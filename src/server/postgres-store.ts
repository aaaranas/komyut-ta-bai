import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { StorageMode } from "@/core/snapshot";
import { emptyDatabase, prune, type Database, type Store } from "@/server/store";

type Row = Record<string, unknown>;
type Tx = Prisma.TransactionClient | PrismaClient;

/** The few delegate calls the store needs, shared by every model. */
interface Delegate {
  findMany(): Promise<Row[]>;
  upsert(args: { where: Row; create: Row; update: Row }): Promise<unknown>;
  deleteMany(args: { where: Row }): Promise<unknown>;
  createMany(args: { data: Row[]; skipDuplicates?: boolean }): Promise<unknown>;
}

type TableName = Exclude<keyof Database, "version">;
type Item<K extends TableName> = Database[K][number];

interface Table<K extends TableName> {
  name: K;
  delegate: (tx: Tx) => Delegate;
  key: string;
  toRow: (item: Item<K>) => Row;
  fromRow: (row: Row) => Item<K>;
}

const date = (iso: string) => new Date(iso);
const maybeDate = (iso: string | null | undefined) => (iso ? new Date(iso) : null);
const iso = (value: unknown) => (value as Date).toISOString();
const maybeIso = (value: unknown) => (value ? (value as Date).toISOString() : null);
const json = (value: unknown) => (value === null || value === undefined ? Prisma.DbNull : (value as Prisma.InputJsonValue));
const optional = <T,>(value: unknown) => (value === null ? undefined : (value as T));
const as = <T,>(value: unknown) => value as T;
const d = (tx: Tx, model: string) => (tx as unknown as Record<string, Delegate>)[model];

/** Domain ↔ row mapping for every table, so both stores hold exactly the same data. */
const TABLES: { [K in TableName]: Table<K> } = {
  reports: {
    name: "reports",
    delegate: (tx) => d(tx, "report"),
    key: "id",
    toRow: (r) => ({
      ...r,
      details: json(r.details),
      replay: json(r.replay),
      observed_at: date(r.observed_at),
      submitted_at: date(r.submitted_at),
      withdrawn_at: maybeDate(r.withdrawn_at),
    }),
    fromRow: (row) => ({
      ...as<Item<"reports">>(row),
      observed_at: iso(row.observed_at),
      submitted_at: iso(row.submitted_at),
      withdrawn_at: maybeIso(row.withdrawn_at),
    }),
  },
  labels: {
    name: "labels",
    delegate: (tx) => d(tx, "label"),
    key: "report_id",
    toRow: (l) => ({ ...l, note: l.note ?? null, split: l.split ?? "dev", labeled_at: date(l.labeled_at) }),
    fromRow: (row) => ({ ...as<Item<"labels">>(row), note: optional<string>(row.note), labeled_at: iso(row.labeled_at) }),
  },
  official: {
    name: "official",
    delegate: (tx) => d(tx, "official"),
    key: "id",
    toRow: (o) => ({
      ...o,
      area: json(o.area),
      reading: json(o.reading),
      replay: json(o.replay),
      observed_at: date(o.observed_at),
      valid_until: maybeDate(o.valid_until),
    }),
    fromRow: (row) => ({
      ...as<Item<"official">>(row),
      reading: optional(row.reading),
      observed_at: iso(row.observed_at),
      valid_until: maybeIso(row.valid_until),
    }),
  },
  segments: {
    name: "segments",
    delegate: (tx) => d(tx, "segment"),
    key: "id",
    toRow: (s) => ({ ...s, replay: json(s.replay), observed_at: date(s.observed_at) }),
    fromRow: (row) => ({ ...as<Item<"segments">>(row), observed_at: iso(row.observed_at) }),
  },
  traces: {
    name: "traces",
    delegate: (tx) => d(tx, "trace"),
    key: "id",
    toRow: (t) => ({ ...t, submitted_at: date(t.submitted_at) }),
    fromRow: (row) => ({ ...as<Item<"traces">>(row), submitted_at: iso(row.submitted_at) }),
  },
  validations: {
    name: "validations",
    delegate: (tx) => d(tx, "validation"),
    key: "id",
    toRow: (v) => ({ ...v, note: v.note ?? null, recorded_at: date(v.recorded_at) }),
    fromRow: (row) => ({ ...as<Item<"validations">>(row), note: optional<string>(row.note), recorded_at: iso(row.recorded_at) }),
  },
};

const TABLE_LIST = Object.values(TABLES) as Table<TableName>[];

/** Arbitrary constant naming the single write lock (pg_advisory_xact_lock). */
const WRITE_LOCK = 724_001;

async function load(tx: Tx): Promise<Database> {
  const db = emptyDatabase();
  await Promise.all(
    TABLE_LIST.map(async (table) => {
      const rows = await table.delegate(tx).findMany();
      (db[table.name] as unknown[]) = rows.map(table.fromRow);
    })
  );
  return db;
}

function fingerprint(db: Database): Map<TableName, Map<string, string>> {
  return new Map(
    TABLE_LIST.map((table) => [
      table.name,
      new Map((db[table.name] as unknown as Row[]).map((item) => [String(item[table.key]), JSON.stringify(item)])),
    ])
  );
}

/** Writes only what changed: upserts new or edited rows, deletes removed ones. */
async function applyDiff(tx: Tx, before: Map<TableName, Map<string, string>>, db: Database): Promise<void> {
  for (const table of TABLE_LIST) {
    const previous = before.get(table.name)!;
    const delegate = table.delegate(tx);
    const kept = new Set<string>();
    for (const item of db[table.name] as Item<TableName>[]) {
      const key = String((item as unknown as Row)[table.key]);
      kept.add(key);
      if (previous.get(key) === JSON.stringify(item)) continue;
      const row = table.toRow(item as never);
      await delegate.upsert({ where: { [table.key]: key }, create: row, update: row });
    }
    const removed = [...previous.keys()].filter((key) => !kept.has(key));
    if (removed.length > 0) await delegate.deleteMany({ where: { [table.key]: { in: removed } } });
  }
}

/**
 * PostgreSQL persistence with the same read/write contract as the JSON
 * store. Writes run in one transaction behind an advisory lock, so
 * concurrent serverless instances serialize exactly like the single-process
 * JSON store does.
 */
export class PostgresStore implements Store {
  readonly prisma: PrismaClient;

  constructor(connectionString: string) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async read<T>(reader: (db: Readonly<Database>) => T): Promise<T> {
    return reader(await load(this.prisma));
  }

  async write<T>(writer: (db: Database) => T): Promise<T> {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${WRITE_LOCK})`;
        const db = await load(tx);
        const before = fingerprint(db);
        const result = writer(db);
        prune(db, new Date());
        await applyDiff(tx, before, db);
        return result;
      },
      { timeout: 20_000, maxWait: 10_000 }
    );
  }

  async storageMode(): Promise<StorageMode> {
    return "postgres";
  }

  /** Bulk insert for the one-time JSON import; existing rows are left alone. */
  async importDatabase(db: Database): Promise<Record<TableName, number>> {
    const counts = {} as Record<TableName, number>;
    for (const table of TABLE_LIST) {
      const items = db[table.name] as Item<TableName>[];
      if (items.length > 0) {
        await table.delegate(this.prisma).createMany({ data: items.map((i) => table.toRow(i as never)), skipDuplicates: true });
      }
      counts[table.name] = items.length;
    }
    return counts;
  }
}

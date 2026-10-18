import { constants } from "node:fs";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FieldValidation } from "@/core/evaluation/metrics";
import type { OfficialObservation } from "@/core/hazards/types";
import type { Report, ReportLabel, SegmentObservation } from "@/core/sensing/types";
import type { StorageMode } from "@/core/snapshot";

/** Metadata kept about a submitted ride trace. Raw GPS fixes never reach the server. */
export interface TraceRecord {
  id: string;
  contributor: string;
  route_id: string;
  submitted_at: string;
  points_total: number;
  points_used: number;
  accepted_segments: number;
  rejected_segments: number;
}

export interface Database {
  version: 1;
  reports: Report[];
  labels: ReportLabel[];
  official: OfficialObservation[];
  segments: SegmentObservation[];
  traces: TraceRecord[];
  validations: FieldValidation[];
}

const FILE_NAME = "komyut-db.json";
const DAY = 86_400_000;

/** Retention: reports and labels 90 days; travel-time data 30 days. */
export const RETENTION_DAYS = { reports: 90, segments: 30 } as const;

const emptyDatabase = (): Database => ({
  version: 1,
  reports: [],
  labels: [],
  official: [],
  segments: [],
  traces: [],
  validations: [],
});

function prune(db: Database, now: Date): void {
  const reportCutoff = now.getTime() - RETENTION_DAYS.reports * DAY;
  const segmentCutoff = now.getTime() - RETENTION_DAYS.segments * DAY;
  db.reports = db.reports.filter((r) => new Date(r.submitted_at).getTime() >= reportCutoff);
  const kept = new Set(db.reports.map((r) => r.id));
  db.labels = db.labels.filter((label) => kept.has(label.report_id));
  db.official = db.official.filter((o) => new Date(o.observed_at).getTime() >= reportCutoff);
  db.segments = db.segments.filter((s) => new Date(s.observed_at).getTime() >= segmentCutoff);
  db.traces = db.traces.filter((t) => new Date(t.submitted_at).getTime() >= segmentCutoff);
}

/**
 * Single-process JSON persistence for the prototype. Operations are
 * serialized through one promise chain and each write is atomic
 * (temp file + rename). Uses `KOMYUT_DATA_DIR` (default `./.data`) and
 * falls back to the OS temp directory on read-only hosts, reporting
 * itself as "temporary" so the UI can say reports may reset.
 */
class JsonStore {
  private db: Database | null = null;
  private location: { dir: string; mode: StorageMode } | null = null;
  private chain: Promise<unknown> = Promise.resolve();

  private async resolveLocation(): Promise<{ dir: string; mode: StorageMode }> {
    if (this.location) return this.location;
    const candidates: [string, StorageMode][] = [
      [process.env.KOMYUT_DATA_DIR ?? join(process.cwd(), ".data"), "file"],
      [join(tmpdir(), "komyut-ta-bai"), "temporary"],
    ];
    for (const [dir, mode] of candidates) {
      try {
        await mkdir(dir, { recursive: true });
        await access(dir, constants.W_OK);
        this.location = { dir, mode };
        return this.location;
      } catch {
        // Not writable here; try the next location.
      }
    }
    throw new Error("No writable location for the Komyut data store");
  }

  private async load(): Promise<Database> {
    if (this.db) return this.db;
    const { dir } = await this.resolveLocation();
    try {
      const parsed = JSON.parse(await readFile(join(dir, FILE_NAME), "utf8"));
      this.db = { ...emptyDatabase(), ...parsed };
    } catch {
      this.db = emptyDatabase();
    }
    return this.db!;
  }

  private async persist(db: Database): Promise<void> {
    const { dir } = await this.resolveLocation();
    const target = join(dir, FILE_NAME);
    const temporary = `${target}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(db));
    await rename(temporary, target);
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(task, task);
    this.chain = run.catch(() => undefined);
    return run;
  }

  read<T>(reader: (db: Readonly<Database>) => T): Promise<T> {
    return this.enqueue(async () => reader(await this.load()));
  }

  write<T>(writer: (db: Database) => T): Promise<T> {
    return this.enqueue(async () => {
      const db = await this.load();
      const result = writer(db);
      prune(db, new Date());
      await this.persist(db);
      return result;
    });
  }

  async storageMode(): Promise<StorageMode> {
    return (await this.resolveLocation()).mode;
  }
}

const holder = globalThis as typeof globalThis & { __komyutStore?: JsonStore };
holder.__komyutStore ??= new JsonStore();

/** Process-wide store (kept on globalThis so dev hot reloads reuse it). */
export const store: JsonStore = holder.__komyutStore;

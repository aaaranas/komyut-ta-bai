/**
 * One-time copy of the JSON file store into PostgreSQL. The JSON file is
 * read only and never deleted. Rows already in the database are skipped.
 *
 *   DATABASE_URL=postgresql://… npm run db:import-json [-- --dry-run] [-- --file path/to/komyut-db.json]
 *
 * Run `npm run db:migrate:deploy` first so the tables exist.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PostgresStore } from "../src/server/postgres-store";
import { emptyDatabase, type Database } from "../src/server/store";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileFlag = args.indexOf("--file");
  const file =
    fileFlag >= 0 ? args[fileFlag + 1] : join(process.env.KOMYUT_DATA_DIR ?? join(process.cwd(), ".data"), "komyut-db.json");

  const db: Database = { ...emptyDatabase(), ...JSON.parse(await readFile(file, "utf8")) };
  const summary = Object.entries(db)
    .filter(([key]) => key !== "version")
    .map(([key, rows]) => `${key}: ${(rows as unknown[]).length}`)
    .join(", ");
  console.log(`Read ${file} (${summary}).`);
  if (dryRun) {
    console.log("Dry run: nothing written.");
    return;
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL to the target PostgreSQL database.");
  const store = new PostgresStore(url);
  try {
    const counts = await store.importDatabase(db);
    console.log("Imported (existing rows skipped):", counts);
  } finally {
    await store.prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

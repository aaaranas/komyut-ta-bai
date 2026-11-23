import { defineConfig } from "prisma/config";

// Migrations use DIRECT_URL when set (Neon's unpooled connection), else DATABASE_URL.
// `prisma generate` needs neither.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  ...(url ? { datasource: { url } } : {}),
});

import { defineConfig } from "prisma/config";

// DATABASE_URL is only needed for migrate/introspect; `prisma generate` runs without it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  ...(process.env.DATABASE_URL ? { datasource: { url: process.env.DATABASE_URL } } : {}),
});

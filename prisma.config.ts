import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Prisma 7 no carga .env por su cuenta; usamos el mismo cargador que Next (.env.local, .env).
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node node_modules/tsx/dist/cli.mjs prisma/seed.ts",
  },
  datasource: {
    // Las migraciones necesitan la conexión directa de Neon (sin pooler).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});

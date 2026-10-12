import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const [categories, products] = await Promise.all([prisma.category.count(), prisma.product.count()]);
  console.log(`Base de datos OK: ${categories} categorías, ${products} productos.`);
}

main()
  .catch((e) => {
    console.error("Fallo al conectar con la base de datos:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

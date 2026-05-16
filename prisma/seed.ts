// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as dotenv from "dotenv";

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const adapter = new PrismaMariaDb(poolConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const categoriasData = [
    "Bolos e tortas doces",
    "Carnes",
    "Aves",
    "Peixes e frutos do mar",
    "Saladas, molhos e acompanhamentos",
    "Sopas",
    "Massas",
    "Bebidas",
    "Doces e sobremesas",
    "Lanches",
    "Prato Único",
    "Light",
    "Alimentação Saudável",
  ];

  for (const nome of categoriasData) {
    await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const categorias = await prisma.categoria.findMany();
  console.log(`✅ ${categorias.length} categorias criadas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const url = new URL(process.env.DATABASE_URL!);
// O adapter oficial mantido pela Prisma para MySQL: @prisma/adapter-mariadb
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });

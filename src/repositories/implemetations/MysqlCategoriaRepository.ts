import { Categoria } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CategoriaRepository } from "../CategoriaRepository";

export class MysqlCategoriaRepository implements CategoriaRepository {
  async findAll(): Promise<Categoria[]> {
    return prisma.categoria.findMany({});
  }
  async findById(id: number): Promise<Categoria | null> {
    return prisma.categoria.findFirst({
      where: {
        id,
      },
    });
  }
}

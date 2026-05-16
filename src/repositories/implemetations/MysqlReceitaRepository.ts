import { Receita } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ReceitaRepository } from "../ReceitaRepository";

export class MysqlReceitaRepository implements ReceitaRepository {
  async findByUser(id_usuarios: number): Promise<Receita[]> {
    return prisma.receita.findMany({
      where: { id_usuarios },
      include: { categoria: true },
      orderBy: { criado_em: "desc" },
    });
  }

  async findById(id: number, id_usuarios: number): Promise<Receita | null> {
    return prisma.receita.findFirst({
      where: {
        id,
        id_usuarios,
      },
      include: { categoria: true },
    });
  }

  async findByUserAndName(
    id_usuarios: number,
    nome: string,
  ): Promise<Receita | null> {
    return prisma.receita.findFirst({
      where: { id_usuarios, nome },
    });
  }

  async save(
    data: Omit<Receita, "id" | "alterado_em" | "criado_em">,
  ): Promise<Receita> {
    return prisma.receita.create({
      data,
    });
  }

  async update(id: number, data: Partial<Receita>): Promise<void> {
    await prisma.receita.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.receita.delete({
      where: { id },
    });
  }
}

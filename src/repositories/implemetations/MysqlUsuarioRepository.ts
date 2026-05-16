import { Usuario } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { UsuarioRepository } from "../UsuarioRepository";

export class MysqlUserRepository implements UsuarioRepository {
  async findByLogin(login: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { login },
    });
  }

  async findById(id: number): Promise<Usuario | null> {
    return prisma.usuario.findFirst({
      where: {
        id,
      },
    });
  }

  async save(
    data: Pick<Usuario, "nome" | "login" | "senha">,
  ): Promise<Usuario> {
    return prisma.usuario.create({
      data,
    });
  }

  async update(
    id: number,
    data: Partial<Pick<Usuario, "nome" | "login" | "senha">>,
  ): Promise<void> {
    await prisma.usuario.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.usuario.delete({
      where: { id },
    });
  }
}

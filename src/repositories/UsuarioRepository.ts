import { Usuario } from "@prisma/client";

export interface UsuarioRepository {
  findByLogin(login: string): Promise<Usuario | null>;
  findById(id: number): Promise<Usuario | null>;
  save(
    usuario: Omit<Usuario, "id" | "alterado_em" | "criado_em">,
  ): Promise<Usuario>;
  update(id: number, Usuario: Partial<Usuario>): Promise<void>;
  delete(id: number): Promise<void>;
}

import { Receita } from "@prisma/client";

export interface ReceitaRepository {
  findByUser(
    id_usuarios: number,
    filters?: { nome?: string; id_categorias?: number },
  ): Promise<Receita[]>;
  findById(id: number, id_usuarios: number): Promise<Receita | null>;
  findByUserAndName(id_usuarios: number, nome: string): Promise<Receita | null>;
  save(
    receita: Omit<Receita, "id" | "alterado_em" | "criado_em">,
  ): Promise<Receita>;
  update(id: number, receita: Partial<Receita>): Promise<void>;
  delete(id: number): Promise<void>;
}

import { Categoria } from "@prisma/client";

export interface CategoriaRepository {
  findAll(): Promise<Categoria[]>;
  findById(id: number): Promise<Categoria | null>;
}

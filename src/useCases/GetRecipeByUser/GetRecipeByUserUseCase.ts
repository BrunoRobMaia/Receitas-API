import { ReceitaRepository } from "../../repositories/ReceitaRepository";

export class GetRecipeByUserUseCase {
  constructor(private receitaRepository: ReceitaRepository) {}

  async execute(
    id_usuarios: number,
    filters?: { nome?: string; id_categorias?: number },
  ) {
    return await this.receitaRepository.findByUser(id_usuarios, filters);
  }
}

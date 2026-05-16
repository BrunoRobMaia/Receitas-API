import { ReceitaRepository } from "../../repositories/ReceitaRepository";

export class GetRecipeByIdUseCase {
  constructor(private receitaRepository: ReceitaRepository) {}

  async execute(id: number, id_usuarios: number) {
    return await this.receitaRepository.findById(id, id_usuarios);
  }
}

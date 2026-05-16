import { ReceitaRepository } from "../../repositories/ReceitaRepository";

export class GetRecipeByUserUseCase {
  constructor(private receitaRepository: ReceitaRepository) {}

  async execute(id_usuarios: number) {
    return await this.receitaRepository.findByUser(id_usuarios);
  }
}

import { ReceitaRepository } from "../../repositories/ReceitaRepository";
import { NotFoundError } from "../../utils/errors";

interface DeleteRecipeRequest {
  id: number;
  id_usuarios: number;
}

export class DeleteRecipeUseCase {
  constructor(private recipeRepository: ReceitaRepository) {}

  async execute({ id, id_usuarios }: DeleteRecipeRequest) {
    const recipeExists = await this.recipeRepository.findById(id, id_usuarios);

    if (!recipeExists) {
      throw new NotFoundError("Receita não encontrada.");
    }

    await this.recipeRepository.delete(id);

    return {
      message: "Receita deletada com sucesso!",
    };
  }
}

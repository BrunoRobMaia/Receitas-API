import { ReceitaRepository } from "../../repositories/ReceitaRepository";
import { EditRecipeDTO } from "./EditRecipeDTO";
import { BadRequestError, NotFoundError } from "../../utils/errors";

export class EditRecipeUseCase {
  constructor(private recipeRepository: ReceitaRepository) {}

  async execute(data: EditRecipeDTO) {
    const recipeExists = await this.recipeRepository.findById(
      data.id,
      data.id_usuarios,
    );

    if (!recipeExists) {
      throw new NotFoundError("Receita não encontrada.");
    }

    if (
      !data.nome ||
      !data.ingredientes ||
      !data.modo_preparo ||
      !data.porcoes ||
      !data.tempo_preparo_minutos ||
      !data.id_categorias
    ) {
      throw new BadRequestError(
        "Dados da receita faltando, verifique novamente",
      );
    }

    await this.recipeRepository.update(data.id, {
      id_categorias: data.id_categorias,
      nome: data.nome,
      tempo_preparo_minutos: data.tempo_preparo_minutos,
      porcoes: data.porcoes,
      modo_preparo: data.modo_preparo,
      ingredientes: data.ingredientes,
    });

    return {
      message: "Receita atualizada com sucesso!",
    };
  }
}

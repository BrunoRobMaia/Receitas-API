import { ReceitaRepository } from "../../repositories/ReceitaRepository";
import { CreateRecipeDTO } from "./CreateRecipeDTO";
import { BadRequestError, ConflictError } from "../../utils/errors";

export class CreateRecipeUseCase {
  constructor(private recipeRepository: ReceitaRepository) {}

  async execute(data: CreateRecipeDTO) {
    const recipesAlredyExists = await this.recipeRepository.findByUserAndName(
      data.id_usuarios,
      data.nome,
    );

    if (recipesAlredyExists) {
      throw new ConflictError("Você já cadastrou esta receita.");
    }
    if (
      !data.nome ||
      !data.ingredientes ||
      !data.modo_preparo ||
      !data.porcoes ||
      !data.tempo_preparo_minutos
    ) {
      throw new BadRequestError(
        "Dados da receita faltando, verifique novamente",
      );
    }

    await this.recipeRepository.save({
      id_categorias: data.id_categorias,
      id_usuarios: data.id_usuarios,
      ingredientes: data.ingredientes,
      modo_preparo: data.modo_preparo,
      nome: data.nome,
      porcoes: data.porcoes,
      tempo_preparo_minutos: data.tempo_preparo_minutos,
    });

    return {
      message: "Receita registrada com sucesso!",
    };
  }
}

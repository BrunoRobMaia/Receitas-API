import { ReceitaRepository } from "../../repositories/ReceitaRepository";
import { CategoriaRepository } from "../../repositories/CategoriaRepository";
import { UsuarioRepository } from "../../repositories/UsuarioRepository";
import { NotFoundError } from "../../utils/errors";
import { RecipePdfService } from "../../services/PDF/PrintRecipeService";

interface PrintRecipeRequest {
  id: number;
  id_usuarios: number;
}

export class PrintRecipeUseCase {
  constructor(
    private recipeRepository: ReceitaRepository,
    private categoriaRepository: CategoriaRepository,
    private usuarioRepository: UsuarioRepository,
    private recipePdfService: RecipePdfService,
  ) {}

  async execute({ id, id_usuarios }: PrintRecipeRequest): Promise<Buffer> {
    const receita = await this.recipeRepository.findById(id, id_usuarios);

    if (!receita) {
      throw new NotFoundError("Receita não encontrada.");
    }

    const categoria = receita.id_categorias
      ? await this.categoriaRepository.findById(receita.id_categorias)
      : null;

    const usuario = await this.usuarioRepository.findById(receita.id_usuarios);

    return this.recipePdfService.generate({
      receita,
      categoria,
      usuario,
    });
  }
}

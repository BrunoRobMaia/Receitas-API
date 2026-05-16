// src/useCases/PrintRecipe/index.ts

import { RecipePdfService } from "../../services/PDF/PrintRecipeService";

import { PrintRecipeUseCase } from "./PrintRecipeUseCase";
import { PrintRecipeController } from "./PrintRecipeController";

import { MysqlReceitaRepository } from "../../repositories/implemetations/MysqlReceitaRepository";
import { MysqlCategoriaRepository } from "../../repositories/implemetations/MysqlCategoriaRepository";
import { MysqlUserRepository } from "../../repositories/implemetations/MysqlUsuarioRepository";

const receitaRepository = new MysqlReceitaRepository();
const categoriaRepository = new MysqlCategoriaRepository();
const usuarioRepository = new MysqlUserRepository();

const recipePdfService = new RecipePdfService();

const printRecipeUseCase = new PrintRecipeUseCase(
  receitaRepository,
  categoriaRepository,
  usuarioRepository,
  recipePdfService,
);

export { PrintRecipeController, printRecipeUseCase };

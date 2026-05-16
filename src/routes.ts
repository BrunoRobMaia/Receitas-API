// src/http/routes.ts
import { FastifyInstance } from "fastify";
import { CreateUserController } from "./useCases/CreateUser";
import { AuthController } from "./useCases/Auth";
import { CreateRecipeController } from "./useCases/CreateRecipe";
import { authenticate } from "./middleware/authenticate";
import { GetAllCategoryController } from "./useCases/GetAllCategory";
import { GetRecipeByUserController } from "./useCases/GetRecipeByUser";
import { EditRecipeController } from "./useCases/EditRecipe";
import { DeleteRecipeController } from "./useCases/DeleteRecipe";
import { PrintRecipeController } from "./useCases/PrintRecipe";
import { GetRecipeByIdController } from "./useCases/GetRecipeById";

export async function routes(app: FastifyInstance) {
  app.register(CreateUserController, { prefix: "/usuario" });
  app.register(AuthController, { prefix: "/login" });

  app.register(
    async (privateRoutes) => {
      privateRoutes.addHook("preHandler", authenticate);
      privateRoutes.register(CreateRecipeController, { prefix: "/receitas" });
      privateRoutes.register(EditRecipeController, { prefix: "/receitas" });
      privateRoutes.register(GetRecipeByUserController, {
        prefix: "/receitas",
      });
      privateRoutes.register(DeleteRecipeController, { prefix: "/receitas" });
      privateRoutes.register(PrintRecipeController, { prefix: "/receitas" });
      privateRoutes.register(GetRecipeByIdController, { prefix: "/receitas" });
      privateRoutes.register(GetAllCategoryController, {
        prefix: "/categorias",
      });
    },
    { prefix: "/" },
  );
}

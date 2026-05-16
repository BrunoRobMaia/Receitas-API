import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { EditRecipeUseCase } from "./EditRecipeUseCase";
import { EditRecipeDTO } from "./EditRecipeDTO";
import { MysqlReceitaRepository } from "../../repositories/implemetations/MysqlReceitaRepository";
import { authenticate } from "../../middleware/authenticate";

export async function EditRecipeController(app: FastifyInstance) {
  app.put<{
    Params: { id: string };
    Body: Omit<EditRecipeDTO, "id" | "id_usuarios">;
  }>(
    "/editar/:id",
    {
      onRequest: [authenticate],
      schema: {
        tags: ["Receitas"],
        summary: "Editar receita",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            id_categorias: { type: "number" },
            nome: { type: "string" },
            tempo_preparo_minutos: { type: "number" },
            porcoes: { type: "number" },
            modo_preparo: { type: "string" },
            ingredientes: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: Omit<EditRecipeDTO, "id" | "id_usuarios">;
      }>,
      reply: FastifyReply,
    ) => {
      const id = Number(request.params.id);
      const id_usuarios = Number(request.user.sub);

      const recipeRepository = new MysqlReceitaRepository();
      const updateRecipeUseCase = new EditRecipeUseCase(recipeRepository);

      const result = await updateRecipeUseCase.execute({
        id,
        id_usuarios,
        ...request.body,
      });

      return reply.status(200).send(result);
    },
  );
}

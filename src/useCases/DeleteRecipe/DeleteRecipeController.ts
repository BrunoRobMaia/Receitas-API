import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DeleteRecipeUseCase } from "./DeleteRecipeUseCase";
import { MysqlReceitaRepository } from "../../repositories/implemetations/MysqlReceitaRepository";
import { authenticate } from "../../middleware/authenticate";

export async function DeleteRecipeController(app: FastifyInstance) {
  app.delete<{
    Params: { id: string };
  }>(
    "/deletar/:id",
    {
      onRequest: [authenticate],
      schema: {
        tags: ["Receitas"],
        summary: "Deletar receita",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
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
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const id = Number(request.params.id);
      const id_usuarios = Number(request.user.sub);

      const recipeRepository = new MysqlReceitaRepository();
      const deleteRecipeUseCase = new DeleteRecipeUseCase(recipeRepository);

      const result = await deleteRecipeUseCase.execute({
        id,
        id_usuarios,
      });

      return reply.status(200).send(result);
    },
  );
}

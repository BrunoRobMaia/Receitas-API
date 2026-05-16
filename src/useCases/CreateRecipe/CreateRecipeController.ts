import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CreateRecipeUseCase } from "./CreateRecipeUseCase";
import { CreateRecipeDTO } from "./CreateRecipeDTO";
import { MysqlReceitaRepository } from "../../repositories/implemetations/MysqlReceitaRepository";
import { authenticate } from "../../middleware/authenticate";

export async function CreateRecipeController(app: FastifyInstance) {
  app.post<{ Body: Omit<CreateRecipeDTO, "id_usuarios"> }>(
    "/registrar",
    {
      onRequest: [authenticate],
      schema: {
        tags: ["Receitas"],
        summary: "Registro de receitas",
        body: {
          type: "object",
          required: [
            "id_categorias",
            "nome",
            "tempo_preparo_minutos",
            "porcoes",
            "modo_preparo",
            "ingredientes",
          ],
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
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: Omit<CreateRecipeDTO, "id_usuarios"> }>,
      reply: FastifyReply,
    ) => {
      const id_usuarios = Number(request.user.sub);

      const recipeRepository = new MysqlReceitaRepository();
      const createRecipeUseCase = new CreateRecipeUseCase(recipeRepository);

      const result = await createRecipeUseCase.execute({
        ...request.body,
        id_usuarios,
      });

      return reply.status(201).send(result);
    },
  );
}

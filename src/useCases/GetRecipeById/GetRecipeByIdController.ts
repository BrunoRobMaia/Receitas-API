import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { GetRecipeByIdUseCase } from "./GetRecipeByIdUseCase";
import { MysqlReceitaRepository } from "../../repositories/implemetations/MysqlReceitaRepository";
import { authenticate } from "../../middleware/authenticate";

export async function GetRecipeByIdController(app: FastifyInstance) {
  app.get<{
    Params: { id: string };
  }>(
    "/:id",
    {
      onRequest: [authenticate],
      schema: {
        tags: ["Receitas"],
        summary: "Detalhe da Receita",
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "number" },
              nome: { type: "string" },
              tempo_preparo_minutos: { type: "number" },
              porcoes: { type: "number" },
              modo_preparo: { type: "string" },
              ingredientes: { type: "string" },
              criado_em: { type: "string" },
              categoria: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "number" },
                  nome: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const id_usuarios = Number(request.user.sub);
      const id = Number(request.params.id);

      const receitaRepository = new MysqlReceitaRepository();
      const getRecipeByIdUseCase = new GetRecipeByIdUseCase(receitaRepository);

      const result = await getRecipeByIdUseCase.execute(id, id_usuarios);

      return reply.status(200).send(result);
    },
  );
}

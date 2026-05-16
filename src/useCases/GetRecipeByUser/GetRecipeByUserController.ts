import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { GetRecipeByUserUseCase } from "./GetRecipeByUserUseCase";
import { MysqlReceitaRepository } from "../../repositories/implemetations/MysqlReceitaRepository";
import { authenticate } from "../../middleware/authenticate";

export async function GetRecipeByUserController(app: FastifyInstance) {
  app.get(
    "/",
    {
      onRequest: [authenticate],
      schema: {
        tags: ["Receitas"],
        summary: "Lista receitas do usuário logado",
        response: {
          200: {
            type: "array",
            items: {
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
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const id_usuarios = Number(request.user.sub);

      const receitaRepository = new MysqlReceitaRepository();
      const getAllRecipeByUserUseCase = new GetRecipeByUserUseCase(
        receitaRepository,
      );

      const result = await getAllRecipeByUserUseCase.execute(id_usuarios);

      return reply.status(200).send(result);
    },
  );
}

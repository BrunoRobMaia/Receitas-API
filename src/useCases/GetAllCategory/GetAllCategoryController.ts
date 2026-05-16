import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { GetAllCategoryUseCase } from "./GetAllCategoryUseCase";
import { MysqlCategoriaRepository } from "../../repositories/implemetations/MysqlCategoriaRepository";
import { authenticate } from "../../middleware/authenticate";

export async function GetAllCategoryController(app: FastifyInstance) {
  app.get<{}>(
    "/",
    {
      onRequest: [authenticate],
      schema: {
        tags: ["Categorias"],
        summary: "Lista de Categorias",
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
    async (request: FastifyRequest<{}>, reply: FastifyReply) => {
      const categoryRepository = new MysqlCategoriaRepository();
      const getAllCategoryUseCase = new GetAllCategoryUseCase(
        categoryRepository,
      );
      const result = await getAllCategoryUseCase.execute();
      return reply.status(200).send(result);
    },
  );
}

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { authenticate } from "../../middleware/authenticate";
import { RecipePdfService } from "../../services/PDF/PrintRecipeService";

import { PrintRecipeUseCase } from "./PrintRecipeUseCase";
import { MysqlReceitaRepository } from "../../repositories/implemetations/MysqlReceitaRepository";
import { MysqlCategoriaRepository } from "../../repositories/implemetations/MysqlCategoriaRepository";
import { MysqlUserRepository } from "../../repositories/implemetations/MysqlUsuarioRepository";

export async function PrintRecipeController(app: FastifyInstance) {
  app.get<{
    Params: { id: string };
  }>(
    "/imprimir/:id",
    {
      onRequest: [authenticate],
      schema: {
        tags: ["Receitas"],
        summary: "Imprimir receita em PDF",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply,
    ) => {
      const id = Number(request.params.id);
      const id_usuarios = Number(request.user.sub);

      /*
       ======================================================
       DEPENDENCIES
       ======================================================
      */

      const recipeRepository = new MysqlReceitaRepository();
      const categoriaRepository = new MysqlCategoriaRepository();
      const usuarioRepository = new MysqlUserRepository();

      const recipePdfService = new RecipePdfService();

      /*
       ======================================================
       USE CASE
       ======================================================
      */

      const printRecipeUseCase = new PrintRecipeUseCase(
        recipeRepository,
        categoriaRepository,
        usuarioRepository,
        recipePdfService,
      );

      /*
       ======================================================
       EXECUTION
       ======================================================
      */

      const pdfBuffer = await printRecipeUseCase.execute({
        id,
        id_usuarios,
      });

      /*
       ======================================================
       RESPONSE
       ======================================================
      */

      reply.header("Content-Type", "application/pdf");

      reply.header(
        "Content-Disposition",
        `attachment; filename=receita-${id}.pdf`,
      );

      return reply.send(pdfBuffer);
    },
  );
}

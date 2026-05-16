import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AuthUseCase } from "./AuthUseCase";
import { AuthDTO } from "./AuthDTO";
import { MysqlUserRepository } from "../../repositories/implemetations/MysqlUsuarioRepository";

export async function AuthController(app: FastifyInstance) {
  app.post<{ Body: AuthDTO }>(
    "",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Login de usuário",
        body: {
          type: "object",
          required: ["login", "senha"],
          properties: {
            login: { type: "string" },
            senha: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              token: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: AuthDTO }>, reply: FastifyReply) => {
      const userRepository = new MysqlUserRepository();
      const authUserUseCase = new AuthUseCase(userRepository);
      const result = await authUserUseCase.execute(request.body);
      return reply.status(200).send(result);
    },
  );
}

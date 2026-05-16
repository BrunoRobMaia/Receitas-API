import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { CreateUserDTO } from "./CreateUserDTO";
import { MysqlUserRepository } from "../../repositories/implemetations/MysqlUsuarioRepository";

export async function CreateUserController(app: FastifyInstance) {
  app.post<{ Body: CreateUserDTO }>(
    "/registrar",
    {
      schema: {
        tags: ["Usuários"],
        summary: "Registro de usuário",
        body: {
          type: "object",
          required: ["nome", "login", "senha"],
          properties: {
            nome: { type: "string" },
            login: { type: "string" },
            senha: { type: "string" },
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
      request: FastifyRequest<{ Body: CreateUserDTO }>,
      reply: FastifyReply,
    ) => {
      const userRepository = new MysqlUserRepository();
      const createUserUseCase = new CreateUserUseCase(userRepository);
      const result = await createUserUseCase.execute(request.body);
      return reply.status(201).send(result);
    },
  );
}

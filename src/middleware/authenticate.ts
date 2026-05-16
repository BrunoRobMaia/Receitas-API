import { FastifyRequest } from "fastify";
import { UnauthorizedError } from "../utils/errors";

export async function authenticate(request: FastifyRequest) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError(
      "Token inválido ou expirado. Faça login novamente.",
    );
  }
}

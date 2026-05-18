import "dotenv/config";
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";
import { routes } from "./routes";
import { FastifyError } from "fastify";

const app = fastify({
  logger: {
    level: "warn",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname,reqId,responseTime,remoteAddress,remotePort",
        messageFormat: "{msg}",
      },
    },
  },
});

app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
});
app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET ?? "secret",
});

app.register(fastifyCookie);

app.register(routes, { prefix: "/api" });

app.get("/", async () => {
  return { message: "API funcionando! 🚀" };
});

const PORT = Number(process.env.PORT) || 3000;

app.setErrorHandler((error: FastifyError, request, reply) => {
  request.log.error(`❌ ${error.message}`);

  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: error.message,
    });
  }

  const status = error.statusCode ?? 500;
  const errorMap: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    500: "Internal Server Error",
  };

  return reply.status(status).send({
    statusCode: status,
    error: errorMap[status] ?? "Internal Server Error",
    message: error.message,
  });
});
if (process.env.NODE_ENV !== "test") {
  app.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}

app.ready(() => {
  console.log("\n\x1b[32m🚀 Servidor rodando!\x1b[0m");
  console.log(`\x1b[36m📡 API:  \x1b[0mhttp://localhost:${PORT}`);
  console.log(`\x1b[36m📚 Docs: \x1b[0mhttp://localhost:${PORT}/docs\n`);
});

export { app };

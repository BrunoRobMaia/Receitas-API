import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../server";
import { prisma } from "../../lib/prisma";

describe("Recipe Flow E2E", () => {
  let token: string;
  let receitaId: number;
  let categoriaId: number;
  let usuarioId: number;
  const timestamp = Date.now();

  beforeAll(async () => {
    try {
      await app.ready();
    } catch (err) {
      console.log("❌ Erro ao conectar ao servidor:", err);
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome: `Sobremesa_${timestamp}`,
      },
    });

    categoriaId = categoria.id;
  });

  afterAll(async () => {
    if (receitaId) {
      await prisma.receita.delete({ where: { id: receitaId } }).catch(() => {});
    }

    if (usuarioId) {
      await prisma.usuario.delete({ where: { id: usuarioId } }).catch(() => {});
    }

    if (categoriaId) {
      await prisma.categoria
        .delete({ where: { id: categoriaId } })
        .catch(() => {});
    }
  });

  it("deve executar o fluxo completo da aplicação", async () => {
    // 1. Criar usuário
    const createUserResponse = await request(app.server)
      .post("/api/usuario/registrar")
      .send({
        nome: `Teste_${timestamp}`,
        login: `teste_${timestamp}`,
        senha: "123",
      });

    expect(createUserResponse.statusCode).toBe(201);
    usuarioId = createUserResponse.body.id;

    // 2. Login
    const loginResponse = await request(app.server)
      .post("/api/login")
      .send({
        login: `teste_${timestamp}`,
        senha: "123",
      });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeDefined();

    token = loginResponse.body.token;

    // 3. Criar receita
    const createRecipeResponse = await request(app.server)
      .post("/api/receitas/registrar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: `Bolo de Cenoura ${timestamp}`,
        ingredientes: "cenoura, farinha, ovos",
        modo_preparo: "Misture tudo",
        tempo_preparo_minutos: 40,
        porcoes: 8,
        id_categorias: categoriaId,
      });

    expect(createRecipeResponse.statusCode).toBe(201);

    const receitaCriada = await prisma.receita.findFirst({
      where: { nome: `Bolo de Cenoura ${timestamp}` },
    });

    expect(receitaCriada).not.toBeNull();
    receitaId = receitaCriada!.id;

    // 4. Editar receita
    const editResponse = await request(app.server)
      .put(`/api/receitas/editar/${receitaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Bolo de Cenoura Premium",
      });

    expect(editResponse.statusCode).toBe(200);

    // 5. Gerar PDF
    const printResponse = await request(app.server)
      .get(`/api/receitas/imprimir/${receitaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(printResponse.statusCode).toBe(200);

    // 6. Deletar receita
    const deleteResponse = await request(app.server)
      .delete(`/api/receitas/deletar/${receitaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
  });
});

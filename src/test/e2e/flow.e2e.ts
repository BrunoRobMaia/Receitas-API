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

    await app.close();
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

    // 3. Criar receita (com todos os campos obrigatórios)
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

    // 4. Editar receita (enviando TODOS os campos obrigatórios)
    const editResponse = await request(app.server)
      .put(`/api/receitas/editar/${receitaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Bolo de Cenoura Premium",
        ingredientes: "cenoura, farinha, ovos, chocolate", // Campo obrigatório
        modo_preparo: "Misture tudo e asse por 40 minutos", // Campo obrigatório
        tempo_preparo_minutos: 45, // Campo obrigatório
        porcoes: 10, // Campo obrigatório
        id_categorias: categoriaId, // Campo obrigatório
      });

    expect(editResponse.statusCode).toBe(200);

    // Verificar se a edição foi aplicada
    const receitaAtualizada = await prisma.receita.findFirst({
      where: { id: receitaId },
    });
    expect(receitaAtualizada?.nome).toBe("Bolo de Cenoura Premium");
    expect(receitaAtualizada?.porcoes).toBe(10);
    expect(receitaAtualizada?.tempo_preparo_minutos).toBe(45);

    // 5. Buscar receitas do usuário
    const getUserRecipesResponse = await request(app.server)
      .get("/api/receitas/")
      .set("Authorization", `Bearer ${token}`);

    expect(getUserRecipesResponse.statusCode).toBe(200);
    expect(Array.isArray(getUserRecipesResponse.body)).toBe(true);
    expect(getUserRecipesResponse.body.length).toBeGreaterThan(0);

    // 6. Gerar PDF
    const printResponse = await request(app.server)
      .get(`/api/receitas/imprimir/${receitaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(printResponse.statusCode).toBe(200);
    expect(printResponse.headers["content-type"]).toMatch(/application\/pdf/);

    // 7. Deletar receita
    const deleteResponse = await request(app.server)
      .delete(`/api/receitas/deletar/${receitaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);

    // Verificar se foi realmente deletada
    const receitaDeletada = await prisma.receita.findFirst({
      where: { id: receitaId },
    });
    expect(receitaDeletada).toBeNull();

    receitaId = 0; // Reseta o ID para não tentar deletar novamente no afterAll
  });

  it("não deve permitir editar receita com dados incompletos", async () => {
    // Criar usuário para este teste
    const createUserResponse = await request(app.server)
      .post("/api/usuario/registrar")
      .send({
        nome: `TesteEdit_${timestamp}`,
        login: `testeedit_${timestamp}`,
        senha: "123",
      });

    expect(createUserResponse.statusCode).toBe(201);
    const testUsuarioId = createUserResponse.body.id;

    // Login
    const loginResponse = await request(app.server)
      .post("/api/login")
      .send({
        login: `testeedit_${timestamp}`,
        senha: "123",
      });

    expect(loginResponse.statusCode).toBe(200);
    const testToken = loginResponse.body.token;

    // Criar receita
    const createRecipeResponse = await request(app.server)
      .post("/api/receitas/registrar")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        nome: `Bolo para Teste ${timestamp}`,
        ingredientes: "cenoura, farinha, ovos",
        modo_preparo: "Misture tudo",
        tempo_preparo_minutos: 40,
        porcoes: 8,
        id_categorias: categoriaId,
      });

    expect(createRecipeResponse.statusCode).toBe(201);

    const receita = await prisma.receita.findFirst({
      where: { nome: `Bolo para Teste ${timestamp}` },
    });

    expect(receita).not.toBeNull();
    const testReceitaId = receita!.id;

    // Tentar editar sem enviar todos os campos obrigatórios
    const editResponse = await request(app.server)
      .put(`/api/receitas/editar/${testReceitaId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        nome: "Tentativa de edição parcial",
        // Faltando ingredientes, modo_preparo, etc.
      });

    expect(editResponse.statusCode).toBe(400);
    expect(editResponse.body.message).toContain("Dados da receita faltando");

    // Limpar dados do teste
    await prisma.receita
      .delete({ where: { id: testReceitaId } })
      .catch(() => {});
    await prisma.usuario
      .delete({ where: { id: testUsuarioId } })
      .catch(() => {});
  });
});

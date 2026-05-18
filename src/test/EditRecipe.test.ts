import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditRecipeUseCase } from "../useCases/EditRecipe/EditRecipeUseCase";
import { NotFoundError, BadRequestError } from "../utils/errors";

const mockReceitaRepository = {
  findById: vi.fn(),
  update: vi.fn(),
};

const receitaFake = {
  id: 1,
  id_usuarios: 10,
  id_categorias: 2,
  nome: "Bolo de cenoura",
  tempo_preparo_minutos: 60,
  porcoes: 8,
  modo_preparo: "Misture tudo e leve ao forno",
  ingredientes: "Cenoura, farinha, ovos, açúcar",
};

describe("EditRecipeUseCase", () => {
  let editRecipeUseCase: EditRecipeUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    editRecipeUseCase = new EditRecipeUseCase(mockReceitaRepository as any);
  });

  describe("quando a receita existe e os dados são válidos", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockReceitaRepository.update.mockResolvedValue(undefined);
    });

    it("deve retornar mensagem de sucesso", async () => {
      const result = await editRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
        nome: "Bolo de chocolate",
        ingredientes: "Cenoura, farinha, ovos, açúcar",
        modo_preparo: "Misture tudo e leve ao forno",
        porcoes: 8,
        tempo_preparo_minutos: 60,
        id_categorias: 2,
      });

      expect(result).toEqual({ message: "Receita atualizada com sucesso!" });
    });

    it("deve chamar findById com id e id_usuarios corretos", async () => {
      await editRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
        nome: "Bolo de chocolate",
        ingredientes: "Cenoura, farinha, ovos, açúcar",
        modo_preparo: "Misture tudo e leve ao forno",
        porcoes: 8,
        tempo_preparo_minutos: 60,
        id_categorias: 2,
      });

      expect(mockReceitaRepository.findById).toHaveBeenCalledWith(1, 10);
      expect(mockReceitaRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("deve chamar update com o id e os campos informados", async () => {
      await editRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
        nome: "Bolo de chocolate",
        porcoes: 10,
        ingredientes: "Cenoura, farinha, ovos, açúcar",
        modo_preparo: "Misture tudo e leve ao forno",
        tempo_preparo_minutos: 60,
        id_categorias: 2,
      });

      expect(mockReceitaRepository.update).toHaveBeenCalledWith(1, {
        id_categorias: 2,
        nome: "Bolo de chocolate",
        tempo_preparo_minutos: 60,
        porcoes: 10,
        modo_preparo: "Misture tudo e leve ao forno",
        ingredientes: "Cenoura, farinha, ovos, açúcar",
      });
    });

    it("deve chamar update exatamente uma vez", async () => {
      await editRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
        nome: "Bolo de chocolate",
        ingredientes: "Cenoura, farinha, ovos, açúcar",
        modo_preparo: "Misture tudo e leve ao forno",
        porcoes: 8,
        tempo_preparo_minutos: 60,
        id_categorias: 2,
      });

      expect(mockReceitaRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("quando apenas alguns campos são informados", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockReceitaRepository.update.mockResolvedValue(undefined);
    });

    it("deve atualizar apenas o nome", async () => {
      await editRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
        nome: "Novo nome",
        ingredientes: receitaFake.ingredientes,
        modo_preparo: receitaFake.modo_preparo,
        porcoes: receitaFake.porcoes,
        tempo_preparo_minutos: receitaFake.tempo_preparo_minutos,
        id_categorias: receitaFake.id_categorias,
      });

      expect(mockReceitaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nome: "Novo nome" }),
      );
    });

    it("deve atualizar apenas os ingredientes", async () => {
      await editRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
        ingredientes: "Novos ingredientes",
        nome: receitaFake.nome,
        modo_preparo: receitaFake.modo_preparo,
        porcoes: receitaFake.porcoes,
        tempo_preparo_minutos: receitaFake.tempo_preparo_minutos,
        id_categorias: receitaFake.id_categorias,
      });

      expect(mockReceitaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ ingredientes: "Novos ingredientes" }),
      );
    });

    it("deve atualizar apenas a categoria", async () => {
      await editRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
        id_categorias: 5,
        nome: receitaFake.nome,
        ingredientes: receitaFake.ingredientes,
        modo_preparo: receitaFake.modo_preparo,
        porcoes: receitaFake.porcoes,
        tempo_preparo_minutos: receitaFake.tempo_preparo_minutos,
      });

      expect(mockReceitaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ id_categorias: 5 }),
      );
    });
  });

  describe("quando a receita não existe", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve lançar NotFoundError", async () => {
      await expect(
        editRecipeUseCase.execute({
          id: 99,
          id_usuarios: 10,
          nome: "teste",
          ingredientes: "teste",
          modo_preparo: "teste",
          porcoes: 1,
          tempo_preparo_minutos: 1,
          id_categorias: 1,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro com a mensagem correta", async () => {
      await expect(
        editRecipeUseCase.execute({
          id: 99,
          id_usuarios: 10,
          nome: "teste",
          ingredientes: "teste",
          modo_preparo: "teste",
          porcoes: 1,
          tempo_preparo_minutos: 1,
          id_categorias: 1,
        }),
      ).rejects.toThrow("Receita não encontrada.");
    });

    it("não deve chamar update se a receita não existe", async () => {
      await expect(
        editRecipeUseCase.execute({
          id: 99,
          id_usuarios: 10,
          nome: "teste",
          ingredientes: "teste",
          modo_preparo: "teste",
          porcoes: 1,
          tempo_preparo_minutos: 1,
          id_categorias: 1,
        }),
      ).rejects.toThrow(NotFoundError);

      expect(mockReceitaRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("quando a receita pertence a outro usuário", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve lançar NotFoundError", async () => {
      await expect(
        editRecipeUseCase.execute({
          id: 1,
          id_usuarios: 99,
          nome: "teste",
          ingredientes: "teste",
          modo_preparo: "teste",
          porcoes: 1,
          tempo_preparo_minutos: 1,
          id_categorias: 1,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("não deve chamar update se a receita não pertence ao usuário", async () => {
      await expect(
        editRecipeUseCase.execute({
          id: 1,
          id_usuarios: 99,
          nome: "teste",
          ingredientes: "teste",
          modo_preparo: "teste",
          porcoes: 1,
          tempo_preparo_minutos: 1,
          id_categorias: 1,
        }),
      ).rejects.toThrow(NotFoundError);

      expect(mockReceitaRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("quando faltam dados obrigatórios", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
    });

    it("deve lançar BadRequestError quando faltam campos obrigatórios", async () => {
      await expect(
        editRecipeUseCase.execute({
          id: 1,
          id_usuarios: 10,
          nome: "Bolo de chocolate",
          // faltando ingredientes, modo_preparo, etc.
        } as any),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro do findById", async () => {
      mockReceitaRepository.findById.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(
        editRecipeUseCase.execute({
          id: 1,
          id_usuarios: 10,
          nome: "teste",
          ingredientes: "teste",
          modo_preparo: "teste",
          porcoes: 1,
          tempo_preparo_minutos: 1,
          id_categorias: 1,
        }),
      ).rejects.toThrow("Erro de conexão com banco");
    });

    it("deve propagar o erro do update", async () => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockReceitaRepository.update.mockRejectedValue(
        new Error("Falha ao atualizar"),
      );

      await expect(
        editRecipeUseCase.execute({
          id: 1,
          id_usuarios: 10,
          nome: "teste",
          ingredientes: "teste",
          modo_preparo: "teste",
          porcoes: 1,
          tempo_preparo_minutos: 1,
          id_categorias: 1,
        }),
      ).rejects.toThrow("Falha ao atualizar");
    });
  });
});

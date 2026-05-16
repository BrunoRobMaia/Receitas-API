import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetRecipeByIdUseCase } from "../useCases/GetRecipeById/GetRecipeByIdUseCase";
import { Receita } from "@prisma/client";

const mockReceitaRepository = {
  findById: vi.fn(),
};

const receitaFake: Receita = {
  id: 1,
  id_usuarios: 10,
  id_categorias: 2,
  nome: "Bolo de cenoura",
  tempo_preparo_minutos: 60,
  porcoes: 8,
  modo_preparo: "Misture tudo e leve ao forno",
  ingredientes: "Cenoura, farinha, ovos, açúcar",
  criado_em: new Date("2024-01-01"),
  alterado_em: new Date("2024-01-01"),
};

describe("GetRecipeByIdUseCase", () => {
  let getRecipeByIdUseCase: GetRecipeByIdUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    getRecipeByIdUseCase = new GetRecipeByIdUseCase(
      mockReceitaRepository as any,
    );
  });

  describe("quando a receita existe e pertence ao usuário", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
    });

    it("deve retornar a receita correta", async () => {
      const result = await getRecipeByIdUseCase.execute(1, 10);

      expect(result).toEqual(receitaFake);
    });

    it("deve chamar findById com id e id_usuarios corretos", async () => {
      await getRecipeByIdUseCase.execute(1, 10);

      expect(mockReceitaRepository.findById).toHaveBeenCalledWith(1, 10);
      expect(mockReceitaRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("deve retornar a receita com id_categorias correto", async () => {
      const result = await getRecipeByIdUseCase.execute(1, 10);

      expect(result).toHaveProperty("id_categorias", 2);
    });
  });

  describe("quando a receita não existe", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve retornar null", async () => {
      const result = await getRecipeByIdUseCase.execute(99, 10);

      expect(result).toBeNull();
    });

    it("deve chamar findById mesmo quando a receita não existe", async () => {
      await getRecipeByIdUseCase.execute(99, 10);

      expect(mockReceitaRepository.findById).toHaveBeenCalledWith(99, 10);
    });
  });

  describe("quando a receita pertence a outro usuário", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve retornar null", async () => {
      const result = await getRecipeByIdUseCase.execute(1, 99);

      expect(result).toBeNull();
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro do findById", async () => {
      mockReceitaRepository.findById.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(getRecipeByIdUseCase.execute(1, 10)).rejects.toThrow(
        "Erro de conexão com banco",
      );
    });
  });
});

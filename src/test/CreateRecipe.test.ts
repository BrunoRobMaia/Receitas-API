import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateRecipeUseCase } from "../useCases/CreateRecipe/CreateRecipeUseCase";
import { ConflictError } from "../utils/errors";

const mockReceitaRepository = {
  findByUserAndName: vi.fn(),
  save: vi.fn(),
};

const receitaFake = {
  id_usuarios: 1,
  id_categorias: 2,
  nome: "Bolo de cenoura",
  tempo_preparo_minutos: 60,
  porcoes: 8,
  modo_preparo: "Misture tudo e leve ao forno",
  ingredientes: "Cenoura, farinha, ovos, açúcar",
};

describe("CreateRecipeUseCase", () => {
  let createRecipeUseCase: CreateRecipeUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    createRecipeUseCase = new CreateRecipeUseCase(mockReceitaRepository as any);
  });

  describe("quando os dados são válidos", () => {
    beforeEach(() => {
      mockReceitaRepository.findByUserAndName.mockResolvedValue(null);
      mockReceitaRepository.save.mockResolvedValue(undefined);
    });

    it("deve retornar mensagem de sucesso", async () => {
      const result = await createRecipeUseCase.execute(receitaFake);

      expect(result).toEqual({ message: "Receita registrada com sucesso!" });
    });

    it("deve chamar findByUserAndName com id_usuarios e nome corretos", async () => {
      await createRecipeUseCase.execute(receitaFake);

      expect(mockReceitaRepository.findByUserAndName).toHaveBeenCalledWith(
        receitaFake.id_usuarios,
        receitaFake.nome,
      );
      expect(mockReceitaRepository.findByUserAndName).toHaveBeenCalledTimes(1);
    });

    it("deve chamar save com todos os campos corretos", async () => {
      await createRecipeUseCase.execute(receitaFake);

      expect(mockReceitaRepository.save).toHaveBeenCalledWith({
        id_categorias: receitaFake.id_categorias,
        id_usuarios: receitaFake.id_usuarios,
        ingredientes: receitaFake.ingredientes,
        modo_preparo: receitaFake.modo_preparo,
        nome: receitaFake.nome,
        porcoes: receitaFake.porcoes,
        tempo_preparo_minutos: receitaFake.tempo_preparo_minutos,
      });
    });

    it("deve chamar save exatamente uma vez", async () => {
      await createRecipeUseCase.execute(receitaFake);

      expect(mockReceitaRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("quando a receita já existe para o usuário", () => {
    beforeEach(() => {
      mockReceitaRepository.findByUserAndName.mockResolvedValue(receitaFake);
    });

    it("deve lançar ConflictError", async () => {
      await expect(createRecipeUseCase.execute(receitaFake)).rejects.toThrow(
        ConflictError,
      );
    });

    it("deve lançar erro com a mensagem correta", async () => {
      await expect(createRecipeUseCase.execute(receitaFake)).rejects.toThrow(
        "Você já cadastrou esta receita.",
      );
    });

    it("não deve chamar save se a receita já existe", async () => {
      await expect(createRecipeUseCase.execute(receitaFake)).rejects.toThrow(
        ConflictError,
      );

      expect(mockReceitaRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro do findByUserAndName", async () => {
      mockReceitaRepository.findByUserAndName.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(createRecipeUseCase.execute(receitaFake)).rejects.toThrow(
        "Erro de conexão com banco",
      );
    });

    it("deve propagar o erro do save", async () => {
      mockReceitaRepository.findByUserAndName.mockResolvedValue(null);
      mockReceitaRepository.save.mockRejectedValue(
        new Error("Falha ao salvar"),
      );

      await expect(createRecipeUseCase.execute(receitaFake)).rejects.toThrow(
        "Falha ao salvar",
      );
    });
  });
});

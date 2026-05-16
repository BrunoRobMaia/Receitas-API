import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteRecipeUseCase } from "../useCases/DeleteRecipe/DeleteRecipeUseCase";
import { NotFoundError } from "../utils/errors";

const mockReceitaRepository = {
  findById: vi.fn(),
  delete: vi.fn(),
};

const receitaFake = {
  id: 1,
  id_usuarios: 10,
  nome: "Bolo de cenoura",
};

describe("DeleteRecipeUseCase", () => {
  let deleteRecipeUseCase: DeleteRecipeUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    deleteRecipeUseCase = new DeleteRecipeUseCase(mockReceitaRepository as any);
  });

  describe("quando a receita existe e pertence ao usuário", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockReceitaRepository.delete.mockResolvedValue(undefined);
    });

    it("deve retornar mensagem de sucesso", async () => {
      const result = await deleteRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
      });

      expect(result).toEqual({ message: "Receita deletada com sucesso!" });
    });

    it("deve chamar findById com id e id_usuarios corretos", async () => {
      await deleteRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockReceitaRepository.findById).toHaveBeenCalledWith(1, 10);
      expect(mockReceitaRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("deve chamar delete com o id da receita", async () => {
      await deleteRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockReceitaRepository.delete).toHaveBeenCalledWith(1);
      expect(mockReceitaRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("quando a receita não existe", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve lançar NotFoundError", async () => {
      await expect(
        deleteRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro com a mensagem correta", async () => {
      await expect(
        deleteRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow("Receita não encontrada.");
    });

    it("não deve chamar delete se a receita não existe", async () => {
      await expect(
        deleteRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow(NotFoundError);

      expect(mockReceitaRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("quando a receita pertence a outro usuário", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve lançar NotFoundError", async () => {
      await expect(
        deleteRecipeUseCase.execute({ id: 1, id_usuarios: 99 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("não deve chamar delete se a receita não pertence ao usuário", async () => {
      await expect(
        deleteRecipeUseCase.execute({ id: 1, id_usuarios: 99 }),
      ).rejects.toThrow(NotFoundError);

      expect(mockReceitaRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro do findById", async () => {
      mockReceitaRepository.findById.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(
        deleteRecipeUseCase.execute({ id: 1, id_usuarios: 10 }),
      ).rejects.toThrow("Erro de conexão com banco");
    });

    it("deve propagar o erro do delete", async () => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockReceitaRepository.delete.mockRejectedValue(
        new Error("Falha ao deletar"),
      );

      await expect(
        deleteRecipeUseCase.execute({ id: 1, id_usuarios: 10 }),
      ).rejects.toThrow("Falha ao deletar");
    });
  });
});

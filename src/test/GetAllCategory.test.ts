import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetAllCategoryUseCase } from "../useCases/GetAllCategory/GetAllCategoryUseCase";

const mockCategoriaRepository = {
  findAll: vi.fn(),
};

const categoriasFake = [
  { id: 1, nome: "Sobremesas" },
  { id: 2, nome: "Massas" },
  { id: 3, nome: "Saladas" },
];

describe("GetAllCategoryUseCase", () => {
  let getAllCategoryUseCase: GetAllCategoryUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    getAllCategoryUseCase = new GetAllCategoryUseCase(
      mockCategoriaRepository as any,
    );
  });

  describe("quando existem categorias cadastradas", () => {
    beforeEach(() => {
      mockCategoriaRepository.findAll.mockResolvedValue(categoriasFake);
    });

    it("deve retornar a lista de categorias", async () => {
      const result = await getAllCategoryUseCase.execute();

      expect(result).toEqual(categoriasFake);
    });

    it("deve retornar a quantidade correta de categorias", async () => {
      const result = await getAllCategoryUseCase.execute();

      expect(result).toHaveLength(3);
    });

    it("deve chamar findAll exatamente uma vez", async () => {
      await getAllCategoryUseCase.execute();

      expect(mockCategoriaRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("deve chamar findAll sem argumentos", async () => {
      await getAllCategoryUseCase.execute();

      expect(mockCategoriaRepository.findAll).toHaveBeenCalledWith();
    });
  });

  describe("quando não existem categorias cadastradas", () => {
    beforeEach(() => {
      mockCategoriaRepository.findAll.mockResolvedValue([]);
    });

    it("deve retornar uma lista vazia", async () => {
      const result = await getAllCategoryUseCase.execute();

      expect(result).toEqual([]);
    });

    it("deve retornar array e não null ou undefined", async () => {
      const result = await getAllCategoryUseCase.execute();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro do findAll", async () => {
      mockCategoriaRepository.findAll.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(getAllCategoryUseCase.execute()).rejects.toThrow(
        "Erro de conexão com banco",
      );
    });
  });
});

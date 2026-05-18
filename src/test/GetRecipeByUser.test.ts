import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetRecipeByUserUseCase } from "../useCases/GetRecipeByUser/GetRecipeByUserUseCase";
import { Receita } from "@prisma/client";

const mockReceitaRepository = {
  findByUser: vi.fn(),
};

const receitasFake: Receita[] = [
  {
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
  },
  {
    id: 2,
    id_usuarios: 10,
    id_categorias: 3,
    nome: "Macarrão ao molho",
    tempo_preparo_minutos: 30,
    porcoes: 4,
    modo_preparo: "Cozinhe o macarrão e adicione o molho",
    ingredientes: "Macarrão, molho de tomate, sal",
    criado_em: new Date("2024-02-01"),
    alterado_em: new Date("2024-02-01"),
  },
];

describe("GetRecipeByUserUseCase", () => {
  let getRecipeByUserUseCase: GetRecipeByUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    getRecipeByUserUseCase = new GetRecipeByUserUseCase(
      mockReceitaRepository as any,
    );
  });

  describe("quando o usuário possui receitas cadastradas", () => {
    beforeEach(() => {
      mockReceitaRepository.findByUser.mockResolvedValue(receitasFake);
    });

    it("deve retornar a lista de receitas do usuário", async () => {
      const result = await getRecipeByUserUseCase.execute(10);

      expect(result).toEqual(receitasFake);
    });

    it("deve retornar a quantidade correta de receitas", async () => {
      const result = await getRecipeByUserUseCase.execute(10);

      expect(result).toHaveLength(2);
    });

    it("deve chamar findByUser com o id_usuarios correto", async () => {
      await getRecipeByUserUseCase.execute(10);

      expect(mockReceitaRepository.findByUser).toHaveBeenCalledWith(
        10,
        undefined,
      );
      expect(mockReceitaRepository.findByUser).toHaveBeenCalledTimes(1);
    });

    it("deve retornar apenas as receitas do usuário informado", async () => {
      const result = await getRecipeByUserUseCase.execute(10);

      result.forEach((receita) => {
        expect(receita.id_usuarios).toBe(10);
      });
    });
  });

  describe("quando o usuário não possui receitas cadastradas", () => {
    beforeEach(() => {
      mockReceitaRepository.findByUser.mockResolvedValue([]);
    });

    it("deve retornar uma lista vazia", async () => {
      const result = await getRecipeByUserUseCase.execute(10);

      expect(result).toEqual([]);
    });

    it("deve retornar array e não null ou undefined", async () => {
      const result = await getRecipeByUserUseCase.execute(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("quando usuários diferentes fazem a consulta", () => {
    it("deve chamar findByUser com o id correto para cada usuário", async () => {
      mockReceitaRepository.findByUser.mockResolvedValueOnce([receitasFake[0]]);
      mockReceitaRepository.findByUser.mockResolvedValueOnce([receitasFake[1]]);

      await getRecipeByUserUseCase.execute(10);
      await getRecipeByUserUseCase.execute(20);

      expect(mockReceitaRepository.findByUser).toHaveBeenNthCalledWith(
        1,
        10,
        undefined,
      );
      expect(mockReceitaRepository.findByUser).toHaveBeenNthCalledWith(
        2,
        20,
        undefined,
      );
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro do findByUser", async () => {
      mockReceitaRepository.findByUser.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(getRecipeByUserUseCase.execute(10)).rejects.toThrow(
        "Erro de conexão com banco",
      );
    });
  });

  describe("quando filtros são fornecidos", () => {
    it("deve chamar findByUser com os filtros", async () => {
      mockReceitaRepository.findByUser.mockResolvedValue([receitasFake[0]]);

      const filters = { nome: "Bolo", id_categorias: 2 };
      await getRecipeByUserUseCase.execute(10, filters);

      expect(mockReceitaRepository.findByUser).toHaveBeenCalledWith(
        10,
        filters,
      );
    });
  });
});

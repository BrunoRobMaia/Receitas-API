import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrintRecipeUseCase } from "../useCases/PrintRecipe/PrintRecipeUseCase";
import { NotFoundError } from "../utils/errors";
import { Receita } from "@prisma/client";

const mockReceitaRepository = {
  findById: vi.fn(),
};

const mockCategoriaRepository = {
  findById: vi.fn(),
};

const mockUsuarioRepository = {
  findById: vi.fn(),
};

const mockRecipePdfService = {
  generate: vi.fn(),
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

const receitaSemCategoriaFake: Receita = {
  ...receitaFake,
  id_categorias: null,
};

const categoriaFake = { id: 2, nome: "Sobremesas" };

const usuarioFake = {
  id: 10,
  nome: "João Silva",
  login: "joao@email.com",
  senha: "hash",
};

const pdfBufferFake = Buffer.from("fake-pdf-content");

describe("PrintRecipeUseCase", () => {
  let printRecipeUseCase: PrintRecipeUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    printRecipeUseCase = new PrintRecipeUseCase(
      mockReceitaRepository as any,
      mockCategoriaRepository as any,
      mockUsuarioRepository as any,
      mockRecipePdfService as any,
    );
  });

  describe("quando a receita existe e possui categoria", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockCategoriaRepository.findById.mockResolvedValue(categoriaFake);
      mockUsuarioRepository.findById.mockResolvedValue(usuarioFake);
      mockRecipePdfService.generate.mockResolvedValue(pdfBufferFake);
    });

    it("deve retornar um Buffer", async () => {
      const result = await printRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
      });

      expect(result).toBeInstanceOf(Buffer);
    });

    it("deve retornar o buffer gerado pelo serviço de PDF", async () => {
      const result = await printRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
      });

      expect(result).toBe(pdfBufferFake);
    });

    it("deve chamar findById do receitaRepository com id e id_usuarios corretos", async () => {
      await printRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockReceitaRepository.findById).toHaveBeenCalledWith(1, 10);
      expect(mockReceitaRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("deve chamar findById do categoriaRepository com o id_categorias da receita", async () => {
      await printRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(
        receitaFake.id_categorias,
      );
      expect(mockCategoriaRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("deve chamar findById do usuarioRepository com o id_usuarios da receita", async () => {
      await printRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockUsuarioRepository.findById).toHaveBeenCalledWith(
        receitaFake.id_usuarios,
      );
      expect(mockUsuarioRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("deve chamar generate do pdfService com receita, categoria e usuario corretos", async () => {
      await printRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockRecipePdfService.generate).toHaveBeenCalledWith({
        receita: receitaFake,
        categoria: categoriaFake,
        usuario: usuarioFake,
      });
    });
  });

  describe("quando a receita existe mas não possui categoria", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(receitaSemCategoriaFake);
      mockUsuarioRepository.findById.mockResolvedValue(usuarioFake);
      mockRecipePdfService.generate.mockResolvedValue(pdfBufferFake);
    });

    it("não deve chamar findById do categoriaRepository", async () => {
      await printRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockCategoriaRepository.findById).not.toHaveBeenCalled();
    });

    it("deve chamar generate com categoria null", async () => {
      await printRecipeUseCase.execute({ id: 1, id_usuarios: 10 });

      expect(mockRecipePdfService.generate).toHaveBeenCalledWith(
        expect.objectContaining({ categoria: null }),
      );
    });

    it("deve retornar o buffer mesmo sem categoria", async () => {
      const result = await printRecipeUseCase.execute({
        id: 1,
        id_usuarios: 10,
      });

      expect(result).toBe(pdfBufferFake);
    });
  });

  describe("quando a receita não existe", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve lançar NotFoundError", async () => {
      await expect(
        printRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro com a mensagem correta", async () => {
      await expect(
        printRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow("Receita não encontrada.");
    });

    it("não deve chamar categoriaRepository se a receita não existe", async () => {
      await expect(
        printRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow(NotFoundError);

      expect(mockCategoriaRepository.findById).not.toHaveBeenCalled();
    });

    it("não deve chamar usuarioRepository se a receita não existe", async () => {
      await expect(
        printRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow(NotFoundError);

      expect(mockUsuarioRepository.findById).not.toHaveBeenCalled();
    });

    it("não deve chamar o serviço de PDF se a receita não existe", async () => {
      await expect(
        printRecipeUseCase.execute({ id: 99, id_usuarios: 10 }),
      ).rejects.toThrow(NotFoundError);

      expect(mockRecipePdfService.generate).not.toHaveBeenCalled();
    });
  });

  describe("quando a receita pertence a outro usuário", () => {
    beforeEach(() => {
      mockReceitaRepository.findById.mockResolvedValue(null);
    });

    it("deve lançar NotFoundError", async () => {
      await expect(
        printRecipeUseCase.execute({ id: 1, id_usuarios: 99 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("não deve chamar o serviço de PDF", async () => {
      await expect(
        printRecipeUseCase.execute({ id: 1, id_usuarios: 99 }),
      ).rejects.toThrow(NotFoundError);

      expect(mockRecipePdfService.generate).not.toHaveBeenCalled();
    });
  });

  describe("quando um serviço lança um erro inesperado", () => {
    it("deve propagar o erro do receitaRepository", async () => {
      mockReceitaRepository.findById.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(
        printRecipeUseCase.execute({ id: 1, id_usuarios: 10 }),
      ).rejects.toThrow("Erro de conexão com banco");
    });

    it("deve propagar o erro do categoriaRepository", async () => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockCategoriaRepository.findById.mockRejectedValue(
        new Error("Falha ao buscar categoria"),
      );

      await expect(
        printRecipeUseCase.execute({ id: 1, id_usuarios: 10 }),
      ).rejects.toThrow("Falha ao buscar categoria");
    });

    it("deve propagar o erro do usuarioRepository", async () => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockCategoriaRepository.findById.mockResolvedValue(categoriaFake);
      mockUsuarioRepository.findById.mockRejectedValue(
        new Error("Falha ao buscar usuário"),
      );

      await expect(
        printRecipeUseCase.execute({ id: 1, id_usuarios: 10 }),
      ).rejects.toThrow("Falha ao buscar usuário");
    });

    it("deve propagar o erro do pdfService", async () => {
      mockReceitaRepository.findById.mockResolvedValue(receitaFake);
      mockCategoriaRepository.findById.mockResolvedValue(categoriaFake);
      mockUsuarioRepository.findById.mockResolvedValue(usuarioFake);
      mockRecipePdfService.generate.mockRejectedValue(
        new Error("Falha ao gerar PDF"),
      );

      await expect(
        printRecipeUseCase.execute({ id: 1, id_usuarios: 10 }),
      ).rejects.toThrow("Falha ao gerar PDF");
    });
  });
});

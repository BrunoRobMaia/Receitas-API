import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateUserUseCase } from "../useCases/CreateUser/CreateUserUseCase";
import { ConflictError, BadRequestError } from "../utils/errors";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs", () => ({
  default: {
    hashSync: vi.fn(() => "hashed_password_123"),
  },
}));

const mockUsuarioRepository = {
  findByLogin: vi.fn(),
  save: vi.fn(),
};

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    createUserUseCase = new CreateUserUseCase(mockUsuarioRepository as any);
  });

  describe("quando os dados são válidos", () => {
    it("deve criar um usuário com sucesso e retornar a mensagem correta", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      mockUsuarioRepository.save.mockResolvedValue(undefined);

      const result = await createUserUseCase.execute({
        nome: "João Silva",
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(result).toEqual({ message: "Usuário registrado com sucesso!" });
    });

    it("deve chamar findByLogin com o login informado", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      mockUsuarioRepository.save.mockResolvedValue(undefined);

      await createUserUseCase.execute({
        nome: "João Silva",
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith(
        "joao@email.com",
      );
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledTimes(1);
    });

    it("deve fazer hash da senha antes de salvar", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      mockUsuarioRepository.save.mockResolvedValue(undefined);

      await createUserUseCase.execute({
        nome: "João Silva",
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(bcrypt.hashSync).toHaveBeenCalledWith("senha123", 10);
    });

    it("deve salvar o usuário com a senha hasheada (nunca em texto puro)", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      mockUsuarioRepository.save.mockResolvedValue(undefined);

      await createUserUseCase.execute({
        nome: "João Silva",
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(mockUsuarioRepository.save).toHaveBeenCalledWith({
        nome: "João Silva",
        login: "joao@email.com",
        senha: "hashed_password_123",
      });
    });
  });

  describe("quando o login já está cadastrado", () => {
    it("deve lançar ConflictError", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue({
        id: "1",
        login: "joao@email.com",
      });

      await expect(
        createUserUseCase.execute({
          nome: "João Silva",
          login: "joao@email.com",
          senha: "senha123",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("deve lançar erro com a mensagem correta", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue({
        id: "1",
        login: "joao@email.com",
      });

      await expect(
        createUserUseCase.execute({
          nome: "João Silva",
          login: "joao@email.com",
          senha: "senha123",
        }),
      ).rejects.toThrow("Usuário já cadastrado.");
    });

    it("não deve chamar save se o usuário já existe", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue({
        id: "1",
        login: "joao@email.com",
      });

      await expect(
        createUserUseCase.execute({
          nome: "João Silva",
          login: "joao@email.com",
          senha: "senha123",
        }),
      ).rejects.toThrow(ConflictError);

      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("quando campos obrigatórios estão ausentes", () => {
    beforeEach(() => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
    });

    it("deve lançar BadRequestError quando nome está vazio", async () => {
      await expect(
        createUserUseCase.execute({
          nome: "",
          login: "joao@email.com",
          senha: "senha123",
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar BadRequestError quando login está vazio", async () => {
      await expect(
        createUserUseCase.execute({
          nome: "João Silva",
          login: "",
          senha: "senha123",
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar BadRequestError quando senha está vazia", async () => {
      await expect(
        createUserUseCase.execute({
          nome: "João Silva",
          login: "joao@email.com",
          senha: "",
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro com a mensagem correta quando campos estão ausentes", async () => {
      await expect(
        createUserUseCase.execute({
          nome: "",
          login: "",
          senha: "",
        }),
      ).rejects.toThrow("Preencha os campos obrigatórios");
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro do findByLogin", async () => {
      mockUsuarioRepository.findByLogin.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(
        createUserUseCase.execute({
          nome: "João Silva",
          login: "joao@email.com",
          senha: "senha123",
        }),
      ).rejects.toThrow("Erro de conexão com banco");
    });

    it("deve propagar o erro do save", async () => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      mockUsuarioRepository.save.mockRejectedValue(
        new Error("Falha ao salvar"),
      );

      await expect(
        createUserUseCase.execute({
          nome: "João Silva",
          login: "joao@email.com",
          senha: "senha123",
        }),
      ).rejects.toThrow("Falha ao salvar");
    });
  });
});

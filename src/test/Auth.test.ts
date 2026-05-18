import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthUseCase } from "../useCases/Auth/AuthUseCase";
import { UnauthorizedError } from "../utils/errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

vi.mock("bcryptjs", () => ({
  default: {
    compareSync: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mocked_jwt_token"),
  },
}));

const mockUsuarioRepository = {
  findByLogin: vi.fn(),
};

const usuarioFake = {
  id: 1,
  nome: "João Silva",
  login: "joao@email.com",
  senha: "hashed_password_123",
};

describe("AuthUseCase", () => {
  let authUseCase: AuthUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    authUseCase = new AuthUseCase(mockUsuarioRepository as any);
    process.env.JWT_SECRET = "test_secret";
  });

  describe("quando as credenciais são válidas", () => {
    beforeEach(() => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(usuarioFake);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);
    });

    it("deve retornar mensagem de sucesso, token e dados do usuário", async () => {
      const result = await authUseCase.execute({
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(result).toEqual({
        message: "Login realizado com sucesso!",
        token: "mocked_jwt_token",
        usuario: {
          nome: "João Silva",
          login: "joao@email.com",
        },
      });
    });

    it("deve chamar findByLogin com o login informado", async () => {
      await authUseCase.execute({
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith(
        "joao@email.com",
      );
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledTimes(1);
    });

    it("deve comparar a senha informada com o hash do banco", async () => {
      await authUseCase.execute({
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        "senha123",
        usuarioFake.senha,
      );
    });

    it("deve gerar o token JWT com o id do usuário como subject", async () => {
      await authUseCase.execute({
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        {},
        "test_secret",
        expect.objectContaining({
          subject: usuarioFake.id.toString(),
          expiresIn: "1d",
        }),
      );
    });

    it("deve retornar o token gerado pelo jwt.sign", async () => {
      vi.mocked(jwt.sign).mockReturnValue("token_especifico_123" as never);

      const result = await authUseCase.execute({
        login: "joao@email.com",
        senha: "senha123",
      });

      expect(result.token).toBe("token_especifico_123");
    });
  });

  describe("quando o login não existe", () => {
    beforeEach(() => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
    });

    it("deve lançar UnauthorizedError", async () => {
      await expect(
        authUseCase.execute({ login: "inexistente@email.com", senha: "123" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("deve lançar erro com a mensagem correta", async () => {
      await expect(
        authUseCase.execute({ login: "inexistente@email.com", senha: "123" }),
      ).rejects.toThrow("Login inválido, tente novamente");
    });

    it("não deve chamar bcrypt se o usuário não existe", async () => {
      await expect(
        authUseCase.execute({ login: "inexistente@email.com", senha: "123" }),
      ).rejects.toThrow(UnauthorizedError);

      expect(bcrypt.compareSync).not.toHaveBeenCalled();
    });

    it("não deve chamar jwt.sign se o usuário não existe", async () => {
      await expect(
        authUseCase.execute({ login: "inexistente@email.com", senha: "123" }),
      ).rejects.toThrow(UnauthorizedError);

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe("quando a senha está incorreta", () => {
    beforeEach(() => {
      mockUsuarioRepository.findByLogin.mockResolvedValue(usuarioFake);
      vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);
    });

    it("deve lançar UnauthorizedError", async () => {
      await expect(
        authUseCase.execute({ login: "joao@email.com", senha: "senha_errada" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("deve lançar erro com a mensagem correta", async () => {
      await expect(
        authUseCase.execute({ login: "joao@email.com", senha: "senha_errada" }),
      ).rejects.toThrow("Senha inválida, tente novamente");
    });

    it("não deve chamar jwt.sign se a senha está incorreta", async () => {
      await expect(
        authUseCase.execute({ login: "joao@email.com", senha: "senha_errada" }),
      ).rejects.toThrow(UnauthorizedError);

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe("quando o repositório lança um erro inesperado", () => {
    it("deve propagar o erro", async () => {
      mockUsuarioRepository.findByLogin.mockRejectedValue(
        new Error("Erro de conexão com banco"),
      );

      await expect(
        authUseCase.execute({ login: "joao@email.com", senha: "senha123" }),
      ).rejects.toThrow("Erro de conexão com banco");
    });
  });
});

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UsuarioRepository } from "../../repositories/UsuarioRepository";
import { AuthDTO } from "./AuthDTO";
import { UnauthorizedError } from "../../utils/errors";

export class AuthUseCase {
  constructor(private userRepository: UsuarioRepository) {}

  async execute(data: AuthDTO) {
    const user = await this.userRepository.findByLogin(data.login);

    if (!user) {
      throw new UnauthorizedError("Login inválido, tente novamente");
    }

    const senhaValida = bcrypt.compareSync(data.senha, user.senha);

    if (!senhaValida) {
      throw new UnauthorizedError("Senha inválida, tente novamente");
    }

    const token = jwt.sign({}, process.env.JWT_SECRET as string, {
      subject: user.id.toString(),
      expiresIn: "1d",
    });

    return {
      message: "Login realizado com sucesso!",
      token,
    };
  }
}

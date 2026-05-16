import bcrypt from "bcryptjs";
import { UsuarioRepository } from "../../repositories/UsuarioRepository";
import { CreateUserDTO } from "./CreateUserDTO";
import { BadRequestError, ConflictError } from "../../utils/errors";

export class CreateUserUseCase {
  constructor(private userRepository: UsuarioRepository) {}

  async execute(data: CreateUserDTO) {
    const userAlreadyExists = await this.userRepository.findByLogin(data.login);
    if (userAlreadyExists) {
      throw new ConflictError("Usuário já cadastrado.");
    }

    if (!data.nome || !data.login || !data.senha) {
      throw new BadRequestError("Preencha os campos obrigatórios");
    }

    const hashedPassword = bcrypt.hashSync(data.senha, 10);

    await this.userRepository.save({
      nome: data.nome,
      login: data.login,
      senha: hashedPassword,
    });

    return {
      message: "Usuário registrado com sucesso!",
    };
  }
}

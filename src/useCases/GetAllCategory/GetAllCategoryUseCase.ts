import { CategoriaRepository } from "../../repositories/CategoriaRepository";

export class GetAllCategoryUseCase {
  constructor(private categoryRepository: CategoriaRepository) {}

  async execute() {
    return await this.categoryRepository.findAll();
  }
}

import { IOportunidadeRepository } from "../ports/out/repositories";
import { IListarOportunidadesUseCase } from "../ports/in/use-cases";
import { Oportunidade } from "../domain/entities/types";

export class ListarOportunidadesUseCase implements IListarOportunidadesUseCase {
  constructor(private readonly oportunidadeRepo: IOportunidadeRepository) {}

  async execute(): Promise<Oportunidade[]> {
    return this.oportunidadeRepo.findAll();
  }
}

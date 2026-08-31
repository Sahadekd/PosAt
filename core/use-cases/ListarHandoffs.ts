import { IHandoffRepository } from "../ports/out/repositories";
import { IListarHandoffsUseCase } from "../ports/in/use-cases";
import { Handoff } from "../domain/entities/types";

export class ListarHandoffsUseCase implements IListarHandoffsUseCase {
  constructor(private readonly handoffRepo: IHandoffRepository) {}

  async execute(): Promise<Handoff[]> {
    return this.handoffRepo.findAll();
  }
}

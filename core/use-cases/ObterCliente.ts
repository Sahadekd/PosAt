import { IClienteRepository } from "../ports/out/repositories";
import { IObterClienteUseCase } from "../ports/in/use-cases";
import { Cliente } from "../domain/entities/types";

export class ObterClienteUseCase implements IObterClienteUseCase {
  constructor(private readonly clienteRepo: IClienteRepository) {}

  async execute(id: string): Promise<Cliente | null> {
    return this.clienteRepo.findById(id);
  }
}

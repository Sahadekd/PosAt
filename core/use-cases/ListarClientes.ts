import { IClienteRepository } from "../ports/out/repositories";
import { IListarClientesUseCase } from "../ports/in/use-cases";
import { Cliente, FiltrosCliente } from "../domain/entities/types";

export class ListarClientesUseCase implements IListarClientesUseCase {
  constructor(private readonly clienteRepo: IClienteRepository) {}

  async execute(filtros?: FiltrosCliente): Promise<Cliente[]> {
    return this.clienteRepo.findAll(filtros);
  }
}

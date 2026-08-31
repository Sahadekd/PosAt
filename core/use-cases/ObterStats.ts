import { IClienteRepository } from "../ports/out/repositories";
import { IObterStatsUseCase } from "../ports/in/use-cases";
import { DashboardStats } from "../domain/entities/types";

export class ObterStatsUseCase implements IObterStatsUseCase {
  constructor(private readonly clienteRepo: IClienteRepository) {}

  async execute(): Promise<DashboardStats> {
    return this.clienteRepo.getStats();
  }
}

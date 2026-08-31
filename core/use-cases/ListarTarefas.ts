import { ITarefaRepository } from "../ports/out/repositories";
import { IListarTarefasUseCase } from "../ports/in/use-cases";
import { Tarefa } from "../domain/entities/types";

export class ListarTarefasUseCase implements IListarTarefasUseCase {
  constructor(private readonly tarefaRepo: ITarefaRepository) {}

  async execute(): Promise<Tarefa[]> {
    return this.tarefaRepo.findAll();
  }
}

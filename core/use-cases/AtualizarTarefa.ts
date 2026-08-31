import { ITarefaRepository } from "../ports/out/repositories";
import { IAtualizarTarefaUseCase, IAtualizarTarefaInput } from "../ports/in/use-cases";
import { Tarefa, StatusTarefa } from "../domain/entities/types";

export class AtualizarTarefaUseCase implements IAtualizarTarefaUseCase {
  constructor(private readonly tarefaRepo: ITarefaRepository) {}

  async execute(input: IAtualizarTarefaInput): Promise<Tarefa | null> {
    const updates: Partial<Tarefa> = {};

    if (input.status !== undefined && input.status !== null) {
      updates.status = input.status as StatusTarefa;
      if (input.status === "concluida") {
        updates.concluida_em = new Date().toISOString();
      }
    }
    if (input.titulo !== undefined && input.titulo !== null) updates.titulo = input.titulo;
    if (input.descricao !== undefined) updates.descricao = input.descricao;
    if (input.prioridade !== undefined && input.prioridade !== null) updates.prioridade = input.prioridade;
    if (input.prazoEm !== undefined) updates.prazo_em = input.prazoEm;

    return this.tarefaRepo.update(input.id, updates);
  }
}

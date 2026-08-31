import { ITarefaRepository } from "../ports/out/repositories";
import { ICriarTarefaUseCase, ICriarTarefaInput } from "../ports/in/use-cases";
import { Tarefa } from "../domain/entities/types";

export class CriarTarefaUseCase implements ICriarTarefaUseCase {
  constructor(private readonly tarefaRepo: ITarefaRepository) {}

  async execute(input: ICriarTarefaInput): Promise<Tarefa> {
    return this.tarefaRepo.create({
      cliente_id: input.clienteId,
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      status: "pendente",
      prioridade: input.prioridade ?? 2,
      responsavel_id: input.responsavelId ?? null,
      prazo_em: input.prazoEm ?? null,
    });
  }
}

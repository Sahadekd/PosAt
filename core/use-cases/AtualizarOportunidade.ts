import { IOportunidadeRepository } from "../ports/out/repositories";
import {
  IAtualizarOportunidadeUseCase,
  IAtualizarOportunidadeInput,
} from "../ports/in/use-cases";
import { Oportunidade } from "../domain/entities/types";

export class AtualizarOportunidadeUseCase implements IAtualizarOportunidadeUseCase {
  constructor(private readonly oportunidadeRepo: IOportunidadeRepository) {}

  async execute(input: IAtualizarOportunidadeInput): Promise<Oportunidade | null> {
    const updates: Partial<Oportunidade> = {};

    if (input.status !== undefined && input.status !== null) {
      updates.status = input.status as Oportunidade["status"];
      if (input.status === "perdida" && input.motivoPerda) {
        updates.motivo_perda = input.motivoPerda;
      }
    }
    if (input.descricao !== undefined && input.descricao !== null) updates.descricao = input.descricao;
    if (input.valorEstimado !== undefined) updates.valor_estimado = input.valorEstimado;
    if (input.prioridade !== undefined && input.prioridade !== null)
      updates.prioridade = input.prioridade;
    if (input.evidencia !== undefined) updates.evidencia = input.evidencia;
    if (input.responsavelId !== undefined) updates.responsavel_id = input.responsavelId;
    if (input.prazoEm !== undefined) updates.prazo_em = input.prazoEm;
    if (input.proximoPasso !== undefined) updates.proximo_passo = input.proximoPasso;
    if (input.motivoPerda !== undefined) updates.motivo_perda = input.motivoPerda;

    return this.oportunidadeRepo.update(input.id, updates);
  }
}
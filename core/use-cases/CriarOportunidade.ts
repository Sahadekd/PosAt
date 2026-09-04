import { IOportunidadeRepository } from "../ports/out/repositories";
import {
  ICriarOportunidadeUseCase,
  ICriarOportunidadeInput,
} from "../ports/in/use-cases";
import { Oportunidade } from "../domain/entities/types";

export class CriarOportunidadeUseCase implements ICriarOportunidadeUseCase {
  constructor(private readonly oportunidadeRepo: IOportunidadeRepository) {}

  async execute(input: ICriarOportunidadeInput): Promise<Oportunidade> {
    return this.oportunidadeRepo.create({
      cliente_id: input.clienteId,
      tipo: input.tipo as Oportunidade["tipo"],
      descricao: input.descricao,
      valor_estimado: input.valorEstimado ?? null,
      status: "identificada",
      prioridade: input.prioridade ?? 3,
      evidencia: input.evidencia ?? null,
      criado_por: input.criadoPor ?? null,
      responsavel_id: input.responsavelId ?? null,
      prazo_em: input.prazoEm ?? null,
      proximo_passo: input.proximoPasso ?? null,
    });
  }
}
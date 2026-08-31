import { IInteracaoRepository, IClienteRepository } from "../ports/out/repositories";
import { ICriarInteracaoUseCase, ICriarInteracaoInput } from "../ports/in/use-cases";
import { Interacao, TipoInteracao } from "../domain/entities/types";

export class CriarInteracaoUseCase implements ICriarInteracaoUseCase {
  constructor(
    private readonly interacaoRepo: IInteracaoRepository,
    private readonly clienteRepo: IClienteRepository
  ) {}

  async execute(input: ICriarInteracaoInput): Promise<Interacao> {
    const dataHora = input.ocorreuEm || new Date().toISOString();

    const interacao = await this.interacaoRepo.create({
      cliente_id: input.clienteId,
      tipo: (input.tipo as TipoInteracao) || "observacao",
      canal: input.canal ?? null,
      descricao: input.descricao,
      resultado: input.resultado ?? null,
      criado_por: input.criadoPor ?? null,
      ocorreu_em: dataHora,
    });

    // Update client's last interaction date
    await this.clienteRepo.update(input.clienteId, {
      ultima_interacao_em: dataHora,
    });

    return interacao;
  }
}

import { IHandoffRepository, IClienteRepository } from "../ports/out/repositories";
import { ICriarHandoffUseCase, ICriarHandoffInput } from "../ports/in/use-cases";
import { Handoff } from "../domain/entities/types";

export class CriarHandoffUseCase implements ICriarHandoffUseCase {
  constructor(
    private readonly handoffRepo: IHandoffRepository,
    private readonly clienteRepo: IClienteRepository
  ) {}

  async execute(input: ICriarHandoffInput): Promise<Handoff> {
    const handoff = await this.handoffRepo.create({
      cliente_id: input.clienteId,
      responsavel_origem: input.responsavelOrigem ?? null,
      responsavel_destino: input.responsavelDestino ?? null,
      status: "aguardando_passagem",
      motivo: input.motivo ?? "Passagem Comercial para Pós-Venda",
      resumo: input.resumo ?? null,
      pendencias: input.pendencias ?? [],
      expectativa_cliente: input.expectativaCliente ?? null,
      enviado_em: new Date().toISOString(),
    });

    // Update client status
    await this.clienteRepo.update(input.clienteId, {
      status: "handoff_pendente",
    });

    return handoff;
  }
}

import { IHandoffRepository, IClienteRepository } from "../ports/out/repositories";
import { IAtualizarHandoffUseCase, IAtualizarHandoffInput } from "../ports/in/use-cases";
import { Handoff } from "../domain/entities/types";

export class AtualizarHandoffUseCase implements IAtualizarHandoffUseCase {
  constructor(
    private readonly handoffRepo: IHandoffRepository,
    private readonly clienteRepo: IClienteRepository
  ) {}

  async execute(input: IAtualizarHandoffInput): Promise<Handoff | null> {
    const updates: Partial<Handoff> = {};

    if (input.status !== undefined && input.status !== null) {
      updates.status = input.status;
      if (input.status === "recebido") {
        updates.recebido_em = new Date().toISOString();
      } else if (input.status === "concluido") {
        updates.concluido_em = new Date().toISOString();
      }
    }
    if (input.resumo !== undefined) updates.resumo = input.resumo;
    if (input.pendencias !== undefined) updates.pendencias = input.pendencias;
    if (input.expectativaCliente !== undefined)
      updates.expectativa_cliente = input.expectativaCliente;
    if (input.responsavelDestino !== undefined)
      updates.responsavel_destino = input.responsavelDestino;

    const handoff = await this.handoffRepo.update(input.id, updates);

    // Sync client status when handoff is concluded
    if (handoff && input.status === "concluido") {
      await this.clienteRepo.update(handoff.cliente_id, {
        status: "onboarding",
      });
    }

    return handoff;
  }
}

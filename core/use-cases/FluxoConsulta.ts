import {
  IFluxoExecucaoRepository,
  IFluxoLogRepository,
} from "../ports/out/repositories";
import {
  FluxoExecucao,
  FiltrosExecucaoFluxo,
  ResumoExecucaoFluxo,
} from "../domain/entities/fluxo";

export class ListarExecucoesUseCase {
  constructor(private readonly execucaoRepo: IFluxoExecucaoRepository) {}

  async execute(filtros?: FiltrosExecucaoFluxo): Promise<FluxoExecucao[]> {
    return this.execucaoRepo.findAll(filtros);
  }
}

export class ObterResumoExecucaoUseCase {
  constructor(
    private readonly execucaoRepo: IFluxoExecucaoRepository,
    private readonly logRepo: IFluxoLogRepository
  ) {}

  async execute(execucaoId: string): Promise<ResumoExecucaoFluxo | null> {
    const resumo = await this.execucaoRepo.obterResumo(execucaoId);
    if (resumo) return resumo;

    // Fallback: monta resumo manualmente
    const execucao = await this.execucaoRepo.findById(execucaoId);
    if (!execucao) return null;

    const nos = await this.execucaoRepo.listarNos(execucaoId);
    const logs = await this.logRepo.listarPorExecucao(execucaoId, 100);

    const proximo = nos.find(
      (n) => n.estado === "agendado" || n.estado === "em_execucao" || n.estado === "pendente"
    );

    return {
      execucao,
      nos,
      logs,
      proximaAcao: proximo
        ? {
            noId: proximo.no_id,
            label:
              ((proximo.dados_extra as Record<string, unknown>)?.label as string) ??
              proximo.no_id,
            tipo: proximo.tipo,
            agendadoPara: proximo.agendado_para,
          }
        : null,
      progresso: {
        total: execucao.fluxo?.grafo?.nodes?.length ?? 0,
        concluidos: nos.filter((n) => n.estado === "concluido").length,
        falhados: nos.filter((n) => n.estado === "falhou").length,
        pulados: nos.filter((n) => n.estado === "pulado").length,
      },
    };
  }
}

export class AuditoriaLeadUseCase {
  /**
   * Audita todos os fluxos de um lead (caso de uso 4 da especificação).
   * Responde "o que foi enviado e quando" sem abrir outra tela.
   */
  constructor(
    private readonly execucaoRepo: IFluxoExecucaoRepository,
    private readonly logRepo: IFluxoLogRepository
  ) {}

  async execute(clienteId: string): Promise<{
    execucoes: FluxoExecucao[];
    logs: import("../domain/entities/fluxo").FluxoLog[];
    mensagensEnviadas: {
      execucaoId: string;
      fluxoNome: string;
      noId: string;
      conteudo: string;
      quando: string;
      statusEntrega: string | null;
      origem: string;
    }[];
  }> {
    const execucoes = await this.execucaoRepo.findAll({ cliente_id: clienteId });
    const logs = await this.logRepo.listarPorCliente(clienteId, 500);

    const mensagensEnviadas: {
      execucaoId: string;
      fluxoNome: string;
      noId: string;
      conteudo: string;
      quando: string;
      statusEntrega: string | null;
      origem: string;
    }[] = [];

    for (const exec of execucoes) {
      const nos = await this.execucaoRepo.listarNos(exec.id);
      for (const no of nos) {
        if (no.tipo === "mensagem_whatsapp" && no.conteudo_enviado) {
          mensagensEnviadas.push({
            execucaoId: exec.id,
            fluxoNome: exec.fluxo?.nome ?? "Fluxo",
            noId: no.no_id,
            conteudo: no.conteudo_enviado,
            quando: no.concluido_em ?? no.criado_em,
            statusEntrega: no.status_entrega,
            origem: no.origem,
          });
        }
      }
    }

    mensagensEnviadas.sort((a, b) => b.quando.localeCompare(a.quando));

    return { execucoes, logs, mensagensEnviadas };
  }
}

import { NextResponse } from "next/server";
import {
  obterStatsUseCase,
  listarClientesUseCase,
  listarTarefasUseCase,
  listarOportunidadesUseCase,
} from "@/core/container";

export async function GET() {
  try {
    const [stats, clientes, tarefas, oportunidades] = await Promise.all([
      obterStatsUseCase.execute(),
      listarClientesUseCase.execute(),
      listarTarefasUseCase.execute(),
      listarOportunidadesUseCase.execute(),
    ]);

    const agora = Date.now();
    const dias = (iso?: string | null) =>
      iso ? Math.floor((agora - new Date(iso).getTime()) / 86400000) : null;

    // Alertas acionáveis
    const tarefasVencidas = tarefas.filter(
      (t) =>
        t.status !== "concluida" &&
        t.prazo_em &&
        new Date(t.prazo_em).getTime() < agora
    );

    const clientesSemContatoSemanal = clientes.filter((c) => {
      const d = dias(c.ultima_interacao_em);
      if (c.ultima_interacao_em == null) return true;
      return d !== null && d >= 7;
    });

    const clientesIncompletos = clientes.filter((c) => (c.indice_completude || 0) < 60);

    const clientesDistrato = clientes.filter(
      (c) => c.alerta_distrato_ativo || c.termometro_cx === "insatisfeito_distrato"
    );

    const oportunidadesAtivas = oportunidades.filter(
      (o) => ["identificada", "em_avaliacao", "proposta_enviada", "negociacao"].includes(o.status)
    );
    const pipelineValor = oportunidadesAtivas.reduce((s, o) => s + (o.valor_estimado || 0), 0);
    const oportunidadesVencidas = oportunidadesAtivas.filter(
      (o) => o.prazo_em && new Date(o.prazo_em).getTime() < agora
    );

    // Taxa de completude global para barra
    const completudeSoma = clientes.reduce((s, c) => s + (c.indice_completude || 0), 0);
    const completudeMedia = clientes.length ? Math.round(completudeSoma / clientes.length) : 0;

    return NextResponse.json({
      ...stats,
      completudeMedia,
      alertas: {
        tarefasVencidas: tarefasVencidas.length,
        clientesSemContatoSemanal: clientesSemContatoSemanal.length,
        clientesIncompletos: clientesIncompletos.length,
        clientesDistrato: clientesDistrato.length,
        oportunidadesVencidas: oportunidadesVencidas.length,
      },
      pipeline: {
        oportunidadesAtivas: oportunidadesAtivas.length,
        pipelineValor,
      },
      composicaoStatus: clientes.reduce<Record<string, number>>((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar dashboard.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
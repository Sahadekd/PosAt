import { IFluxoExecucaoRepository } from "../../ports/out/repositories";
import {
  FluxoExecucao,
  FluxoNoExecucao,
  FiltrosExecucaoFluxo,
  ResumoExecucaoFluxo,
} from "../../domain/entities/fluxo";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SELECT_EXECUCAO = `
  *,
  fluxo:fluxos(id, nome, status, grafo),
  cliente:clientes(
    id, status, responsavel_id,
    pessoa:pessoas(nome, telefone)
  ),
  no_atual_atual:fluxo_no_execucoes(*)
`;

export class FluxoExecucaoRepository implements IFluxoExecucaoRepository {
  async findAll(filtros?: FiltrosExecucaoFluxo): Promise<FluxoExecucao[]> {
    if (!supabaseAdmin) return [];

    let query = supabaseAdmin
      .from("fluxo_execucoes")
      .select(SELECT_EXECUCAO)
      .order("iniciado_em", { ascending: false })
      .limit(500);

    if (filtros?.fluxo_id) query = query.eq("fluxo_id", filtros.fluxo_id);
    if (filtros?.cliente_id) query = query.eq("cliente_id", filtros.cliente_id);
    if (filtros?.status) query = query.eq("status", filtros.status);
    if (filtros?.responsavel) {
      query = query.eq("clientes.responsavel_id", filtros.responsavel);
    }
    if (filtros?.busca) {
      const termo = filtros.busca.trim();
      query = query.or(`clientes.pessoas.nome.ilike.%${termo}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return normalizarExecucoes(data);
  }

  async findById(id: string): Promise<FluxoExecucao | null> {
    if (!supabaseAdmin) return null;

    const { data, error } = await supabaseAdmin
      .from("fluxo_execucoes")
      .select(SELECT_EXECUCAO)
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return normalizarExecucoes([data])[0] ?? null;
  }

  async findAtiva(fluxoId: string, clienteId: string): Promise<FluxoExecucao | null> {
    if (!supabaseAdmin) return null;

    const { data, error } = await supabaseAdmin
      .from("fluxo_execucoes")
      .select(SELECT_EXECUCAO)
      .eq("fluxo_id", fluxoId)
      .eq("cliente_id", clienteId)
      .in("status", ["ativa", "pausada_por_resposta", "pausada_manual"])
      .maybeSingle();

    if (error || !data) return null;
    return normalizarExecucoes([data])[0] ?? null;
  }

  async listarParaExecucao(agora: string): Promise<FluxoExecucao[]> {
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
      .from("fluxo_execucoes")
      .select(`
        *,
        fluxo:fluxos(id, nome, status, grafo, pausar_quando_responder, janela_envio_inicio, janela_envio_fim, limite_mensagens_por_dia),
        cliente:clientes(id, status, responsavel_id, pessoa:pessoas(nome, telefone))
      `)
      .eq("status", "ativa")
      .lte("proxima_execucao_em", agora)
      .order("proxima_execucao_em", { ascending: true })
      .limit(50);

    if (error || !data) return [];
    return normalizarExecucoes(data);
  }

  async create(dados: Partial<FluxoExecucao>): Promise<FluxoExecucao> {
    if (!supabaseAdmin) throw new Error("Supabase não configurado.");

    const { data, error } = await supabaseAdmin
      .from("fluxo_execucoes")
      .insert({
        fluxo_id: dados.fluxo_id,
        cliente_id: dados.cliente_id,
        status: dados.status ?? "ativa",
        no_atual_id: dados.no_atual_id ?? null,
        no_atual_estado: dados.no_atual_estado ?? "pendente",
        proxima_execucao_em: dados.proxima_execucao_em ?? null,
        tentativas: dados.tentativas ?? 0,
        pausada_em: dados.pausada_em ?? null,
        pausada_motivo: dados.pausada_motivo ?? null,
        retomada_em: dados.retomada_em ?? null,
        contexto: dados.contexto ?? {},
        iniciada_por: dados.iniciada_por ?? null,
        origem: dados.origem ?? "automatica",
        concluido_em: dados.concluido_em ?? null,
        cancelada_em: dados.cancelada_em ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Erro ao criar execução de fluxo: ${error?.message ?? "desconhecido"}`);
    }
    return data as unknown as FluxoExecucao;
  }

  async update(id: string, dados: Partial<FluxoExecucao>): Promise<FluxoExecucao | null> {
    if (!supabaseAdmin) return null;

    const payload: Record<string, unknown> = {};
    const campos = [
      "status", "no_atual_id", "no_atual_estado", "proxima_execucao_em",
      "tentativas", "pausada_em", "pausada_motivo", "retomada_em",
      "contexto", "concluido_em", "cancelada_em",
    ] as const;

    for (const c of campos) {
      if (dados[c] !== undefined) payload[c] = dados[c];
    }

    if (Object.keys(payload).length === 0) return this.findById(id);

    const { data, error } = await supabaseAdmin
      .from("fluxo_execucoes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;
    return data as unknown as FluxoExecucao;
  }

  async cancelarAtivasDoCliente(clienteId: string, motivo?: string): Promise<number> {
    if (!supabaseAdmin) return 0;

    const { data, error } = await supabaseAdmin
      .from("fluxo_execucoes")
      .update({
        status: "cancelada",
        cancelada_em: new Date().toISOString(),
        pausada_motivo: motivo ?? "cancelada",
      })
      .eq("cliente_id", clienteId)
      .in("status", ["ativa", "pausada_por_resposta", "pausada_manual"])
      .select("id");

    if (error || !data) return 0;
    return data.length;
  }

  // ---- Nós da execução ----

  async listarNos(execucaoId: string): Promise<FluxoNoExecucao[]> {
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
      .from("fluxo_no_execucoes")
      .select("*")
      .eq("execucao_id", execucaoId)
      .order("criado_em", { ascending: true });

    if (error || !data) return [];
    return data as unknown as FluxoNoExecucao[];
  }

  async criarNo(dados: Partial<FluxoNoExecucao>): Promise<FluxoNoExecucao> {
    if (!supabaseAdmin) throw new Error("Supabase não configurado.");

    const { data, error } = await supabaseAdmin
      .from("fluxo_no_execucoes")
      .insert({
        execucao_id: dados.execucao_id,
        no_id: dados.no_id,
        tipo: dados.tipo,
        estado: dados.estado ?? "pendente",
        origem: dados.origem ?? "automatica",
        responsavel_id: dados.responsavel_id ?? null,
        conteudo_enviado: dados.conteudo_enviado ?? null,
        mensagem_whatsapp_id: dados.mensagem_whatsapp_id ?? null,
        status_entrega: dados.status_entrega ?? null,
        erro_detalhe: dados.erro_detalhe ?? null,
        tentativas: dados.tentativas ?? 0,
        ramificacao: dados.ramificacao ?? null,
        agendado_para: dados.agendado_para ?? null,
        iniciado_em: dados.iniciado_em ?? null,
        concluido_em: dados.concluido_em ?? null,
        dados_extra: dados.dados_extra ?? {},
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Erro ao criar execução de nó: ${error?.message ?? "desconhecido"}`);
    }
    return data as unknown as FluxoNoExecucao;
  }

  async atualizarNo(id: string, dados: Partial<FluxoNoExecucao>): Promise<FluxoNoExecucao | null> {
    if (!supabaseAdmin) return null;

    const payload: Record<string, unknown> = {};
    const campos = [
      "estado", "origem", "responsavel_id", "conteudo_enviado",
      "mensagem_whatsapp_id", "status_entrega", "erro_detalhe",
      "tentativas", "ramificacao", "agendado_para", "iniciado_em",
      "concluido_em", "dados_extra",
    ] as const;

    for (const c of campos) {
      if (dados[c] !== undefined) payload[c] = dados[c];
    }

    if (Object.keys(payload).length === 0) return null;

    const { data, error } = await supabaseAdmin
      .from("fluxo_no_execucoes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;
    return data as unknown as FluxoNoExecucao;
  }

  async obterResumo(execucaoId: string): Promise<ResumoExecucaoFluxo | null> {
    const execucao = await this.findById(execucaoId);
    if (!execucao) return null;

    const nos = await this.listarNos(execucaoId);

    const logRepo = new FluxoLogRepositoryInline();
    const logs = await logRepo.listarPorExecucao(execucaoId, 100);

    // Próxima ação pendente
    const proximo = nos.find(
      (n) => n.estado === "agendado" || n.estado === "em_execucao" || n.estado === "pendente"
    );

    // Total de nós definidos no grafo (exclui gatilho que é o ponto de entrada)
    const totalNosGrafo = execucao.fluxo?.grafo?.nodes?.length ?? 0;

    const progresso = {
      total: totalNosGrafo,
      concluidos: nos.filter((n) => n.estado === "concluido").length,
      falhados: nos.filter((n) => n.estado === "falhou").length,
      pulados: nos.filter((n) => n.estado === "pulado").length,
    };

    return {
      execucao,
      nos,
      logs,
      proximaAcao: proximo
        ? {
            noId: proximo.no_id,
            label: (proximo.dados_extra as Record<string, unknown>)?.label as string ?? proximo.no_id,
            tipo: proximo.tipo,
            agendadoPara: proximo.agendado_para,
          }
        : null,
      progresso,
    };
  }
}

// Helper inline para evitar import circular
class FluxoLogRepositoryInline {
  async listarPorExecucao(execucaoId: string, limite = 100) {
    if (!supabaseAdmin) return [];
    const { data } = await supabaseAdmin
      .from("fluxo_log")
      .select("*")
      .eq("execucao_id", execucaoId)
      .order("criado_em", { ascending: false })
      .limit(limite);
    return (data ?? []) as unknown as import("../../domain/entities/fluxo").FluxoLog[];
  }
}

function normalizarExecucoes(rows: Record<string, unknown>[]): FluxoExecucao[] {
  return rows.map((row) => {
    const r = row as Record<string, unknown> & {
      cliente?: Record<string, unknown> | null;
      no_atual_atual?: Record<string, unknown> | null;
    };

    const pessoa = r.cliente?.["pessoa"] as { nome?: string | null; telefone?: string | null } | undefined;

    return {
      ...(row as unknown as FluxoExecucao),
      cliente: r.cliente
        ? {
            id: r.cliente["id"] as string,
            nome: pessoa?.nome ?? null,
            telefone: pessoa?.telefone ?? null,
            status: r.cliente["status"] as string,
            responsavel_id: r.cliente["responsavel_id"] as string | null,
          }
        : undefined,
      no_atual: (r.no_atual_atual as FluxoNoExecucao | null) ?? null,
    };
  });
}

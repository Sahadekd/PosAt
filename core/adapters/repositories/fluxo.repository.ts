import { IFluxoRepository } from "../../ports/out/repositories";
import { Fluxo, FiltrosFluxo, GrafoFluxo } from "../../domain/entities/fluxo";
import { supabaseAdmin } from "@/lib/supabase-admin";

const GRAFO_VAZIO: GrafoFluxo = { nodes: [], edges: [] };

export class FluxoRepository implements IFluxoRepository {
  async findAll(filtros?: FiltrosFluxo): Promise<Fluxo[]> {
    if (!supabaseAdmin) return [];

    let query = supabaseAdmin
      .from("fluxos")
      .select(`
        *,
        execucoes_total:fluxo_execucoes(count),
        execucoes_ativas:fluxo_execucoes(count).filter(status,in.(ativa,pausada_por_resposta,pausada_manual)),
        execucoes_falha:fluxo_execucoes(count).filter(status,eq,falhou)
      `)
      .order("atualizado_em", { ascending: false });

    if (filtros?.status) {
      query = query.eq("status", filtros.status);
    }
    if (filtros?.e_template !== undefined && filtros.e_template !== null) {
      query = query.eq("e_template", filtros.e_template);
    }
    if (filtros?.categoria) {
      query = query.eq("template_categoria", filtros.categoria);
    }
    if (filtros?.responsavel) {
      query = query.eq("responsavel_id", filtros.responsavel);
    }
    if (filtros?.busca) {
      const termo = filtros.busca.trim();
      query = query.or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as unknown as (Fluxo & {
      execucoes_total: { count: number }[];
      execucoes_ativas: { count: number }[];
      execucoes_falha: { count: number }[];
    })[]).map((f) => ({
      ...f,
      total_execucoes: f.execucoes_total?.[0]?.count ?? 0,
      execucoes_ativas: f.execucoes_ativas?.[0]?.count ?? 0,
      execucoes_com_falha: f.execucoes_falha?.[0]?.count ?? 0,
    })) as Fluxo[];
  }

  async findById(id: string): Promise<Fluxo | null> {
    if (!supabaseAdmin) return null;

    const { data, error } = await supabaseAdmin
      .from("fluxos")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as unknown as Fluxo;
  }

  async create(dados: Partial<Fluxo>): Promise<Fluxo> {
    if (!supabaseAdmin) {
      throw new Error("Supabase não configurado.");
    }

    const { data, error } = await supabaseAdmin
      .from("fluxos")
      .insert({
        nome: dados.nome,
        descricao: dados.descricao ?? null,
        status: dados.status ?? "rascunho",
        template_origem_id: dados.template_origem_id ?? null,
        e_template: dados.e_template ?? false,
        template_categoria: dados.template_categoria ?? null,
        responsavel_id: dados.responsavel_id ?? null,
        equipe_escopo: dados.equipe_escopo ?? true,
        pausar_quando_responder: dados.pausar_quando_responder ?? true,
        janela_envio_inicio: dados.janela_envio_inicio ?? "08:00",
        janela_envio_fim: dados.janela_envio_fim ?? "20:00",
        limite_mensagens_por_dia: dados.limite_mensagens_por_dia ?? 8,
        grafo: dados.grafo ?? GRAFO_VAZIO,
        criado_por: dados.criado_por ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Erro ao criar fluxo: ${error?.message ?? "desconhecido"}`);
    }
    return data as unknown as Fluxo;
  }

  async update(id: string, dados: Partial<Fluxo>): Promise<Fluxo | null> {
    if (!supabaseAdmin) return null;

    const payload: Record<string, unknown> = {};
    const camposPermitidos = [
      "nome", "descricao", "status", "template_categoria",
      "responsavel_id", "equipe_escopo", "pausar_quando_responder",
      "janela_envio_inicio", "janela_envio_fim", "limite_mensagens_por_dia",
      "grafo", "e_template",
    ] as const;

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        payload[campo] = dados[campo];
      }
    }

    if (Object.keys(payload).length === 0) return this.findById(id);

    const { data, error } = await supabaseAdmin
      .from("fluxos")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;
    return data as unknown as Fluxo;
  }

  async delete(id: string): Promise<boolean> {
    if (!supabaseAdmin) return false;
    const { error } = await supabaseAdmin.from("fluxos").delete().eq("id", id);
    return !error;
  }

  async duplicar(id: string, criadoPor?: string | null): Promise<Fluxo | null> {
    const original = await this.findById(id);
    if (!original) return null;

    return this.create({
      nome: `${original.nome} (cópia)`,
      descricao: original.descricao,
      status: "rascunho",
      template_origem_id: original.e_template ? original.id : (original.template_origem_id ?? original.id),
      e_template: original.e_template,
      template_categoria: original.template_categoria,
      responsavel_id: original.responsavel_id,
      equipe_escopo: original.equipe_escopo,
      pausar_quando_responder: original.pausar_quando_responder,
      janela_envio_inicio: original.janela_envio_inicio,
      janela_envio_fim: original.janela_envio_fim,
      limite_mensagens_por_dia: original.limite_mensagens_por_dia,
      grafo: original.grafo,
      criado_por: criadoPor ?? original.criado_por,
    });
  }
}

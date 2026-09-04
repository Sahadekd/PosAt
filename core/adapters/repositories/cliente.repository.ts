import { IClienteRepository } from "../../ports/out/repositories";
import { Cliente, DashboardStats, FiltrosCliente } from "../../domain/entities/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class ClienteRepository implements IClienteRepository {
  async findAll(filtros?: FiltrosCliente): Promise<Cliente[]> {
    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from("clientes")
        .select(`
          *,
          pessoa:pessoas(*),
          interacoes:interacoes(*),
          tarefas:tarefas_pos_atendimento(*),
          handoffs:handoffs(*)
        `)
        .order("atualizado_em", { ascending: false });

      if (filtros?.finalidade && filtros.finalidade !== "todas") {
        query = query.eq("finalidade_principal", filtros.finalidade);
      }
      if (filtros?.status && filtros.status !== "todos") {
        query = query.eq("status", filtros.status);
      }
      if (filtros?.regiao && filtros.regiao !== "todas") {
        query = query.eq("regiao_interesse", filtros.regiao);
      }
      if (filtros?.confianca && filtros.confianca !== "todas") {
        query = query.eq("nivel_confianca", filtros.confianca);
      }
      if (filtros?.completude_maxima) {
        const max = parseInt(filtros.completude_maxima, 10);
        if (!isNaN(max)) {
          query = query.lte("indice_completude", max);
        }
      }

      const { data, error } = await query;
      if (!error && data) {
        let items = data as unknown as Cliente[];
        if (filtros?.busca) {
          const termo = filtros.busca.toLowerCase();
          items = items.filter(
            (c) =>
              c.pessoa?.nome?.toLowerCase().includes(termo) ||
              c.pessoa?.telefone?.includes(termo) ||
              c.pessoa?.email?.toLowerCase().includes(termo) ||
              c.cidade_interesse?.toLowerCase().includes(termo) ||
              c.bairro_interesse?.toLowerCase().includes(termo)
          );
        }
        return items;
      }
    }

    const fallbackItems = storageFallback.getClientes(filtros as any);
    return fallbackItems as unknown as Cliente[];
  }

  async findById(id: string): Promise<Cliente | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("clientes")
        .select(`
          *,
          pessoa:pessoas(*),
          interacoes:interacoes(*),
          tarefas:tarefas_pos_atendimento(*),
          handoffs:handoffs(*)
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as unknown as Cliente;
      }
    }

    const fallbackItem = storageFallback.getClienteById(id);
    return (fallbackItem as unknown as Cliente) || null;
  }

  async create(data: Partial<Cliente>): Promise<Cliente> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("clientes")
        .insert({
          pessoa_id: data.pessoa_id,
          status: data.status ?? "novo_lead",
          finalidade_principal: data.finalidade_principal ?? "nao_identificado",
          finalidades_secundarias: data.finalidades_secundarias ?? [],
          regiao_interesse: data.regiao_interesse ?? null,
          cidade_interesse: data.cidade_interesse ?? null,
          bairro_interesse: data.bairro_interesse ?? null,
          tipo_imovel: data.tipo_imovel ?? null,
          padrao_imovel: data.padrao_imovel ?? null,
          valor_minimo: data.valor_minimo ?? null,
          valor_maximo: data.valor_maximo ?? null,
          prazo_compra: data.prazo_compra ?? null,
          forma_pagamento: data.forma_pagamento ?? null,
          precisa_financiamento: data.precisa_financiamento ?? null,
          ja_possui_imovel: data.ja_possui_imovel ?? null,
          e_investidor_confirmado: data.e_investidor_confirmado ?? false,
          indice_completude: data.indice_completude ?? 0,
          nivel_confianca: data.nivel_confianca ?? "baixa",
          campos_faltantes: data.campos_faltantes ?? [],
          sinais_classificacao: data.sinais_classificacao ?? [],
          responsavel_id: data.responsavel_id ?? null,
          proxima_acao: data.proxima_acao ?? null,
          proxima_acao_em: data.proxima_acao_em ?? null,
        })
        .select(`
          *,
          pessoa:pessoas(*),
          interacoes:interacoes(*),
          tarefas:tarefas_pos_atendimento(*),
          handoffs:handoffs(*)
        `)
        .single();

      if (!error && created) {
        return created as unknown as Cliente;
      }
    }

    const fallbackCreated = storageFallback.addCliente(data as any);
    return fallbackCreated as unknown as Cliente;
  }

  async update(id: string, data: Partial<Cliente>): Promise<Cliente | null> {
    if (supabaseAdmin) {
      const { data: updated, error } = await supabaseAdmin
        .from("clientes")
        .update({
          ...data,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          pessoa:pessoas(*),
          interacoes:interacoes(*),
          tarefas:tarefas_pos_atendimento(*),
          handoffs:handoffs(*)
        `)
        .single();

      if (!error && updated) {
        return updated as unknown as Cliente;
      }
    }

    const fallbackUpdated = storageFallback.updateCliente(id, data as any);
    return (fallbackUpdated as unknown as Cliente) || null;
  }

  async getStats(): Promise<DashboardStats> {
    if (supabaseAdmin) {
      const { data: clientes, error: errC } = await supabaseAdmin
        .from("clientes")
        .select("id, indice_completude, finalidade_principal, e_investidor_confirmado");

      const { data: tarefas, error: errT } = await supabaseAdmin
        .from("tarefas_pos_atendimento")
        .select("id, status")
        .in("status", ["pendente", "em_andamento"]);

      const { data: handoffs, error: errH } = await supabaseAdmin
        .from("handoffs")
        .select("id, status")
        .in("status", ["pendente", "em_andamento"]);

      if (!errC && !errT && !errH && clientes) {
        const total = clientes.length;
        const totalCompletude = clientes.reduce((acc, c) => acc + (c.indice_completude || 0), 0);
        const completudeMedia = total > 0 ? Math.round(totalCompletude / total) : 0;
        const investidores = clientes.filter(
          (c) => c.finalidade_principal === "investimento" || c.e_investidor_confirmado
        ).length;

        return {
          totalClientes: total,
          completudeMedia,
          investidores,
          tarefasPendentes: tarefas?.length || 0,
          handoffsAtivos: handoffs?.length || 0,
        };
      }
    }

    const stats = storageFallback.getStats();
    return stats;
  }
}

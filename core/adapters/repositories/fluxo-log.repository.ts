import { IFluxoLogRepository } from "../../ports/out/repositories";
import { FluxoLog } from "../../domain/entities/fluxo";
import { supabaseAdmin } from "@/lib/supabase-admin";

export class FluxoLogRepository implements IFluxoLogRepository {
  async listarPorExecucao(execucaoId: string, limite = 100): Promise<FluxoLog[]> {
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
      .from("fluxo_log")
      .select("*")
      .eq("execucao_id", execucaoId)
      .order("criado_em", { ascending: false })
      .limit(limite);

    if (error || !data) return [];
    return data as unknown as FluxoLog[];
  }

  async listarPorCliente(clienteId: string, limite = 100): Promise<FluxoLog[]> {
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
      .from("fluxo_log")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("criado_em", { ascending: false })
      .limit(limite);

    if (error || !data) return [];
    return data as unknown as FluxoLog[];
  }

  async listarPorFluxo(fluxoId: string, limite = 200): Promise<FluxoLog[]> {
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
      .from("fluxo_log")
      .select("*")
      .eq("fluxo_id", fluxoId)
      .order("criado_em", { ascending: false })
      .limit(limite);

    if (error || !data) return [];
    return data as unknown as FluxoLog[];
  }

  async create(dados: Partial<FluxoLog>): Promise<FluxoLog> {
    if (!supabaseAdmin) throw new Error("Supabase não configurado.");

    const { data, error } = await supabaseAdmin
      .from("fluxo_log")
      .insert({
        execucao_id: dados.execucao_id ?? null,
        fluxo_id: dados.fluxo_id ?? null,
        cliente_id: dados.cliente_id ?? null,
        no_id: dados.no_id ?? null,
        evento: dados.evento,
        detalhe: dados.detalhe ?? null,
        origem: dados.origem ?? "automatica",
        responsavel_id: dados.responsavel_id ?? null,
        dados: dados.dados ?? {},
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Erro ao criar log de fluxo: ${error?.message ?? "desconhecido"}`);
    }
    return data as unknown as FluxoLog;
  }
}

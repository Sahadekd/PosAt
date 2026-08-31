import { IInteracaoRepository } from "../../ports/out/repositories";
import { Interacao } from "../../domain/entities/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class InteracaoRepository implements IInteracaoRepository {
  async findAll(clienteId?: string): Promise<Interacao[]> {
    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from("interacoes")
        .select("*")
        .order("ocorreu_em", { ascending: false });

      if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as unknown as Interacao[];
      }
    }

    const fallbackItems = storageFallback.getInteracoes(clienteId);
    return fallbackItems as unknown as Interacao[];
  }

  async findById(id: string): Promise<Interacao | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("interacoes")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as unknown as Interacao;
      }
    }

    const all = storageFallback.getInteracoes();
    const found = all.find((i: any) => i.id === id);
    return (found as unknown as Interacao) || null;
  }

  async create(data: Partial<Interacao>): Promise<Interacao> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("interacoes")
        .insert({
          cliente_id: data.cliente_id,
          tipo: data.tipo ?? "observacao",
          canal: data.canal ?? null,
          descricao: data.descricao,
          resultado: data.resultado ?? null,
          criado_por: data.criado_por ?? null,
          ocorreu_em: data.ocorreu_em || new Date().toISOString(),
          dados_extra: data.dados_extra ?? {},
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as Interacao;
      }
    }

    const fallbackCreated = storageFallback.addInteracao(data as any);
    return fallbackCreated as unknown as Interacao;
  }
}

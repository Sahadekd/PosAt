import { IHandoffRepository } from "../../ports/out/repositories";
import { Handoff } from "../../domain/entities/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class HandoffRepository implements IHandoffRepository {
  async findAll(): Promise<Handoff[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("handoffs")
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .order("criado_em", { ascending: false });

      if (!error && data) {
        return data as unknown as Handoff[];
      }
    }

    const fallbackItems = storageFallback.getHandoffs();
    return fallbackItems as unknown as Handoff[];
  }

  async findById(id: string): Promise<Handoff | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("handoffs")
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as unknown as Handoff;
      }
    }

    const all = storageFallback.getHandoffs();
    const found = all.find((h: any) => h.id === id);
    return (found as unknown as Handoff) || null;
  }

  async create(data: Partial<Handoff>): Promise<Handoff> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("handoffs")
        .insert({
          cliente_id: data.cliente_id,
          responsavel_origem: data.responsavel_origem ?? null,
          responsavel_destino: data.responsavel_destino ?? null,
          status: data.status ?? "pendente",
          motivo: data.motivo ?? null,
          resumo: data.resumo ?? null,
          pendencias: data.pendencias ?? [],
          expectativa_cliente: data.expectativa_cliente ?? null,
          enviado_em: new Date().toISOString(),
        })
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .single();

      if (!error && created) {
        return created as unknown as Handoff;
      }
    }

    const fallbackCreated = storageFallback.addHandoff(data as any);
    return fallbackCreated as unknown as Handoff;
  }

  async update(id: string, data: Partial<Handoff>): Promise<Handoff | null> {
    if (supabaseAdmin) {
      const updatePayload: Record<string, unknown> = { ...data };
      if (data.status === "concluido") {
        updatePayload.concluido_em = new Date().toISOString();
      }
      if (data.status === "em_andamento" && !data.recebido_em) {
        updatePayload.recebido_em = new Date().toISOString();
      }

      const { data: updated, error } = await supabaseAdmin
        .from("handoffs")
        .update(updatePayload)
        .eq("id", id)
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .single();

      if (!error && updated) {
        return updated as unknown as Handoff;
      }
    }

    const handoffs = storageFallback.getHandoffs();
    const index = (storageFallback as any).handoffs?.findIndex((h: any) => h.id === id) ?? -1;
    if (index !== -1 && (storageFallback as any).handoffs) {
      (storageFallback as any).handoffs[index] = {
        ...(storageFallback as any).handoffs[index],
        ...data,
      };
      return storageFallback.getHandoffs().find((h: any) => h.id === id) as unknown as Handoff;
    }
    return null;
  }
}

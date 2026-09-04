import { ITarefaRepository } from "../../ports/out/repositories";
import { Tarefa } from "../../domain/entities/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class TarefaRepository implements ITarefaRepository {
  async findAll(): Promise<Tarefa[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("tarefas_pos_atendimento")
        .select(`
          *,
          cliente:clientes(
            id,
            finalidade_principal,
            status,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .order("prioridade", { ascending: false })
        .order("prazo_em", { ascending: true, nullsFirst: false });

      if (!error && data) {
        return data as unknown as Tarefa[];
      }
    }

    const fallbackItems = storageFallback.getTarefas();
    return fallbackItems as unknown as Tarefa[];
  }

  async findById(id: string): Promise<Tarefa | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("tarefas_pos_atendimento")
        .select(`
          *,
          cliente:clientes(
            id,
            finalidade_principal,
            status,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as unknown as Tarefa;
      }
    }

    const all = storageFallback.getTarefas();
    const found = all.find((t: any) => t.id === id);
    return (found as unknown as Tarefa) || null;
  }

  async create(data: Partial<Tarefa>): Promise<Tarefa> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("tarefas_pos_atendimento")
        .insert({
          cliente_id: data.cliente_id,
          titulo: data.titulo,
          descricao: data.descricao ?? null,
          status: data.status ?? "pendente",
          prioridade: data.prioridade ?? 2,
          responsavel_id: data.responsavel_id ?? null,
          prazo_em: data.prazo_em ?? null,
        })
        .select(`
          *,
          cliente:clientes(
            id,
            finalidade_principal,
            status,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .single();

      if (!error && created) {
        return created as unknown as Tarefa;
      }
    }

    const fallbackCreated = storageFallback.addTarefa(data as any);
    return fallbackCreated as unknown as Tarefa;
  }

  async update(id: string, data: Partial<Tarefa>): Promise<Tarefa | null> {
    if (supabaseAdmin) {
      const updatePayload: Record<string, unknown> = {
        ...data,
        atualizado_em: new Date().toISOString(),
      };
      if (data.status === "concluida") {
        updatePayload.concluido_em = new Date().toISOString();
      }

      const { data: updated, error } = await supabaseAdmin
        .from("tarefas_pos_atendimento")
        .update(updatePayload)
        .eq("id", id)
        .select(`
          *,
          cliente:clientes(
            id,
            finalidade_principal,
            status,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .single();

      if (!error && updated) {
        return updated as unknown as Tarefa;
      }
    }

    const fallbackUpdated = storageFallback.updateTarefa(id, data as any);
    return (fallbackUpdated as unknown as Tarefa) || null;
  }
}

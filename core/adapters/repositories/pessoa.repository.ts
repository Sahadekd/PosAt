import { IPessoaRepository } from "../../ports/out/repositories";
import { Pessoa } from "../../domain/entities/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class PessoaRepository implements IPessoaRepository {
  async findAll(): Promise<Pessoa[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("pessoas")
        .select("*")
        .order("criado_em", { ascending: false });
      if (!error && data) {
        return data as Pessoa[];
      }
    }
    return storageFallback.getPessoas() as unknown as Pessoa[];
  }

  async findById(id: string): Promise<Pessoa | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("pessoas")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        return data as Pessoa;
      }
    }
    const pessoa = storageFallback.getPessoas().find((p) => p.id === id);
    return (pessoa as unknown as Pessoa) || null;
  }

  async create(data: Partial<Pessoa>): Promise<Pessoa> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("pessoas")
        .insert({
          nome: data.nome ?? null,
          telefone: data.telefone ?? null,
          email: data.email ?? null,
          documento: data.documento ?? null,
          origem: data.origem ?? "manual",
          id_externo: data.id_externo ?? null,
          dados_originais: data.dados_originais ?? {},
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as Pessoa;
      }
    }

    const fallbackCreated = storageFallback.addPessoa({
      nome: data.nome ?? "",
      telefone: data.telefone ?? "",
      email: data.email ?? "",
      documento: data.documento ?? undefined,
      origem: (data.origem as any) ?? "manual",
      dados_originais: data.dados_originais as any,
    });
    return fallbackCreated as unknown as Pessoa;
  }

  async update(id: string, data: Partial<Pessoa>): Promise<Pessoa | null> {
    if (supabaseAdmin) {
      const { data: updated, error } = await supabaseAdmin
        .from("pessoas")
        .update({
          ...data,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      if (!error && updated) {
        return updated as Pessoa;
      }
    }

    const pessoas = storageFallback.getPessoas();
    const index = pessoas.findIndex((p) => p.id === id);
    if (index !== -1) {
      pessoas[index] = {
        ...pessoas[index],
        ...data as any,
        atualizado_em: new Date().toISOString(),
      };
      return pessoas[index] as unknown as Pessoa;
    }
    return null;
  }
}

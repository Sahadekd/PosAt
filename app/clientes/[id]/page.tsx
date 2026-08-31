import { notFound } from "next/navigation";
import { storageFallback } from "@/lib/storage-fallback";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ClienteCompleto } from "@/lib/segmentacao/tipos";
import ClienteProfile from "@/components/ClienteProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getClienteData(id: string): Promise<ClienteCompleto | null> {
  if (supabaseAdmin) {
    const { data: cliente, error } = await supabaseAdmin
      .from("clientes")
      .select(`
        *,
        pessoa:pessoas(*),
        interacoes(*),
        tarefas:tarefas_pos_atendimento(*),
        handoffs(*)
      `)
      .eq("id", id)
      .single();

    if (!error && cliente) {
      return cliente as unknown as ClienteCompleto;
    }
  }

  // Fallback store
  return storageFallback.getClienteById(id);
}

export default async function ClienteDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const cliente = await getClienteData(id);

  if (!cliente) {
    notFound();
  }

  return <ClienteProfile clienteInicial={cliente} />;
}

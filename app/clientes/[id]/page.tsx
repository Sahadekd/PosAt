import { notFound } from "next/navigation";
import { obterClienteUseCase } from "@/core/container";
import { ClienteCompleto } from "@/lib/segmentacao/tipos";
import ClienteProfile from "@/components/ClienteProfile";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClienteDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const cliente = (await obterClienteUseCase.execute(id)) as unknown as ClienteCompleto | null;

  if (!cliente) {
    notFound();
  }

  return <ClienteProfile clienteInicial={cliente} />;
}

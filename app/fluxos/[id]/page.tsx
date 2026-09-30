import FluxoEditor from "@/components/fluxo/FluxoEditor";

export const metadata = {
  title: "Editor de Fluxo",
};

export default async function FluxoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FluxoEditor fluxoId={id} />;
}

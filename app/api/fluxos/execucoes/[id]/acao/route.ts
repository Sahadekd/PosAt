import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { controlarExecucaoUseCase, executarFluxoUseCase } from "@/core/container";

const acaoSchema = z.object({
  acao: z.enum([
    "pausar",
    "retomar",
    "cancelar",
    "pular_etapa",
    "reexecutar_no_falho",
    "executar_agora",
  ]),
  responsavelId: z.string().uuid().optional().nullable(),
  noId: z.string().optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = acaoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: parsed.error.issues },
        { status: 422 }
      );
    }

    const { acao, responsavelId, noId } = parsed.data;
    const executor = controlarExecucaoUseCase;

    switch (acao) {
      case "pausar":
        await executor.pausar(id, responsavelId);
        break;
      case "retomar":
        await executor.retomar(id, responsavelId);
        break;
      case "cancelar":
        await executor.cancelar(id, responsavelId);
        break;
      case "pular_etapa":
        if (!noId) {
          return NextResponse.json(
            { erro: "noId é obrigatório para pular etapa." },
            { status: 422 }
          );
        }
        await executor.pularEtapa(id, noId, responsavelId);
        break;
      case "reexecutar_no_falho":
        await executor.reexecutarNoFalho(id, responsavelId);
        break;
      case "executar_agora":
        await executarFluxoUseCase.executar(id);
        break;
    }

    return NextResponse.json({ ok: true, acao });
  } catch (error) {
    console.error("Erro ao controlar execução:", error);
    const status =
      error instanceof Error && error.message.includes("não encontrada")
        ? 404
        : error instanceof Error && error.message.includes("Apenas")
          ? 409
          : 500;
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao executar ação." },
      { status }
    );
  }
}

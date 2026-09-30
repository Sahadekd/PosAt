import { NextRequest, NextResponse } from "next/server";
import { obterResumoExecucaoUseCase, fluxoExecucaoRepo } from "@/core/container";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resumo = await obterResumoExecucaoUseCase.execute(id);

    if (!resumo) {
      return NextResponse.json({ erro: "Execução não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ resumo });
  } catch (error) {
    console.error("Erro ao obter resumo da execução:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao obter resumo." },
      { status: 500 }
    );
  }
}

// Iniciar execução manual de fluxo para um lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fluxoId, clienteId, iniciadoPor } = body;

    // id pode ser "novo" para criar uma nova execução
    if (id === "novo") {
      if (!fluxoId || !clienteId) {
        return NextResponse.json(
          { erro: "fluxoId e clienteId são obrigatórios." },
          { status: 422 }
        );
      }

      const existente = await fluxoExecucaoRepo.findAtiva(fluxoId, clienteId);
      if (existente) {
        return NextResponse.json(
          { erro: "Lead já possui execução ativa neste fluxo.", execucao: existente },
          { status: 409 }
        );
      }

      const execucao = await fluxoExecucaoRepo.create({
        fluxo_id: fluxoId,
        cliente_id: clienteId,
        status: "ativa",
        proxima_execucao_em: new Date().toISOString(),
        origem: "manual",
        iniciada_por: iniciadoPor ?? null,
      });

      return NextResponse.json({ execucao }, { status: 201 });
    }

    return NextResponse.json({ erro: "Rota inválida." }, { status: 404 });
  } catch (error) {
    console.error("Erro ao iniciar execução:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao iniciar execução." },
      { status: 500 }
    );
  }
}

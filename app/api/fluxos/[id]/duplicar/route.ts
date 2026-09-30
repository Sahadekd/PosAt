import { NextRequest, NextResponse } from "next/server";
import { duplicarFluxoUseCase } from "@/core/container";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fluxo = await duplicarFluxoUseCase.execute(id);

    return NextResponse.json({ fluxo }, { status: 201 });
  } catch (error) {
    console.error("Erro ao duplicar fluxo:", error);
    const status = error instanceof Error && error.message.includes("não encontrado")
      ? 404
      : 500;
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao duplicar fluxo." },
      { status }
    );
  }
}

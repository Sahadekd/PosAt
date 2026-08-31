import { NextResponse } from "next/server";
import { obterStatsUseCase } from "@/core/container";

export async function GET() {
  try {
    const stats = await obterStatsUseCase.execute();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar estatísticas.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

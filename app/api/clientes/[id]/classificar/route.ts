import { NextRequest, NextResponse } from "next/server";
import { classificarClienteUseCase, obterClienteUseCase } from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: Contexto
) {
  try {
    const { id } = await context.params;

    const classificacao = await classificarClienteUseCase.execute(id);
    const cliente = await obterClienteUseCase.execute(id);

    return NextResponse.json({
      cliente,
      classificacao,
      completude: cliente?.indice_completude ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao reclassificar o cliente.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

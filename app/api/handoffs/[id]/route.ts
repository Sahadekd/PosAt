import { NextRequest, NextResponse } from "next/server";
import { atualizarHandoffUseCase } from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: Contexto
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const handoff = await atualizarHandoffUseCase.execute({
      id,
      status: body.status,
      resumo: body.resumo,
      pendencias: body.pendencias,
      expectativaCliente: body.expectativa_cliente || body.expectativaCliente,
      responsavelDestino: body.responsavel_destino || body.responsavelDestino,
    });

    if (!handoff) {
      return NextResponse.json(
        { erro: "Handoff não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ handoff });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro interno ao atualizar handoff.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

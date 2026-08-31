import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarHandoffUseCase, listarHandoffsUseCase } from "@/core/container";

const handoffSchema = z.object({
  clienteId: z.string(),
  responsavelOrigem: z.string().optional(),
  responsavelDestino: z.string().optional(),
  motivo: z.string().optional(),
  resumo: z.string().min(1, "O resumo do cliente e da negociação é fundamental para o handoff"),
  pendencias: z.array(z.string()).default([]),
  expectativaCliente: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = handoffSchema.parse(await request.json());
    const handoff = await criarHandoffUseCase.execute({
      clienteId: body.clienteId,
      responsavelOrigem: body.responsavelOrigem,
      responsavelDestino: body.responsavelDestino,
      motivo: body.motivo,
      resumo: body.resumo,
      pendencias: body.pendencias,
      expectativaCliente: body.expectativaCliente,
    });

    return NextResponse.json({ handoff }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: "Dados inválidos.", campos: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { erro: "Erro interno ao registrar handoff." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const handoffs = await listarHandoffsUseCase.execute();
    return NextResponse.json({ handoffs });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar handoffs.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

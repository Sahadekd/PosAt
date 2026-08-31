import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarInteracaoUseCase, interacaoRepo } from "@/core/container";

const interacaoSchema = z.object({
  clienteId: z.string(),
  tipo: z.string(),
  canal: z.string().optional(),
  descricao: z.string().min(1, "A descrição é obrigatória"),
  resultado: z.string().optional(),
  criadoPor: z.string().optional(),
  ocorreuEm: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = interacaoSchema.parse(await request.json());
    const interacao = await criarInteracaoUseCase.execute({
      clienteId: body.clienteId,
      tipo: body.tipo,
      canal: body.canal,
      descricao: body.descricao,
      resultado: body.resultado,
      criadoPor: body.criadoPor,
      ocorreuEm: body.ocorreuEm,
    });

    return NextResponse.json({ interacao }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          erro: "Dados inválidos.",
          campos: error.flatten(),
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { erro: "Erro interno ao registrar interação." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("clienteId") || undefined;
    const interacoes = await interacaoRepo.findAll(clienteId);
    return NextResponse.json({ interacoes });
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao buscar interações." },
      { status: 500 }
    );
  }
}

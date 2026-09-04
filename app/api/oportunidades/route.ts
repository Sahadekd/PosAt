import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarOportunidadeUseCase, listarOportunidadesUseCase } from "@/core/container";

const oportunidadeSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório."),
  tipo: z.enum(["recompra", "upgrade", "investimento_novo", "indicacao", "servicos", "outro"]),
  descricao: z.string().min(1, "Descreva a oportunidade."),
  valorEstimado: z.number().nullable().optional(),
  prioridade: z.number().min(1).max(3).optional(),
  evidencia: z.string().nullish(),
  criadoPor: z.string().nullish(),
  responsavelId: z.string().nullish(),
  prazoEm: z.string().nullish(),
  proximoPasso: z.string().nullish(),
});

export async function POST(request: NextRequest) {
  try {
    const body = oportunidadeSchema.parse(await request.json());
    const oportunidade = await criarOportunidadeUseCase.execute({
      clienteId: body.clienteId,
      tipo: body.tipo,
      descricao: body.descricao,
      valorEstimado: body.valorEstimado,
      prioridade: body.prioridade,
      evidencia: body.evidencia,
      criadoPor: body.criadoPor,
      responsavelId: body.responsavelId,
      prazoEm: body.prazoEm,
      proximoPasso: body.proximoPasso,
    });

    return NextResponse.json({ oportunidade }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: "Dados inválidos.", campos: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { erro: "Erro interno ao registrar oportunidade." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const oportunidades = await listarOportunidadesUseCase.execute();
    return NextResponse.json({ oportunidades });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar oportunidades.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
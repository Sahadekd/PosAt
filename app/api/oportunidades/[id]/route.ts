import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { atualizarOportunidadeUseCase } from "@/core/container";
import { oportunidadeRepo } from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

const updateSchema = z.object({
  status: z.enum([
    "identificada",
    "em_avaliacao",
    "proposta_enviada",
    "negociacao",
    "ganha",
    "perdida",
    "arquivada",
  ]).nullish(),
  descricao: z.string().nullish(),
  valorEstimado: z.number().nullable().optional(),
  prioridade: z.number().min(1).max(3).nullish(),
  evidencia: z.string().nullish(),
  responsavelId: z.string().nullish(),
  prazoEm: z.string().nullish(),
  proximoPasso: z.string().nullish(),
  motivoPerda: z.string().nullish(),
});

export async function GET(request: NextRequest, context: Contexto) {
  try {
    const { id } = await context.params;
    const oportunidade = await oportunidadeRepo.findById(id);

    if (!oportunidade) {
      return NextResponse.json(
        { erro: "Oportunidade não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ oportunidade });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro interno ao buscar oportunidade.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const { id } = await context.params;
    const body = updateSchema.parse(await request.json());

    const atualizado = await atualizarOportunidadeUseCase.execute({
      id,
      status: body.status,
      descricao: body.descricao,
      valorEstimado: body.valorEstimado,
      prioridade: body.prioridade,
      evidencia: body.evidencia,
      responsavelId: body.responsavelId,
      prazoEm: body.prazoEm,
      proximoPasso: body.proximoPasso,
      motivoPerda: body.motivoPerda,
    });

    if (!atualizado) {
      return NextResponse.json(
        { erro: "Oportunidade não encontrada para atualização." },
        { status: 404 }
      );
    }

    return NextResponse.json({ oportunidade: atualizado });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: "Dados inválidos.", campos: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        erro: "Erro interno ao atualizar oportunidade.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
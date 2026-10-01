import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listarExecucoesUseCase,
  aplicarTemplateUseCase,
} from "@/core/container";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const execucoes = await listarExecucoesUseCase.execute({
      fluxo_id: searchParams.get("fluxo_id"),
      cliente_id: searchParams.get("cliente_id"),
      status: searchParams.get("status"),
      responsavel: searchParams.get("responsavel"),
      busca: searchParams.get("busca"),
    });

    return NextResponse.json({ execucoes });
  } catch (error) {
    console.error("Erro ao listar execuções:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao listar execuções." },
      { status: 500 }
    );
  }
}

const aplicarSchema = z.object({
  templateId: z.string().uuid(),
  clienteIds: z.array(z.string().uuid()).min(1),
  iniciadoPor: z.string().uuid().optional().nullable(),
});

// Aplicar template a um lead ou segmento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aplicarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: parsed.error.issues },
        { status: 422 }
      );
    }

    const resultado = await aplicarTemplateUseCase.execute(parsed.data);

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Erro ao aplicar template:", error);
    const status = error instanceof Error && error.message.includes("não encontrado")
      ? 404
      : 500;
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao aplicar template." },
      { status }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  atualizarFluxoUseCase,
  deletarFluxoUseCase,
  fluxoRepo,
} from "@/core/container";

const atualizarSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().nullable().optional(),
  status: z.enum(["rascunho", "ativo", "pausado", "concluido", "cancelado"]).optional(),
  template_categoria: z.string().nullable().optional(),
  responsavel_id: z.string().uuid().nullable().optional(),
  equipe_escopo: z.boolean().optional(),
  pausar_quando_responder: z.boolean().optional(),
  janela_envio_inicio: z.string().optional(),
  janela_envio_fim: z.string().optional(),
  limite_mensagens_por_dia: z.number().int().min(1).max(50).optional(),
  e_template: z.boolean().optional(),
  grafo: z
    .object({
      nodes: z.array(z.any()),
      edges: z.array(z.any()),
    })
    .optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fluxo = await fluxoRepo.findById(id);

    if (!fluxo) {
      return NextResponse.json({ erro: "Fluxo não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ fluxo });
  } catch (error) {
    console.error("Erro ao obter fluxo:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao obter fluxo." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = atualizarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: parsed.error.issues },
        { status: 422 }
      );
    }

    const fluxo = await atualizarFluxoUseCase.execute(id, parsed.data);

    return NextResponse.json({ fluxo });
  } catch (error) {
    console.error("Erro ao atualizar fluxo:", error);
    const status = error instanceof Error && error.message.includes("não encontrado")
      ? 404
      : error instanceof Error && error.message.includes("inválido")
        ? 422
        : 500;
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao atualizar fluxo." },
      { status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletarFluxoUseCase.execute(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao deletar fluxo:", error);
    const status = error instanceof Error && error.message.includes("não encontrado")
      ? 404
      : 500;
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao deletar fluxo." },
      { status }
    );
  }
}

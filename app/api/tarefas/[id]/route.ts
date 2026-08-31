import { NextRequest, NextResponse } from "next/server";
import { atualizarTarefaUseCase } from "@/core/container";

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

    const tarefa = await atualizarTarefaUseCase.execute({
      id,
      status: body.status,
      titulo: body.titulo,
      descricao: body.descricao,
      prioridade: body.prioridade,
      prazoEm: body.prazo_em || body.prazoEm,
    });

    if (!tarefa) {
      return NextResponse.json(
        { erro: "Tarefa não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ tarefa });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro interno ao atualizar tarefa.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

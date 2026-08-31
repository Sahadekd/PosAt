import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarTarefaUseCase, listarTarefasUseCase } from "@/core/container";

const tarefaSchema = z.object({
  clienteId: z.string(),
  titulo: z.string().min(1, "O título é obrigatório"),
  descricao: z.string().optional(),
  prioridade: z.number().int().min(1).max(5).default(3),
  responsavelId: z.string().optional(),
  prazoEm: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = tarefaSchema.parse(await request.json());
    const tarefa = await criarTarefaUseCase.execute({
      clienteId: body.clienteId,
      titulo: body.titulo,
      descricao: body.descricao,
      prioridade: body.prioridade,
      responsavelId: body.responsavelId,
      prazoEm: body.prazoEm,
    });

    return NextResponse.json({ tarefa }, { status: 201 });
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
      { erro: "Erro interno ao criar tarefa." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tarefas = await listarTarefasUseCase.execute();
    return NextResponse.json({ tarefas });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar tarefas.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

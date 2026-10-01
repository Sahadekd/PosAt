import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listarFluxosUseCase,
  criarFluxoUseCase,
} from "@/core/container";

const criarSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional().nullable(),
  status: z.enum(["rascunho", "ativo", "pausado"]).optional(),
  e_template: z.boolean().optional(),
  template_categoria: z.string().optional().nullable(),
  responsavel_id: z.string().uuid().optional().nullable(),
  equipe_escopo: z.boolean().optional(),
  grafo: z
    .object({
      nodes: z.array(z.any()),
      edges: z.array(z.any()),
    })
    .optional(),
  criado_por: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const fluxos = await listarFluxosUseCase.execute({
      status: searchParams.get("status"),
      busca: searchParams.get("busca"),
      responsavel: searchParams.get("responsavel"),
      e_template:
        searchParams.get("e_template") === "true"
          ? true
          : searchParams.get("e_template") === "false"
            ? false
            : undefined,
      categoria: searchParams.get("categoria"),
    });

    return NextResponse.json({ fluxos });
  } catch (error) {
    console.error("Erro ao listar fluxos:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao listar fluxos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = criarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: parsed.error.issues },
        { status: 422 }
      );
    }

    const fluxo = await criarFluxoUseCase.execute(parsed.data);

    return NextResponse.json({ fluxo }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar fluxo:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao criar fluxo." },
      { status: 500 }
    );
  }
}

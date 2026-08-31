import { NextRequest, NextResponse } from "next/server";
import { obterClienteUseCase, clienteRepo } from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: Contexto
) {
  try {
    const { id } = await context.params;
    const cliente = await obterClienteUseCase.execute(id);

    if (!cliente) {
      return NextResponse.json(
        { erro: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ cliente });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro interno ao buscar cliente.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: Contexto
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const atualizado = await clienteRepo.update(id, body);
    if (!atualizado) {
      return NextResponse.json(
        { erro: "Cliente não encontrado para atualização." },
        { status: 404 }
      );
    }

    return NextResponse.json({ cliente: atualizado });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro interno ao atualizar cliente.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

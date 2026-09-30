import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { iniciarExecucaoUseCase } from "@/core/container";

const iniciarSchema = z.object({
  fluxoId: z.string().uuid(),
  clienteId: z.string().uuid(),
  iniciadoPor: z.string().uuid().optional().nullable(),
});

// Inicia uma execução do fluxo para um lead (usado para testar o fluxo)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = iniciarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: parsed.error.issues },
        { status: 422 }
      );
    }

    const execucao = await iniciarExecucaoUseCase.execute(parsed.data);

    return NextResponse.json({ execucao }, { status: 201 });
  } catch (error) {
    console.error("Erro ao iniciar execução:", error);
    const msg = error instanceof Error ? error.message : "Erro ao iniciar execução.";
    const status = msg.includes("não encontrado")
      ? 404
      : msg.includes("já possui")
        ? 409
        : 500;
    return NextResponse.json({ erro: msg }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auditoriaLeadUseCase } from "@/core/container";

// Auditoria de relacionamento: o que foi enviado, quando, por automação ou pessoa.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params;
    const auditoria = await auditoriaLeadUseCase.execute(clienteId);

    return NextResponse.json(auditoria);
  } catch (error) {
    console.error("Erro ao auditar lead:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao auditar lead." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { processarAgendamentosUseCase } from "@/core/container";

// Processa agendamentos vencidos do fluxo.
// Deve ser chamado por um cron externo / edge function a cada 15-30s.
export async function POST() {
  try {
    const resultado = await processarAgendamentosUseCase.execute();
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao processar agendamentos:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao processar.", processadas: 0, erros: 1 },
      { status: 500 }
    );
  }
}

// GET para health check / diagnóstico
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "fluxos/processar" });
}

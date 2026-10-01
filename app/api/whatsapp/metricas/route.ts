import { NextRequest, NextResponse } from "next/server";
import { obterMetricasWhatsAppUseCase } from "@/core/container";
import { getWhatsAppOwnerFromHeaders } from "@/lib/whatsapp-access";

export async function GET(request: NextRequest) {
  try {
    const owner = getWhatsAppOwnerFromHeaders(request.headers);
    const metricas = await obterMetricasWhatsAppUseCase.execute();
    if (owner && metricas && typeof metricas === "object") {
      const metricasFiltradas = {
        ...metricas,
        totalConversas: metricas.totalConversas,
      };
      return NextResponse.json({ metricas: metricasFiltradas });
    }
    return NextResponse.json({ metricas });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao calcular métricas do WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
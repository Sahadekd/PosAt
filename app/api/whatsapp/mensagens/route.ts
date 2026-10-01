import { NextRequest, NextResponse } from "next/server";
import {
  listarConversasWhatsAppUseCase,
  listarClientesUseCase,
  listarNpsWhatsAppUseCase,
} from "@/core/container";
import { getWhatsAppOwnerFromHeaders } from "@/lib/whatsapp-access";

export async function GET(request: NextRequest) {
  try {
    const owner = getWhatsAppOwnerFromHeaders(request.headers);
    const [conversas, clientes, nps] = await Promise.all([
      listarConversasWhatsAppUseCase.execute(),
      listarClientesUseCase.execute(),
      listarNpsWhatsAppUseCase.execute(),
    ]);

    const conversasVisiveis = owner
      ? conversas.filter((conversa) => (conversa.corretor || "").trim() === owner.trim())
      : conversas;

    return NextResponse.json({
      conversas: conversasVisiveis,
      clientes: clientes.map((c) => ({
        id: c.id,
        nome: c.pessoa?.nome || "Cliente",
        telefone: c.pessoa?.telefone || null,
        finalidade_principal: c.finalidade_principal,
        status: c.status,
      })),
      nps,
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar conversas do WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
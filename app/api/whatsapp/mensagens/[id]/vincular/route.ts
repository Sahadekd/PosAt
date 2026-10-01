import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listarConversasWhatsAppUseCase,
  vincularConversaWhatsAppUseCase,
} from "@/core/container";
import { ensureWhatsAppOwnerAccess, getWhatsAppOwnerFromHeaders } from "@/lib/whatsapp-access";

const schema = z.object({
  clienteId: z.string(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const owner = getWhatsAppOwnerFromHeaders(request.headers);
    const conversas = await listarConversasWhatsAppUseCase.execute();
    const conversaAtual = conversas.find((conversa) => conversa.id === id) ?? null;

    if (owner && !ensureWhatsAppOwnerAccess(owner, conversaAtual?.corretor ?? null)) {
      return NextResponse.json({ erro: "Acesso negado para esta conversa." }, { status: 403 });
    }

    const body = schema.parse(await request.json());
    const conversa = await vincularConversaWhatsAppUseCase.execute({
      conversaId: id,
      clienteId: body.clienteId,
    });
    if (!conversa) {
      return NextResponse.json({ erro: "Conversa ou cliente não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ conversa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json({ erro: "Erro ao vincular conversa ao cliente." }, { status: 500 });
  }
}
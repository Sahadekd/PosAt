import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listarConversasWhatsAppUseCase,
  responderMensagemWhatsAppUseCase,
} from "@/core/container";
import { ensureWhatsAppOwnerAccess, getWhatsAppOwnerFromHeaders } from "@/lib/whatsapp-access";

const schema = z.object({
  conteudo: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const owner = getWhatsAppOwnerFromHeaders(request.headers);
    const conversas = await listarConversasWhatsAppUseCase.execute();
    const conversaAtual = conversas.find((conversa) => conversa.id === id) ?? null;

    if (owner && !ensureWhatsAppOwnerAccess(owner, conversaAtual?.corretor ?? null)) {
      return NextResponse.json({ erro: "Acesso negado para esta conversa." }, { status: 403 });
    }

    const body = schema.parse(await request.json());
    const resultado = await responderMensagemWhatsAppUseCase.execute({
      conversaId: id,
      conteudo: body.conteudo,
    });
    return NextResponse.json({
      ok: true,
      enviadoViaEvolution: resultado.enviadoViaEvolution,
      registradoNoCrm: resultado.registradoNoCrm,
      mensagem: resultado.mensagem,
      conversa: resultado.conversa,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json(
      {
        erro: "Falha ao enviar resposta pelo WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
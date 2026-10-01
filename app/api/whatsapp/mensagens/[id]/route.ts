import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  atualizarEspelhamentoWhatsAppUseCase,
  excluirConversaWhatsAppUseCase,
  listarConversasWhatsAppUseCase,
} from "@/core/container";
import { ensureWhatsAppOwnerAccess, getWhatsAppOwnerFromHeaders } from "@/lib/whatsapp-access";

const schema = z.object({
  espelhando: z.boolean(),
  privadaMotivo: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const owner = getWhatsAppOwnerFromHeaders(request.headers);
    const conversas = await listarConversasWhatsAppUseCase.execute();
    const conversaAtual = conversas.find((conversa) => conversa.id === id) ?? null;

    if (owner && !ensureWhatsAppOwnerAccess(owner, conversaAtual?.corretor ?? null)) {
      return NextResponse.json({ erro: "Acesso negado para esta conversa." }, { status: 403 });
    }

    const body = schema.parse(await request.json());
    const conversa = await atualizarEspelhamentoWhatsAppUseCase.execute({
      conversaId: id,
      espelhando: body.espelhando,
      privadaMotivo: body.privadaMotivo,
    });
    if (!conversa) {
      return NextResponse.json({ erro: "Conversa não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ conversa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json({ erro: "Erro ao atualizar espelhamento." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const owner = getWhatsAppOwnerFromHeaders(request.headers);
    const conversas = await listarConversasWhatsAppUseCase.execute();
    const conversaAtual = conversas.find((conversa) => conversa.id === id) ?? null;

    if (owner && !ensureWhatsAppOwnerAccess(owner, conversaAtual?.corretor ?? null)) {
      return NextResponse.json({ erro: "Acesso negado para esta conversa." }, { status: 403 });
    }

    const removida = await excluirConversaWhatsAppUseCase.execute(id);
    if (!removida) {
      return NextResponse.json({ erro: "Conversa não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, mensagem: "Conversa excluída (LGPD)." });
  } catch {
    return NextResponse.json({ erro: "Erro ao excluir conversa." }, { status: 500 });
  }
}
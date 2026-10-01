import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listarConexoesWhatsAppUseCase,
  criarConexaoWhatsAppUseCase,
  atualizarConexaoWhatsAppUseCase,
} from "@/core/container";
import {
  getWhatsAppOwnerFromHeaders,
  getWhatsAppUserIdentityFromHeaders,
  resolveWhatsAppOwnerFromContext,
} from "@/lib/whatsapp-access";

const criarSchema = z.object({
  corretor: z.string().min(2),
  numero: z.string().min(8),
});

const atualizarSchema = z.object({
  id: z.string(),
  status: z.enum([
    "conectado",
    "conectando",
    "desconectado",
    "qr_expirado",
  ]),
});

export async function GET(request: NextRequest) {
  try {
    const userIdentity = getWhatsAppUserIdentityFromHeaders(request.headers);
    const owner = resolveWhatsAppOwnerFromContext(
      getWhatsAppOwnerFromHeaders(request.headers),
      userIdentity
    );
    const conexoes = await listarConexoesWhatsAppUseCase.execute();
    const conexoesVisiveis = owner
      ? conexoes.filter((conexao) => (conexao.corretor || "").trim() === owner.trim())
      : conexoes;

    return NextResponse.json({
      conexoes: conexoesVisiveis.slice(0, 1),
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar conexões do WhatsApp.",
        detalhe:
          error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body && typeof body.corretor === "string") {
      const userIdentity = getWhatsAppUserIdentityFromHeaders(request.headers);
      const owner = resolveWhatsAppOwnerFromContext(
        getWhatsAppOwnerFromHeaders(request.headers),
        userIdentity
      );
      const parsed = criarSchema.parse(body);
      const corretorDesejado = owner || parsed.corretor;

      if (owner && parsed.corretor.trim().toLowerCase() !== owner.trim().toLowerCase()) {
        return NextResponse.json(
          {
            erro: "Você só pode cadastrar o WhatsApp vinculado ao seu usuário atual.",
          },
          { status: 403 }
        );
      }

      const conexoesAtuais = await listarConexoesWhatsAppUseCase.execute();
      const existente = conexoesAtuais.find(
        (conexao) =>
          (conexao.corretor || "").trim().toLowerCase() ===
          corretorDesejado.trim().toLowerCase()
      );

      if (existente) {
        return NextResponse.json(
          {
            erro: "Este usuário já possui um WhatsApp cadastrado. Cadastre apenas um número por usuário.",
            conexaoExistente: existente,
          },
          { status: 409 }
        );
      }

      const conexao = await criarConexaoWhatsAppUseCase.execute({
        corretor: corretorDesejado,
        numero: parsed.numero,
      });

      return NextResponse.json(
        { conexao },
        { status: 201 }
      );
    }

    const parsed = atualizarSchema.parse(body);

    const conexao = await atualizarConexaoWhatsAppUseCase.execute({
      id: parsed.id,
      status: parsed.status,
    });

    if (!conexao) {
      return NextResponse.json(
        { erro: "Conexão não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ conexao });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          erro: "Dados inválidos.",
          campos: error.flatten(),
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        erro: "Erro ao atualizar conexão.",
        detalhe:
          error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
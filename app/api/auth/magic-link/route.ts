import { NextResponse } from "next/server";
import { z } from "zod";
import { gerarTokenMagico, validarTokenMagico } from "@/lib/auth/magic-link";
import {
  buscarUsuarioPorEmail,
  marcarLogin,
  obterUsuarioPorId,
} from "@/lib/auth/usuarios";
import { criarCookieSessao } from "@/lib/auth/sessao";
import { registrarAuditoria } from "@/lib/auth/auditoria";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const corpo = schema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "E-mail inválido." }, { status: 400 });
  }

  const usuario = buscarUsuarioPorEmail(corpo.data.email);
  if (!usuario || usuario.papel !== "cliente" || !usuario.ativo) {
    return NextResponse.json({ ok: true });
  }

  const token = gerarTokenMagico(usuario.id);
  registrarAuditoria({
    usuario_id: usuario.id,
    email: usuario.email,
    acao: "login",
    detalhe: "Link mágico emitido",
  });
  return NextResponse.json({ url: `/login?token=${token}` });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?erro=token-invalido", request.url));
  }

  const uid = validarTokenMagico(token);
  if (!uid) {
    return NextResponse.redirect(new URL("/login?erro=token-expirado", request.url));
  }

  const cliente = obterUsuarioPorId(uid);
  if (!cliente || !cliente.ativo || cliente.papel !== "cliente") {
    return NextResponse.redirect(new URL("/login?erro=token-invalido", request.url));
  }

  marcarLogin(cliente.id);
  const cookie = await criarCookieSessao({ uid: cliente.id, papel: cliente.papel });
  const resposta = NextResponse.redirect(new URL("/portal", request.url));
  resposta.headers.append("Set-Cookie", cookie);
  return resposta;
}
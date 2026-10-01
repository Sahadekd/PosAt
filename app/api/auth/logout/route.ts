import { NextResponse } from "next/server";
import { cookieSessaoExpirado, obterSessao } from "@/lib/auth/sessao";
import { registrarAuditoria } from "@/lib/auth/auditoria";

export async function POST(request: Request) {
  const sessao = await obterSessao(request.headers.get("cookie"));
  if (sessao) {
    registrarAuditoria({
      usuario_id: sessao.uid,
      email: "sessao",
      acao: "logout",
    });
  }
  const resposta = NextResponse.json({ ok: true });
  resposta.headers.append("Set-Cookie", cookieSessaoExpirado());
  return resposta;
}
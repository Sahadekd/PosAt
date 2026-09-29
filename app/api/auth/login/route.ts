import { NextResponse } from "next/server";
import { z } from "zod";
import { criarCookieSessao } from "@/lib/auth/sessao";
import { autenticarUsuario, marcarLogin, resumoPublico } from "@/lib/auth/usuarios";
import { registrarAuditoria } from "@/lib/auth/auditoria";

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function POST(request: Request) {
  const corpo = schema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  const usuario = autenticarUsuario(corpo.data.email, corpo.data.senha);
  if (!usuario) {
    registrarAuditoria({
      usuario_id: "anon",
      email: corpo.data.email.toLowerCase(),
      acao: "acesso_negado",
      detalhe: "Credenciais inválidas no login",
    });
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  }
  if (!usuario.ativo) {
    registrarAuditoria({
      usuario_id: usuario.id,
      email: usuario.email,
      acao: "acesso_negado",
      detalhe: "Usuário desativado",
    });
    return NextResponse.json({ erro: "Usuário desativado. Contate o gerente." }, { status: 403 });
  }

  marcarLogin(usuario.id);
  registrarAuditoria({
    usuario_id: usuario.id,
    email: usuario.email,
    acao: "login",
  });

  const cookie = await criarCookieSessao({ uid: usuario.id, papel: usuario.papel });
  const resposta = NextResponse.json(
    { usuario: resumoPublico(usuario) },
    { status: 200 }
  );
  resposta.headers.append("Set-Cookie", cookie);
  return resposta;
}
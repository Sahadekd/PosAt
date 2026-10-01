import { NextResponse } from "next/server";
import { z } from "zod";
import { usuarioAutenticado } from "@/lib/auth/autorizacao";
import { alterarSenha } from "@/lib/auth/usuarios";
import { registrarAuditoria } from "@/lib/auth/auditoria";

const schema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(6),
});

export async function POST(request: Request) {
  const autenticado = await usuarioAutenticado(request);
  if (!autenticado) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const corpo = schema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const ok = alterarSenha(
    autenticado.usuario.id,
    corpo.data.senhaAtual,
    corpo.data.novaSenha
  );
  if (!ok) {
    registrarAuditoria({
      usuario_id: autenticado.usuario.id,
      email: autenticado.usuario.email,
      acao: "acesso_negado",
      detalhe: "Tentativa de alterar senha com dados inválidos",
    });
    return NextResponse.json(
      { erro: "Senha atual incorreta ou nova senha muito curta." },
      { status: 400 }
    );
  }

  registrarAuditoria({
    usuario_id: autenticado.usuario.id,
    email: autenticado.usuario.email,
    acao: "alterar_senha",
  });

  return NextResponse.json({ ok: true });
}
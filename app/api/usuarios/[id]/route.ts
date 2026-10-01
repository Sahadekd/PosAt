import { NextResponse } from "next/server";
import { z } from "zod";
import {
  exigirPermissaoOu403,
  exigirSessaoOu401,
  temPermissao,
  usuarioAutenticado,
} from "@/lib/auth/autorizacao";
import { atualizarUsuario, obterUsuarioPorId, resumoPublico } from "@/lib/auth/usuarios";
import { registrarAuditoria } from "@/lib/auth/auditoria";
import { PAPEIS, type Papel } from "@/core/domain/papeis";

const schema = z.object({
  papel: z.enum(PAPEIS as [Papel, ...Papel[]]).optional(),
  ativo: z.boolean().optional(),
  vendedor_id: z.string().nullable().optional(),
  cliente_id: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const autenticado = await usuarioAutenticado(request);
  if (!autenticado) return exigirSessaoOu401();
  if (!temPermissao(autenticado.papel, "acessos", "gerenciar")) {
    return exigirPermissaoOu403();
  }

  const { id } = await params;
  const corpo = schema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const alvo = obterUsuarioPorId(id);
  if (!alvo) {
    return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
  }

  const atualizado = atualizarUsuario(id, corpo.data);
  if (!atualizado) {
    return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
  }

  registrarAuditoria({
    usuario_id: autenticado.usuario.id,
    email: autenticado.usuario.email,
    acao: "alterar_usuario",
    detalhe: `${alvo.email} → ${JSON.stringify(corpo.data)}`,
  });

  return NextResponse.json({ usuario: resumoPublico(atualizado) });
}
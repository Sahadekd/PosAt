import { NextResponse } from "next/server";
import { z } from "zod";
import {
  exigirPermissaoOu403,
  exigirSessaoOu401,
  temPermissao,
  usuarioAutenticado,
  type UsuarioPublico,
} from "@/lib/auth/autorizacao";
import { criarUsuario, listarUsuarios, resumoPublico } from "@/lib/auth/usuarios";
import { registrarAuditoria } from "@/lib/auth/auditoria";
import { PAPEIS, PAPEL_LABEL, type Papel } from "@/core/domain/papeis";

const schema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  papel: z.enum(PAPEIS as [Papel, ...Papel[]]),
  vendedor_id: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const autenticado = await usuarioAutenticado(request);
  if (!autenticado) return exigirSessaoOu401();
  if (!temPermissao(autenticado.papel, "acessos", "gerenciar")) {
    return exigirPermissaoOu403();
  }

  const usuarios: (UsuarioPublico & { papel_label: string })[] = listarUsuarios().map(
    (u) => ({ ...resumoPublico(u), papel_label: PAPEL_LABEL[u.papel] })
  );
  return NextResponse.json({ usuarios });
}

export async function POST(request: Request) {
  const autenticado = await usuarioAutenticado(request);
  if (!autenticado) return exigirSessaoOu401();
  if (!temPermissao(autenticado.papel, "acessos", "gerenciar")) {
    return exigirPermissaoOu403();
  }

  const corpo = schema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  try {
    const criado = criarUsuario({
      nome: corpo.data.nome,
      email: corpo.data.email,
      papel: corpo.data.papel,
      vendedor_id: corpo.data.vendedor_id ?? null,
      criado_por: autenticado.usuario.id,
    });
    registrarAuditoria({
      usuario_id: autenticado.usuario.id,
      email: autenticado.usuario.email,
      acao: "criar_usuario",
      detalhe: `${criado.nome} (${corpo.data.papel})`,
    });
    return NextResponse.json(
      { usuario: { ...resumoPublico(criado), papel_label: PAPEL_LABEL[criado.papel] } },
      { status: 201 }
    );
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Erro ao criar usuário." },
      { status: 409 }
    );
  }
}
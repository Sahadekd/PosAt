import { NextResponse } from "next/server";
import { obterSessao } from "@/lib/auth/sessao";
import { obterUsuarioPorId, resumoPublico } from "@/lib/auth/usuarios";
import { modulosDoPapel, PAPEL_LABEL } from "@/core/domain/papeis";
import { rotasPermitidas } from "@/lib/rbac/role-permissoes";

export async function GET(request: Request) {
  const sessao = await obterSessao(request.headers.get("cookie"));
  if (!sessao) return NextResponse.json({ usuario: null });

  const usuario = obterUsuarioPorId(sessao.uid);
  if (!usuario || !usuario.ativo) return NextResponse.json({ usuario: null });

  const modulos = modulosDoPapel(usuario.papel).map((m) => ({
    modulo: m.modulo,
    acoes: m.acoes,
  }));

  return NextResponse.json({
    usuario: {
      ...resumoPublico(usuario),
      papel_label: PAPEL_LABEL[usuario.papel],
      modulos,
      rotas: rotasPermitidas(usuario.papel),
    },
  });
}

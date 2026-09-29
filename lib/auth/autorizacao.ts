import { NextResponse } from "next/server";
import { obterSessao } from "./sessao";
import { obterUsuarioPorId, resumoPublico, type UsuarioItem } from "./usuarios";
import { pode, type Modulo, type ModuloAcao, type Papel } from "@/core/domain/papeis";

export async function usuarioAutenticado(
  request: Request
): Promise<{ usuario: UsuarioItem; papel: Papel } | null> {
  const sessao = await obterSessao(request.headers.get("cookie"));
  if (!sessao) return null;
  const usuario = obterUsuarioPorId(sessao.uid);
  if (!usuario || !usuario.ativo) return null;
  return { usuario, papel: usuario.papel };
}

export function exigirSessaoOu401() {
  return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
}

export function exigirPermissaoOu403() {
  return NextResponse.json(
    { erro: "Você não tem permissão para esta ação." },
    { status: 403 }
  );
}

export function temPermissao(
  papel: Papel,
  modulo: Modulo,
  acao: ModuloAcao = "ver"
): boolean {
  return pode(papel, modulo, acao);
}

export type UsuarioPublico = ReturnType<typeof resumoPublico>;
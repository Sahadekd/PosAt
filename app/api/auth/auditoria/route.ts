import { NextResponse } from "next/server";
import {
  exigirPermissaoOu403,
  exigirSessaoOu401,
  temPermissao,
  usuarioAutenticado,
} from "@/lib/auth/autorizacao";
import { listarAuditoria } from "@/lib/auth/auditoria";

export async function GET(request: Request) {
  const autenticado = await usuarioAutenticado(request);
  if (!autenticado) return exigirSessaoOu401();
  if (!temPermissao(autenticado.papel, "acessos", "gerenciar")) {
    return exigirPermissaoOu403();
  }

  return NextResponse.json({ registros: listarAuditoria(200) });
}
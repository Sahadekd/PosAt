import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  PAPEIS,
  ROTAS_SISTEMA,
  PAPEL_LABEL,
  pode,
  type Papel,
} from "@/core/domain/papeis";
import { usuarioAutenticado } from "@/lib/auth/autorizacao";
import { exigirPermissaoOu403, exigirSessaoOu401 } from "@/lib/auth/autorizacao";
import { matrizPermissoes, definirPermissoes } from "@/lib/rbac/role-permissoes";

const salvarSchema = z.object({
  permissao: z.record(z.enum(PAPEIS), z.array(z.string())),
});

export async function GET(request: Request) {
  const sessao = await usuarioAutenticado(request);
  if (!sessao) return exigirSessaoOu401();
  if (!pode(sessao.papel, "acessos", "ver")) return exigirPermissaoOu403();

  return NextResponse.json({
    cargos: PAPEIS.map((papel) => ({
      papel,
      label: PAPEL_LABEL[papel],
    })),
    telas: ROTAS_SISTEMA,
    permissao: matrizPermissoes(),
  });
}

export async function POST(request: NextRequest) {
  const sessao = await usuarioAutenticado(request);
  if (!sessao) return exigirSessaoOu401();
  if (!pode(sessao.papel, "acessos", "gerenciar")) return exigirPermissaoOu403();

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const validado = salvarSchema.safeParse(corpo);
  if (!validado.success) {
    return NextResponse.json(
      { erro: "Dados de permissão inválidos." },
      { status: 422 }
    );
  }

  const permissao = definirPermissoes(validado.data.permissao as Record<Papel, string[]>);
  return NextResponse.json({ permissao });
}
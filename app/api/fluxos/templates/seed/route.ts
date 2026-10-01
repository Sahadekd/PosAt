import { NextResponse } from "next/server";
import { fluxoRepo, criarFluxoUseCase } from "@/core/container";
import { TEMPLATES_INICIAIS } from "@/lib/fluxo-templates";

// Cria os templates iniciais (idempotente).
// Só insere os que ainda não existem pela categoria.
export async function POST() {
  try {
    const existentes = await fluxoRepo.findAll({ e_template: true });
    const categorias = new Set(existentes.map((f) => f.template_categoria).filter(Boolean));

    const criados: string[] = [];

    for (const tpl of TEMPLATES_INICIAIS) {
      if (categorias.has(tpl.categoria)) continue;

      await criarFluxoUseCase.execute({
        nome: tpl.nome,
        descricao: tpl.descricao,
        status: "ativo",
        e_template: true,
        template_categoria: tpl.categoria,
        equipe_escopo: true,
        grafo: tpl.grafo,
      });
      criados.push(tpl.categoria);
    }

    return NextResponse.json({
      ok: true,
      criados,
      jaExistiam: TEMPLATES_INICIAIS.length - criados.length,
    });
  } catch (error) {
    console.error("Erro ao semear templates:", error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao criar templates." },
      { status: 500 }
    );
  }
}

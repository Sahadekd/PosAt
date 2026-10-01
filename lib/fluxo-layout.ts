// ============================================================
// Layout horizontal do grafo (esquerda → direita), estilo n8n.
// Cada nível de profundidade do fluxo vira uma coluna; a ordem
// vertical atual dos nós é usada como referência para ordenar
// cada coluna (preserva a disposição das ramificações sim/não).
// ============================================================

import type { GrafoFluxo } from "@/core/domain/entities/fluxo";

/** Distância horizontal entre colunas (nós têm ~240px de largura). */
export const COLUNA_LARGURA = 320;

/** Distância vertical entre linhas da mesma coluna. */
export const LINHA_ALTURA = 150;

type NoGrafo = GrafoFluxo["nodes"][number];

/**
 * Reorganiza os nós do grafo na horizontal: gatilho à esquerda,
 * próximos passos avançando para a direita; ramificações empilhadas
 * na vertical dentro da mesma coluna.
 */
export function organizarHorizontal(grafo: GrafoFluxo): GrafoFluxo {
  const { nodes, edges } = grafo;
  if (nodes.length <= 1) return grafo;

  const ids = new Set(nodes.map((n) => n.id));
  const arestas = edges.filter(
    (e) => ids.has(e.source) && ids.has(e.target) && e.source !== e.target
  );

  // Profundidade = maior distância a partir das raízes (longest path).
  // iterações limitadas a |nós| — seguro para grafos com ciclos.
  const profundidade = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  for (let i = 0; i < nodes.length; i++) {
    let mudou = false;
    for (const e of arestas) {
      const origem = profundidade.get(e.source) ?? 0;
      const alvo = profundidade.get(e.target) ?? 0;
      const proximo = origem + 1;
      if (proximo < nodes.length && proximo > alvo) {
        profundidade.set(e.target, proximo);
        mudou = true;
      }
    }
    if (!mudou) break;
  }

  // Agrupa por coluna e ordena cada coluna pela posição vertical atual
  const colunas = new Map<number, NoGrafo[]>();
  for (const n of nodes) {
    const col = profundidade.get(n.id) ?? 0;
    const lista = colunas.get(col);
    if (lista) lista.push(n);
    else colunas.set(col, [n]);
  }
  for (const lista of colunas.values()) {
    lista.sort((a, b) => a.position.y - b.position.y);
  }

  const maxLinhas = Math.max(...[...colunas.values()].map((l) => l.length));
  const posicoes = new Map<string, { x: number; y: number }>();
  for (const [col, lista] of colunas) {
    const deslocamento = ((maxLinhas - lista.length) * LINHA_ALTURA) / 2;
    lista.forEach((n, i) => {
      posicoes.set(n.id, {
        x: col * COLUNA_LARGURA,
        y: Math.round(deslocamento + i * LINHA_ALTURA),
      });
    });
  }

  return {
    nodes: nodes.map((n) => ({ ...n, position: posicoes.get(n.id) ?? n.position })),
    edges,
  };
}

/**
 * Detecta se o grafo está majoritariamente na vertical (nós descendo).
 * Usado para reorganizar automaticamente fluxos antigos na abertura.
 */
export function estaNaVertical(grafo: GrafoFluxo): boolean {
  const mapa = new Map(grafo.nodes.map((n) => [n.id, n.position]));
  let verticais = 0;
  let horizontais = 0;

  for (const e of grafo.edges) {
    const a = mapa.get(e.source);
    const b = mapa.get(e.target);
    if (!a || !b) continue;
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    if (dy > dx + 40) verticais++;
    else if (dx > dy + 40) horizontais++;
  }

  return verticais > horizontais;
}

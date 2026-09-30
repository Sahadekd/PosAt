"use client";

import {
  Play,
  MessageCircle,
  Clock,
  GitBranch,
  ListTodo,
  Bell,
  CheckCircle2,
  XCircle,
  Circle,
  Clock3,
  Loader2,
  MinusCircle,
  Link2,
} from "lucide-react";
import { META_NOS, META_ESTADOS } from "./meta";
import type {
  GrafoFluxo,
  TipoNo,
  EstadoNoExecucao,
} from "@/core/domain/entities/fluxo";

const ICONES_TIPO: Record<TipoNo, typeof Play> = {
  gatilho: Play,
  mensagem_whatsapp: MessageCircle,
  atraso: Clock,
  condicao: GitBranch,
  acao_interna: ListTodo,
  notificacao: Bell,
};

function IconeEstado({ estado }: { estado: EstadoNoExecucao }) {
  const meta = META_ESTADOS[estado];
  const props = { className: "h-4 w-4", style: { color: meta.cor } };
  switch (estado) {
    case "concluido":
      return <CheckCircle2 {...props} />;
    case "falhou":
      return <XCircle {...props} />;
    case "agendado":
      return <Clock3 {...props} />;
    case "em_execucao":
      return <Loader2 {...props} className="h-4 w-4 animate-spin" />;
    case "pulado":
      return <MinusCircle {...props} />;
    default:
      return <Circle {...props} />;
  }
}

interface LinhaTempoViewProps {
  grafo: GrafoFluxo;
  estadosNo?: Record<string, EstadoNoExecucao>;
  noAtualId?: string | null;
  onSelecionarNo?: (noId: string | null) => void;
}

/**
 * Visão "etapas em sequência" — alternativa ao grafo.
 * Usada como padrão em mobile e disponível como opção em desktop.
 */
export function LinhaTempoView({
  grafo,
  estadosNo,
  noAtualId,
  onSelecionarNo,
}: LinhaTempoViewProps) {
  // Ordena nós seguindo as conexões a partir do gatilho
  const ordenados = ordenarGrafo(grafo);

  return (
    <ol className="mx-auto max-w-2xl space-y-0 px-1 py-2" aria-label="Etapas do fluxo em sequência">
      {ordenados.map((no, idx) => {
        const tipo = no.data.tipo;
        const metaTipo = META_NOS[tipo];
        const IconeTipo = ICONES_TIPO[tipo];
        const estado: EstadoNoExecucao = estadosNo?.[no.id] ?? "pendente";
        const metaEstado = META_ESTADOS[estado];
        const eAtual = noAtualId === no.id;
        const ultimo = idx === ordenados.length - 1;

        return (
          <li key={no.id} className="relative">
            {/* Linha vertical conectora */}
            {!ultimo && (
              <span
                aria-hidden
                className="absolute left-[19px] top-10 h-[calc(100%-24px)] w-0.5"
                style={{
                  background:
                    estadosNo && estadosNo[ordenados[idx + 1].id] === "concluido"
                      ? "var(--success)"
                      : "var(--border)",
                }}
              />
            )}

            <button
              onClick={() => onSelecionarNo?.(no.id)}
              className="relative flex w-full items-start gap-3 rounded-xl px-1 py-2.5 text-left transition-colors hover:bg-[var(--inset)]"
              aria-current={eAtual ? "step" : undefined}
            >
              {/* Ícone do tipo */}
              <span
                className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  background: metaTipo.corLight,
                  borderColor: metaEstado.cor,
                  color: metaTipo.cor,
                }}
              >
                <IconeTipo className="h-4 w-4" />
              </span>

              {/* Conteúdo */}
              <span className="min-w-0 flex-1 rounded-lg border bg-[var(--white)] px-3 py-2"
                style={{ borderColor: eAtual ? metaEstado.cor : "var(--border)" }}>
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                    {no.data.label}
                  </span>
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{ background: metaEstado.corLight, color: metaEstado.cor }}
                  >
                    <IconeEstado estado={estado} />
                    {metaEstado.label}
                  </span>
                </span>

                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide" style={{ color: metaTipo.cor }}>
                  {metaTipo.label}
                </span>

                {tipo === "mensagem_whatsapp" && (
                  <span className="mt-1 block line-clamp-2 rounded bg-[var(--inset)] px-2 py-1 text-[11px] leading-snug text-[var(--text-secondary)]">
                    {(no.data as { conteudo?: string }).conteudo}
                  </span>
                )}
                {tipo === "atraso" && (
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                    <Clock className="h-3 w-3" />
                    Espera {(no.data as { quantidade?: number; unidade?: string }).quantidade}{" "}
                    {(no.data as { quantidade?: number; unidade?: string }).unidade}
                  </span>
                )}
                {tipo === "condicao" && (
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                    <GitBranch className="h-3 w-3" />
                    {(no.data as { campo?: string }).campo}{" "}
                    {(no.data as { operador?: string }).operador}{" "}
                    {(no.data as { valor?: string }).valor}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}

      {ordenados.length === 0 && (
        <li className="flex flex-col items-center gap-2 py-12 text-center">
          <Link2 className="h-8 w-8 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">Este fluxo ainda não tem etapas.</p>
        </li>
      )}
    </ol>
  );
}

function ordenarGrafo(grafo: GrafoFluxo) {
  const porId = new Map(grafo.nodes.map((n) => [n.id, n]));
  const visitados = new Set<string>();
  const ordem: typeof grafo.nodes = [];

  // Começa pelo gatilho
  const gatilho = grafo.nodes.find((n) => n.data.tipo === "gatilho");
  const fila: string[] = gatilho ? [gatilho.id] : grafo.nodes.map((n) => n.id);

  while (fila.length) {
    const id = fila.shift()!;
    if (visitados.has(id)) continue;
    visitados.add(id);
    const no = porId.get(id);
    if (!no) continue;
    ordem.push(no);

    for (const aresta of grafo.edges.filter((e) => e.source === id)) {
      if (!visitados.has(aresta.target)) fila.push(aresta.target);
    }
  }

  // Nós desconectados no final
  for (const no of grafo.nodes) {
    if (!visitados.has(no.id)) ordem.push(no);
  }

  return ordem;
}

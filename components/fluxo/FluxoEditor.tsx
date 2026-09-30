"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  Copy,
  LayoutGrid,
  ListOrdered,
  RefreshCw,
  Users,
  X,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  RotateCcw,
  SkipForward,
  Ban,
  ExternalLink,
} from "lucide-react";
import { FluxoCanvas, type FluxoCanvasHandle } from "./FluxoCanvas";
import { LinhaTempoView } from "./LinhaTempoView";
import { META_ESTADOS } from "./meta";
import type {
  Fluxo,
  FluxoExecucao,
  ResumoExecucaoFluxo,
  GrafoFluxo,
  EstadoNoExecucao,
} from "@/core/domain/entities/fluxo";

type Aba = "execucoes" | "config";

export default function FluxoEditor({ fluxoId }: { fluxoId: string }) {
  const [fluxo, setFluxo] = useState<Fluxo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [grafo, setGrafo] = useState<GrafoFluxo>({ nodes: [], edges: [] });
  const [sujo, setSujo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modoVisao, setModoVisao] = useState<"grafo" | "linha">("grafo");
  const [execucoes, setExecucoes] = useState<FluxoExecucao[]>([]);
  const [execucaoSel, setExecucaoSel] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoExecucaoFluxo | null>(null);
  const [aba, setAba] = useState<Aba>("execucoes");
  const [toast, setToast] = useState<string | null>(null);
  const canvasRef = useRef<FluxoCanvasHandle>(null);

  // Carrega fluxo
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/fluxos/${fluxoId}`);
        if (!r.ok) {
          setErro("Fluxo não encontrado.");
          return;
        }
        const data = await r.json();
        setFluxo(data.fluxo);
        setGrafo(data.fluxo.grafo ?? { nodes: [], edges: [] });
      } catch {
        setErro("Erro ao carregar fluxo.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [fluxoId]);

  const carregarExecucoes = useCallback(async () => {
    try {
      const r = await fetch(`/api/fluxos/execucoes?fluxo_id=${fluxoId}`);
      if (r.ok) {
        const data = await r.json();
        setExecucoes(data.execucoes ?? []);
      }
    } catch {
      // silencioso
    }
  }, [fluxoId]);

  useEffect(() => {
    carregarExecucoes();
  }, [carregarExecucoes]);

  // Carrega resumo da execução selecionada
  useEffect(() => {
    if (!execucaoSel) {
      setResumo(null);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`/api/fluxos/execucoes/${execucaoSel}`);
        if (r.ok) {
          const data = await r.json();
          setResumo(data.resumo);
        }
      } catch {
        // silencioso
      }
    })();
  }, [execucaoSel]);

  // Polling discreto enquanto há execuções ativas (5s)
  useEffect(() => {
    const temAtivas = execucoes.some((e) =>
      ["ativa", "pausada_por_resposta", "pausada_manual"].includes(e.status)
    );
    if (!temAtivas) return;
    const t = setInterval(carregarExecucoes, 5000);
    return () => clearInterval(t);
  }, [execucoes, carregarExecucoes]);

  const mostrarToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  async function salvar() {
    setSalvando(true);
    try {
      const r = await fetch(`/api/fluxos/${fluxoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grafo }),
      });
      if (r.ok) {
        setSujo(false);
        mostrarToast("Fluxo salvo.");
      } else {
        const data = await r.json();
        mostrarToast(data.erro ?? "Erro ao salvar.");
      }
    } catch {
      mostrarToast("Erro de conexão ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(novo: Fluxo["status"]) {
    const r = await fetch(`/api/fluxos/${fluxoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novo }),
    });
    if (r.ok) {
      const data = await r.json();
      setFluxo(data.fluxo);
      mostrarToast(
        novo === "ativo" ? "Fluxo ativado." : novo === "pausado" ? "Fluxo pausado." : "Status atualizado."
      );
    }
  }

  async function acaoExecucao(acao: string, noId?: string) {
    if (!execucaoSel) return;
    try {
      const r = await fetch(`/api/fluxos/execucoes/${execucaoSel}/acao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, noId }),
      });
      if (r.ok) {
        mostrarToast(`Ação "${acao}" executada.`);
        await carregarExecucoes();
        if (execucaoSel) {
          const rr = await fetch(`/api/fluxos/execucoes/${execucaoSel}`);
          if (rr.ok) setResumo((await rr.json()).resumo);
        }
      } else {
        const data = await r.json();
        mostrarToast(data.erro ?? "Erro na ação.");
      }
    } catch {
      mostrarToast("Erro de conexão.");
    }
  }

  // Estados por nó da execução selecionada (destaque no canvas)
  const estadosNo = useCallback((): Record<string, EstadoNoExecucao> | undefined => {
    if (!resumo) return undefined;
    const mapa: Record<string, EstadoNoExecucao> = {};
    for (const no of resumo.nos) mapa[no.no_id] = no.estado;
    if (resumo.execucao.no_atual_id && !mapa[resumo.execucao.no_atual_id]) {
      mapa[resumo.execucao.no_atual_id] = resumo.execucao.no_atual_estado;
    }
    return mapa;
  }, [resumo]);

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-72 rounded-lg" />
        <div className="skeleton h-[520px] rounded-xl" />
      </div>
    );
  }

  if (erro || !fluxo) {
    return (
      <div className="card flex flex-col items-center gap-3 py-14 text-center">
        <AlertTriangle className="h-8 w-8 text-[var(--danger)]" />
        <p className="text-sm font-semibold text-[var(--text-primary)]">{erro ?? "Fluxo não encontrado"}</p>
        <Link href="/fluxos" className="text-xs font-semibold text-[var(--accent)] hover:underline">
          Voltar para fluxos
        </Link>
      </div>
    );
  }

  const statusMeta = {
    rascunho: { label: "Rascunho", cor: "#94A3B8" },
    ativo: { label: "Ativo", cor: "#34D399" },
    pausado: { label: "Pausado", cor: "#FBBF24" },
    concluido: { label: "Concluído", cor: "#38BDF8" },
    cancelado: { label: "Cancelado", cor: "#F87171" },
  }[fluxo.status];

  return (
    <div className="space-y-4">
      {/* ─── Cabeçalho ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/fluxos"
          aria-label="Voltar para fluxos"
          className="rounded-lg border border-[var(--border)] bg-[var(--inset)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold tracking-tight text-[var(--text-primary)]">
              {fluxo.nome}
            </h2>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{ background: `${statusMeta.cor}22`, color: statusMeta.cor }}
            >
              {statusMeta.label}
            </span>
            {sujo && (
              <span className="rounded-full bg-[var(--warning-light)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--warning)]">
                Alterações não salvas
              </span>
            )}
          </div>
          {fluxo.descricao && (
            <p className="truncate text-xs text-[var(--text-secondary)]">{fluxo.descricao}</p>
          )}
        </div>

        {/* Alternador de visão */}
        <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--inset)] p-1">
          <button
            onClick={() => setModoVisao("grafo")}
            aria-pressed={modoVisao === "grafo"}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
              modoVisao === "grafo" ? "bg-[var(--raised)] text-[var(--text-primary)]" : "text-[var(--text-muted)]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grafo
          </button>
          <button
            onClick={() => setModoVisao("linha")}
            aria-pressed={modoVisao === "linha"}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
              modoVisao === "linha" ? "bg-[var(--raised)] text-[var(--text-primary)]" : "text-[var(--text-muted)]"
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Etapas
          </button>
        </div>

        <button
          onClick={salvar}
          disabled={!sujo || salvando}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-45 hover:bg-[var(--accent-hover)]"
        >
          {salvando ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Salvar
        </button>

        {fluxo.status === "ativo" ? (
          <button
            onClick={() => mudarStatus("pausado")}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-light)] px-3 py-2 text-xs font-semibold text-[var(--warning)] hover:border-[var(--warning)]"
          >
            <Pause className="h-3.5 w-3.5" />
            Pausar fluxo
          </button>
        ) : (
          <button
            onClick={() => mudarStatus("ativo")}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--success-border)] bg-[var(--success-light)] px-3 py-2 text-xs font-semibold text-[var(--success)] hover:border-[var(--success)]"
          >
            <Play className="h-3.5 w-3.5" />
            Ativar fluxo
          </button>
        )}
      </div>

      {/* ─── Corpo: canvas + painel lateral ─── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        {/* Canvas / Linha do tempo */}
        <div className="card relative h-[560px] overflow-hidden">
          {modoVisao === "grafo" ? (
            <FluxoCanvas
              ref={canvasRef}
              grafo={grafo}
              onChange={(g) => {
                setGrafo(g);
                setSujo(true);
              }}
              estadosNo={estadosNo()}
              onSelecionarNo={() => {}}
            />
          ) : (
            <div className="h-full overflow-y-auto scroll-thin">
              <LinhaTempoView
                grafo={grafo}
                estadosNo={estadosNo()}
                noAtualId={resumo?.execucao.no_atual_id}
              />
            </div>
          )}
        </div>

        {/* Painel lateral */}
        <aside className="card flex max-h-[560px] flex-col overflow-hidden">
          {/* Abas */}
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setAba("execucoes")}
              className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${
                aba === "execucoes"
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Execuções ({execucoes.length})
            </button>
            <button
              onClick={() => setAba("config")}
              className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${
                aba === "config"
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Configuração
            </button>
          </div>

          {aba === "execucoes" ? (
            <div className="flex-1 overflow-y-auto scroll-thin">
              {execucoes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <Users className="h-7 w-7 text-[var(--text-muted)]" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Nenhum lead neste fluxo
                  </p>
                  <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                    Ative o fluxo e aplique-o a um lead ou segmento para começar a acompanhar.
                  </p>
                </div>
              ) : (
                <ul>
                  {execucoes.map((exec) => {
                    const st = {
                      ativa: { label: "Ativa", cor: "#34D399" },
                      pausada_por_resposta: { label: "Pausada · resposta", cor: "#38BDF8" },
                      pausada_manual: { label: "Pausada", cor: "#FBBF24" },
                      concluida: { label: "Concluída", cor: "#94A3B8" },
                      falhou: { label: "Falhou", cor: "#F87171" },
                      cancelada: { label: "Cancelada", cor: "#64748B" },
                    }[exec.status];
                    const selecionada = execucaoSel === exec.id;
                    return (
                      <li key={exec.id}>
                        <button
                          onClick={() => setExecucaoSel(selecionada ? null : exec.id)}
                          className={`w-full border-b border-[var(--border)] px-4 py-2.5 text-left transition-colors hover:bg-[var(--inset)] ${
                            selecionada ? "bg-[var(--accent-light)]" : ""
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                              {exec.cliente?.nome ?? "Sem nome"}
                            </span>
                            <span
                              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                              style={{ background: `${st.cor}22`, color: st.cor }}
                            >
                              {st.label}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
                            Iniciado {new Date(exec.iniciado_em).toLocaleDateString("pt-BR")}
                            {exec.proxima_execucao_em && exec.status === "ativa" && (
                              <> · próxima {formatarRelativo(exec.proxima_execucao_em)}</>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Detalhe da execução selecionada */}
              {resumo && (
                <div className="space-y-3 p-4 animate-fade-up">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      Detalhes
                    </p>
                    <button
                      onClick={() => setExecucaoSel(null)}
                      aria-label="Fechar detalhes"
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Lead */}
                  <div className="rounded-lg bg-[var(--inset)] p-3">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                      {resumo.execucao.cliente?.nome ?? "Lead"}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {resumo.execucao.cliente?.telefone ?? "Sem telefone"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                      Estágio: {resumo.execucao.cliente?.status?.replace(/_/g, " ") ?? "—"}
                    </p>
                  </div>

                  {/* Progresso */}
                  <div className="rounded-lg bg-[var(--inset)] p-3">
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[var(--text-secondary)]">Progresso</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {resumo.progresso.concluidos}/{resumo.progresso.total}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--raised)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${resumo.progresso.total ? (resumo.progresso.concluidos / resumo.progresso.total) * 100 : 0}%`,
                          background: "var(--success)",
                        }}
                      />
                    </div>
                    <div className="mt-2 flex gap-3 text-[10px]">
                      {resumo.progresso.falhados > 0 && (
                        <span className="font-bold text-[var(--danger)]">
                          {resumo.progresso.falhados} falha(s)
                        </span>
                      )}
                      {resumo.progresso.pulados > 0 && (
                        <span className="font-bold text-[var(--text-muted)]">
                          {resumo.progresso.pulados} pulado(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Próxima ação */}
                  {resumo.proximaAcao && (
                    <div className="rounded-lg border border-[var(--warning-border)] bg-[var(--warning-light)] p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase" style={{ color: "var(--warning)" }}>
                        <CalendarClock className="h-3.5 w-3.5" />
                        Próxima etapa
                      </p>
                      <p className="mt-0.5 text-[13px] font-semibold text-[var(--text-primary)]">
                        {resumo.proximaAcao.label}
                      </p>
                      {resumo.proximaAcao.agendadoPara && (
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Agendado para {formatarRelativo(resumo.proximaAcao.agendadoPara)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Ações manuais */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {resumo.execucao.status === "ativa" && (
                      <AcaoBotao icon={Pause} label="Pausar" onClick={() => acaoExecucao("pausar")} />
                    )}
                    {resumo.execucao.status.startsWith("pausada") && (
                      <AcaoBotao icon={Play} label="Retomar" tone="success" onClick={() => acaoExecucao("retomar")} />
                    )}
                    {resumo.execucao.no_atual_estado === "falhou" && (
                      <AcaoBotao icon={RotateCcw} label="Reexecutar" tone="danger" onClick={() => acaoExecucao("reexecutar_no_falho")} />
                    )}
                    {resumo.execucao.no_atual_id && (
                      <AcaoBotao icon={SkipForward} label="Pular etapa" onClick={() => acaoExecucao("pular_etapa", resumo.execucao.no_atual_id!)} />
                    )}
                    <AcaoBotao icon={Play} label="Executar agora" tone="accent" onClick={() => acaoExecucao("executar_agora")} />
                    {!resumo.execucao.status.startsWith("cancelada") && (
                      <AcaoBotao icon={Ban} label="Cancelar" tone="danger" onClick={() => acaoExecucao("cancelar")} />
                    )}
                  </div>

                  {/* Nós executados (mini linha do tempo) */}
                  {resumo.nos.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                        Etapas
                      </p>
                      <ul className="space-y-1">
                        {resumo.nos.map((no) => {
                          const meta = META_ESTADOS[no.estado];
                          return (
                            <li
                              key={no.id}
                              className="flex items-center justify-between gap-2 rounded-md bg-[var(--inset)] px-2.5 py-1.5"
                            >
                              <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--text-primary)]">
                                {(no.dados_extra as Record<string, unknown>)?.label as string ?? no.no_id}
                              </span>
                              <span
                                className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                                style={{ background: meta.corLight, color: meta.cor }}
                              >
                                {meta.label}
                              </span>
                              {no.concluido_em && (
                                <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                                  {new Date(no.concluido_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Log */}
                  {resumo.logs.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                        Log de execução
                      </p>
                      <ul className="space-y-1">
                        {resumo.logs.slice(0, 12).map((log) => (
                          <li key={log.id} className="flex items-start gap-2 text-[11px]">
                            <span className="shrink-0 font-mono text-[var(--text-muted)]">
                              {new Date(log.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className={log.origem === "manual" ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>
                              {log.evento}
                              {log.origem === "manual" && " · manual"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Link para conversa */}
                  <a
                    href={`/mensagens?cliente=${resumo.execucao.cliente_id}`}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--inset)] py-2 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir conversa no WhatsApp
                  </a>
                </div>
              )}
            </div>
          ) : (
            <ConfigAba fluxo={fluxo} onSalvar={(dados) => setFluxo({ ...fluxo, ...dados })} />
          )}
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-toast">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--raised)] px-4 py-2.5 shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AcaoBotao({
  icon: Icon,
  label,
  onClick,
  tone = "neutral",
}: {
  icon: typeof Pause;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "success" | "danger" | "accent";
}) {
  const cores = {
    neutral: "border-[var(--border)] bg-[var(--inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    success: "border-[var(--success-border)] bg-[var(--success-light)] text-[var(--success)]",
    danger: "border-[var(--danger-border)] bg-[var(--danger-light)] text-[var(--danger)]",
    accent: "border-[var(--accent-border)] bg-[var(--accent-light)] text-[var(--accent)]",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-semibold ${cores}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ConfigAba({
  fluxo,
  onSalvar,
}: {
  fluxo: Fluxo;
  onSalvar: (dados: Partial<Fluxo>) => void;
}) {
  const [form, setForm] = useState({
    pausar_quando_responder: fluxo.pausar_quando_responder,
    janela_envio_inicio: fluxo.janela_envio_inicio.slice(0, 5),
    janela_envio_fim: fluxo.janela_envio_fim.slice(0, 5),
    limite_mensagens_por_dia: fluxo.limite_mensagens_por_dia,
  });
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      const r = await fetch(`/api/fluxos/${fluxo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) {
        const data = await r.json();
        onSalvar(data.fluxo);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }
    } finally {
      setSalvando(false);
    }
  }

  const labelClasse = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]";
  const campoClasse = "w-full rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none";

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4 scroll-thin">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          Regras de execução
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
          Configurações globais de disparo deste fluxo.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-[var(--inset)] p-3">
        <input
          type="checkbox"
          checked={form.pausar_quando_responder}
          onChange={(e) => setForm({ ...form, pausar_quando_responder: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded accent-[var(--accent)]"
        />
        <span>
          <span className="block text-[13px] font-semibold text-[var(--text-primary)]">
            Pausar quando o lead responder
          </span>
          <span className="block text-[11px] leading-snug text-[var(--text-secondary)]">
            Nenhuma automação "pisando" na conversa humana. A pausa ocorre em até 30s.
          </span>
        </span>
      </label>

      <div>
        <label className={labelClasse} htmlFor="janela-inicio">Janela de envio</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            id="janela-inicio"
            type="time"
            className={campoClasse}
            value={form.janela_envio_inicio}
            onChange={(e) => setForm({ ...form, janela_envio_inicio: e.target.value })}
          />
          <input
            type="time"
            aria-label="Fim da janela de envio"
            className={campoClasse}
            value={form.janela_envio_fim}
            onChange={(e) => setForm({ ...form, janela_envio_fim: e.target.value })}
          />
        </div>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Mensagens fora da janela são reagendadas para o próximo início.
        </p>
      </div>

      <div>
        <label className={labelClasse} htmlFor="limite-dia">
          Limite de mensagens por lead/dia: {form.limite_mensagens_por_dia}
        </label>
        <input
          id="limite-dia"
          type="range"
          min={1}
          max={20}
          value={form.limite_mensagens_por_dia}
          onChange={(e) => setForm({ ...form, limite_mensagens_por_dia: Number(e.target.value) })}
          className="w-full accent-[var(--accent)]"
        />
        <p className="text-[11px] text-[var(--text-muted)]">
          Limite anti-bloqueio por número.
        </p>
      </div>

      <button
        onClick={salvar}
        disabled={salvando}
        className="w-full rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-white disabled:opacity-50 hover:bg-[var(--accent-hover)]"
      >
        {salvando ? "Salvando..." : ok ? "Salvo!" : "Salvar configurações"}
      </button>
    </div>
  );
}

function formatarRelativo(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const min = Math.round(diff / 60000);
  if (Math.abs(min) < 60) return `em ${min} min`;
  const horas = Math.round(min / 60);
  if (Math.abs(horas) < 48) return `em ${horas}h`;
  const dias = Math.round(horas / 24);
  return `em ${dias}d`;
}

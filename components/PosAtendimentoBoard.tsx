"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  AlertTriangle,
  X,
  UserRound,
  FileText,
} from "lucide-react";
import { TarefaItem } from "@/lib/segmentacao/tipos";
import { finalidadeConfig } from "./ClienteCard";
import NovaTarefaModal from "./NovaTarefaModal";
import { executeGraphQL, QUERIES, MUTATIONS } from "@/lib/graphql-client";

const PRIORIDADE_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Crítica", color: "#dc2626" },
  2: { label: "Alta",    color: "#b45309" },
  3: { label: "Média",   color: "#4f46e5" },
};

const MS_DIA = 24 * 60 * 60 * 1000;

interface Coluna {
  id: string;
  titulo: string;
  statusList: string[];
  accent: string;
  badge: string;
}

const COLUNAS: Coluna[] = [
  {
    id: "pendente",
    titulo: "Pendentes",
    statusList: ["pendente"],
    accent: "#d97706",
    badge: "bg-amber-50 text-amber-700",
  },
  {
    id: "em_andamento",
    titulo: "Em Andamento",
    statusList: ["em_andamento", "reagendada"],
    accent: "#2563eb",
    badge: "bg-blue-50 text-blue-700",
  },
  {
    id: "concluida",
    titulo: "Concluídas",
    statusList: ["concluida"],
    accent: "#059669",
    badge: "bg-emerald-50 text-emerald-700",
  },
];

type AtualizarStatusFn = (tarefaId: string, novoStatus: string) => void;

function TarefaDrawer({
  tarefa,
  aoFechar,
  aoAtualizarStatus,
}: {
  tarefa: TarefaItem;
  aoFechar: () => void;
  aoAtualizarStatus: AtualizarStatusFn;
}) {
  const prio = PRIORIDADE_LABEL[tarefa.prioridade] ?? { label: `P${tarefa.prioridade}`, color: "var(--text-muted)" };
  const vencida = tarefa.prazo_em && new Date(tarefa.prazo_em) < new Date() && tarefa.status !== "concluida";
  const diasAtraso = tarefa.prazo_em
    ? Math.floor((new Date().getTime() - new Date(tarefa.prazo_em).getTime()) / MS_DIA)
    : 0;

  const statusMeta =
    tarefa.status === "concluida"
      ? { label: "Concluída", cor: "var(--success)", bg: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" }
      : tarefa.status === "em_andamento" || tarefa.status === "reagendada"
        ? { label: "Em Andamento", cor: "var(--accent)", bg: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.35)" }
        : { label: "Pendente", cor: "var(--warning)", bg: "rgba(251,191,36,0.14)", border: "rgba(251,191,36,0.35)" };

  const finalidadeItem = tarefa.cliente?.finalidade_principal
    ? finalidadeConfig[tarefa.cliente.finalidade_principal]
    : null;

  const formatarData = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={aoFechar} />
      <aside className="absolute right-0 top-0 flex h-screen w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--white)] shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--border)] px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ color: statusMeta.cor, background: statusMeta.bg, border: `1px solid ${statusMeta.border}` }}
              >
                {statusMeta.label}
              </span>
              <h2 className="mt-3 text-lg font-black tracking-wide leading-snug text-[var(--text-primary)]">
                {tarefa.titulo}
              </h2>
            </div>
            <button
              onClick={aoFechar}
              aria-label="Fechar detalhes da tarefa"
              className="shrink-0 rounded-xl border border-[var(--border)] p-2 text-[var(--text-muted)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Alertas reais */}
          {vencida && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-light)] p-3.5 text-sm text-[var(--danger)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Prazo vencido</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {diasAtraso > 0
                    ? `Tarefa atrasada há ${diasAtraso} dia${diasAtraso > 1 ? "s" : ""} desde ${formatarData(tarefa.prazo_em)}.`
                    : `Prazo vencido em ${formatarData(tarefa.prazo_em)}.`}
                </p>
              </div>
            </div>
          )}

          {/* Situação */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              <FileText className="h-4 w-4 text-[var(--accent)]" />
              Situação
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</dt>
                <dd className="mt-1 font-bold capitalize text-[var(--text-primary)]">{statusMeta.label}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Prioridade</dt>
                <dd className="mt-1 font-bold" style={{ color: prio.color }}>{prio.label}</dd>
              </div>
              {tarefa.prazo_em && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Prazo</dt>
                  <dd className={`mt-1 font-bold ${vencida ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}>
                    {formatarData(tarefa.prazo_em)}
                  </dd>
                </div>
              )}
              {tarefa.concluida_em && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Concluída em</dt>
                  <dd className="mt-1 font-bold text-[var(--text-primary)]">{formatarData(tarefa.concluida_em)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Criada em</dt>
                <dd className="mt-1 text-[var(--text-primary)]">{formatarData(tarefa.criado_em)}</dd>
              </div>
              {tarefa.atualizado_em && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Atualizada em</dt>
                  <dd className="mt-1 text-[var(--text-primary)]">{formatarData(tarefa.atualizado_em)}</dd>
                </div>
              )}
            </dl>
          </section>

          <div className="border-t border-[var(--border)]" />

          {/* Cliente */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              <UserRound className="h-4 w-4 text-[var(--accent)]" />
              Cliente
            </h3>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              {tarefa.cliente?.id ? (
                <Link
                  href={`/clientes/${tarefa.cliente.id}`}
                  className="flex items-center gap-1 text-sm font-bold text-[var(--accent)] hover:underline"
                >
                  {tarefa.cliente.pessoa?.nome || "Cliente"} <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {tarefa.cliente?.pessoa?.nome || "Cliente não informado"}
                </span>
              )}
              {finalidadeItem && (
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${finalidadeItem.bg} ${finalidadeItem.text} ${finalidadeItem.border}`}>
                  {finalidadeItem.label}
                </span>
              )}
            </div>
          </section>

          <div className="border-t border-[var(--border)]" />

          {/* Descrição */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              <FileText className="h-4 w-4 text-[var(--accent)]" />
              Descrição
            </h3>
            {tarefa.descricao ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                {tarefa.descricao}
              </p>
            ) : (
              <p className="mt-3 text-sm text-[var(--text-muted)]">Sem descrição.</p>
            )}
          </section>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-[var(--border)] px-6 py-4">
          {tarefa.status !== "pendente" && (
            <button
              onClick={() => aoAtualizarStatus(tarefa.id, "pendente")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--warning-border)] bg-[var(--warning-light)] px-4 py-2.5 text-sm font-bold text-[var(--warning)] transition hover:opacity-80"
            >
              Voltar para Fila
            </button>
          )}
          {tarefa.status !== "em_andamento" && tarefa.status !== "concluida" && (
            <button
              onClick={() => aoAtualizarStatus(tarefa.id, "em_andamento")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Iniciar Tarefa
            </button>
          )}
          {tarefa.status !== "concluida" && (
            <button
              onClick={() => aoAtualizarStatus(tarefa.id, "concluida")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--success)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4" />
              Concluir
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function PosAtendimentoBoard() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaItem | null>(null);

  // Drag & drop state
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [overColuna, setOverColuna] = useState<string | null>(null);
  const dragCounter = useRef<number>(0);

  async function carregarTarefas() {
    setCarregando(true);
    try {
      try {
        const data = await executeGraphQL<{ tarefas: any[] }>(QUERIES.GET_TAREFAS);
        if (data?.tarefas) {
          const normalizadas = data.tarefas.map((t) => ({
            ...t,
            cliente_id: t.clienteId || t.cliente_id,
            prazo_em: t.prazoEm || t.prazo_em,
            concluido_em: t.concluidoEm || t.concluido_em,
            criado_em: t.criadoEm || t.criado_em,
            cliente: t.cliente
              ? { ...t.cliente, finalidade_principal: t.cliente.finalidadePrincipal || t.cliente.finalidade_principal }
              : undefined,
          }));
          setTarefas(normalizadas as TarefaItem[]);
          return;
        }
      } catch { /* fallback */ }

      const res = await fetch("/api/tarefas");
      if (res.ok) {
        const json = await res.json();
        setTarefas(json.tarefas || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarTarefas(); }, []);

  async function atualizarStatus(tarefaId: string, novoStatus: string) {
    try {
      try {
        await executeGraphQL(MUTATIONS.ATUALIZAR_TAREFA, { input: { id: tarefaId, status: novoStatus } });
        carregarTarefas();
        return;
      } catch { /* fallback */ }

      const res = await fetch(`/api/tarefas/${tarefaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) carregarTarefas();
    } catch (e) {
      console.error(e);
    }
  }

  function handleDragStart(id: string) {
    setArrastandoId(id);
  }

  function handleDragEnd() {
    dragCounter.current = 0;
    setArrastandoId(null);
    setOverColuna(null);
  }

  function handleDragOverColuna(colunaId: string, e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverColuna(colunaId);
  }

  function handleDropColuna(coluna: Coluna, e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setOverColuna(null);
    if (!arrastandoId) return;

    const tarefa = tarefas.find((t) => t.id === arrastandoId);
    if (!tarefa) return;
    const alvo = coluna.statusList[0];
    if (tarefa.status === alvo) return;

    atualizarStatus(tarefa.id, alvo);
    setArrastandoId(null);
  }

  const tarefasFiltradas = filtroPrioridade
    ? tarefas.filter((t) => t.prioridade === Number(filtroPrioridade))
    : tarefas;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const resumo = {
    atrasadas: tarefas.filter((t) => t.status !== "concluida" && t.prazo_em && new Date(t.prazo_em) < hoje).length,
    hoje: tarefas.filter(
      (t) => t.status !== "concluida" && t.prazo_em && new Date(t.prazo_em) >= hoje && new Date(t.prazo_em) < amanha
    ).length,
    proximas: tarefas.filter((t) => t.status !== "concluida" && t.prazo_em && new Date(t.prazo_em) >= amanha).length,
    concluidas: tarefas.filter((t) => t.status === "concluida").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Fila de Pós-Atendimento
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} no total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="h-10 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
          >
            <option value="">Todas as prioridades</option>
            <option value="1">Crítica</option>
            <option value="2">Alta</option>
            <option value="3">Média</option>
          </select>
          <button
            onClick={carregarTarefas}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Resumo compacto */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Atrasadas", value: resumo.atrasadas, cor: "var(--danger)", icon: AlertTriangle },
          { label: "Vencem hoje", value: resumo.hoje, cor: "var(--accent)", icon: Clock },
          { label: "Próximas", value: resumo.proximas, cor: "var(--warning)", icon: ArrowRight },
          { label: "Concluídas", value: resumo.concluidas, cor: "var(--success)", icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-3 p-3.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--inset)", color: s.cor }}
              >
                <Icon className="h-[15px] w-[15px]" />
              </span>
              <div className="min-w-0">
                <span className="block text-lg font-bold leading-tight tracking-tight text-[var(--text-primary)]">
                  {s.value}
                </span>
                <span className="block truncate text-[11px] text-[var(--text-secondary)]">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {carregando ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)]">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
          Carregando tarefas…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {COLUNAS.map((col) => {
            const items = tarefasFiltradas.filter((t) => col.statusList.includes(t.status));
            const isOver = overColuna === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOverColuna(col.id, e)}
                onDragLeave={() => {
                  dragCounter.current -= 1;
                  if (dragCounter.current <= 0) {
                    dragCounter.current = 0;
                    setOverColuna(null);
                  }
                }}
                onDrop={(e) => handleDropColuna(col, e)}
                className={`flex flex-col gap-3 rounded-xl border p-3 transition-colors ${
                  isOver
                    ? "border-[var(--accent)] bg-[var(--raised)] ring-2 ring-[var(--accent-light)]"
                    : "border-[var(--border)] bg-[var(--inset)]"
                }`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-2 pb-2.5 pt-1">
                  <h2 className="text-sm font-black uppercase tracking-wide text-[var(--text-primary)]">
                    {col.titulo}
                  </h2>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: "var(--white)", color: col.accent }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="flex min-h-[60px] flex-col gap-3">
                  {items.map((tarefa) => {
                    const prio = PRIORIDADE_LABEL[tarefa.prioridade] ?? { label: `P${tarefa.prioridade}`, color: "var(--text-muted)" };
                    const isVencida = tarefa.prazo_em && new Date(tarefa.prazo_em) < new Date() && tarefa.status !== "concluida";
                    const estaArrastando = arrastandoId === tarefa.id;
                    const concluida = tarefa.status === "concluida";
                    const diasAtraso = tarefa.prazo_em
                      ? Math.floor((new Date().getTime() - new Date(tarefa.prazo_em).getTime()) / MS_DIA)
                      : 0;

                    return (
                      <div
                        key={tarefa.id}
                        draggable
                        onDragStart={() => handleDragStart(tarefa.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setTarefaSelecionada(tarefa)}
                        className={`relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border bg-[var(--white)] p-3 pl-4 shadow-sm transition active:cursor-grabbing ${
                          estaArrastando
                            ? "scale-[1.01] opacity-40 shadow-lg"
                            : "hover:border-[var(--border-strong)] hover:shadow-md hover:shadow-black/10"
                        } ${isVencida ? "border-[var(--danger-border)] ring-1 ring-[var(--danger-border)]" : "border-[var(--border)]"}`}
                      >
                        <span
                          className="absolute bottom-0 left-0 top-0 w-1"
                          style={{ background: col.accent }}
                        />

                        {/* Título com checkbox */}
                        <div className="flex items-start gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              atualizarStatus(tarefa.id, concluida ? "pendente" : "concluida");
                            }}
                            aria-label={concluida ? "Reabrir tarefa" : "Concluir tarefa"}
                            className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition ${
                              concluida
                                ? "border-[var(--success)] bg-[var(--success)] text-white"
                                : "border-[var(--border-strong)] bg-[var(--white)] hover:border-[var(--accent)]"
                            }`}
                          >
                            {concluida && <CheckCircle2 className="h-3 w-3" />}
                          </button>
                          <h4 className={`min-w-0 flex-1 text-sm font-black leading-snug tracking-wide ${concluida ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                            {tarefa.titulo}
                          </h4>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{ color: prio.color, borderColor: `${prio.color}4d`, backgroundColor: `${prio.color}1a`, borderWidth: 1 }}
                          >
                            {prio.label}
                          </span>
                        </div>

                        {/* Meta: cliente + prazo */}
                        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                          <div className="flex min-w-0 items-center gap-2">
                            {tarefa.cliente?.id ? (
                              <Link
                                href={`/clientes/${tarefa.cliente.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex min-w-0 items-center gap-1 font-bold text-[var(--accent)] hover:underline"
                              >
                                <UserRound className="h-3 w-3 shrink-0" />
                                <span className="truncate">{tarefa.cliente.pessoa?.nome || "Cliente"}</span>
                              </Link>
                            ) : tarefa.cliente ? (
                              <span className="flex min-w-0 items-center gap-1 font-bold text-[var(--text-primary)]">
                                <UserRound className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                                <span className="truncate">{tarefa.cliente.pessoa?.nome || "Cliente"}</span>
                              </span>
                            ) : <span />}
                          </div>
                          {tarefa.prazo_em && (
                            <span
                              className={`flex shrink-0 items-center gap-1 font-semibold ${
                                isVencida ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"
                              }`}
                            >
                              <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                              {new Date(tarefa.prazo_em).toLocaleDateString("pt-BR")}
                              {isVencida && (
                                <span className="rounded-full border border-[var(--danger-border)] bg-[var(--danger-light)] px-1.5 py-px text-[9px] font-bold">
                                  {diasAtraso > 0 ? `${diasAtraso}d atraso` : "atrasada"}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div
                      className={`rounded-xl border border-dashed px-4 py-8 text-center text-sm transition-colors ${
                        isOver
                          ? "border-[var(--accent)] bg-[var(--raised)] text-[var(--text-primary)]"
                          : "border-[var(--border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {isOver ? "Solte aqui" : "Nenhuma tarefa aqui."}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tarefaSelecionada && (
        <TarefaDrawer
          tarefa={tarefaSelecionada}
          aoFechar={() => setTarefaSelecionada(null)}
          aoAtualizarStatus={atualizarStatus}
        />
      )}

      <NovaTarefaModal
        aberto={modalAberto}
        clienteId=""
        nomeCliente=""
        aoFechar={() => setModalAberto(false)}
        aoSalvar={() => { setModalAberto(false); carregarTarefas(); }}
      />
    </div>
  );
}

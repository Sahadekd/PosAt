"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
} from "lucide-react";
import { TarefaItem } from "@/lib/segmentacao/tipos";
import { finalidadeConfig } from "./ClienteCard";
import NovaTarefaModal from "./NovaTarefaModal";
import { executeGraphQL, QUERIES, MUTATIONS } from "@/lib/graphql-client";

const PRIORIDADE_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Crítica", color: "#e05b3f" },
  2: { label: "Alta",    color: "#d97706" },
  3: { label: "Média",   color: "#6366f1" },
};

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
    accent: "#f59e0b",
    badge: "bg-amber-100 text-amber-800",
  },
  {
    id: "em_andamento",
    titulo: "Em Andamento",
    statusList: ["em_andamento", "reagendada"],
    accent: "#3b82f6",
    badge: "bg-blue-100 text-blue-800",
  },
  {
    id: "concluida",
    titulo: "Concluídas",
    statusList: ["concluida"],
    accent: "#10b981",
    badge: "bg-emerald-100 text-emerald-800",
  },
];

export default function PosAtendimentoBoard() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            Operacional
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Fila de Pós-Atendimento
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} no total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-transparent focus:ring-2 focus:ring-slate-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-100"
          >
            <option value="">Todas as prioridades</option>
            <option value="1">Crítica</option>
            <option value="2">Alta</option>
            <option value="3">Média</option>
          </select>
          <button
            onClick={carregarTarefas}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />
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
                className={`flex flex-col gap-3 rounded-2xl border p-3 transition-colors dark:border-zinc-700 ${
                  isOver
                    ? "border-slate-300 bg-slate-200/70 ring-2 ring-slate-400/60 dark:border-zinc-500 dark:bg-zinc-700/60 dark:ring-zinc-400"
                    : "border-slate-200 bg-slate-100/60 dark:bg-zinc-800/50"
                }`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-2 pb-2.5 pt-1 dark:border-zinc-700">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-100">
                    {col.titulo}
                  </h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.badge}`}>
                    {items.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="flex min-h-[60px] flex-col gap-3">
                  {items.map((tarefa) => {
                    const prio = PRIORIDADE_LABEL[tarefa.prioridade] ?? { label: `P${tarefa.prioridade}`, color: "var(--text-muted)" };
                    const finalidadeItem = tarefa.cliente?.finalidade_principal
                      ? finalidadeConfig[tarefa.cliente.finalidade_principal]
                      : null;
                    const isVencida = tarefa.prazo_em && new Date(tarefa.prazo_em) < new Date() && tarefa.status !== "concluida";
                    const estaArrastando = arrastandoId === tarefa.id;

                    return (
                      <div
                        key={tarefa.id}
                        draggable
                        onDragStart={() => handleDragStart(tarefa.id)}
                        onDragEnd={handleDragEnd}
                        className={`relative flex cursor-grab flex-col gap-3 overflow-hidden rounded-2xl border bg-white p-4 pl-5 shadow-sm transition active:cursor-grabbing dark:bg-zinc-800 ${
                          estaArrastando
                            ? "rotate-1 scale-[1.01] opacity-40 shadow-lg"
                            : "hover:shadow-md"
                        } ${isVencida ? "border-rose-300" : "border-slate-200 dark:border-zinc-600"}`}
                      >
                        {/* Status indicator stripe (column color) */}
                        <span
                          className="absolute bottom-0 left-0 top-0 w-1"
                          style={{ background: col.accent }}
                        />
                        {/* Priority dot + title */}
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: prio.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-zinc-100">
                              {tarefa.titulo}
                            </h3>
                            {tarefa.descricao && (
                              <p className="mt-1 text-xs line-clamp-2 text-slate-500 dark:text-zinc-400">
                                {tarefa.descricao}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                          <div className="flex items-center gap-3">
                            {tarefa.prazo_em && (
                              <span
                                className="flex items-center gap-1"
                                style={{ color: isVencida ? "#e05b3f" : "" }}
                              >
                                <Clock className="h-3 w-3" />
                                {new Date(tarefa.prazo_em).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                            {tarefa.cliente && (
                              <span className="max-w-[100px] truncate font-medium text-slate-700 dark:text-zinc-200">
                                {tarefa.cliente.pessoa?.nome || "Cliente"}
                              </span>
                            )}
                          </div>
                          {finalidadeItem && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${finalidadeItem.bg} ${finalidadeItem.text}`}>
                              {finalidadeItem.label}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-zinc-700">
                          {tarefa.cliente?.id ? (
                            <Link
                              href={`/clientes/${tarefa.cliente.id}`}
                              className="flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline dark:text-zinc-100"
                            >
                              Ver perfil <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : <span />}

                          <div className="flex items-center gap-1">
                            {tarefa.status !== "pendente" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "pendente")}
                                className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 transition hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
                              >
                                Fila
                              </button>
                            )}
                            {tarefa.status !== "em_andamento" && tarefa.status !== "concluida" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "em_andamento")}
                                className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25"
                              >
                                Iniciar
                              </button>
                            )}
                            {tarefa.status !== "concluida" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "concluida")}
                                className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                OK
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div
                      className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition-colors ${
                        isOver
                          ? "border-slate-400 bg-slate-200/50 text-slate-500 dark:border-zinc-400 dark:bg-zinc-700/50 dark:text-zinc-300"
                          : "border-slate-300 text-slate-400 dark:border-zinc-600 dark:text-zinc-500"
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  Plus,
  RefreshCw,
} from "lucide-react";
import { TarefaItem } from "@/lib/segmentacao/tipos";
import { finalidadeConfig } from "./ClienteCard";
import NovaTarefaModal from "./NovaTarefaModal";
import { executeGraphQL, QUERIES, MUTATIONS } from "@/lib/graphql-client";

export default function PosAtendimentoBoard() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");

  async function carregarTarefas() {
    setCarregando(true);
    try {
      try {
        const data = await executeGraphQL<{ tarefas: any[] }>(QUERIES.GET_TAREFAS);
        if (data?.tarefas) {
          // Normaliza campos para compatibilidade com o layout do board
          const normalizadas = data.tarefas.map((t) => ({
            ...t,
            cliente_id: t.clienteId || t.cliente_id,
            prazo_em: t.prazoEm || t.prazo_em,
            concluido_em: t.concluidoEm || t.concluido_em,
            criado_em: t.criadoEm || t.criado_em,
            cliente: t.cliente
              ? {
                  ...t.cliente,
                  finalidade_principal:
                    t.cliente.finalidadePrincipal || t.cliente.finalidade_principal,
                }
              : undefined,
          }));
          setTarefas(normalizadas as TarefaItem[]);
          return;
        }
      } catch {
        // Fallback REST
      }

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

  useEffect(() => {
    carregarTarefas();
  }, []);

  async function atualizarStatus(tarefaId: string, novoStatus: string) {
    try {
      try {
        await executeGraphQL(MUTATIONS.ATUALIZAR_TAREFA, {
          input: {
            id: tarefaId,
            status: novoStatus,
          },
        });
        carregarTarefas();
        return;
      } catch {
        // Fallback REST
      }

      const res = await fetch(`/api/tarefas/${tarefaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) {
        carregarTarefas();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const tarefasFiltradas = filtroPrioridade
    ? tarefas.filter((t) => t.prioridade === Number(filtroPrioridade))
    : tarefas;

  const colunas = [
    {
      id: "pendente",
      titulo: "Pendentes / Fila de Qualificação",
      statusList: ["pendente"],
      bgBadge: "bg-amber-100 text-amber-800",
      accent: "border-t-4 border-amber-500",
    },
    {
      id: "em_andamento",
      titulo: "Em Andamento / Em Contato",
      statusList: ["em_andamento", "reagendada"],
      bgBadge: "bg-blue-100 text-blue-800",
      accent: "border-t-4 border-blue-500",
    },
    {
      id: "concluida",
      titulo: "Concluídas Recentemente",
      statusList: ["concluida"],
      bgBadge: "bg-emerald-100 text-emerald-800",
      accent: "border-t-4 border-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e2722] text-white">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e2722]">Fila Operacional de Pós-Atendimento</h1>
            <p className="text-xs text-[#68706a]">
              Acompanhamento de tarefas, chamados e lacunas cadastrais geradas automaticamente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2 text-xs font-medium text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
          >
            <option value="">Todas as prioridades</option>
            <option value="1">Prioridade 1 (Crítica)</option>
            <option value="2">Prioridade 2 (Alta)</option>
            <option value="3">Prioridade 3 (Média)</option>
          </select>

          <button
            onClick={carregarTarefas}
            className="flex items-center gap-1 rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2 text-xs font-semibold text-[#1e2722] hover:bg-[#f5f1e9]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#b25c3f]" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="py-12 text-center text-xs text-[#68706a]">Carregando tarefas...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {colunas.map((col) => {
            const items = tarefasFiltradas.filter((t) => col.statusList.includes(t.status));

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-5 shadow-xs ${col.accent}`}
              >
                <div className="flex items-center justify-between border-b border-[#ede6d8] pb-3 mb-4">
                  <h2 className="text-sm font-bold text-[#1e2722]">{col.titulo}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.bgBadge}`}>
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {items.map((tarefa) => {
                    const finalidadeItem = tarefa.cliente?.finalidade_principal
                      ? finalidadeConfig[tarefa.cliente.finalidade_principal]
                      : null;

                    return (
                      <div
                        key={tarefa.id}
                        className="group flex flex-col justify-between rounded-2xl border border-[#d9d2c6] bg-[#faf8f2] p-4 text-xs transition hover:bg-white hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="rounded-md border border-[#ded6c7] bg-white px-2 py-0.5 text-[10px] font-bold text-[#1e2722]">
                              Prioridade {tarefa.prioridade}
                            </span>
                            {tarefa.prazo_em && (
                              <span className="flex items-center gap-1 text-[11px] text-[#8b918c]">
                                <Clock className="h-3 w-3" />
                                {new Date(tarefa.prazo_em).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-[#1e2722] leading-snug">{tarefa.titulo}</h3>

                          {tarefa.descricao && (
                            <p className="mt-1 text-[#5b625d] leading-relaxed line-clamp-3">
                              {tarefa.descricao}
                            </p>
                          )}

                          {tarefa.cliente && (
                            <div className="mt-3 flex items-center justify-between border-t border-[#ede6d8] pt-2.5 text-[11px]">
                              <span className="font-medium text-[#1e2722] truncate">
                                {tarefa.cliente.pessoa?.nome || "Cliente"}
                              </span>
                              {finalidadeItem && (
                                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${finalidadeItem.bg} ${finalidadeItem.text}`}>
                                  {finalidadeItem.label}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Status Change Buttons */}
                        <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-[#ede6d8]">
                          {tarefa.cliente?.id && (
                            <Link
                              href={`/clientes/${tarefa.cliente.id}`}
                              className="text-[11px] font-semibold text-[#b25c3f] hover:underline"
                            >
                              Ver Perfil &rarr;
                            </Link>
                          )}

                          <div className="flex items-center gap-1">
                            {tarefa.status !== "pendente" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "pendente")}
                                className="rounded px-2 py-1 text-[10px] font-medium text-stone-600 hover:bg-stone-200"
                              >
                                Mover P/ Fila
                              </button>
                            )}
                            {tarefa.status !== "em_andamento" && tarefa.status !== "concluida" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "em_andamento")}
                                className="rounded bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-blue-700"
                              >
                                Iniciar
                              </button>
                            )}
                            {tarefa.status !== "concluida" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "concluida")}
                                className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="py-8 text-center text-xs text-[#8b918c]">
                      Nenhuma tarefa nesta etapa.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

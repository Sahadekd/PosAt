"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RefreshCw, ArrowRight, AlertTriangle, GripVertical } from "lucide-react";

interface ClienteKanban {
  id: string;
  nome: string | null;
  status: string;
  finalidade_principal?: string;
  indice_completude?: number;
  ultima_interacao_em?: string | null;
  alerta_distrato_ativo?: boolean;
  termometro_cx?: string;
}

interface Coluna {
  id: string;
  titulo: string;
  statusList: string[];
  accent: string;
  badge: string;
}

const COLUNAS: Coluna[] = [
  { id: "novo_lead", titulo: "Novo Lead", statusList: ["novo_lead"], accent: "#64748b", badge: "bg-[var(--inset)] text-[var(--text-secondary)]" },
  { id: "qualificacao", titulo: "Qualificação", statusList: ["em_qualificacao"], accent: "#0284c7", badge: "bg-[var(--accent-light)] text-[var(--accent)]" },
  { id: "negociacao", titulo: "Negociação", statusList: ["em_negociacao"], accent: "#7c3aed", badge: "bg-purple-50 text-purple-700" },
  { id: "convertido", titulo: "Convertido", statusList: ["convertido"], accent: "#0891b2", badge: "bg-cyan-50 text-cyan-700" },
  { id: "handoff", titulo: "Handoff", statusList: ["handoff_pendente"], accent: "#d97706", badge: "bg-amber-50 text-amber-700" },
  { id: "onboarding", titulo: "Onboarding", statusList: ["onboarding"], accent: "#2563eb", badge: "bg-blue-50 text-blue-700" },
  { id: "pos_venda", titulo: "Pós-venda", statusList: ["pos_venda"], accent: "#059669", badge: "bg-emerald-50 text-emerald-700" },
  { id: "cliente_ativo", titulo: "Cliente Ativo", statusList: ["cliente_ativo"], accent: "#14b8a6", badge: "bg-teal-50 text-teal-700" },
  { id: "reativacao", titulo: "Reativação / Inativo", statusList: ["reativacao", "cliente_inativo", "sem_resposta"], accent: "#e11d48", badge: "bg-rose-50 text-rose-700" },
  { id: "encerrado", titulo: "Encerrado", statusList: ["encerrado"], accent: "#64748b", badge: "bg-[var(--inset)] text-[var(--text-secondary)]" },
];

export default function KanbanPosVenda() {
  const [clientes, setClientes] = useState<ClienteKanban[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [overColuna, setOverColuna] = useState<string | null>(null);
  const dragCounter = useRef<number>(0);

  useEffect(() => {
    let ativo = true;
    fetch("/api/clientes")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!ativo || !json) return;
        const lista = (json.clientes || []).map((c: Partial<ClienteKanban> & { pessoa?: { nome?: string | null } }) => ({
          id: String(c.id),
          nome: c.pessoa?.nome || null,
          status: c.status || "",
          finalidade_principal: c.finalidade_principal,
          indice_completude: c.indice_completude,
          ultima_interacao_em: c.ultima_interacao_em,
          alerta_distrato_ativo: c.alerta_distrato_ativo,
          termometro_cx: c.termometro_cx,
        }));
        setClientes(lista);
      })
      .catch(() => {})
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  async function refresh() {
    setCarregando(true);
    try {
      const res = await fetch("/api/clientes");
      if (res.ok) {
        const json = await res.json();
        const lista = (json.clientes || []).map((c: Partial<ClienteKanban> & { pessoa?: { nome?: string | null } }) => ({
          id: String(c.id),
          nome: c.pessoa?.nome || null,
          status: c.status || "",
          finalidade_principal: c.finalidade_principal,
          indice_completude: c.indice_completude,
          ultima_interacao_em: c.ultima_interacao_em,
          alerta_distrato_ativo: c.alerta_distrato_ativo,
          termometro_cx: c.termometro_cx,
        }));
        setClientes(lista);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }
    async function moverCliente(clienteId: string, novoStatus: string) {
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteId ? { ...c, status: novoStatus } : c))
    );
    try {
      await fetch(`/api/clientes/${clienteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  function handleDrop(coluna: Coluna, e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setOverColuna(null);
    if (!arrastandoId) return;
    const cliente = clientes.find((c) => c.id === arrastandoId);
    const alvo = coluna.statusList[0];
    if (cliente && cliente.status !== alvo) {
      moverCliente(cliente.id, alvo);
    }
    setArrastandoId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Kanban de Clientes
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {clientes.length} cliente(s) na operação · arraste para avançar na jornada
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {carregando ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)]">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
          Carregando clientes…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {COLUNAS.map((col) => {
            const items = clientes.filter((c) => col.statusList.includes(c.status));
            const isOver = overColuna === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setOverColuna(col.id);
                }}
                onDragLeave={() => {
                  dragCounter.current -= 1;
                  if (dragCounter.current <= 0) {
                    dragCounter.current = 0;
                    setOverColuna(null);
                  }
                }}
                onDrop={(e) => handleDrop(col, e)}
                className={`flex flex-col gap-3 rounded-xl border p-3 transition-colors ${
                  isOver
                    ? "border-[var(--accent)] bg-[var(--raised)] ring-2 ring-[var(--accent-light)]"
                    : "border-[var(--border)] bg-[var(--inset)]"
                }`}
              >
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

                <div className="flex min-h-[60px] flex-col gap-3">
                  {items.map((c) => {
                    const estaArrastando = arrastandoId === c.id;
                    const diasSemContato = c.ultima_interacao_em
                      ? Math.floor((Date.now() - new Date(c.ultima_interacao_em).getTime()) / 86400000)
                      : null;
                    const emRisco = c.alerta_distrato_ativo || c.termometro_cx === "insatisfeito_distrato";
                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={() => setArrastandoId(c.id)}
                        onDragEnd={() => { dragCounter.current = 0; setArrastandoId(null); setOverColuna(null); }}
                        className={`relative flex cursor-grab flex-col gap-2 overflow-hidden rounded-xl border bg-[var(--white)] p-3 pl-4 shadow-sm transition active:cursor-grabbing ${
                          estaArrastando
                            ? "scale-[1.01] opacity-40 shadow-lg"
                            : "hover:border-[var(--border-strong)] hover:shadow-md hover:shadow-black/10"
                        } ${emRisco ? "border-[var(--danger-border)] ring-1 ring-[var(--danger-border)]" : "border-[var(--border)]"}`}
                      >
                        <span className="absolute bottom-0 left-0 top-0 w-1" style={{ background: col.accent }} />
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black leading-snug tracking-wide text-[var(--text-primary)]">
                              {c.nome || "Sem nome"}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              {String(c.finalidade_principal || "").replace(/_/g, " ")} · {c.indice_completude ?? 0}% completo
                            </p>
                          </div>
                          {emRisco && <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--danger)]" />}
                        </div>
                        {diasSemContato !== null && (
                          <p className="text-[11px] text-[var(--text-secondary)]">
                            {diasSemContato === 0 ? "Contato hoje" : `${diasSemContato} dia(s) sem contato`}
                          </p>
                        )}
                        <Link
                          href={`/clientes/${c.id}`}
                          className="flex items-center gap-1 border-t border-[var(--border)] pt-2 text-[11px] font-bold text-[var(--accent)] hover:underline"
                        >
                          Ver perfil <ArrowRight className="h-3 w-3" />
                        </Link>
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
                      {isOver ? "Solte aqui" : "Vazio"}
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
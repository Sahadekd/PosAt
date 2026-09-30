"use client";

import { Search, RotateCcw, SlidersHorizontal, X, Grip, Filter } from "lucide-react";
import { useState } from "react";
import { finalidadeConfig, statusConfig } from "./ClienteCard";

interface ClienteFiltersProps {
  busca: string;
  setBusca: (val: string) => void;
  finalidade: string;
  setFinalidade: (val: string) => void;
  confianca: string;
  setConfianca: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  completudeMaxima: string;
  setCompletudeMaxima: (val: string) => void;
  origemFluxo?: string;
  setOrigemFluxo?: (val: string) => void;
  termometroCX?: string;
  setTermometroCX?: (val: string) => void;
  empreendimento?: string;
  setEmpreendimento?: (val: string) => void;
  corretor?: string;
  setCorretor?: (val: string) => void;
  analistaCS?: string;
  setAnalistaCS?: (val: string) => void;
  onFiltrar: () => void;
  onLimpar: () => void;
}

const NIVEL_CONFIANCA_OPCOES: { value: string; label: string }[] = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
  { value: "revisao_necessaria", label: "Revisão necessária" },
];

const COMPLETUDE_OPCOES: { value: string; label: string }[] = [
  { value: "30", label: "≤ 30% (crítico)" },
  { value: "50", label: "≤ 50% (incompleto)" },
  { value: "70", label: "≤ 70% (parcial)" },
  { value: "90", label: "≤ 90% (quase completo)" },
  { value: "100", label: "≥ 100% (completo)" },
];

const labelInput =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]";

export default function ClienteFilters({
  busca,
  setBusca,
  finalidade,
  setFinalidade,
  confianca,
  setConfianca,
  status,
  setStatus,
  completudeMaxima,
  setCompletudeMaxima,
  origemFluxo = "",
  setOrigemFluxo,
  termometroCX = "",
  setTermometroCX,
  empreendimento = "",
  setEmpreendimento,
  corretor = "",
  setCorretor,
  analistaCS = "",
  setAnalistaCS,
  onFiltrar,
  onLimpar,
}: ClienteFiltersProps) {
  const [drawerAberto, setDrawerAberto] = useState(false);

  const temFiltroAvancado = Boolean(
    finalidade || confianca || completudeMaxima || origemFluxo || empreendimento || analistaCS
  );

  const temFiltroAtivo = Boolean(busca || status || termometroCX || corretor || temFiltroAvancado);

  const cxChips: { value: string; label: string }[] = [
    { value: "insatisfeito_distrato", label: "🔴 Risco de Distrato" },
    { value: "neutro_nutricao", label: "🟡 Neutro" },
    { value: "promotor_mgm", label: "🟢 Promotor / MGM" },
  ];

  const origemChips: { value: string; label: string }[] = [
    { value: "", label: "Todos" },
    { value: "re_trabalho", label: "♻️ Re-trabalho" },
    { value: "tempo_real", label: "⚡ Tempo Real" },
  ];

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--white)", border: "1px solid var(--border)" }}
      >
        {/* Barra principal: busca + filtros de uso frequente */}
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Buscar por nome, empreendimento, bairro ou corretor…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl transition-all"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            {busca && (
              <button
                onClick={() => { setBusca(""); onFiltrar(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:items-center">
            {/* Status */}
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); }}
              onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
              className={labelInput}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: status ? "var(--text-primary)" : "var(--text-muted)",
              }}
              aria-label="Filtrar por status"
              title="Status"
            >
              <option value="">Status</option>
              {Object.entries(statusConfig).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>

            {/* Termômetro CX */}
            {setTermometroCX && (
              <select
                value={termometroCX}
                onChange={(e) => { setTermometroCX(e.target.value); }}
                onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
                className={labelInput}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: termometroCX ? "var(--text-primary)" : "var(--text-muted)",
                }}
                aria-label="Filtrar por termômetro"
                title="Termômetro"
              >
                <option value="">Termômetro</option>
                {cxChips.map((chip) => (
                  <option key={chip.value} value={chip.value}>{chip.label}</option>
                ))}
              </select>
            )}

            {/* Corretor */}
            <input
              type="text"
              placeholder="Corretor…"
              value={corretor}
              onChange={(e) => setCorretor?.(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
              className={labelInput}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                outline: "none",
              }}
              aria-label="Filtrar por corretor"
              title="Corretor"
            />

            {/* Mais filtros → drawer */}
            <button
              onClick={() => setDrawerAberto(true)}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition ${
                temFiltroAvancado
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{temFiltroAvancado ? "Filtros ativos" : "Mais filtros"}</span>
              {temFiltroAvancado && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-light)] text-[10px] font-bold text-[var(--accent)]">
                  {[finalidade, confianca, completudeMaxima, origemFluxo, empreendimento, analistaCS].filter(Boolean).length}
                </span>
              )}
            </button>

            {temFiltroAtivo && (
              <button
                onClick={onLimpar}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                title="Limpar todos os filtros"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Drawer: filtros avançados ── */}
      {drawerAberto && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerAberto(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--inset)] shadow-2xl">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]">
                  <Grip className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-black tracking-wide text-[var(--text-primary)]">Filtros avançados</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Refine a base por critérios complementares</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerAberto(false)}
                aria-label="Fechar filtros"
                className="rounded-xl border border-[var(--border)] bg-[var(--white)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corpo */}
            <div className="flex-1 min-h-0 space-y-5 overflow-y-auto px-5 py-5">
              {/* Finalidade */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Finalidade
                </label>
                <select
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value)}
                  className={labelInput}
                >
                  <option value="">Todas</option>
                  {Object.entries(finalidadeConfig).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* Confiança */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Confiança da classificação
                </label>
                <select
                  value={confianca}
                  onChange={(e) => setConfianca(e.target.value)}
                  className={labelInput}
                >
                  <option value="">Todas</option>
                  {NIVEL_CONFIANCA_OPCOES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Completude máxima */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Completude do cadastro
                </label>
                <select
                  value={completudeMaxima}
                  onChange={(e) => setCompletudeMaxima(e.target.value)}
                  className={labelInput}
                >
                  <option value="">Qualquer</option>
                  {COMPLETUDE_OPCOES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Origem */}
              {setOrigemFluxo && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Origem do fluxo
                  </label>
                  <div className="flex items-center gap-1.5">
                    {origemChips.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        onClick={() => setOrigemFluxo(chip.value)}
                        className="flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition"
                        style={{
                          background: origemFluxo === chip.value ? "var(--text-primary)" : "var(--surface)",
                          color: origemFluxo === chip.value ? "var(--text-primary)" : "var(--text-secondary)",
                          borderColor: origemFluxo === chip.value ? "var(--text-primary)" : "var(--border)",
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empreendimento */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Empreendimento
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Residencial Tereza Ayres…"
                  value={empreendimento}
                  onChange={(e) => setEmpreendimento?.(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
                  className={labelInput}
                />
              </div>

              {/* Analista CS */}
              {setAnalistaCS && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Analista CS
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do analista…"
                    value={analistaCS}
                    onChange={(e) => setAnalistaCS(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
                    className={labelInput}
                  />
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="flex items-center gap-2 border-t border-[var(--border)] px-5 py-4">
              <button
                onClick={onLimpar}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                <RotateCcw className="h-4 w-4" />
                Limpar
              </button>
              <button
                onClick={() => { setDrawerAberto(false); onFiltrar(); }}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
              >
                <Filter className="h-4 w-4" />
                Aplicar filtros
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
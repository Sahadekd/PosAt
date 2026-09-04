"use client";

import { Search, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { FinalidadeCliente, StatusRelacionamento } from "@/lib/segmentacao/tipos";
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

export default function ClienteFilters({
  busca,
  setBusca,
  finalidade,
  setFinalidade,
  status,
  setStatus,
  origemFluxo = "",
  setOrigemFluxo,
  termometroCX = "",
  setTermometroCX,
  empreendimento = "",
  setEmpreendimento,
  corretor = "",
  setCorretor,
  onFiltrar,
  onLimpar,
  // unused but kept for interface compat:
  confianca,
  setConfianca,
  completudeMaxima,
  setCompletudeMaxima,
}: ClienteFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const temFiltroAtivo = Boolean(
    busca || finalidade || status || origemFluxo || termometroCX || empreendimento || corretor
  );

  const cxChips = [
    { value: "insatisfeito_distrato", label: "🔴 Risco de Distrato" },
    { value: "neutro_nutricao", label: "🟡 Neutro" },
    { value: "promotor_mgm", label: "🟢 Promotor / MGM" },
  ];

  const origemChips = [
    { value: "", label: "Todos" },
    { value: "re_trabalho", label: "♻️ Re-trabalho" },
    { value: "tempo_real", label: "⚡ Tempo Real" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--white)", border: "1px solid var(--border)" }}
    >
      {/* ── Main search bar ── */}
      <div className="flex items-center gap-2 px-4 py-3">
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
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--text-primary)";
              e.currentTarget.style.background = "var(--white)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface)";
            }}
          />
          {busca && (
            <button
              onClick={() => { setBusca(""); onFiltrar(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0"
          style={{
            background: expanded || temFiltroAtivo ? "var(--text-primary)" : "var(--surface)",
            color: expanded || temFiltroAtivo ? "white" : "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {temFiltroAtivo && (
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
          )}
        </button>

        {temFiltroAtivo && (
          <button
            onClick={onLimpar}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors shrink-0"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-2 space-y-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Row 1: Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Finalidade */}
            <select
              value={finalidade}
              onChange={(e) => setFinalidade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all appearance-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                color: finalidade ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <option value="">Finalidade</option>
              {Object.entries(finalidadeConfig).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all appearance-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                color: status ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <option value="">Status</option>
              {Object.entries(statusConfig).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>

            {/* Empreendimento */}
            <input
              type="text"
              placeholder="Empreendimento…"
              value={empreendimento}
              onChange={(e) => setEmpreendimento?.(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>

          {/* Row 2: Corretor + Origem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Corretor ou Analista CS…"
              value={corretor}
              onChange={(e) => setCorretor?.(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />

            {/* Origem chips */}
            {setOrigemFluxo && (
              <div className="flex items-center gap-1.5">
                {origemChips.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => { setOrigemFluxo(chip.value); onFiltrar(); }}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                    style={{
                      background: origemFluxo === chip.value ? "var(--text-primary)" : "var(--surface)",
                      color: origemFluxo === chip.value ? "white" : "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Farol CX chips */}
          {setTermometroCX && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Farol CX:
              </span>
              {cxChips.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => {
                    setTermometroCX(termometroCX === chip.value ? "" : chip.value);
                    onFiltrar();
                  }}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: termometroCX === chip.value ? "var(--text-primary)" : "var(--surface)",
                    color: termometroCX === chip.value ? "white" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Apply button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { onFiltrar(); setExpanded(false); }}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  X,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { REGRA_LABEL, ORIGEM_LABEL } from "./oportunidade-ui";

export interface FiltrosOportunidade {
  busca: string;
  origem: string;
  regra: string;
  vendedor: string;
}

interface OportunidadeFiltersDrawerProps {
  aberto: boolean;
  aoFechar: () => void;
  filtros: FiltrosOportunidade;
  setFiltros: (f: FiltrosOportunidade) => void;
  vendedores: { id: string; nome: string }[];
  aoLimpar: () => void;
}

const ORIGENS = ["crm", "manual", "whatsapp", "formulario", "planilha"] as const;
const REGRAS = [
  "venda_recente",
  "locacao_recente",
  "base_retrabalho",
  "origem_manual",
] as const;

export default function OportunidadeFiltersDrawer({
  aberto,
  aoFechar,
  filtros,
  setFiltros,
  vendedores,
  aoLimpar,
}: OportunidadeFiltersDrawerProps) {
  if (!aberto) return null;

  const mudar = (campo: keyof FiltrosOportunidade, valor: string) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={aoFechar}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--white)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-base font-black tracking-wide text-[var(--text-primary)]">
              Filtros de oportunidades
            </h2>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar filtros"
            className="rounded-xl border border-[var(--border)] p-2 text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:bg-[var(--inset)]/60 hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Busca
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => mudar("busca", e.target.value)}
                placeholder="Cliente, imóvel, vendedor…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Origem do registro
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => mudar("origem", "")}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  filtros.origem === ""
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--inset)]"
                }`}
              >
                Todas
              </button>
              {ORIGENS.map((orig) => (
                <button
                  key={orig}
                  type="button"
                  onClick={() => mudar("origem", filtros.origem === orig ? "" : orig)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    filtros.origem === orig
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--inset)]"
                  }`}
                >
                  {ORIGEM_LABEL[orig]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Regra geradora
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => mudar("regra", "")}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  filtros.regra === ""
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--inset)]"
                }`}
              >
                Todas
              </button>
              {REGRAS.map((regra) => (
                <button
                  key={regra}
                  type="button"
                  onClick={() => mudar("regra", filtros.regra === regra ? "" : regra)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    filtros.regra === regra
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--inset)]"
                  }`}
                >
                  {REGRA_LABEL[regra]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Vendedor / responsável
            </label>
            <select
              value={filtros.vendedor}
              onChange={(e) => mudar("vendedor", e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={() => {
              aoLimpar();
              aoFechar();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--inset)]"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar
          </button>
          <button
            onClick={aoFechar}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Aplicar filtros
          </button>
        </div>
      </aside>
    </div>
  );
}
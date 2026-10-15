"use client";

import type { ColunaCliente } from "./etapasClientes";

export interface LeadTimeline {
  id: string;
  nome: string | null;
  status: string;
  finalidade_principal?: string | null;
  tipo_imovel?: string | null;
  indice_completude?: number | null;
  ultima_interacao_em?: string | null;
  alerta_distrato_ativo?: boolean;
  termometro_cx?: string | null;
  criado_em?: string | null;
  isDemo?: boolean;
}

interface TimelineNodeProps {
  etapa: ColunaCliente;
  quantidade: number;
  ultimoLead?: LeadTimeline;
  leadsDeDemonstracao: LeadTimeline[];
  nodeRef?: (node: HTMLButtonElement | null) => void;
  onSelecionar: () => void;
}

export default function TimelineNode({
  etapa,
  quantidade,
  ultimoLead,
  leadsDeDemonstracao,
  nodeRef,
  onSelecionar,
}: TimelineNodeProps) {
  const leadsDemoAdicionais = leadsDeDemonstracao.filter(
    (lead) => lead.id !== ultimoLead?.id
  );
  const leadsDemoVisiveis = leadsDemoAdicionais.slice(0, 2);
  const leadsDemoRestantes = leadsDemoAdicionais.length - leadsDemoVisiveis.length;

  return (
    <button
      ref={nodeRef}
      type="button"
      onClick={onSelecionar}
      aria-label={`${etapa.titulo}: ${quantidade} lead(s). Abrir lista.`}
      className="group/node relative flex min-h-[190px] w-full flex-col overflow-visible rounded-xl border border-[var(--border)] bg-[var(--white)] text-left shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:z-20 hover:scale-[1.035] hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-xl focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl"
        style={{ backgroundColor: etapa.accent }}
      />
      <span className="relative flex min-h-11 items-center justify-center border-b border-[var(--border)] px-8 text-center text-sm font-semibold text-[var(--text-primary)]">
        {etapa.titulo}
        <span
          className="absolute -right-2 -top-2 flex h-8 min-w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--white)] px-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-sm"
          aria-hidden="true"
        >
          {quantidade}
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-1.5 p-2.5">
        {ultimoLead && (
          <span
            className="block min-w-0 max-w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5"
            style={{ borderLeft: `4px solid ${etapa.accent}` }}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="block min-w-0 flex-1 truncate text-[11px] font-semibold text-[var(--text-primary)]">
                {ultimoLead.nome || "Sem nome"}
              </span>
              <span className="shrink-0 rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-muted)]">
                {ultimoLead.isDemo ? "Demo" : "Real"}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-[10px] capitalize text-[var(--text-secondary)]">
              {ultimoLead.tipo_imovel?.replace(/_/g, " ") ||
                ultimoLead.finalidade_principal?.replace(/_/g, " ") ||
                "Perfil do imóvel"}
            </span>
          </span>
        )}

        {leadsDemoVisiveis.map((lead, index) => (
          <span
            key={lead.id}
            className={`flex min-w-0 items-center gap-1.5 rounded-md border border-dashed border-[var(--border)]/80 bg-[var(--surface)]/75 px-2 py-1 transition-colors group-hover/node:bg-white ${
              index === 1 ? "hidden sm:flex" : "flex"
            }`}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: `${etapa.accent}99` }}
            />
            <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[var(--text-secondary)]">
              {lead.nome || "Sem nome"}
            </span>
            <span className="shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[8px] font-medium text-[var(--text-muted)]">
              Demo
            </span>
          </span>
        ))}
        {leadsDemoRestantes > 0 && (
          <span className="truncate px-1 text-[9px] font-medium text-[var(--text-muted)]">
            + {leadsDemoRestantes} leads Demo
          </span>
        )}
      </span>
    </button>
  );
}

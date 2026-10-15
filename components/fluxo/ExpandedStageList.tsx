"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Filter,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { ColunaCliente } from "./etapasClientes";
import type { LeadTimeline } from "./TimelineNode";

type FiltroLead = "todos" | "alertas" | "sem-alertas";

interface ExpandedStageListProps {
  etapa: ColunaCliente;
  leads: LeadTimeline[];
  onFechar: () => void;
}

function temAlerta(lead: LeadTimeline) {
  return Boolean(
    lead.alerta_distrato_ativo ||
      lead.termometro_cx === "insatisfeito_distrato"
  );
}

function finalidadeLabel(finalidade?: string | null) {
  return finalidade?.replace(/_/g, " ") || "Perfil do imóvel não informado";
}

export default function ExpandedStageList({
  etapa,
  leads,
  onFechar,
}: ExpandedStageListProps) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroLead>("todos");
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [leadDemoSelecionado, setLeadDemoSelecionado] =
    useState<LeadTimeline | null>(null);

  useEffect(() => {
    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onFechar();
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [onFechar]);

  const leadsFiltrados = leads.filter((lead) => {
    const nomeCorresponde = (lead.nome || "")
      .toLocaleLowerCase("pt-BR")
      .includes(busca.trim().toLocaleLowerCase("pt-BR"));
    const alertaCorresponde =
      filtro === "todos" ||
      (filtro === "alertas" && temAlerta(lead)) ||
      (filtro === "sem-alertas" && !temAlerta(lead));

    return nomeCorresponde && alertaCorresponde;
  });

  const filtroLabel =
    filtro === "alertas"
      ? "Com alerta"
      : filtro === "sem-alertas"
        ? "Sem alerta"
        : "Todos";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar lista da etapa"
        onClick={onFechar}
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="expanded-stage-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--white)] px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Etapa da jornada
            </p>
            <h2
              id="expanded-stage-title"
              className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]"
            >
              {etapa.titulo}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {leads.length} {leads.length === 1 ? "lead nesta etapa" : "leads nesta etapa"}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {!leadDemoSelecionado && (
          <div className="flex flex-wrap gap-3 border-b border-[var(--border)] bg-[var(--white)] px-5 py-4 sm:px-7">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome"
              aria-label="Buscar leads por nome"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--white)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)]"
            />
          </label>

          <div className="relative">
            <button
              type="button"
              aria-expanded={filtroAberto}
              onClick={() => setFiltroAberto((aberto) => !aberto)}
              className="flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--white)] px-3 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              <Filter className="h-4 w-4" />
              Filtro
              {filtro !== "todos" && (
                <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                  {filtroLabel}
                </span>
              )}
            </button>
            {filtroAberto && (
              <div className="absolute right-0 top-12 z-10 min-w-44 rounded-xl border border-[var(--border)] bg-[var(--white)] p-1.5 shadow-lg">
                {(
                  [
                    ["todos", "Todos os leads"],
                    ["alertas", "Com alerta"],
                    ["sem-alertas", "Sem alerta"],
                  ] as const
                ).map(([valor, rotulo]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => {
                      setFiltro(valor);
                      setFiltroAberto(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      filtro === valor
                        ? "bg-[var(--inset)] font-semibold text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--inset)]"
                    }`}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {leadDemoSelecionado ? (
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => setLeadDemoSelecionado(null)}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--white)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para {etapa.titulo}
              </button>

              <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-sm">
                <div
                  className="h-1.5"
                  style={{ backgroundColor: etapa.accent }}
                />
                <div className="p-5 sm:p-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Lead de demonstração · não salvo
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
                    {leadDemoSelecionado.nome || "Sem nome"}
                  </h3>
                  <p className="mt-1 text-sm capitalize text-[var(--text-secondary)]">
                    {finalidadeLabel(leadDemoSelecionado.finalidade_principal)}
                  </p>

                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                        <Building2 className="h-4 w-4" />
                        Interesse imobiliário
                      </dt>
                      <dd className="mt-2 text-sm font-semibold capitalize text-[var(--text-primary)]">
                        {leadDemoSelecionado.tipo_imovel || "Não informado"}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <dt className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                        <CalendarDays className="h-4 w-4" />
                        Entrada na etapa
                      </dt>
                      <dd className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                        {leadDemoSelecionado.criado_em
                          ? new Date(
                              leadDemoSelecionado.criado_em
                            ).toLocaleDateString("pt-BR")
                          : "Data demonstrativa"}
                      </dd>
                    </div>
                    {leadDemoSelecionado.indice_completude != null && (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <dt className="text-xs font-medium text-[var(--text-muted)]">
                          Cadastro preenchido
                        </dt>
                        <dd className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                          {leadDemoSelecionado.indice_completude}%
                        </dd>
                      </div>
                    )}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <dt className="text-xs font-medium text-[var(--text-muted)]">
                        Etapa atual
                      </dt>
                      <dd className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                        {etapa.titulo}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-5 rounded-lg bg-sky-50 px-3.5 py-3 text-xs leading-relaxed text-sky-800">
                    Este perfil serve para demonstrar a jornada completa. Ele
                    existe apenas nesta visualização e não corresponde a um
                    cadastro salvo no sistema.
                  </p>
                </div>
              </article>
            </section>
          ) : (
            <div className="space-y-3">
              {leadsFiltrados.map((lead) => {
                const conteudo = (
                  <span className="flex min-w-0 flex-1 items-center gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${etapa.accent}18`,
                        color: etapa.accent,
                      }}
                    >
                      <Users className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {lead.nome || "Sem nome"}
                        </span>
                        {lead.isDemo && (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                            Demo
                          </span>
                        )}
                        {temAlerta(lead) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                            <AlertTriangle className="h-3 w-3" />
                            Atenção
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block truncate text-xs capitalize text-[var(--text-secondary)]">
                        {lead.tipo_imovel || finalidadeLabel(lead.finalidade_principal)}
                        {lead.indice_completude != null &&
                          ` · ${lead.indice_completude}% completo`}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                  </span>
                );

                const className =
                  "group flex w-full items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--white)] p-4 text-left shadow-sm transition hover:border-[var(--border-strong)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

                return lead.isDemo ? (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setLeadDemoSelecionado(lead)}
                    className={className}
                  >
                    {conteudo}
                  </button>
                ) : (
                  <Link
                    key={lead.id}
                    href={`/clientes/${lead.id}`}
                    onClick={onFechar}
                    className={className}
                  >
                    {conteudo}
                  </Link>
                );
              })}

            {leadsFiltrados.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--white)] px-5 py-12 text-center">
                <Users className="mx-auto h-7 w-7 text-[var(--text-muted)]" />
                <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
                  {leads.length === 0
                    ? "Nenhum lead nesta etapa"
                    : "Nenhum lead encontrado"}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {leads.length === 0
                    ? "Quando houver leads nesta etapa, eles aparecerão aqui."
                    : "Ajuste a busca ou o filtro para ver outros leads."}
                </p>
              </div>
            )}
          </div>
          )}
        </div>
      </aside>
    </div>
  );
}

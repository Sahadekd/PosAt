"use client";

import { PhoneCall, Mail, Building2, Target, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { VendedorItem, ImovelItem, OportunidadeItem } from "@/lib/segmentacao/tipos";
import { STATUS_LABEL, STAGE, formataMoeda } from "@/components/oportunidade/oportunidade-ui";

const IMOVEL_STATUS: Record<string, { label: string; text: string; bg: string }> = {
  disponivel: { label: "Disponível", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  reservado: { label: "Reservado", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40" },
  vendido: { label: "Vendido", text: "text-[var(--text-secondary)]", bg: "bg-[var(--inset)]" },
  locado: { label: "Locado", text: "text-[var(--accent)]", bg: "bg-[var(--accent-light)]" },
};

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

interface VendedorDetailPanelProps {
  vendedor: VendedorItem;
  imoveis: ImovelItem[];
  oportunidades: OportunidadeItem[];
  aoFechar: () => void;
}

export function VendedorDetailPanel({
  vendedor: v,
  imoveis,
  oportunidades,
  aoFechar,
}: VendedorDetailPanelProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={aoFechar} />
      <aside className="absolute right-0 top-0 flex h-screen w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--white)] shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--border)] px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-sky-400 text-base font-bold text-white">
                {iniciais(v.nome)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black tracking-wide text-[var(--text-primary)]">{v.nome}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      v.status === "ativo"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-[var(--inset)] text-[var(--text-muted)]"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${v.status === "ativo" ? "bg-emerald-500 dark:bg-emerald-300" : "bg-slate-500"}`} />
                    {v.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                  {v.creci && <span>CRECI {v.creci.replace(/^CRECI\s+/i, "")}</span>}
                </div>
              </div>
            </div>
            <button onClick={aoFechar} aria-label="Fechar" className="shrink-0 rounded-xl border border-[var(--border)] p-2 text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:bg-[var(--inset)] hover:text-[var(--text-primary)]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Contato */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              <PhoneCall className="h-4 w-4 text-[var(--accent)]" />
              Contato
            </h3>
            <dl className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              {v.telefone && (
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  {v.telefone}
                </div>
              )}
              {v.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  <span className="truncate">{v.email}</span>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Contato não informado.</p>
              )}
            </dl>
          </section>

          <div className="border-t border-[var(--border)]" />

          {/* Imóveis */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />
              Imóveis anunciados ({imoveis.length})
            </h3>
            {imoveis.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">Nenhum imóvel vinculado.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {imoveis.map((i) => {
                  const statusImovel = IMOVEL_STATUS[i.status] || { label: i.status, text: "text-[var(--text-secondary)]", bg: "bg-[var(--inset)]" };
                  const valor =
                    i.tipo_negocio === "venda" && i.valor_venda
                      ? formataMoeda(i.valor_venda)
                      : i.tipo_negocio === "locacao" && i.valor_locacao
                        ? `${formataMoeda(i.valor_locacao)}/mês`
                        : null;
                  return (
                    <li key={i.id} className="rounded-xl border border-[var(--border)] bg-[var(--white)] p-3 dark:bg-gray-800">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-black tracking-wide text-[var(--text-primary)]">
                          {i.codigo_imovel}
                          <span className="ml-2 font-normal text-[var(--text-muted)]">{i.empreendimento}</span>
                        </p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusImovel.bg} ${statusImovel.text}`}>
                          {statusImovel.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {[i.tipologia, [i.bairro, i.cidade].filter(Boolean).join(", "), i.regiao].filter(Boolean).join(" · ")}
                      </p>
                      {valor && (
                        <p className="mt-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-300">{valor}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="border-t border-[var(--border)]" />

          {/* Oportunidades */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              <Target className="h-4 w-4 text-[var(--accent)]" />
              Oportunidades ({oportunidades.length})
            </h3>
            {oportunidades.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">Nenhuma oportunidade vinculada.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {oportunidades.slice(0, 8).map((o) => {
                  const stage = STAGE[o.status] || STAGE.encerrada;
                  return (
                    <li key={o.id}>
                      <button
                        onClick={() => {
                          aoFechar();
                          router.push(`/oportunidades?oportunidade=${o.id}`);
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--white)] p-3 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--surface)] dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stage.dot}`} />
                          <span className="min-w-0 truncate text-sm font-semibold text-[var(--text-primary)]">
                            {o.descricao}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        </span>
                      </button>
                    </li>
                  );
                })}
                {oportunidades.length > 8 && (
                  <li className="text-xs text-[var(--text-muted)]">
                    +{oportunidades.length - 8} outra(s)…
                  </li>
                )}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
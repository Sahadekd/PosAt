"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  GitBranch,
  Play,
  Pause,
  CheckCircle2,
  FileText,
  Copy,
  Users,
  AlertTriangle,
  Inbox,
  Sparkles,
  Filter,
} from "lucide-react";
import type { Fluxo, StatusFluxo } from "@/core/domain/entities/fluxo";

const STATUS_META: Record<
  StatusFluxo,
  { label: string; cor: string; corLight: string; icon: typeof Play }
> = {
  rascunho: { label: "Rascunho", cor: "#94A3B8", corLight: "rgba(148,163,184,.16)", icon: FileText },
  ativo: { label: "Ativo", cor: "#34D399", corLight: "rgba(52,211,153,.16)", icon: Play },
  pausado: { label: "Pausado", cor: "#FBBF24", corLight: "rgba(251,191,36,.16)", icon: Pause },
  concluido: { label: "Concluído", cor: "#38BDF8", corLight: "rgba(56,189,248,.16)", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", cor: "#F87171", corLight: "rgba(248,113,113,.16)", icon: AlertTriangle },
};

const CATEGORIAS: Record<string, string> = {
  pos_visita: "Pós-visita",
  reativacao: "Reativação",
  pos_proposta: "Pós-proposta",
  pos_venda: "Pós-venda",
};

export default function FluxosLista() {
  const [fluxos, setFluxos] = useState<Fluxo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [somenteTemplates, setSomenteTemplates] = useState(false);
  const [criando, setCriando] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [semeando, setSemeando] = useState(false);
  const router = useRouter();

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (filtroStatus) params.set("status", filtroStatus);
      if (somenteTemplates) params.set("e_template", "true");

      const r = await fetch(`/api/fluxos?${params.toString()}`);
      if (r.ok) {
        const data = await r.json();
        setFluxos(data.fluxos ?? []);
      }
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }, [busca, filtroStatus, somenteTemplates]);

  useEffect(() => {
    const t = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(t);
  }, [carregar, busca]);

  // Garante pelo menos 1 template pronto no primeiro acesso (time-to-value)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/fluxos?e_template=true");
        if (!r.ok) return;
        const data = await r.json();
        if (!data.fluxos?.length) {
          await fetch("/api/fluxos/templates/seed", { method: "POST" });
          await carregar();
        }
      } catch {
        // silencioso
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function semearTemplates() {
    setSemeando(true);
    try {
      await fetch("/api/fluxos/templates/seed", { method: "POST" });
      await carregar();
    } finally {
      setSemeando(false);
    }
  }

  async function criarFluxo() {
    if (!nomeNovo.trim()) return;
    setErro(null);
    try {
      const r = await fetch("/api/fluxos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeNovo.trim() }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErro(data.erro ?? "Erro ao criar fluxo.");
        return;
      }
      router.push(`/fluxos/${data.fluxo.id}`);
    } catch {
      setErro("Erro de conexão.");
    }
  }

  async function duplicar(id: string) {
    const r = await fetch(`/api/fluxos/${id}/duplicar`, { method: "POST" });
    if (r.ok) carregar();
  }

  const contadores = {
    ativos: fluxos.filter((f) => f.status === "ativo").length,
    pausados: fluxos.filter((f) => f.status === "pausado").length,
    concluidos: fluxos.filter((f) => f.status === "concluido").length,
    templates: fluxos.filter((f) => f.e_template).length,
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Fluxo de Leads
          </h2>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Follow-ups, disparos automáticos e acompanhamento de relacionamento.
          </p>
        </div>
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-900/30 hover:bg-[var(--accent-hover)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo fluxo
        </button>
      </div>

      {/* Contadores */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Ativos", valor: contadores.ativos, cor: "var(--success)", icon: Play },
          { label: "Pausados", valor: contadores.pausados, cor: "var(--warning)", icon: Pause },
          { label: "Concluídos", valor: contadores.concluidos, cor: "var(--sky)", icon: CheckCircle2 },
          { label: "Templates", valor: contadores.templates, cor: "var(--accent)", icon: Copy },
        ].map((k) => (
          <div key={k.label} className="card flex items-center gap-3 p-4">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: "var(--inset)", color: k.cor }}
            >
              <k.icon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <span className="block text-2xl font-bold leading-tight text-[var(--text-primary)]">
                {k.valor}
              </span>
              <span className="block text-xs text-[var(--text-secondary)]">{k.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fluxo por nome..."
            aria-label="Buscar fluxo"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--inset)] py-2 pl-9 pr-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-2.5 py-1.5">
          <Filter className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            aria-label="Filtrar por status"
            className="bg-transparent text-[13px] text-[var(--text-primary)] focus:outline-none"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="pausado">Pausado</option>
            <option value="rascunho">Rascunho</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-[13px] text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={somenteTemplates}
            onChange={(e) => setSomenteTemplates(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-[var(--accent)]"
          />
          Só templates
        </label>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : fluxos.length === 0 ? (
        <EstadoVazio
          temBusca={Boolean(busca || filtroStatus || somenteTemplates)}
          onLimpar={() => {
            setBusca("");
            setFiltroStatus("");
            setSomenteTemplates(false);
          }}
          onCriar={semearTemplates}
          carregando={semeando}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          {fluxos.map((fluxo, i) => {
            const meta = STATUS_META[fluxo.status];
            const StatusIcon = meta.icon;
            return (
              <div
                key={fluxo.id}
                className={`group flex items-center gap-4 bg-[var(--white)] px-4 py-3 transition-colors hover:bg-[var(--raised)] ${
                  i > 0 ? "border-t border-[var(--border)]" : ""
                }`}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: meta.corLight, color: meta.cor }}
                >
                  <GitBranch className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/fluxos/${fluxo.id}`}
                      className="truncate text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                    >
                      {fluxo.nome}
                    </Link>
                    {fluxo.e_template && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">
                        <Sparkles className="h-3 w-3" />
                        Template
                        {fluxo.template_categoria && (
                          <> · {CATEGORIAS[fluxo.template_categoria] ?? fluxo.template_categoria}</>
                        )}
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{ background: meta.corLight, color: meta.cor }}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </div>
                  {fluxo.descricao && (
                    <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                      {fluxo.descricao}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
                    <span>{fluxo.grafo?.nodes?.length ?? 0} nós</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {fluxo.execucoes_ativas ?? 0} execuções ativas
                    </span>
                    {(fluxo.execucoes_com_falha ?? 0) > 0 && (
                      <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--danger)" }}>
                        <AlertTriangle className="h-3 w-3" />
                        {fluxo.execucoes_com_falha} com falha
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    onClick={() => duplicar(fluxo.id)}
                    data-tooltip="Duplicar"
                    aria-label={`Duplicar ${fluxo.nome}`}
                    className="rounded-lg border border-[var(--border)] bg-[var(--inset)] p-2 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    href={`/fluxos/${fluxo.id}`}
                    className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
                  >
                    Abrir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar */}
      {criando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCriando(false)} />
          <div className="relative w-full max-w-md animate-fade-up rounded-xl border border-[var(--border)] bg-[var(--raised)] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Novo fluxo</h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Comece do zero ou use um template pronto na biblioteca.
            </p>
            <input
              autoFocus
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && criarFluxo()}
              placeholder="Ex.: Follow-up pós-visita"
              className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            {erro && (
              <p className="mt-2 text-xs font-semibold text-[var(--danger)]">{erro}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCriando(false)}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancelar
              </button>
              <button
                onClick={criarFluxo}
                disabled={!nomeNovo.trim()}
                className="rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50 hover:bg-[var(--accent-hover)]"
              >
                Criar e abrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EstadoVazio({
  temBusca,
  onLimpar,
  onCriar,
  carregando,
}: {
  temBusca: boolean;
  onLimpar: () => void;
  onCriar: () => void;
  carregando?: boolean;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--accent)]">
        {temBusca ? <Inbox className="h-7 w-7" /> : <GitBranch className="h-7 w-7" />}
      </span>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {temBusca ? "Nenhum fluxo encontrado" : "Nenhum fluxo ainda"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-secondary)]">
          {temBusca
            ? "Ajuste a busca ou os filtros para encontrar o que procura."
            : "Crie seu primeiro fluxo de follow-up ou comece por um template pronto: pós-visita, reativação ou pós-proposta."}
        </p>
      </div>
      {temBusca ? (
        <button
          onClick={onLimpar}
          className="rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]"
        >
          Limpar filtros
        </button>
      ) : (
        <button
          onClick={onCriar}
          disabled={carregando}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {carregando ? "Criando templates..." : "Criar a partir de um template"}
        </button>
      )}
    </div>
  );
}

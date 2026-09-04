"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Flag,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { OportunidadeItem, TipoOportunidade } from "@/lib/segmentacao/tipos";
import { executeGraphQL, QUERIES, MUTATIONS } from "@/lib/graphql-client";
import NovaOportunidadeModal from "@/components/NovaOportunidadeModal";

const TIPO_LABEL: Record<TipoOportunidade, { label: string; badge: string }> = {
  recompra: { label: "Recompra", badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300" },
  upgrade: { label: "Upgrade", badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300" },
  investimento_novo: { label: "Investimento", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  indicacao: { label: "Indicação", badge: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300" },
  servicos: { label: "Serviços", badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  outro: { label: "Outro", badge: "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200" },
};

const STATUS_ORDEM = [
  "identificada",
  "em_avaliacao",
  "proposta_enviada",
  "negociacao",
  "ganha",
] as const;

const STATUS_RESOLVIDO = ["ganha", "perdida", "arquivada"] as const;

const STATUS_LABEL: Record<string, string> = {
  identificada: "Identificada",
  em_avaliacao: "Em avaliação",
  proposta_enviada: "Proposta enviada",
  negociacao: "Negociação",
  ganha: "Ganha",
  perdida: "Perdida",
  arquivada: "Arquivada",
};

const formataMoeda = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export default function OportunidadesPage() {
  const [oportunidades, setOportunidades] = useState<OportunidadeItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  async function carregar(resetLoading: boolean = true) {
    if (resetLoading) setCarregando(true);
    try {
      try {
        const data = await executeGraphQL<{ oportunidades: OportunidadeItem[] }>(QUERIES.GET_OPORTUNIDADES);
        if (data?.oportunidades) {
          setOportunidades(data.oportunidades);
          return;
        }
      } catch { /* fallback */ }
      const res = await fetch("/api/oportunidades");
      if (res.ok) {
        const json = await res.json();
        setOportunidades(json.oportunidades || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(false); }, []);

  async function atualizarStatus(id: string, status: string) {
    setOportunidades((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: status as OportunidadeItem["status"] } : o))
    );
    try {
      try {
        await executeGraphQL(MUTATIONS.ATUALIZAR_OPORTUNIDADE, { input: { id, status } });
        return;
      } catch { /* fallback */ }
      await fetch(`/api/oportunidades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  const ativas = oportunidades.filter((o) => !STATUS_RESOLVIDO.includes(o.status as any));
  const resolvidas = oportunidades.filter((o) => STATUS_RESOLVIDO.includes(o.status as any));
  const totalValor = ativas.reduce((s, o) => s + (o.valor_estimado || 0), 0);
  const vencidas = ativas.filter((o) => o.prazo_em && new Date(o.prazo_em) < new Date());

  const Cards = ({ list, avancavel }: { list: OportunidadeItem[]; avancavel: boolean }) =>
    list.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-zinc-600 dark:text-zinc-500">
        Nenhuma oportunidade aqui.
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((o) => {
          const tipo = TIPO_LABEL[o.tipo] || TIPO_LABEL.outro;
          const idx = STATUS_ORDEM.indexOf(o.status as (typeof STATUS_ORDEM)[number]);
          const proximo = idx >= 0 ? STATUS_ORDEM[idx + 1] : null;
          const estaVencida = avancavel && o.prazo_em && new Date(o.prazo_em) < new Date();
          return (
            <div
              key={o.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tipo.badge}`}>
                    {tipo.label}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-zinc-100">
                    {o.descricao}
                  </h3>
                </div>
                {o.valor_estimado ? (
                  <span className="shrink-0 whitespace-nowrap text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {formataMoeda(o.valor_estimado)}
                  </span>
                ) : null}
              </div>

              {o.cliente?.id && (
                <Link
                  href={`/clientes/${o.cliente.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:underline dark:text-zinc-200"
                >
                  <Target className="h-3 w-3" />
                  {o.cliente.nome || "Cliente"}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}

              {o.evidencia && (
                <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                  {o.evidencia}
                </p>
              )}

              {o.proximo_passo && (
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-zinc-700/50 dark:text-zinc-300">
                  <span className="font-semibold">Próximo passo: </span>
                  {o.proximo_passo}
                </div>
              )}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  {STATUS_LABEL[o.status] || o.status}
                </span>
                {o.prazo_em && (
                  <span
                    className={`flex items-center gap-1 ${estaVencida ? "font-semibold text-rose-600 dark:text-rose-400" : ""}`}
                  >
                    <Calendar className="h-3 w-3" />
                    {new Date(o.prazo_em).toLocaleDateString("pt-BR")}
                    {estaVencida ? " (vencida)" : ""}
                  </span>
                )}
              </div>

              {avancavel && proximo && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => atualizarStatus(o.id, proximo)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Avançar para {STATUS_LABEL[proximo]}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => atualizarStatus(o.id, "perdida")}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
                  >
                    Perder
                  </button>
                </div>
              )}

              {!avancavel && (
                <button
                  onClick={() => atualizarStatus(o.id, "identificada")}
                  className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reabrir
                </button>
              )}
            </div>
          );
        })}
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            Crescimento
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Oportunidades
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {ativas.length} em andamento · {formataMoeda(totalValor)} em jogo
            {vencidas.length > 0 && ` · ${vencidas.length} vencida(s)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => carregar()}
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
            Nova Oportunidade
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />
          Carregando oportunidades…
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-zinc-100">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Pipeline ativo
            </h2>
            <Cards list={ativas} avancavel />
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-zinc-100">
              <RotateCcw className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
              Resolvidas / Arquivadas
            </h2>
            <Cards list={resolvidas} avancavel={false} />
          </section>
        </>
      )}

      <NovaOportunidadeModal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={() => { setModalAberto(false); carregar(); }}
      />
    </div>
  );
}
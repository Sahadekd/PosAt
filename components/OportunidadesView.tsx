"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { RefreshCw, Plus, SlidersHorizontal, X, Store, Target } from "lucide-react";
import { executeGraphQL, QUERIES } from "@/lib/graphql-client";
import { OportunidadeItem } from "@/lib/segmentacao/tipos";
import { usePermissions } from "@/hooks/usePermissions";
import NovaOportunidadeModal from "@/components/NovaOportunidadeModal";
import OportunidadeCard from "@/components/oportunidade/OportunidadeCard";
import OportunidadeFiltersDrawer, {
  FiltrosOportunidade,
} from "@/components/oportunidade/OportunidadeFiltersDrawer";
import { DadosConversaoLead } from "@/components/oportunidade/OportunidadeConverterModal";
import {
  GRUPO,
  GrupoOportunidade,
  STATUS_LABEL,
  grupoDeOportunidade,
  formataMoeda,
} from "@/components/oportunidade/oportunidade-ui";

const FILTROS_VAZIOS: FiltrosOportunidade = { busca: "", origem: "", regra: "", vendedor: "" };

export interface CallbacksOportunidade {
  aoAvancar?: () => void;
  aoConverter?: () => void;
  aoRemover?: () => void;
  aoReabrir?: () => void;
}

interface OportunidadesViewProps {
  onNavigateToVendedores: () => void;
  onOpenDetail: (oportunidade: OportunidadeItem, callbacks: CallbacksOportunidade) => void;
  onCloseDetail: () => void;
  onOpenRemoverModal: (oportunidade: OportunidadeItem) => void;
  onOpenConverterModal: (oportunidade: OportunidadeItem) => void;
  onRemoverConfirm: (oportunidade: OportunidadeItem, motivo: string) => void;
  onConverterConfirm: (oportunidade: OportunidadeItem, dados: DadosConversaoLead) => void;
}

export function OportunidadesView({ onNavigateToVendedores, onOpenDetail, onCloseDetail, onOpenRemoverModal, onOpenConverterModal, onRemoverConfirm, onConverterConfirm }: OportunidadesViewProps) {
  const searchParams = useSearchParams();
  const perms = usePermissions();
  const podeCriar = perms.pode("oportunidades", "criar");
  const podeOperar = perms.pode("oportunidades", "editar");
  const opIdInicial = useRef(searchParams.get("oportunidade"));
  const [oportunidades, setOportunidades] = useState<OportunidadeItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNova, setModalNova] = useState(false);
  const [grupo, setGrupo] = useState<GrupoOportunidade>("ativas");
  const [filtrosAberto, setFiltrosAberto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosOportunidade>(FILTROS_VAZIOS);
  const [aviso, setAviso] = useState<{ texto: string; ok: boolean } | null>(null);
  const [vendedores, setVendedores] = useState<{ id: string; nome: string }[]>([]);

  function mostrarAviso(texto: string, ok = true) {
    setAviso({ texto, ok });
    setTimeout(() => setAviso(null), 4500);
  }

  function obterDados() {
    return (async () => {
      try {
        let lista: OportunidadeItem[] | null = null;
        try {
          const data = await executeGraphQL<{ oportunidades: OportunidadeItem[] }>(QUERIES.GET_OPORTUNIDADES);
          if (data?.oportunidades) lista = data.oportunidades;
        } catch { /* fallback REST */ }

        if (!lista) {
          const res = await fetch("/api/oportunidades");
          if (res.ok) {
            const json = await res.json();
            lista = json.oportunidades || [];
          }
        }

        const resV = await fetch("/api/vendedores");
        const jsonV = resV.ok ? await resV.json() : { vendedores: [] };

        return { oportunidades: lista || [], vendedores: jsonV.vendedores || [] };
      } catch (e) {
        console.error(e);
        return { oportunidades: [], vendedores: [] };
      }
    })();
  }

  function carregar() {
    setCarregando(true);
    obterDados()
      .then((dados) => {
        setOportunidades(dados.oportunidades);
        setVendedores(dados.vendedores);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    let ativo = true;
    obterDados().then((dados) => {
      if (ativo) {
        setOportunidades(dados.oportunidades);
        setVendedores(dados.vendedores);
        setCarregando(false);
        const opId = opIdInicial.current;
        if (opId) {
          const alvo = dados.oportunidades.find((o) => o.id === opId);
          if (alvo) {
            setGrupo(grupoDeOportunidade(alvo.status));
            const callbacks: CallbacksOportunidade = {
              aoAvancar: podeOperar ? () => { avancarStatus(alvo); onCloseDetail?.(); } : undefined,
              aoConverter: podeOperar ? () => { onOpenConverterModal(alvo); onCloseDetail?.(); } : undefined,
              aoRemover: podeOperar ? () => { onOpenRemoverModal(alvo); onCloseDetail?.(); } : undefined,
              aoReabrir: podeOperar ? () => { reabrir(alvo); onCloseDetail?.(); } : undefined,
            };
            onOpenDetail(alvo, callbacks);
          }
        }
      }
    });
    return () => { ativo = false; };
  }, [onOpenDetail, onCloseDetail, onOpenConverterModal, onOpenRemoverModal]);

  function recarregar() { carregar(); }

  /* ---------- Mutations ---------- */

  async function avancarStatus(op: OportunidadeItem) {
    const proximo = ((): string | null => {
      if (op.status === "identificada") return "em_andamento";
      if (op.status === "em_andamento") return "aguardando_decisao";
      if (op.status === "em_avaliacao") return "proposta_enviada";
      if (op.status === "proposta_enviada") return "negociacao";
      return null;
    })();
    if (!proximo) return;
    setOportunidades((prev) => prev.map((o) => (o.id === op.id ? { ...o, status: proximo as OportunidadeItem["status"] } : o)));
    try {
      await fetch(`/api/oportunidades/${op.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: proximo }),
      });
      mostrarAviso(`Status alterado para ${STATUS_LABEL[proximo]}`);
    } catch { mostrarAviso("Falha ao atualizar status", false); }
  }

  async function reabrir(op: OportunidadeItem) {
    setOportunidades((prev) => prev.map((o) => (o.id === op.id ? { ...o, status: "identificada" as OportunidadeItem["status"] } : o)));
    try {
      await fetch(`/api/oportunidades/${op.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "identificada" }),
      });
      mostrarAviso("Oportunidade reaberta");
    } catch { mostrarAviso("Falha ao reabrir", false); }
  }

  async function removerOp(op: OportunidadeItem, motivo: string) {
    setOportunidades((prev) => prev.map((o) => (o.id === op.id ? { ...o, status: "removida" as OportunidadeItem["status"], removida_motivo: motivo, removida_em: new Date().toISOString(), tags: [...(o.tags || []), "Removido"] } : o)));
    try {
      await fetch(`/api/oportunidades/${op.id}/remover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      mostrarAviso("Oportunidade removida (perdeu interesse)");
      onRemoverConfirm?.(op, motivo);
    } catch { mostrarAviso("Falha ao remover", false); }
  }

  async function converterOp(op: OportunidadeItem, dados: DadosConversaoLead) {
    try {
      const res = await fetch(`/api/oportunidades/${op.id}/converter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.erro || "Falha ao converter");
      }
      const json = await res.json();
      const leadId = json.lead?.id || null;
      setOportunidades((prev) => prev.map((o) => (o.id === op.id ? {
        ...o,
        status: "convertida" as OportunidadeItem["status"],
        convertida_em: new Date().toISOString(),
        lead_criado_id: json.duplicado ? null : leadId,
        lead_duplicado_id: json.duplicado ? leadId : null,
        tarefa_primeiro_contato_id: json.tarefa?.id || null,
        tags: [...(o.tags || []), "Convertido"],
      } : o)));
      mostrarAviso(
        json.duplicado
          ? "Cadastro deduplicado — tarefa de primeiro contato criada"
          : "Lead criado com tarefa de primeiro contato"
      );
      onConverterConfirm?.(op, dados);
    } catch (e: unknown) {
      mostrarAviso(e instanceof Error ? e.message : "Falha ao converter", false);
    }
  }

  /* ---------- Filtering ---------- */

  function correspondeFiltros(o: OportunidadeItem) {
    const busca = filtros.busca.toLowerCase();
    if (busca) {
      const alvo = `${o.descricao} ${o.cliente?.nome || ""} ${o.vendedor?.nome || ""} ${o.imovel?.codigo_imovel || ""} ${o.imovel?.empreendimento || ""}`.toLowerCase();
      if (!alvo.includes(busca)) return false;
    }
    if (filtros.origem && o.origem !== filtros.origem) return false;
    if (filtros.regra && o.regra_geradora !== filtros.regra) return false;
    if (filtros.vendedor && o.vendedor_id !== filtros.vendedor) return false;
    return true;
  }

  const filtradas = oportunidades.filter((o) => grupoDeOportunidade(o.status) === grupo && correspondeFiltros(o));
  const contagem = Object.fromEntries(GRUPO.map((g) => [g.id, oportunidades.filter((o) => grupoDeOportunidade(o.status) === g.id).length])) as Record<GrupoOportunidade, number>;
  const totalValorAtivas = oportunidades.filter((o) => grupoDeOportunidade(o.status) === "ativas").reduce((s, o) => s + (o.valor_estimado || 0), 0);

  const filtresAtivos = filtros.busca || filtros.origem || filtros.regra || filtros.vendedor;

  return (
    <div className="space-y-6 h-full">
      {aviso && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-sm font-medium shadow-lg shadow-black/10 transition"
          style={{
            color: aviso.ok ? "var(--text-primary)" : "var(--text-primary)",
            borderColor: aviso.ok ? "rgba(59,130,246,0.6)" : "rgba(248,113,113,0.6)",
          }}
        >
          <span>{aviso.texto}</span>
          <button onClick={() => setAviso(null)} className="ml-1 rounded p-1 text-[var(--text-muted)] hover:bg-[var(--inset)] hover:text-[var(--text-primary)]">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Oportunidades</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {contagem.ativas} em andamento · {formataMoeda(totalValorAtivas)} em jogo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToVendedores}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
          >
            <Store className="h-4 w-4 text-[var(--accent)]" />
            <span className="hidden sm:inline">Vendedores</span>
          </button>
          <button onClick={recarregar} className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button onClick={() => setModalNova(true)} disabled={!podeCriar} className="flex h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40">
            <Plus className="h-4 w-4" />
            Nova Oportunidade
          </button>
        </div>
      </div>

      {/* Destaque: Oportunidades Ativas */}
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)]">
            <Target className="h-5 w-5 text-[var(--accent)]" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              Em Negociação Ativa
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {contagem.ativas}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            Valor Total em Jogo
          </p>
          <p className="text-2xl font-extrabold text-[var(--success)]">{formataMoeda(totalValorAtivas)}</p>
        </div>
      </div>

      {/* Tabs + filtro */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 gap-1 rounded-xl border border-[var(--border)] bg-[var(--inset)] p-1">
          {GRUPO.map((g) => (
            <button
              key={g.id}
              onClick={() => setGrupo(g.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm ${
                grupo === g.id
                  ? "bg-[var(--white)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--raised)] hover:text-[var(--text-primary)]"
              }`}
            >
              {g.label}
              <span className="ml-1 text-[11px] opacity-60">{contagem[g.id]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setFiltrosAberto(true)}
          className={`flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-semibold transition ${
            filtresAtivos
              ? "border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
              : "border-[var(--border)] bg-[var(--white)] text-[var(--text-secondary)] hover:bg-[var(--inset)]"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {filtresAtivos && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--inset)] text-[10px] font-bold text-[var(--text-secondary)]">
              {[filtros.busca, filtros.origem, filtros.regra, filtros.vendedor].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Cards */}
      {carregando ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)]">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
          Carregando oportunidades…
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] py-10 text-center text-sm text-[var(--text-muted)]">
          {filtresAtivos ? "Nenhuma oportunidade encontrada com esses filtros." : "Nenhuma oportunidade nesta aba."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((op) => {
            const callbacks: CallbacksOportunidade = {
              aoAvancar: podeOperar ? () => { avancarStatus(op); onCloseDetail?.(); } : undefined,
              aoConverter: podeOperar ? () => { onOpenConverterModal(op); onCloseDetail?.(); } : undefined,
              aoRemover: podeOperar ? () => { onOpenRemoverModal(op); onCloseDetail?.(); } : undefined,
              aoReabrir: podeOperar ? () => { reabrir(op); onCloseDetail?.(); } : undefined,
            };
            return (
              <OportunidadeCard
                key={op.id}
                oportunidade={op}
                aoAbrir={() => onOpenDetail(op, callbacks)}
                aoAvancar={callbacks.aoAvancar}
                aoConverter={callbacks.aoConverter}
                aoRemover={callbacks.aoRemover}
                aoReabrir={callbacks.aoReabrir}
              />
            );
          })}
        </div>
      )}

      {/* Modais / Panels */}
      <NovaOportunidadeModal
        aberto={modalNova}
        aoFechar={() => setModalNova(false)}
        aoSalvar={() => { setModalNova(false); recarregar(); mostrarAviso("Oportunidade criada"); }}
      />

      <OportunidadeFiltersDrawer
        aberto={filtrosAberto}
        aoFechar={() => setFiltrosAberto(false)}
        filtros={filtros}
        setFiltros={setFiltros}
        vendedores={vendedores}
        aoLimpar={() => setFiltros(FILTROS_VAZIOS)}
      />
    </div>
  );
}
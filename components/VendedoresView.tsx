"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, RefreshCw, Plus, Store, UserRound, PhoneCall, Mail, Building2, Target, ChevronRight } from "lucide-react";
import { VendedorItem, ImovelItem, OportunidadeItem } from "@/lib/segmentacao/tipos";
import NovoVendedorModal from "@/components/vendedor/NovoVendedorModal";
import { formataMoeda } from "@/components/oportunidade/oportunidade-ui";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function VendedoresView({ onOpenDetail, onVoltar }: { onOpenDetail: (detalhe: { vendedor: VendedorItem; imoveis: ImovelItem[]; oportunidades: OportunidadeItem[] }) => void; onVoltar?: () => void }) {
  const [vendedores, setVendedores] = useState<VendedorItem[]>([]);
  const [imoveis, setImoveis] = useState<ImovelItem[]>([]);
  const [oportunidades, setOportunidades] = useState<OportunidadeItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);

  function carregar() {
    let ativo = true;

    (async () => {
      try {
        const [resV, resI, resO] = await Promise.all([
          fetch("/api/vendedores"),
          fetch("/api/imoveis"),
          fetch("/api/oportunidades"),
        ]);
        const [jsonV, jsonI, jsonO] = await Promise.all([
          resV.ok ? resV.json() : { vendedores: [] },
          resI.ok ? resI.json() : { imoveis: [] },
          resO.ok ? resO.json() : { oportunidades: [] },
        ]);
        if (ativo) {
          setVendedores(jsonV.vendedores || []);
          setImoveis(jsonI.imoveis || []);
          setOportunidades(jsonO.oportunidades || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => { ativo = false; };
  }

  useEffect(() => {
    const cleanup = carregar();
    return cleanup;
  }, []);

  const ativos = vendedores.filter((v) => v.status === "ativo").length;

  const imoveisDoVendedor = (v: VendedorItem) => imoveis.filter((i) => i.vendedor_id === v.id);
  const oportunidadesDoVendedor = (v: VendedorItem) =>
    oportunidades.filter((o) => o.vendedor_id === v.id);

  if (carregando) {
    return (
      <div className="h-full space-y-5">
        <div className="flex items-center gap-2">
          <button
            onClick={onVoltar}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Oportunidades</span>
          </button>
        </div>
        <HeaderSection ativos={ativos} total={vendedores.length} />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)]">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
          Carregando vendedores…
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={onVoltar}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Oportunidades</span>
        </button>
      </div>

      <HeaderSection ativos={ativos} total={vendedores.length} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Vendedores</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {ativos} ativos · {vendedores.length} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => carregar()}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalNovo(true)}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
          >
            <Plus className="h-4 w-4" />
            Novo Vendedor
          </button>
        </div>
      </div>

      {vendedores.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] py-12 text-center text-sm text-[var(--text-muted)]">
          Nenhum vendedor cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendedores.map((v) => {
            const totals = {
              imoveis: imoveisDoVendedor(v).length,
              oportunidades: oportunidadesDoVendedor(v).length,
            };
            const valorOportunidades = oportunidadesDoVendedor(v)
              .filter((o) => o.status !== "removida" && o.status !== "convertida" && o.status !== "encerrada")
              .reduce((s, o) => s + (o.valor_estimado || 0), 0);
            return (
              <div
                key={v.id}
                onClick={() => onOpenDetail({
                  vendedor: v,
                  imoveis: imoveisDoVendedor(v),
                  oportunidades: oportunidadesDoVendedor(v)
                })}
                className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-4 transition-all hover:border-[var(--border-strong)] hover:shadow-lg hover:shadow-black/10"
              >
                {/* Vendedor */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--inset)] text-sm font-black text-[var(--accent)]">
                      {iniciais(v.nome)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black tracking-wide text-[var(--text-primary)]">
                        {v.nome}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {v.creci ? `CREci ${v.creci}` : "Sem CREci"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      v.status === "ativo"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-[var(--inset)] text-[var(--text-muted)]"
                    }`}
                  >
                    {v.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Contato */}
                {(v.telefone || v.email) && (
                  <div className="space-y-1 text-xs text-[var(--text-muted)]">
                    {v.telefone && (
                      <div className="flex items-center gap-2">
                        <PhoneCall className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                        {v.telefone}
                      </div>
                    )}
                    {v.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                        <span className="truncate">{v.email}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="my-1 border-t border-[var(--border)]" />

                {/* Métricas */}
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)]">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Building2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      <strong className="block text-sm font-extrabold text-[var(--text-primary)]">{totals.imoveis}</strong>
                      imóveis
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-[var(--border)] px-3 py-2.5">
                    <Target className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      <strong className="block text-sm font-extrabold text-[var(--text-primary)]">{totals.oportunidades}</strong>
                      oportunidades
                    </span>
                  </div>
                </div>

                {/* Rodapé */}
                <div className="flex items-center justify-between gap-2">
                  {valorOportunidades > 0 ? (
                    <span className="truncate text-xs font-extrabold text-emerald-600">
                      {formataMoeda(valorOportunidades)} em jogo
                    </span>
                  ) : <span />}
                  <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[var(--text-muted)] transition group-hover:text-[var(--text-secondary)]">
                    Ver detalhes
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NovoVendedorModal
        aberto={modalNovo}
        aoFechar={() => setModalNovo(false)}
        aoSalvar={() => {
          setModalNovo(false);
          carregar();
        }}
      />
    </div>
  );
}

function HeaderSection({ ativos, total }: { ativos: number; total: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="card flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success-light)] text-[var(--success)]">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl font-extrabold text-[var(--text-primary)]">{ativos}</p>
          <p className="text-xs text-[var(--text-secondary)]">Vendedores ativos</p>
        </div>
      </div>
      <div className="card flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl font-extrabold text-[var(--text-primary)]">{total}</p>
          <p className="text-xs text-[var(--text-secondary)]">Cadastrados</p>
        </div>
      </div>
    </div>
  );
}
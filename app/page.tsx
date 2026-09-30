"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  ArrowRight,
  AlertTriangle,
  Target,
  PhoneCall,
  ListChecks,
  ShieldAlert,
  ArrowRightLeft,
  MessageSquare,
  Sparkles,
  Building2,
} from "lucide-react";

interface DashboardData {
  totalClientes?: number;
  completudeMedia?: number;
  investidores?: number;
  tarefasPendentes?: number;
  handoffsAtivos?: number;
  oportunidadesAtivas?: number;
  oportunidadesValor?: number;
  investidoresPotenciais?: number;
  alertas?: {
    tarefasVencidas: number;
    clientesSemContatoSemanal: number;
    clientesIncompletos: number;
    clientesDistrato: number;
    oportunidadesVencidas: number;
  };
  pipeline?: {
    oportunidadesAtivas: number;
    pipelineValor: number;
  };
  vendedoresRecentes?: {
    id: string;
    nome: string;
    creci?: string | null;
    status?: string;
    telefone?: string | null;
    criado_em?: string;
  }[];
  composicaoStatus?: Record<string, number>;
  whatsapp?: {
    totalConversas: number;
    espelhadas: number;
    semMatch: number;
    privadas: number;
    semResposta: number;
    volumeHoje?: { data: string; total: number; recebidas: number; enviadas: number } | null;
  };
}

const formatoMoeda = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export default function HomePage() {
  const [stats, setStats] = useState<DashboardData>({});
  const [, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const alertas = stats.alertas || {
    tarefasVencidas: 0,
    clientesSemContatoSemanal: 0,
    clientesIncompletos: 0,
    clientesDistrato: 0,
    oportunidadesVencidas: 0,
  };
  const pipeline = stats.pipeline || { oportunidadesAtivas: 0, pipelineValor: 0 };
  const temAlerta =
    alertas.tarefasVencidas +
      alertas.clientesSemContatoSemanal +
      alertas.clientesIncompletos +
      alertas.clientesDistrato +
      alertas.oportunidadesVencidas >
    0;
  const vendedoresRecentes = stats.vendedoresRecentes || [];

  const clientesAtencao =
    alertas.clientesSemContatoSemanal + alertas.clientesIncompletos + alertas.clientesDistrato;

  const kpis = [
    {
      label: "Clientes na base",
      valor: String(stats.totalClientes ?? 0),
      href: "/clientes",
      icon: Users,
      cor: "var(--accent)",
    },
    {
      label: "Tarefas pendentes",
      valor: String(stats.tarefasPendentes ?? 0),
      href: "/tarefas",
      icon: CheckSquare,
      cor: "var(--warning)",
    },
    {
      label: "Oportunidades ativas",
      valor: String(pipeline.oportunidadesAtivas ?? stats.oportunidadesAtivas ?? 0),
      href: "/oportunidades",
      icon: Target,
      cor: "var(--success)",
    },
    {
      label: "Clientes que exigem atenção",
      valor: String(clientesAtencao),
      href: "/clientes",
      icon: AlertTriangle,
      cor: clientesAtencao > 0 ? "var(--danger)" : "var(--success)",
    },
  ];

  const alertasList = [
    {
      icon: AlertTriangle,
      label: "Tarefas vencidas",
      desc: "Prazo já passou e a tarefa não foi concluída.",
      count: alertas.tarefasVencidas,
      href: "/tarefas",
      acao: "Abrir tarefas",
      tone: "danger",
    },
    {
      icon: PhoneCall,
      label: "Sem contato há 7+ dias",
      desc: "Clientes sem interação recente precisam de follow-up.",
      count: alertas.clientesSemContatoSemanal,
      href: "/clientes",
      acao: "Ver clientes",
      tone: "warn",
    },
    {
      icon: ListChecks,
      label: "Cadastros incompletos",
      desc: "Completude abaixo de 60% — faltam dados para priorizar.",
      count: alertas.clientesIncompletos,
      href: "/clientes?completude_maxima=60",
      acao: "Ver clientes",
      tone: "warn",
    },
    {
      icon: ShieldAlert,
      label: "Risco de distrato",
      desc: "Cliente insatisfeito ou com alerta ativo — ação imediata.",
      count: alertas.clientesDistrato,
      href: "/clientes",
      acao: "Ver clientes",
      tone: "danger",
    },
    {
      icon: Target,
      label: "Oportunidades vencidas",
      desc: "Próximo passo dentro do prazo sem avanço registrado.",
      count: alertas.oportunidadesVencidas,
      href: "/oportunidades",
      acao: "Ver oportunidades",
      tone: "warn",
    },
  ];

  const composicao = stats.composicaoStatus || {};
  const composicaoTotal = Object.values(composicao).reduce((a, b) => a + b, 0) || 1;
  const composicaoCores = ["#0284c7", "#d97706", "#059669", "#7c3aed", "#dc2626", "#64748b", "#2563eb"];

  const quickLinks = [
    { icon: Users, label: "Base de clientes", desc: "Cadastros, filtros e status de pós-venda", href: "/clientes" },
    { icon: Target, label: "Oportunidades", desc: "Recompra, upgrade e investimento", href: "/oportunidades" },
    { icon: CheckSquare, label: "Fila de tarefas", desc: "Onboarding, follow-up e pendências", href: "/tarefas" },
    { icon: ArrowRightLeft, label: "Handoffs", desc: "Passagens de bastão com checklist", href: "/handoffs" },
    { icon: MessageSquare, label: "Conversas WhatsApp", desc: "Espelhamento automático no CRM", href: "/mensagens" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Resumo da operação
          </h2>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            O que está acontecendo e o que precisa da sua atenção hoje.
          </p>
        </div>
        <Link
          href="/mensagens"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
        >
          <MessageSquare className="h-3.5 w-3.5 text-[var(--accent)]" />
          Abrir conversas
        </Link>
      </div>

      {/* ── KPIs principais ── */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link
              key={k.label}
              href={k.href}
              className="card card-hover group flex items-start gap-3 p-4"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--inset)", color: k.cor }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <span className="block text-2xl font-bold leading-tight tracking-tight text-[var(--text-primary)]">
                  {k.valor}
                </span>
                <span className="block truncate text-xs text-[var(--text-secondary)]">{k.label}</span>
              </div>
              <ArrowRight className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--accent)" }} />
            </Link>
          );
        })}
      </section>

      {/* ── Precisa de atenção (agrupamento por tipo) ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--text-secondary)]">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
            Precisa de atenção
          </h3>
          {!temAlerta && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-light)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
              <Sparkles className="h-3.5 w-3.5" />
              Tudo em dia
            </span>
          )}
        </div>

        {temAlerta ? (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            {alertasList.map((a, i) => {
              const Icon = a.icon;
              const danger = a.tone === "danger";
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`group flex items-center gap-4 bg-[var(--white)] px-4 py-3 transition-colors hover:bg-[var(--raised)] ${
                    i > 0 ? "border-t border-[var(--border)]" : ""
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: danger ? "var(--danger-light)" : "var(--inset)",
                      color: danger ? "var(--danger)" : "var(--warning)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {a.label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: danger ? "var(--danger)" : "var(--warning)" }}
                      >
                        {a.count}
                      </span>
                    </div>
                    <p className="truncate text-xs text-[var(--text-secondary)]">{a.desc}</p>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-[var(--accent)] sm:flex">
                    {a.acao}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-2 p-10 text-center">
            <Sparkles className="h-8 w-8 text-[var(--success)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              Nenhum alerta acionável no momento.
            </p>
          </div>
        )}
      </section>

      {/* ── Métricas secundárias: pipeline + WhatsApp ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pipeline */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--accent)]">
                <Target className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Pipeline de novas vendas</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {pipeline.oportunidadesAtivas} oportunidade(s) em andamento
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold tracking-tight text-[var(--accent)]">
                {formatoMoeda(pipeline.pipelineValor)}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">Valor estimado em jogo</p>
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        {stats.whatsapp && (
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--success-light)] text-[var(--success)]">
                  <MessageSquare className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">WhatsApp espelhado no CRM</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {stats.whatsapp.espelhadas} de {stats.whatsapp.totalConversas} conversas espelhadas
                  </p>
                </div>
              </div>
              <Link href="/mensagens" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                Abrir painel
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                {stats.whatsapp.espelhadas} espelhadas
              </span>
              <span
                className="flex items-center gap-1.5 text-[var(--text-secondary)]"
                style={{ color: stats.whatsapp.semResposta > 0 ? "var(--danger)" : "var(--text-secondary)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--danger)" }} />
                {stats.whatsapp.semResposta} sem resposta 8h+
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                {stats.whatsapp.semMatch} sem match
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {stats.whatsapp.volumeHoje?.total ?? 0} mensagens hoje
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ── Indicadores de base: completude + composição ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Indicadores de base</p>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Completude média</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {stats.completudeMedia ?? 0}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--inset)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${Math.min(stats.completudeMedia ?? 0, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Handoffs ativos</span>
              <span className="font-bold text-[var(--text-primary)]">
                <Link href="/handoffs" className="text-[var(--text-primary)] hover:text-[var(--accent)]">
                  {stats.handoffsAtivos ?? 0}
                </Link>
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--text-secondary)]">Investidores potenciais</span>
              <span className="ml-2 text-xs font-bold text-[var(--text-primary)]">
                {stats.investidoresPotenciais ?? 0}
              </span>
            </div>
          </div>
        </div>

        {Object.keys(composicao).length > 0 && (
          <div className="card p-5 lg:col-span-2">
            <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Base por status</p>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--inset)]">
              {Object.entries(composicao).map(([status, count], i) => (
                <div
                  key={status}
                  title={`${status}: ${count}`}
                  style={{
                    width: `${(count / composicaoTotal) * 100}%`,
                    background: composicaoCores[i % composicaoCores.length],
                  }}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(composicao).map(([status, count], i) => (
                <div key={status} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: composicaoCores[i % composicaoCores.length] }}
                  />
                  <span className="text-[var(--text-secondary)]">{status.replace(/_/g, " ")}</span>
                  <span className="font-bold text-[var(--text-primary)]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Corretores recentes + acesso rápido ── */}
      {vendedoresRecentes.length > 0 && (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
              Corretores cadastrados recentemente
              <span className="rounded-full bg-[var(--inset)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-secondary)]">
                {vendedoresRecentes.length}
              </span>
            </p>
            <Link href="/vendedores" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div>
            {vendedoresRecentes.map((v, i) => (
              <Link
                key={v.id}
                href="/vendedores"
                className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--raised)] ${
                  i > 0 ? "border-t border-[var(--border)]" : ""
                }`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ background: "var(--inset)", color: "var(--text-primary)" }}
                >
                  {(v.nome || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase() || "")
                    .join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                    {v.nome}
                  </span>
                  <span className="block truncate text-[11px] text-[var(--text-secondary)]">
                    {v.creci ? `CREci ${v.creci}` : v.telefone || "Sem CREci"}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: v.status === "ativo" ? "var(--success-light)" : "var(--inset)",
                    color: v.status === "ativo" ? "var(--success)" : "var(--text-muted)",
                  }}
                >
                  {v.status === "ativo" ? "Ativo" : "Inativo"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Acesso rápido ── */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          Atalhos
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {quickLinks.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.href} href={q.href} className="card card-hover flex flex-col gap-2 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inset)] text-[var(--text-secondary)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{q.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">{q.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
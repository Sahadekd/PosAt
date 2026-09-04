"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  ArrowRightLeft,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Target,
  PhoneCall,
  ListChecks,
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
  composicaoStatus?: Record<string, number>;
}

const formatoMoeda = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export default function HomePage() {
  const [stats, setStats] = useState<DashboardData>({});
  const [carregando, setCarregando] = useState(true);

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
  const temAlerta = alertas.tarefasVencidas + alertas.clientesSemContatoSemanal + alertas.clientesIncompletos + alertas.clientesDistrato + alertas.oportunidadesVencidas > 0;

  const metricas = [
    {
      label: "Clientes na base",
      valor: String(stats.totalClientes ?? 0),
      href: "/clientes",
      icon: Users,
      color: "var(--text-primary)",
    },
    {
      label: "Completude média",
      valor: `${stats.completudeMedia ?? 0}%`,
      href: "/clientes?completude_maxima=70",
      icon: UserCheck,
      color: "var(--success)",
    },
    {
      label: "Tarefas pendentes",
      valor: String(stats.tarefasPendentes ?? 0),
      href: "/tarefas",
      icon: CheckSquare,
      color: "var(--accent)",
    },
    {
      label: pipeline.oportunidadesAtivas > 0 ? "Oportunidades ativas" : "Oportunidades",
      valor: String(pipeline.oportunidadesAtivas ?? stats.oportunidadesAtivas ?? 0),
      href: "/oportunidades",
      icon: Target,
      color: "var(--warning)",
    },
  ];

  const alertasList = [
    {
      icon: AlertTriangle,
      label: "Tarefas vencidas",
      desc: "Prazo já passou e a tarefa não foi concluída.",
      count: alertas.tarefasVencidas,
      href: "/tarefas",
      tone: "danger",
    },
    {
      icon: PhoneCall,
      label: "Sem contato há 7+ dias",
      desc: "Clientes sem interação recente precisam de follow-up.",
      count: alertas.clientesSemContatoSemanal,
      href: "/clientes",
      tone: "warn",
    },
    {
      icon: ListChecks,
      label: "Cadastros incompletos",
      desc: "Completude abaixo de 60% — faltam dados para priorizar.",
      count: alertas.clientesIncompletos,
      href: "/clientes?completude_maxima=60",
      tone: "warn",
    },
    {
      icon: ShieldAlert,
      label: "Risco de distrato",
      desc: "Cliente insatisfeito ou com alerta ativo — ação imediata.",
      count: alertas.clientesDistrato,
      href: "/clientes",
      tone: "danger",
    },
    {
      icon: Target,
      label: "Oportunidades vencidas",
      desc: "Próximo passo dentro do prazo sem avanço registrado.",
      count: alertas.oportunidadesVencidas,
      href: "/oportunidades",
      tone: "warn",
    },
  ];

  const composicao = stats.composicaoStatus || {};
  const composicaoTotal = Object.values(composicao).reduce((a, b) => a + b, 0) || 1;

  const quickLinks = [
    {
      icon: Users,
      label: "Base de Clientes",
      desc: "Cadastros, filtros por finalidade e status de pós-venda.",
      href: "/clientes",
      tag: "Visão 360°",
    },
    {
      icon: Target,
      label: "Oportunidades",
      desc: "Recompra, upgrade, investimento e indicações com pipeline.",
      href: "/oportunidades",
      tag: "Novo",
    },
    {
      icon: CheckSquare,
      label: "Fila de Tarefas",
      desc: "Onboarding, qualificação, follow-up e pendências ativas.",
      href: "/tarefas",
      tag: "Operacional",
    },
    {
      icon: ArrowRightLeft,
      label: "Handoffs",
      desc: "Passagens de bastão com checklists de pós-fechamento.",
      href: "/handoffs",
      tag: "Continuidade",
    },
  ];

  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <section
        className="rounded-2xl px-8 py-10 md:py-14"
        style={{ background: "var(--white)", border: "1px solid var(--border)" }}
      >
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-5"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Painel de Pós-Atendimento Imobiliário
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Operação com contexto, prioridade e continuidade.
          </h1>

          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Foco no que mais importa hoje: pendências vencidas, clientes carentes de contato e o pipeline de novas oportunidades.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/clientes"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Acessar Base de Clientes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/oportunidades"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: "var(--white)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <Target className="h-4 w-4" style={{ color: "var(--warning)" }} />
              Ver Pipeline de Oportunidades
            </Link>
          </div>
        </div>
      </section>

      {/* ── KPI Strip ── */}
      <section
        className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 rounded-2xl overflow-hidden"
        style={{ background: "var(--white)", border: "1px solid var(--border)" }}
      >
        {metricas.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href + m.label}
              href={m.href}
              className="flex flex-col gap-1 px-6 py-6 group transition-colors hover:bg-[var(--surface)]"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4" style={{ color: m.color }} />
              </div>
              <span
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {m.valor}
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {m.label}
              </span>
            </Link>
          );
        })}
      </section>

      {/* ── Pipeline de Oportunidades ── */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--accent-light)", border: "1px solid var(--accent)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--accent)" }}
            >
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Pipeline de novas vendas
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {pipeline.oportunidadesAtivas} oportunidade(s) em andamento
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "var(--accent)" }}
            >
              {formatoMoeda(pipeline.pipelineValor)}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Valor estimado em jogo
            </p>
          </div>
        </div>
      </section>

      {/* ── Alertas Acionáveis ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Preciso agir
          </h2>
          {!temAlerta && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--accent-light)", color: "var(--success)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Tudo em dia
            </span>
          )}
        </div>

        {temAlerta ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertasList.map((a) => {
              const Icon = a.icon;
              const danger = a.tone === "danger";
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className="group flex items-start gap-4 p-5 rounded-2xl transition-all"
                  style={{
                    background: "var(--white)",
                    border: `1px solid ${danger ? "var(--danger)" : "var(--border)"}`,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: danger ? "var(--danger-light)" : "var(--surface)",
                      color: danger ? "var(--danger)" : "var(--text-secondary)",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {a.label}
                      </span>
                      <span
                        className="text-base font-extrabold"
                        style={{ color: danger ? "var(--danger)" : "var(--warning)" }}
                      >
                        {a.count}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {a.desc}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--accent)" }}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 text-center text-sm"
            style={{ background: "var(--white)", border: "1px solid var(--border)" }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              Nenhum alerta acionável no momento.
            </p>
          </div>
        )}
      </section>

      {/* ── Composição por status ── */}
      {Object.keys(composicao).length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Base por status
          </h2>
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--white)", border: "1px solid var(--border)" }}
          >
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {Object.entries(composicao).map(([status, count], i) => {
                const colors = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#e05b3f", "#64748b", "#3b82f6"];
                return (
                  <div
                    key={status}
                    title={`${status}: ${count}`}
                    style={{
                      width: `${(count / composicaoTotal) * 100}%`,
                      background: colors[i % colors.length],
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(composicao).map(([status, count], i) => {
                const colors = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#e05b3f", "#64748b", "#3b82f6"];
                return (
                  <div key={status} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: colors[i % colors.length] }}
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {status.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Quick Access ── */}
      <section>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Acesso Rápido
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="group flex items-start gap-4 p-5 rounded-2xl transition-all"
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <h3
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.label}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {item.desc}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--accent)" }}
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
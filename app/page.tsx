"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  ArrowRightLeft,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  PieChart,
  UserCheck,
} from "lucide-react";

import { executeGraphQL, QUERIES } from "@/lib/graphql-client";

interface StatsData {
  totalClientes: number;
  completudeMedia: number;
  investidores: number;
  tarefasPendentes: number;
  handoffsAtivos: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<StatsData>({
    totalClientes: 6,
    completudeMedia: 83,
    investidores: 2,
    tarefasPendentes: 4,
    handoffsAtivos: 1,
  });

  useEffect(() => {
    executeGraphQL<{ dashboardStats: StatsData }>(QUERIES.GET_DASHBOARD_STATS)
      .then((data) => {
        if (data?.dashboardStats) setStats(data.dashboardStats);
      })
      .catch(() => {
        // Fallback gracefully
        fetch("/api/stats")
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data) setStats(data);
          })
          .catch(() => {});
      });
  }, []);

  const metricCards = [
    {
      titulo: "Base de Relacionamento",
      valor: stats.totalClientes,
      sufixo: "cadastros",
      descricao: "Leads e clientes normalizados e unificados",
      icon: Users,
      href: "/clientes",
      bgBadge: "bg-blue-50 text-blue-700",
    },
    {
      titulo: "Índice Médio de Completude",
      valor: `${stats.completudeMedia}%`,
      sufixo: "qualificação",
      descricao: "Média ponderada de integridade cadastral",
      icon: UserCheck,
      href: "/clientes?completude_maxima=70",
      bgBadge: "bg-emerald-50 text-emerald-700",
    },
    {
      titulo: "Investidores Mapeados",
      valor: stats.investidores,
      sufixo: "compradores",
      descricao: "Classificados por perfil ou sinais comportamentais",
      icon: TrendingUp,
      href: "/clientes?finalidade=investimento",
      bgBadge: "bg-amber-50 text-amber-700",
    },
    {
      titulo: "Fila de Pós-Atendimento",
      valor: stats.tarefasPendentes,
      sufixo: "tarefas ativas",
      descricao: "Ações de onboarding, qualificação e follow-up",
      icon: CheckSquare,
      href: "/tarefas",
      bgBadge: "bg-purple-50 text-purple-700",
    },
  ];

  const quickSections = [
    {
      titulo: "Base de Clientes & Leads",
      descricao: "Acesse o cadastro unificado com filtros por finalidade, confiança e status.",
      href: "/clientes",
      cta: "Consultar base de clientes",
      tag: "Visão 360°",
    },
    {
      titulo: "Auditoria de Dados Incompletos",
      descricao: "Identifique leads com lacunas cadastrais (&le; 70%) para completar a qualificação.",
      href: "/clientes?completude_maxima=70",
      cta: "Ver cadastros a qualificar",
      tag: "Qualificação Ativa",
    },
    {
      titulo: "Mapeamento de Investidores",
      descricao: "Priorize oportunidades para clientes com perfil ou interesse em renda e valorização.",
      href: "/clientes?finalidade=investimento",
      cta: "Acessar carteira de investidores",
      tag: "Alta Rentabilidade",
    },
    {
      titulo: "Fluxo de Handoff (Vendas &rarr; Atendimento)",
      descricao: "Acompanhe as passagens de bastão com checklists de pendências pós-fechamento.",
      href: "/handoffs",
      cta: "Acompanhar transições",
      tag: "Continuidade",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-8 md:p-12 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d9d2c6] bg-[#f5f1e9] px-3.5 py-1 text-xs font-semibold text-[#b25c3f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sistema Unificado • Quadra Brasileira</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[#1e2722] sm:text-5xl leading-tight">
            Pós-atendimento com contexto, prioridade e continuidade.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#5b625d] leading-relaxed">
            Centralize leads e clientes, diagnostique a finalidade de compra com inteligência,
            calcule a completude cadastral e transforme cada interação em uma próxima ação assertiva.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/clientes"
              className="flex items-center gap-2 rounded-2xl bg-[#1e2722] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b25c3f] transition"
            >
              <span>Acessar Base de Clientes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/tarefas"
              className="flex items-center gap-2 rounded-2xl border border-[#d9d2c6] bg-white px-6 py-3.5 text-sm font-semibold text-[#1e2722] hover:bg-[#f5f1e9] transition"
            >
              <CheckSquare className="h-4 w-4 text-[#b25c3f]" />
              <span>Ver Fila de Pós-Atendimento</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metric Cards Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="group rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-lg hover:border-[#b25c3f]/50"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-xl p-2.5 ${card.bgBadge}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs text-[#8b918c] font-medium">{card.sufixo}</span>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight text-[#1e2722]">
                  {card.valor}
                </span>
                <h3 className="mt-1 text-sm font-semibold text-[#1e2722]">{card.titulo}</h3>
                <p className="mt-1 text-xs text-[#68706a] leading-relaxed">{card.descricao}</p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Operational Quick Sections */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1e2722]">
              Visão Operacional e Módulos
            </h2>
            <p className="text-xs text-[#68706a]">
              Acesso direto aos fluxos de atendimento, segmentação e governança de dados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {quickSections.map((sec, idx) => (
            <Link
              key={idx}
              href={sec.href}
              className="group flex flex-col justify-between rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-7 shadow-xs transition hover:-translate-y-1 hover:shadow-xl hover:border-[#b25c3f]"
            >
              <div>
                <span className="inline-block rounded-full bg-[#f5f1e9] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#b25c3f]">
                  {sec.tag}
                </span>
                <h3 className="mt-3 text-xl font-bold text-[#1e2722] group-hover:text-[#b25c3f] transition-colors">
                  {sec.titulo}
                </h3>
                <p className="mt-2 text-sm text-[#5b625d] leading-relaxed">{sec.descricao}</p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#b25c3f] group-hover:translate-x-1 transition-transform">
                <span>{sec.cta}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Logical Architecture Summary Card */}
      <section className="rounded-3xl border border-[#d9d2c6] bg-[#f9f7f2] p-8 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#b25c3f] mb-2">
          Arquitetura Lógica de Segmentação & Pós-Atendimento
        </h3>
        <p className="text-xs text-[#5b625d] mb-6 leading-relaxed">
          O motor opera em camadas integradas para garantir deduplicação, normalização e inteligência de relacionamento contínua:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-2xl border border-[#d9d2c6] bg-white p-4">
            <strong className="block text-sm text-[#1e2722] mb-1">1. Ingestão & Unificação</strong>
            <p className="text-[#68706a]">
              Captura de dados via CRM, formulários, WhatsApp e planilhas com deduplicação automática por CPF e E-mail.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d9d2c6] bg-white p-4">
            <strong className="block text-sm text-[#1e2722] mb-1">2. Motor de Classificação</strong>
            <p className="text-[#68706a]">
              Inferência semântica de finalidade (investimento, moradia, 1º imóvel), cálculo de completude (%) e sinais comportamentais.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d9d2c6] bg-white p-4">
            <strong className="block text-sm text-[#1e2722] mb-1">3. Ação & Handoff</strong>
            <p className="text-[#68706a]">
              Disparo automático de tarefas para qualificar campos faltantes e transição assistida entre vendas e pós-venda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  Sparkles,
  CheckSquare,
  MessageSquare,
  DollarSign,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronDown,
  Plus,
  Tag,
  ShieldAlert,
  Send,
  Building2,
  FileText,
  AlertTriangle,
  Repeat,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import { ClienteCompleto, TarefaItem, PromessaVenda, TermometroCX } from "@/lib/segmentacao/tipos";
import { finalidadeConfig, statusConfig, termometroCXConfig } from "./ClienteCard";
import NovaInteracaoModal from "./NovaInteracaoModal";
import NovaTarefaModal from "./NovaTarefaModal";
import HandoffModal from "./HandoffModal";
import { executeGraphQL, MUTATIONS } from "@/lib/graphql-client";

interface ClienteProfileProps {
  clienteInicial: ClienteCompleto;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function avatarColor(name: string): string {
  const colors = [
    "#dc2626","#0d9488","#b45309","#4f46e5","#0284c7","#65a30d","#db2777"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ClienteProfile({ clienteInicial }: ClienteProfileProps) {
  const [cliente, setCliente] = useState<ClienteCompleto>(clienteInicial);
  const [reclassificando, setReclassificando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [alertaDistratoAtivo, setAlertaDistratoAtivo] = useState(
    Boolean(cliente.alerta_distrato_ativo || cliente.termometro_cx === "insatisfeito_distrato")
  );
  const [statusHandoffLocal, setStatusHandoffLocal] = useState<string>(
    cliente.handoffs?.[0]?.status || "pendente"
  );
  const [promessas, setPromessas] = useState<PromessaVenda[]>(
    cliente.promessas_venda || [
      {
        id: "p-1",
        descricao: "Piso laminado nas áreas secas incluso sem custo",
        categoria: "brinde_mobiliario",
        cumprida: false,
      },
      {
        id: "p-2",
        descricao: "Assessoria documental e ITBI parcelado em 12x",
        categoria: "documentacao",
        cumprida: true,
      },
    ]
  );

  const [modalInteracaoAberto, setModalInteracaoAberto] = useState(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [modalHandoffAberto, setModalHandoffAberto] = useState(false);
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState("visao");

  async function recarregarCliente() {
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.cliente) {
          setCliente(json.cliente);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReclassificar() {
    setReclassificando(true);
    setMensagemSucesso(null);

    try {
      try {
        await executeGraphQL(MUTATIONS.CLASSIFICAR_CLIENTE, {
          clienteId: cliente.id,
        });
        setMensagemSucesso("Classificação recalculada com sucesso!");
        await recarregarCliente();
        setTimeout(() => setMensagemSucesso(null), 4000);
        return;
      } catch {
        // Fallback REST
      }

      const res = await fetch(`/api/clientes/${cliente.id}/classificar`, {
        method: "POST",
      });

      if (res.ok) {
        setMensagemSucesso("Classificação recalculada com sucesso!");
        await recarregarCliente();
        setTimeout(() => setMensagemSucesso(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReclassificando(false);
    }
  }

  function handleAcionarComiteDistrato() {
    setMenuAcoesAberto(false);
    const confirmou = window.confirm(
      "Tem certeza que deseja acionar o Comitê de Prevenção a Distrato? Um alerta de urgência será registrado para retenção imediata."
    );
    if (confirmou) {
      setAlertaDistratoAtivo(true);
      setMensagemSucesso("Comitê de Prevenção a Distrato acionado com prioridade máxima!");
      setTimeout(() => setMensagemSucesso(null), 5000);
    }
  }

  function togglePromessa(id: string) {
    setPromessas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cumprida: !p.cumprida } : p))
    );
  }

  async function toggleStatusTarefa(tarefa: TarefaItem) {
    const novoStatus = tarefa.status === "concluida" ? "pendente" : "concluida";
    try {
      try {
        await executeGraphQL(MUTATIONS.ATUALIZAR_TAREFA, {
          input: {
            id: tarefa.id,
            status: novoStatus,
          },
        });
        await recarregarCliente();
        return;
      } catch {
        // Fallback REST
      }

      const res = await fetch(`/api/tarefas/${tarefa.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) {
        await recarregarCliente();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const finalidade = finalidadeConfig[cliente.finalidade_principal] || finalidadeConfig.nao_identificado;
  const status = statusConfig[cliente.status] || { label: cliente.status, bg: "bg-stone-100", text: "text-stone-700" };
  const completudeNum = Number(cliente.indice_completude || 0);

  const cxTermometro: TermometroCX = alertaDistratoAtivo
    ? "insatisfeito_distrato"
    : cliente.termometro_cx || "neutro_nutricao";

  const cxBadge = termometroCXConfig[cxTermometro] || termometroCXConfig.neutro_nutricao;

  const empreendimento = cliente.empreendimento || (cliente.regiao_interesse ? `Condomínio ${cliente.regiao_interesse}` : "Residencial Jardins de Monet");
  const corretor = cliente.corretor_original_nome || "Carlos Eduardo (Corretor)";
  const analistaCS = cliente.analista_cs_nome || "Mariana Souza (CS)";
  const scoreSaude = cliente.indice_saude_score || (alertaDistratoAtivo ? 30 : completudeNum >= 70 ? 92 : 65);

  const repasseInfo = cliente.repasse_financeiro || {
    status: "documentacao_pendente",
    bancoFinanciador: "Caixa Econômica Federal",
    valorFinanciado: cliente.valor_maximo ? cliente.valor_maximo * 0.8 : 450000,
    pendenciasDocumentais: ["Comprovante de Renda Atualizado", "Certidão de Casamento Atualizada"],
  };

  const telefoneLimpo = (cliente.pessoa?.telefone || "").replace(/\D/g, "");

  const valorFormatado = (val: number | null | undefined) =>
    val != null
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val)
      : "Não informado";

  const tarefasPendentes =
    (cliente.tarefas || []).filter((t) => t.status !== "concluida").length || 0;
  const promessasCumpridas = promessas.filter((p) => p.cumprida).length;

  const abas = [
    { id: "visao", label: "Visão geral", icon: User },
    { id: "handoff", label: "Handoff & Promessas", icon: FileText },
    { id: "historico", label: "Histórico", icon: Clock },
    { id: "tarefas", label: "Tarefas", icon: CheckSquare },
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
  ];

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb & ações ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <X className="h-3.5 w-3.5" />
          <span>Voltar para Gestão de Clientes</span>
        </Link>

        <button
          onClick={handleReclassificar}
          disabled={reclassificando}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--inset)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[var(--accent)] ${reclassificando ? "animate-spin" : ""}`} />
          <span>{reclassificando ? "Recalculando..." : "Recalcular Classificação"}</span>
        </button>
      </div>

      {/* ── Mensagem de sucesso ── */}
      {mensagemSucesso && (
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--success-border)] bg-[var(--success-light)] p-4 text-sm font-medium text-[var(--success)]">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* ── Banner de Alerta Crítico (Comitê de Distrato) ── */}
      {alertaDistratoAtivo && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-light)] p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--danger)] text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--danger)]">
                Comitê de Prevenção a Distrato Acionado!
              </h3>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                Cliente sob risco iminente de cancelamento de contrato. Prioridade de atendimento nível 1 para a equipe de CS e Retenção.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertaDistratoAtivo(false)}
            className="self-start rounded-xl border border-[var(--danger-border)] px-3 py-1.5 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-light)] sm:self-center"
          >
            Encerrar Protocolo
          </button>
        </div>
      )}

      {/* ── Cabeçalho compacto ── */}
      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-lg shadow-black/20"
              style={{ background: avatarColor(cliente.pessoa?.nome || "Lead") }}
            >
              {initials(cliente.pessoa?.nome || "Lead Sem Nome")}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-black tracking-tight text-[var(--text-primary)]">
                  {cliente.pessoa?.nome || "Lead Sem Nome"}
                </h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cxBadge.bg} ${cxBadge.text} ${cxBadge.border}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cxBadge.dot}`} />
                  {cxBadge.label}
                </span>
              </div>

              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
                <Building2 className="h-4 w-4 text-[var(--accent)]" />
                {empreendimento} {cliente.unidade ? `(${cliente.unidade})` : ""}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                <span><strong className="font-bold text-[var(--text-primary)]">Corretor:</strong> {corretor}</span>
                <span>•</span>
                <span><strong className="font-bold text-[var(--text-primary)]">CS:</strong> {analistaCS}</span>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-wrap items-center gap-2">
            {telefoneLimpo && (
              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/55${telefoneLimpo}?text=Olá%20${encodeURIComponent(
                      cliente.pessoa?.nome || ""
                    )},%20aqui%20é%20da%20equipe%20de%20Pós-Atendimento.`,
                    "_blank"
                  )
                }
                className="flex items-center gap-1.5 rounded-xl border border-[var(--success-border)] bg-[var(--success-light)] px-3.5 py-2 text-sm font-bold text-[var(--success)] transition hover:bg-[var(--success-light)]"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </button>
            )}

            <button
              onClick={() => setModalTarefaAberto(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 py-2 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
            >
              <Plus className="h-4 w-4" />
              Nova tarefa
            </button>

            {/* Mais ações */}
            <div className="relative">
              <button
                onClick={() => setMenuAcoesAberto((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--inset)] px-3.5 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface)]"
              >
                <MoreHorizontal className="h-4 w-4 text-[var(--text-muted)]" />
                Mais ações
                <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-muted)] transition ${menuAcoesAberto ? "rotate-180" : ""}`} />
              </button>

              {menuAcoesAberto && (
                <div className="absolute right-0 top-12 z-30 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--inset)] py-1.5 text-sm shadow-xl shadow-black/10">
                  <button
                    onClick={() => { setMenuAcoesAberto(false); setModalInteracaoAberto(true); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-[var(--text-primary)] transition hover:bg-[var(--raised)]"
                  >
                    <Send className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Disparo de E-mail da Régua
                  </button>
                  <button
                    onClick={() => {
                      setMenuAcoesAberto(false);
                      setMensagemSucesso("Cliente sinalizado no CRM para oferta de 2º Imóvel (Investimento)!");
                      setTimeout(() => setMensagemSucesso(null), 4000);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-[var(--text-primary)] transition hover:bg-[var(--raised)]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Mapear Up-Sell / 2º Imóvel
                  </button>
                  <button
                    onClick={() => { setMenuAcoesAberto(false); setModalHandoffAberto(true); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-[var(--text-primary)] transition hover:bg-[var(--raised)]"
                  >
                    <Repeat className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Revisar Handoff
                  </button>
                  <div className="my-1 border-t border-[var(--border)]" />
                  <button
                    onClick={handleAcionarComiteDistrato}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-light)]"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Acionar Comitê de Distrato
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Abas ── */}
      <div className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--inset)] p-1">
        {abas.map((aba) => {
          const Icon = aba.icon;
          const ativa = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                ativa
                  ? "bg-[var(--white)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: ativa ? "var(--accent)" : undefined }} />
              {aba.label}
            </button>
          );
        })}
      </div>

      {/* ── Visão geral: seções com divisores ── */}
      {abaAtiva === "visao" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 sm:p-6">
          {/* Seção: Informações do cliente */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              Informações do cliente
            </h2>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Finalidade</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <span className={`h-2 w-2 rounded-full ${finalidade.bg}`} />
                {finalidade.label}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Origem</dt>
              <dd className="mt-1 font-semibold text-[var(--text-primary)]">
                {cliente.origem_fluxo === "re_trabalho" ? "♻️ Base de Re-trabalho" : "⚡ Novos Dados (Tempo Real)"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Contato</dt>
              <dd className="mt-1 space-y-0.5 text-[var(--text-secondary)]">
                {cliente.pessoa?.telefone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    {cliente.pessoa.telefone}
                  </span>
                )}
                {cliente.pessoa?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="truncate">{cliente.pessoa.email}</span>
                  </span>
                )}
                {cliente.pessoa?.documento && (
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    CPF/Doc: {cliente.pessoa.documento}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <div className="my-6 border-t border-[var(--border)]" />

          {/* Seção: Indicadores */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              Indicadores
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--inset)] p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Completude do cadastro</span>
                <span className="font-bold text-[var(--text-primary)]">{completudeNum}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(completudeNum, 100)}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--inset)] p-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Score de Relacionamento</span>
                <span className="font-extrabold text-[var(--text-primary)]">{scoreSaude}/100</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)]">
                <div
                  className={`h-full transition-all duration-500 ${
                    scoreSaude >= 80 ? "bg-[var(--success)]" : scoreSaude >= 50 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"
                  }`}
                  style={{ width: `${scoreSaude}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--inset)] p-4">
              <span className="block text-xs text-[var(--text-secondary)]">Tarefas pendentes de CS</span>
              <span className="mt-1 block text-xl font-extrabold text-[var(--text-primary)]">{tarefasPendentes}</span>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--inset)] p-4">
              <span className="block text-xs text-[var(--text-secondary)]">Promessas cumpridas</span>
              <span className="mt-1 block text-xl font-extrabold text-[var(--success)]">
                {promessasCumpridas}/{promessas.length}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            Status do handoff: <strong className="font-bold capitalize text-[var(--text-primary)]">{statusHandoffLocal.replace(/_/g, " ")}</strong>
          </p>

          <div className="my-6 border-t border-[var(--border)]" />

          {/* Seção: Alertas & próximas ações */}
          {(repasseInfo.pendenciasDocumentais.length > 0 || (cliente.campos_faltantes && cliente.campos_faltantes.length > 0)) && (
            <>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                  Exige atenção
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {cliente.campos_faltantes && cliente.campos_faltantes.length > 0 && (
                  <div className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-light)] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--warning)]">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Dados cadastrais ausentes para atingir 100% de qualificação:</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cliente.campos_faltantes.map((campo) => (
                        <span
                          key={campo}
                          className="rounded-full border border-[var(--warning-border)] bg-[var(--inset)] px-2.5 py-1 text-xs font-semibold text-[var(--warning)]"
                        >
                          {campo.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {repasseInfo.pendenciasDocumentais.length > 0 && (
                  <div className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-light)] p-4">
                    <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[var(--warning)]">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Pendências Documentais para Repasse:</span>
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-secondary)]">
                      {repasseInfo.pendenciasDocumentais.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="my-6 border-t border-[var(--border)]" />
            </>
          )}

          {/* Seção: Atividades recentes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                Atividades recentes
              </h2>
            </div>
            <button
              onClick={() => setAbaAtiva("historico")}
              className="text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Ver histórico completo
            </button>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div className="relative border-l-2 border-[var(--accent)] pb-3 pl-6">
              <div className="absolute -left-1 top-0.5 h-3 w-3 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent-light)]" />
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[var(--accent)]">
                <span>Régua Automática • Onboarding</span>
                <span>Ontem</span>
              </div>
              <p className="mt-0.5 font-medium text-[var(--text-primary)]">
                E-mail de Boas-Vindas e Acesso ao Portal do Cliente disparado com sucesso.
              </p>
            </div>

            {cliente.interacoes && cliente.interacoes.length > 0 ? (
              cliente.interacoes.slice(0, 3).map((item) => (
                <div key={item.id} className="relative border-l-2 border-[var(--border)] pb-3 pl-6 text-sm">
                  <div className="absolute -left-1 top-0.5 h-3 w-3 rounded-full bg-[var(--text-muted)]" />
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    <span>
                      {item.tipo} {item.canal ? `• ${item.canal}` : ""}
                    </span>
                    <span>{new Date(item.ocorreu_em).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="font-medium leading-relaxed text-[var(--text-primary)]">{item.descricao}</p>
                </div>
              ))
            ) : (
              <div className="relative border-l-2 border-[var(--success)] pb-3 pl-6">
                <div className="absolute -left-1 top-0.5 h-3 w-3 rounded-full bg-[var(--success)]" />
                <div className="flex items-center justify-between text-xs font-semibold uppercase text-[var(--success)]">
                  <span>Venda Convertida • Corretor</span>
                  <span>Há 5 dias</span>
                </div>
                <p className="mt-0.5 font-medium text-[var(--text-primary)]">
                  Contrato de compra e venda assinado no estande de vendas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {abaAtiva === "handoff" && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                Passagem de Bastão (Handoff)
              </h2>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-[var(--inset)] px-2.5 py-1 text-xs font-bold capitalize text-[var(--text-primary)]">
              Status: {statusHandoffLocal.replace(/_/g, " ")}
            </span>
          </div>

          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--inset)] p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">
                🎯 Promessas de Venda Feitas pelo Corretor ({corretor}):
              </span>
              <span className="text-xs text-[var(--text-muted)]">Marque ao auditar</span>
            </div>

            <div className="space-y-2">
              {promessas.map((p) => (
                <div
                  key={p.id}
                  onClick={() => togglePromessa(p.id)}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition ${
                    p.cumprida
                      ? "border-[var(--success-border)] bg-[var(--success-light)] text-[var(--success)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                      p.cumprida ? "border-[var(--success)] bg-[var(--success)] text-white" : "border-[var(--border-strong)]"
                    }`}
                  >
                    {p.cumprida && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${p.cumprida ? "text-[var(--text-muted)] line-through" : ""}`}>
                      {p.descricao}
                    </p>
                    <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      Categoria: {p.categoria.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setStatusHandoffLocal("aceito_cs");
                setMensagemSucesso("Handoff aceito pelo CS! Cliente transferido para a régua de Onboarding.");
                setTimeout(() => setMensagemSucesso(null), 4000);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--success)] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Aceitar Handoff</span>
            </button>
            <button
              onClick={() => {
                setStatusHandoffLocal("devolvido_corretor");
                setMensagemSucesso("Handoff devolvido ao corretor para esclarecimento de promessas.");
                setTimeout(() => setMensagemSucesso(null), 4000);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--danger-border)] bg-[var(--inset)] py-2.5 text-sm font-bold text-[var(--danger)] transition hover:bg-[var(--danger-light)]"
            >
              <X className="h-4 w-4" />
              <span>Devolver ao Corretor</span>
            </button>
          </div>
        </div>
      )}

      {abaAtiva === "historico" && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                Régua de Relacionamento & Timeline
              </h2>
            </div>
            <button
              onClick={() => setModalInteracaoAberto(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--inset)] px-3 py-1.5 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface)]"
            >
              <Plus className="h-4 w-4 text-[var(--accent)]" />
              Registrar Contato
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div className="relative border-l-2 border-[var(--accent)] pb-3 pl-6">
              <div className="absolute -left-1 top-0.5 h-3 w-3 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent-light)]" />
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[var(--accent)]">
                <span>Régua Automática • Onboarding</span>
                <span>Ontem</span>
              </div>
              <p className="mt-0.5 font-medium text-[var(--text-primary)]">
                E-mail de Boas-Vindas e Acesso ao Portal do Cliente disparado com sucesso.
              </p>
            </div>

            {cliente.interacoes && cliente.interacoes.length > 0 ? (
              cliente.interacoes.map((item) => (
                <div key={item.id} className="relative border-l-2 border-[var(--border)] pb-3 pl-6 text-sm">
                  <div className="absolute -left-1 top-0.5 h-3 w-3 rounded-full bg-[var(--text-muted)]" />
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    <span>
                      {item.tipo} {item.canal ? `• ${item.canal}` : ""}
                    </span>
                    <span>{new Date(item.ocorreu_em).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="font-medium leading-relaxed text-[var(--text-primary)]">{item.descricao}</p>
                  {item.resultado && (
                    <div className="mt-1.5 rounded-xl border border-[var(--border)] bg-[var(--inset)] p-2 text-xs text-[var(--text-secondary)]">
                      <strong className="text-[var(--text-primary)]">Resultado: </strong>
                      {item.resultado}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="relative border-l-2 border-[var(--success)] pb-3 pl-6">
                <div className="absolute -left-1 top-0.5 h-3 w-3 rounded-full bg-[var(--success)]" />
                <div className="flex items-center justify-between text-xs font-semibold uppercase text-[var(--success)]">
                  <span>Venda Convertida • Corretor</span>
                  <span>Há 5 dias</span>
                </div>
                <p className="mt-0.5 font-medium text-[var(--text-primary)]">
                  Contrato de compra e venda assinado no estande de vendas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {abaAtiva === "tarefas" && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                Tarefas Operacionais de CS
              </h2>
            </div>
            <button
              onClick={() => setModalTarefaAberto(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--inset)] px-3 py-1.5 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface)]"
            >
              <Plus className="h-4 w-4 text-[var(--accent)]" />
              Nova Tarefa
            </button>
          </div>

          {cliente.tarefas && cliente.tarefas.length > 0 ? (
            <div className="space-y-3">
              {cliente.tarefas.map((tarefa) => {
                const concluida = tarefa.status === "concluida";
                return (
                  <div
                    key={tarefa.id}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm transition ${
                      concluida
                        ? "border-[var(--success-border)] bg-[var(--success-light)] text-[var(--success)]"
                        : "border-[var(--border)] bg-[var(--inset)] text-[var(--text-primary)]"
                    }`}
                  >
                    <button
                      onClick={() => toggleStatusTarefa(tarefa)}
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition ${
                        concluida ? "border-[var(--success)] bg-[var(--success)] text-white" : "border-[var(--border-strong)]"
                      }`}
                    >
                      {concluida && <CheckCircle2 className="h-3 w-3" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className={concluida ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}>
                          {tarefa.titulo}
                        </strong>
                        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-xs font-bold text-[var(--text-secondary)]">
                          Prioridade {tarefa.prioridade}
                        </span>
                      </div>
                      {tarefa.descricao && (
                        <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">{tarefa.descricao}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-[var(--text-secondary)]">Nenhuma tarefa pendente para este cliente.</p>
          )}
        </div>
      )}

      {abaAtiva === "financeiro" && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
              Assessoria de Repasse Financeiro
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--inset)] p-3.5 text-sm">
              <span className="block text-[var(--text-secondary)]">Status do Repasse</span>
              <strong className="mt-0.5 block text-sm font-extrabold capitalize text-[var(--text-primary)]">
                {repasseInfo.status.replace(/_/g, " ")}
              </strong>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--inset)] p-3.5 text-sm">
              <span className="block text-[var(--text-secondary)]">Banco Financiador</span>
              <strong className="mt-0.5 block text-sm font-extrabold text-[var(--text-primary)]">
                {repasseInfo.bancoFinanciador || "Em análise"}
              </strong>
            </div>
          </div>

          {repasseInfo.valorFinanciado && (
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--inset)] p-3.5 text-sm">
              <span className="text-[var(--text-secondary)]">Valor Previsto de Financiamento:</span>
              <strong className="text-sm font-extrabold text-[var(--text-primary)]">
                {valorFormatado(repasseInfo.valorFinanciado)}
              </strong>
            </div>
          )}

          {repasseInfo.pendenciasDocumentais && repasseInfo.pendenciasDocumentais.length > 0 && (
            <div className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-light)] p-3.5 text-sm">
              <div className="mb-1.5 flex items-center gap-1.5 font-bold text-[var(--warning)]">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Pendências Documentais para Repasse:</span>
              </div>
              <ul className="list-inside list-disc space-y-1 text-[var(--text-secondary)]">
                {repasseInfo.pendenciasDocumentais.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <NovaInteracaoModal
        aberto={modalInteracaoAberto}
        clienteId={cliente.id}
        nomeCliente={cliente.pessoa?.nome || "Lead"}
        aoFechar={() => setModalInteracaoAberto(false)}
        aoSalvar={() => {
          setModalInteracaoAberto(false);
          recarregarCliente();
        }}
      />

      <NovaTarefaModal
        aberto={modalTarefaAberto}
        clienteId={cliente.id}
        nomeCliente={cliente.pessoa?.nome || "Lead"}
        aoFechar={() => setModalTarefaAberto(false)}
        aoSalvar={() => {
          setModalTarefaAberto(false);
          recarregarCliente();
        }}
      />

      <HandoffModal
        aberto={modalHandoffAberto}
        clienteId={cliente.id}
        nomeCliente={cliente.pessoa?.nome || "Lead"}
        aoFechar={() => setModalHandoffAberto(false)}
        aoSalvar={() => {
          setModalHandoffAberto(false);
          recarregarCliente();
        }}
      />
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  MessageSquare,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Building,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Plus,
  Tag,
  ShieldAlert,
  Send,
  Building2,
  FileText,
  AlertTriangle,
  Repeat,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { ClienteCompleto, TarefaItem, PromessaVenda, TermometroCX } from "@/lib/segmentacao/tipos";
import { finalidadeConfig, statusConfig, confiancaConfig, termometroCXConfig } from "./ClienteCard";
import NovaInteracaoModal from "./NovaInteracaoModal";
import NovaTarefaModal from "./NovaTarefaModal";
import HandoffModal from "./HandoffModal";
import { executeGraphQL, QUERIES, MUTATIONS } from "@/lib/graphql-client";

interface ClienteProfileProps {
  clienteInicial: ClienteCompleto;
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
  const confianca = confiancaConfig[cliente.nivel_confianca] || confiancaConfig.baixa;
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

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Voltar para Gestão de Clientes</span>
        </Link>

        <button
          onClick={handleReclassificar}
          disabled={reclassificando}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
        >
          <RefreshCw className={`h-4 w-4 ${reclassificando ? "animate-spin" : ""}`} />
          <span>{reclassificando ? "Recalculando..." : "Recalcular Classificação"}</span>
        </button>
      </div>

      {mensagemSucesso && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 dark:text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Banner de Alerta Crítico (Comitê de Distrato) */}
      {alertaDistratoAtivo && (
        <div className="flex flex-col gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-rose-900 dark:bg-rose-500/15">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-950 dark:text-rose-300">
                Comitê de Prevenção a Distrato Acionado!
              </h3>
              <p className="mt-0.5 text-sm text-rose-800 dark:text-rose-200">
                Cliente sob risco iminente de cancelamento de contrato. Prioridade de atendimento nível 1 para a equipe de CS e Retenção.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertaDistratoAtivo(false)}
            className="self-start rounded-xl bg-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-950 transition hover:bg-rose-300 sm:self-center dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
          >
            Encerrar Protocolo
          </button>
        </div>
      )}

      {/* 1. Header 360° Profile Card */}
      <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cxBadge.bg} ${cxBadge.text} ${cxBadge.border}`}>
                {cxBadge.label}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {finalidade.label}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
                {cliente.origem_fluxo === "re_trabalho" ? "♻️ Base de Re-trabalho" : "⚡ Novos Dados (Tempo Real)"}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              {cliente.pessoa?.nome || "Lead Sem Nome"}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
                <Building2 className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                {empreendimento} {cliente.unidade ? `(${cliente.unidade})` : ""}
              </span>
              {cliente.pessoa?.telefone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  {cliente.pessoa.telefone}
                </span>
              )}
              {cliente.pessoa?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  {cliente.pessoa.email}
                </span>
              )}
              {cliente.pessoa?.documento && (
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  CPF/Doc: {cliente.pessoa.documento}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-slate-500 dark:text-zinc-400">
              <span><strong className="text-slate-700 dark:text-zinc-200">Corretor Original:</strong> {corretor}</span>
              <span>•</span>
              <span><strong className="text-slate-700 dark:text-zinc-200">Analista CS:</strong> {analistaCS}</span>
            </div>
          </div>

          {/* Completeness, Health Score & Emergency Action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <button
              onClick={handleAcionarComiteDistrato}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Acionar Comitê de Prevenção a Distrato</span>
            </button>

            <div className="w-full rounded-2xl bg-slate-50 p-3 text-sm sm:w-60 dark:bg-zinc-800/60">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-zinc-400">Score de Relacionamento</span>
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{scoreSaude}/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    scoreSaude >= 80 ? "bg-emerald-600" : scoreSaude >= 50 ? "bg-amber-500" : "bg-rose-600"
                  }`}
                  style={{ width: `${scoreSaude}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Barra de Ações Rápidas & Integrações */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-zinc-700">
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
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
              >
                <MessageSquare className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>Mensagem EZ Chat (WhatsApp)</span>
              </button>
            )}

            <button
              onClick={() => setModalInteracaoAberto(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
            >
              <Send className="h-4 w-4" />
              <span>Disparo de E-mail da Régua</span>
            </button>

            <button
              onClick={() => {
                setMensagemSucesso("Cliente sinalizado no CRM para oferta de 2º Imóvel (Investimento)!");
                setTimeout(() => setMensagemSucesso(null), 4000);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-sm font-semibold text-purple-900 transition hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-500/15 dark:text-purple-300 dark:hover:bg-purple-500/25"
            >
              <Sparkles className="h-4 w-4 text-purple-700 dark:text-purple-400" />
              <span>Mapear Up-Sell / 2º Imóvel</span>
            </button>
          </div>

          <button
            onClick={() => setModalHandoffAberto(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Repeat className="h-4 w-4" />
            <span>Revisar Handoff</span>
          </button>
        </div>

        {/* Missing fields alert */}
        {cliente.campos_faltantes && cliente.campos_faltantes.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-500/15">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Dados cadastrais ausentes para atingir 100% de qualificação:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {cliente.campos_faltantes.map((campo) => (
                <span
                  key={campo}
                  className="rounded-full bg-white px-2.5 py-1 text-sm font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-zinc-800 dark:text-amber-300 dark:ring-amber-700"
                >
                  {campo.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid de 2 Colunas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Handoff, Promessas e Repasse Financeiro */}
        <div className="space-y-6 lg:col-span-6">
          {/* MÓDULO DE HANDOFF (Passagem de Bastão & Promessas de Venda) */}
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-zinc-100">
                  Passagem de Bastão (Handoff)
                </h2>
              </div>
              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800 ring-1 ring-purple-100 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-900/40">
                Status: {statusHandoffLocal.replace(/_/g, " ")}
              </span>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                  🎯 Promessas de Venda Feitas pelo Corretor ({corretor}):
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">Marque ao auditar</span>
              </div>

              <div className="space-y-2">
                {promessas.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => togglePromessa(p.id)}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition ${
                      p.cumprida
                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                        p.cumprida ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-zinc-600"
                      }`}
                    >
                      {p.cumprida && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${p.cumprida ? "text-stone-500 line-through" : ""}`}>
                        {p.descricao}
                      </p>
                      <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-zinc-500">
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
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
              >
                <X className="h-4 w-4" />
                <span>Devolver ao Corretor</span>
              </button>
            </div>
          </div>

          {/* MÓDULO FINANCEIRO / REPASSE */}
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-zinc-100">
                Assessoria de Repasse Financeiro
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-zinc-800/60">
                <span className="block text-slate-500 dark:text-zinc-400">Status do Repasse</span>
                <strong className="mt-0.5 block text-sm font-semibold capitalize text-slate-900 dark:text-zinc-100">
                  {repasseInfo.status.replace(/_/g, " ")}
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-zinc-800/60">
                <span className="block text-slate-500 dark:text-zinc-400">Banco Financiador</span>
                <strong className="mt-0.5 block text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {repasseInfo.bancoFinanciador || "Em análise"}
                </strong>
              </div>
            </div>

            {repasseInfo.valorFinanciado && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/60">
                <span className="text-slate-500 dark:text-zinc-400">Valor Previsto de Financiamento:</span>
                <strong className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {valorFormatado(repasseInfo.valorFinanciado)}
                </strong>
              </div>
            )}

            {repasseInfo.pendenciasDocumentais && repasseInfo.pendenciasDocumentais.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm dark:border-amber-900 dark:bg-amber-500/15">
                <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Pendências Documentais para Repasse:</span>
                </div>
                <ul className="list-inside list-disc space-y-1 text-amber-800 dark:text-amber-200">
                  {repasseInfo.pendenciasDocumentais.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline da Régua e Tarefas */}
        <div className="space-y-6 lg:col-span-6">
          {/* Timeline da Régua de Relacionamento */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-zinc-100">
                  Régua de Relacionamento & Timeline
                </h2>
              </div>
              <button
                onClick={() => setModalInteracaoAberto(true)}
                className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-slate-900 dark:text-zinc-200 dark:hover:text-zinc-100"
              >
                <Plus className="h-4 w-4" />
                Registrar Contato
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Eventos automáticos e manuais combinados */}
              <div className="relative border-l-2 border-purple-400 pb-3 pl-6">
                <div className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/40" />
                <div className="flex items-center justify-between text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">
                  <span>Régua Automática • Onboarding</span>
                  <span>Ontem</span>
                </div>
                <p className="mt-0.5 font-medium text-slate-900 dark:text-zinc-100">
                  E-mail de Boas-Vindas e Acesso ao Portal do Cliente disparado com sucesso.
                </p>
              </div>

              {cliente.interacoes && cliente.interacoes.length > 0 ? (
                cliente.interacoes.map((item) => (
                  <div key={item.id} className="relative border-l-2 border-slate-200 pb-3 pl-6 text-sm dark:border-zinc-700">
                    <div className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-slate-900 dark:bg-zinc-100" />
                    <div className="mb-1 flex items-center justify-between gap-2 text-slate-400 dark:text-zinc-500">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                        {item.tipo} {item.canal ? `• ${item.canal}` : ""}
                      </span>
                      <span>{new Date(item.ocorreu_em).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <p className="font-medium leading-relaxed text-slate-900 dark:text-zinc-100">{item.descricao}</p>
                    {item.resultado && (
                      <div className="mt-1.5 rounded-lg bg-slate-50 p-2 text-xs text-slate-500 dark:bg-zinc-800/60 dark:text-zinc-400">
                        <strong className="text-slate-700 dark:text-zinc-200">Resultado: </strong>
                        {item.resultado}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative border-l-2 border-emerald-400 pb-3 pl-6">
                  <div className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-emerald-600" />
                  <div className="flex items-center justify-between text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                    <span>Venda Convertida • Corretor</span>
                    <span>Há 5 dias</span>
                  </div>
                  <p className="mt-0.5 font-medium text-slate-900 dark:text-zinc-100">
                    Contrato de compra e venda assinado no estande de vendas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tarefas Operacionais de CS */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-zinc-100">
                  Tarefas Operacionais de CS
                </h2>
              </div>
              <button
                onClick={() => setModalTarefaAberto(true)}
                className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-slate-900 dark:text-zinc-200 dark:hover:text-zinc-100"
              >
                <Plus className="h-4 w-4" />
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
                      className={`flex items-start gap-3 rounded-2xl border p-3.5 text-sm transition ${
                        concluida
                          ? "border-emerald-200 bg-emerald-50/40 text-emerald-900 opacity-75 dark:border-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                          : "border-slate-100 bg-slate-50 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100"
                      }`}
                    >
                      <button
                        onClick={() => toggleStatusTarefa(tarefa)}
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition ${
                          concluida ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
                        }`}
                      >
                        {concluida && <CheckCircle2 className="h-3 w-3" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <strong className={concluida ? "text-stone-500 line-through" : "text-slate-900"}>
                            {tarefa.titulo}
                          </strong>
                          <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                            Prioridade {tarefa.prioridade}
                          </span>
                        </div>
                        {tarefa.descricao && (
                          <p className="mt-1 leading-relaxed text-slate-500 dark:text-zinc-400">{tarefa.descricao}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400 dark:text-zinc-500">Nenhuma tarefa pendente para este cliente.</p>
            )}
          </div>
        </div>
      </div>

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


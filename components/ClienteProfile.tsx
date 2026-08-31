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
} from "lucide-react";
import { ClienteCompleto, TarefaItem } from "@/lib/segmentacao/tipos";
import { finalidadeConfig, statusConfig, confiancaConfig } from "./ClienteCard";
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
        setMensagemSucesso("Classificação recalculada via GraphQL com sucesso!");
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

  const valorFormatado = (val: number | null | undefined) =>
    val != null
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val)
      : "Não informado";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b625d] hover:text-[#1e2722] transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Voltar para Lista de Clientes</span>
        </Link>

        <button
          onClick={handleReclassificar}
          disabled={reclassificando}
          className="flex items-center gap-2 rounded-xl border border-[#d9d2c6] bg-white px-4 py-2 text-xs font-semibold text-[#1e2722] shadow-xs hover:bg-[#f5f1e9] transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#b25c3f] ${reclassificando ? "animate-spin" : ""}`} />
          <span>{reclassificando ? "Recalculando..." : "Recalcular Classificação"}</span>
        </button>
      </div>

      {mensagemSucesso && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Main Header 360° Profile Card */}
      <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {finalidade.label}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${confianca.bg}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {confianca.label}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#1e2722]">
              {cliente.pessoa?.nome || "Lead Sem Nome"}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#5b625d]">
              {cliente.pessoa?.telefone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-[#b25c3f]" />
                  {cliente.pessoa.telefone}
                </span>
              )}
              {cliente.pessoa?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-[#b25c3f]" />
                  {cliente.pessoa.email}
                </span>
              )}
              {cliente.pessoa?.documento && (
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-[#b25c3f]" />
                  Doc: {cliente.pessoa.documento}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#b25c3f]" />
                Origem: <strong className="capitalize">{cliente.pessoa?.origem || "manual"}</strong>
              </span>
            </div>
          </div>

          {/* Completeness & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div className="w-full sm:w-60 rounded-2xl bg-[#f5f1e9] p-4 text-xs">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-[#5b625d]">Índice de Completude</span>
                <span className="font-bold text-sm text-[#1e2722]">{completudeNum}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#ded6c7]">
                <div
                  className={`h-full transition-all duration-500 ${
                    completudeNum >= 80 ? "bg-emerald-600" : completudeNum >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${completudeNum}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setModalInteracaoAberto(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2 text-xs font-semibold text-[#1e2722] shadow-xs hover:bg-[#f5f1e9] transition"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#b25c3f]" />
                <span>Interação</span>
              </button>
              <button
                onClick={() => setModalTarefaAberto(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2 text-xs font-semibold text-[#1e2722] shadow-xs hover:bg-[#f5f1e9] transition"
              >
                <CheckSquare className="h-3.5 w-3.5 text-[#1e2722]" />
                <span>Tarefa</span>
              </button>
              <button
                onClick={() => setModalHandoffAberto(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#b25c3f] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#974b32] transition"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Handoff</span>
              </button>
            </div>
          </div>
        </div>

        {/* Missing fields alert banner */}
        {cliente.campos_faltantes && cliente.campos_faltantes.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#eed4c8] bg-[#fff5f0] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#a34426]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Dados ausentes para atingir 100% de qualificação:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {cliente.campos_faltantes.map((campo) => (
                <span
                  key={campo}
                  className="rounded-lg bg-[#ffe8df] px-2.5 py-1 text-xs font-semibold text-[#8c351b]"
                >
                  {campo.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Preferences & Intelligence */}
        <div className="space-y-6 lg:col-span-6">
          {/* Section: Próxima Ação & Sinais */}
          <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#b25c3f]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1e2722]">
                Diagnóstico & Próxima Ação
              </h2>
            </div>

            {cliente.proxima_acao && (
              <div className="rounded-2xl border border-[#d9d2c6] bg-[#f9f7f2] p-4 text-xs">
                <span className="font-bold text-[#1e2722] block mb-1">Diretriz Estratégica:</span>
                <p className="text-[#5b625d] leading-relaxed text-sm">{cliente.proxima_acao}</p>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="text-xs">
                <span className="font-semibold text-[#1e2722] block mb-1">Sinais Identificados pelo Motor:</span>
                {cliente.sinais_classificacao && cliente.sinais_classificacao.length > 0 ? (
                  <ul className="space-y-1">
                    {cliente.sinais_classificacao.map((sinal, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-[#5b625d]">
                        <span className="text-[#b25c3f] font-bold">•</span>
                        <span>{sinal}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#8b918c]">Nenhum sinal específico detectado até o momento.</p>
                )}
              </div>

              {cliente.finalidades_secundarias && cliente.finalidades_secundarias.length > 0 && (
                <div className="text-xs pt-2 border-t border-[#ede6d8]">
                  <span className="font-semibold text-[#1e2722] block mb-1">Finalidades Secundárias:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cliente.finalidades_secundarias.map((f) => (
                      <span key={f} className="rounded-md bg-[#f5f1e9] px-2 py-0.5 text-xs text-[#1e2722]">
                        {finalidadeConfig[f]?.label || f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Preferências de Compra e Imóvel */}
          <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-4 w-4 text-[#b25c3f]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1e2722]">
                Perfil de Busca e Imóvel
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-[#f5f1e9] p-3.5">
                <span className="text-[#68706a] block">Tipo de Imóvel</span>
                <strong className="text-sm text-[#1e2722] mt-0.5 block">
                  {cliente.tipo_imovel || "Não informado"}
                </strong>
              </div>

              <div className="rounded-2xl bg-[#f5f1e9] p-3.5">
                <span className="text-[#68706a] block">Padrão</span>
                <strong className="text-sm text-[#1e2722] mt-0.5 block">
                  {cliente.padrao_imovel || "Não especificado"}
                </strong>
              </div>

              <div className="rounded-2xl bg-[#f5f1e9] p-3.5">
                <span className="text-[#68706a] block">Região / Bairro</span>
                <strong className="text-sm text-[#1e2722] mt-0.5 block">
                  {[cliente.bairro_interesse, cliente.cidade_interesse || cliente.regiao_interesse].filter(Boolean).join(" - ") || "Não informado"}
                </strong>
              </div>

              <div className="rounded-2xl bg-[#f5f1e9] p-3.5">
                <span className="text-[#68706a] block">Prazo Pretendido</span>
                <strong className="text-sm text-[#1e2722] mt-0.5 block">
                  {cliente.prazo_compra || "Não informado"}
                </strong>
              </div>

              <div className="rounded-2xl bg-[#f5f1e9] p-3.5">
                <span className="text-[#68706a] block">Faixa de Investimento</span>
                <strong className="text-sm text-[#1e2722] mt-0.5 block">
                  {cliente.valor_minimo || cliente.valor_maximo
                    ? `${valorFormatado(cliente.valor_minimo)} até ${valorFormatado(cliente.valor_maximo)}`
                    : "Não informado"}
                </strong>
              </div>

              <div className="rounded-2xl bg-[#f5f1e9] p-3.5">
                <span className="text-[#68706a] block">Forma de Pagamento</span>
                <strong className="text-sm text-[#1e2722] mt-0.5 block">
                  {cliente.forma_pagamento || "Não informado"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline, Tasks & Handoffs */}
        <div className="space-y-6 lg:col-span-6">
          {/* Tasks Section */}
          <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[#b25c3f]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#1e2722]">
                  Tarefas de Pós-Atendimento
                </h2>
              </div>
              <button
                onClick={() => setModalTarefaAberto(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#b25c3f] hover:text-[#974b32]"
              >
                <Plus className="h-3.5 w-3.5" />
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
                      className={`flex items-start gap-3 rounded-2xl border p-3.5 text-xs transition ${
                        concluida
                          ? "border-emerald-200 bg-emerald-50/40 text-emerald-900 opacity-75"
                          : "border-[#d9d2c6] bg-[#faf8f2] text-[#1e2722]"
                      }`}
                    >
                      <button
                        onClick={() => toggleStatusTarefa(tarefa)}
                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md border transition ${
                          concluida ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-400 bg-white"
                        }`}
                      >
                        {concluida && <CheckCircle2 className="h-3 w-3" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <strong className={concluida ? "line-through text-stone-500" : "text-[#1e2722]"}>
                            {tarefa.titulo}
                          </strong>
                          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold border border-[#ded6c7]">
                            Prioridade {tarefa.prioridade}
                          </span>
                        </div>
                        {tarefa.descricao && (
                          <p className="mt-1 text-[#5b625d] leading-relaxed">{tarefa.descricao}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#8b918c] py-4 text-center">Nenhuma tarefa pendente para este cliente.</p>
            )}
          </div>

          {/* Interactions Timeline */}
          <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#b25c3f]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#1e2722]">
                  Histórico de Interações
                </h2>
              </div>
              <button
                onClick={() => setModalInteracaoAberto(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#b25c3f] hover:text-[#974b32]"
              >
                <Plus className="h-3.5 w-3.5" />
                Registrar Contato
              </button>
            </div>

            {cliente.interacoes && cliente.interacoes.length > 0 ? (
              <div className="space-y-4">
                {cliente.interacoes.map((item) => (
                  <div key={item.id} className="relative pl-6 border-l-2 border-[#ded6c7] pb-2 text-xs">
                    <div className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-[#b25c3f]" />
                    <div className="flex items-center justify-between gap-2 text-[#8b918c] mb-1">
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-[#b25c3f]">
                        {item.tipo} {item.canal ? `• ${item.canal}` : ""}
                      </span>
                      <span>{new Date(item.ocorreu_em).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <p className="text-[#1e2722] font-medium leading-relaxed">{item.descricao}</p>
                    {item.resultado && (
                      <div className="mt-1.5 rounded-lg bg-[#f5f1e9] p-2 text-[11px] text-[#5b625d]">
                        <strong className="text-[#1e2722]">Resultado: </strong>
                        {item.resultado}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8b918c] py-4 text-center">Nenhuma interação registrada ainda.</p>
            )}
          </div>

          {/* Handoff Section */}
          {cliente.handoffs && cliente.handoffs.length > 0 && (
            <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRightLeft className="h-4 w-4 text-[#b25c3f]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#1e2722]">
                  Passagem de Bastão (Handoffs)
                </h2>
              </div>

              <div className="space-y-3">
                {cliente.handoffs.map((h) => (
                  <div key={h.id} className="rounded-2xl border border-[#d9d2c6] bg-[#f9f7f2] p-4 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <strong className="text-sm text-[#1e2722]">{h.motivo || "Transição"}</strong>
                      <span className="rounded bg-[#ffe8df] text-[#8c351b] px-2 py-0.5 text-[10px] font-bold uppercase">
                        {h.status}
                      </span>
                    </div>
                    {h.resumo && <p className="text-[#5b625d] leading-relaxed">{h.resumo}</p>}
                    {h.expectativa_cliente && (
                      <p className="text-[11px] text-[#1e2722]">
                        <strong>Expectativa: </strong> {h.expectativa_cliente}
                      </p>
                    )}
                    {h.pendencias && h.pendencias.length > 0 && (
                      <div className="pt-2 border-t border-[#ede6d8]">
                        <strong className="block text-[11px] text-[#1e2722] mb-1">Checklist:</strong>
                        <ul className="space-y-1">
                          {h.pendencias.map((p, idx) => (
                            <li key={idx} className="text-[#5b625d]">• {p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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

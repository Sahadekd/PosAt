"use client";

import Link from "next/link";
import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  MessageSquarePlus,
  CheckSquare,
  Sparkles,
  ShieldCheck,
  Building,
} from "lucide-react";
import { ClienteCompleto, FinalidadeCliente, NivelConfianca, StatusRelacionamento } from "@/lib/segmentacao/tipos";
import NovaInteracaoModal from "./NovaInteracaoModal";
import NovaTarefaModal from "./NovaTarefaModal";
import HandoffModal from "./HandoffModal";

interface ClienteCardProps {
  cliente: ClienteCompleto;
  onAtualizado?: () => void;
}

export const finalidadeConfig: Record<
  FinalidadeCliente,
  { label: string; bg: string; text: string; border: string }
> = {
  primeiro_imovel: {
    label: "Primeiro Imóvel",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  moradia: {
    label: "Moradia",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  investimento: {
    label: "Investidor Confirmado",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  possivel_investidor: {
    label: "Possível Investidor",
    bg: "bg-amber-50/70",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  upgrade: {
    label: "Upgrade Residencial",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  segunda_residencia: {
    label: "Segunda Residência",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  compra_para_familiar: {
    label: "Compra Familiar",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  locacao: {
    label: "Locação",
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
  },
  imovel_comercial: {
    label: "Comercial / Lajes",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  cliente_recorrente: {
    label: "Cliente Recorrente",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  potencial_indicacao: {
    label: "Potencial Indicação",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  nao_identificado: {
    label: "Sem Perfil Definido",
    bg: "bg-stone-100",
    text: "text-stone-600",
    border: "border-stone-200",
  },
};

export const statusConfig: Record<
  StatusRelacionamento,
  { label: string; bg: string; text: string }
> = {
  novo_lead: { label: "Novo Lead", bg: "bg-blue-100", text: "text-blue-800" },
  em_qualificacao: { label: "Em Qualificação", bg: "bg-amber-100", text: "text-amber-800" },
  em_negociacao: { label: "Em Negociação", bg: "bg-indigo-100", text: "text-indigo-800" },
  convertido: { label: "Convertido (Vendido)", bg: "bg-emerald-100", text: "text-emerald-800" },
  handoff_pendente: { label: "Handoff Pendente", bg: "bg-rose-100", text: "text-rose-800" },
  onboarding: { label: "Onboarding", bg: "bg-purple-100", text: "text-purple-800" },
  pos_venda: { label: "Pós-Venda Ativo", bg: "bg-teal-100", text: "text-teal-800" },
  cliente_ativo: { label: "Cliente Ativo", bg: "bg-emerald-100", text: "text-emerald-800" },
  cliente_inativo: { label: "Inativo", bg: "bg-stone-200", text: "text-stone-700" },
  reativacao: { label: "Reativação", bg: "bg-yellow-100", text: "text-yellow-800" },
  sem_resposta: { label: "Sem Resposta", bg: "bg-stone-200", text: "text-stone-600" },
  encerrado: { label: "Encerrado", bg: "bg-stone-300", text: "text-stone-700" },
};

export const confiancaConfig: Record<
  NivelConfianca,
  { label: string; bg: string; text: string }
> = {
  alta: { label: "Confiança Alta", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700" },
  media: { label: "Confiança Média", bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700" },
  baixa: { label: "Confiança Baixa", bg: "bg-stone-100 text-stone-600 border-stone-200", text: "text-stone-600" },
  revisao_necessaria: { label: "Revisão Necessária", bg: "bg-rose-50 text-rose-700 border-rose-200", text: "text-rose-700" },
};

export default function ClienteCard({ cliente, onAtualizado }: ClienteCardProps) {
  const [modalInteracaoAberto, setModalInteracaoAberto] = useState(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [modalHandoffAberto, setModalHandoffAberto] = useState(false);

  const finalidade = finalidadeConfig[cliente.finalidade_principal] || finalidadeConfig.nao_identificado;
  const status = statusConfig[cliente.status] || { label: cliente.status, bg: "bg-stone-100", text: "text-stone-700" };
  const confianca = confiancaConfig[cliente.nivel_confianca] || confiancaConfig.baixa;

  const completudeNum = Number(cliente.indice_completude || 0);

  let completudeBarColor = "bg-rose-500";
  if (completudeNum >= 80) completudeBarColor = "bg-emerald-600";
  else if (completudeNum >= 50) completudeBarColor = "bg-amber-500";

  const nome = cliente.pessoa?.nome || "Lead Sem Nome";
  const telefone = cliente.pessoa?.telefone;
  const email = cliente.pessoa?.email;

  const valorFormatado = cliente.valor_maximo
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(cliente.valor_maximo)
    : null;

  return (
    <>
      <article className="group relative flex flex-col justify-between rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-[#b25c3f]/50">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-[#ede6d8] pb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}>
                  <Sparkles className="h-3 w-3" />
                  {finalidade.label}
                </span>
              </div>

              <h2 className="mt-2.5 text-xl font-bold text-[#1e2722] group-hover:text-[#b25c3f] transition-colors">
                <Link href={`/clientes/${cliente.id}`}>{nome}</Link>
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#68706a]">
                {telefone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-[#b25c3f]" />
                    {telefone}
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-[#b25c3f]" />
                    {email}
                  </span>
                )}
                {(cliente.bairro_interesse || cliente.cidade_interesse || cliente.regiao_interesse) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#b25c3f]" />
                    {[cliente.bairro_interesse, cliente.cidade_interesse || cliente.regiao_interesse].filter(Boolean).join(" - ")}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold ${confianca.bg}`}>
                <ShieldCheck className="h-3 w-3" />
                {confianca.label}
              </span>
            </div>
          </div>

          {/* Indicators: Completude & Budget */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f5f1e9] p-3">
              <div className="flex items-center justify-between text-xs text-[#68706a]">
                <span>Completude</span>
                <span className="font-bold text-[#1e2722]">{completudeNum}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e3dccf]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completudeBarColor}`}
                  style={{ width: `${completudeNum}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#f5f1e9] p-3 text-xs">
              <span className="text-[#68706a]">Interesse / Faixa</span>
              <p className="mt-0.5 truncate font-semibold text-[#1e2722]">
                {valorFormatado ? `Até ${valorFormatado}` : cliente.tipo_imovel || "Não especificado"}
              </p>
            </div>
          </div>

          {/* Missing Fields Alert */}
          {cliente.campos_faltantes && cliente.campos_faltantes.length > 0 && (
            <div className="mt-3.5 rounded-2xl border border-[#eed4c8] bg-[#fff5f0] p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#a34426]">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Dados necessários para qualificação</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {cliente.campos_faltantes.map((campo) => (
                  <span
                    key={campo}
                    className="rounded-md bg-[#ffe8df] px-1.5 py-0.5 text-[10px] font-medium text-[#8c351b]"
                  >
                    {campo.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Action */}
          {cliente.proxima_acao && (
            <div className="mt-3.5 rounded-2xl border border-[#d9d2c6] bg-[#f9f7f2] p-3 text-xs">
              <span className="font-semibold text-[#1e2722]">Próxima Ação Sugerida:</span>
              <p className="mt-1 text-[#5b625d] leading-relaxed">{cliente.proxima_acao}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#ede6d8] pt-4">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setModalInteracaoAberto(true)}
              title="Registrar Interação"
              className="flex items-center gap-1 rounded-xl border border-[#d9d2c6] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1e2722] hover:bg-[#f5f1e9] transition shadow-xs"
            >
              <MessageSquarePlus className="h-3.5 w-3.5 text-[#b25c3f]" />
              <span className="hidden sm:inline">Interação</span>
            </button>

            <button
              onClick={() => setModalTarefaAberto(true)}
              title="Criar Tarefa de Pós-Atendimento"
              className="flex items-center gap-1 rounded-xl border border-[#d9d2c6] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1e2722] hover:bg-[#f5f1e9] transition shadow-xs"
            >
              <CheckSquare className="h-3.5 w-3.5 text-[#1e2722]" />
              <span className="hidden sm:inline">Tarefa</span>
            </button>

            <button
              onClick={() => setModalHandoffAberto(true)}
              title="Passagem de Bastão (Handoff)"
              className="flex items-center gap-1 rounded-xl border border-[#b25c3f]/30 bg-[#fff5f0] px-2.5 py-1.5 text-xs font-medium text-[#b25c3f] hover:bg-[#ffe8df] transition shadow-xs"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Handoff</span>
            </button>
          </div>

          <Link
            href={`/clientes/${cliente.id}`}
            className="inline-flex items-center gap-1 rounded-xl bg-[#1e2722] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#b25c3f]"
          >
            <span>Ver Perfil 360°</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>

      <NovaInteracaoModal
        aberto={modalInteracaoAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalInteracaoAberto(false)}
        aoSalvar={() => {
          setModalInteracaoAberto(false);
          onAtualizado?.();
        }}
      />

      <NovaTarefaModal
        aberto={modalTarefaAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalTarefaAberto(false)}
        aoSalvar={() => {
          setModalTarefaAberto(false);
          onAtualizado?.();
        }}
      />

      <HandoffModal
        aberto={modalHandoffAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalHandoffAberto(false)}
        aoSalvar={() => {
          setModalHandoffAberto(false);
          onAtualizado?.();
        }}
      />
    </>
  );
}

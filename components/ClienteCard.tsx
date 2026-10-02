"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  ArrowRight,
  MessageSquarePlus,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  ClienteCompleto,
  FinalidadeCliente,
  NivelConfianca,
  StatusRelacionamento,
} from "@/lib/segmentacao/tipos";
import NovaInteracaoModal from "./NovaInteracaoModal";
import NovaTarefaModal from "./NovaTarefaModal";
import HandoffModal from "./HandoffModal";

interface ClienteCardProps {
  cliente: ClienteCompleto;
  onAtualizado?: () => void;
}

// ─── Config maps (exported for use in Filters/Board) ───

export const finalidadeConfig: Record<
  FinalidadeCliente,
  { label: string; bg: string; text: string; border: string }
> = {
  primeiro_imovel:    { label: "Primeiro Imóvel",      bg: "bg-blue-50",      text: "text-blue-700",      border: "border-blue-500/30" },
  moradia:            { label: "Moradia",               bg: "bg-emerald-50",     text: "text-emerald-700",     border: "border-emerald-500/30" },
  investimento:       { label: "Investidor",            bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-500/30" },
  possivel_investidor:{ label: "Possível Invest.",      bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-500/25" },
  upgrade:            { label: "Upgrade",               bg: "bg-purple-50",    text: "text-purple-700",    border: "border-purple-500/30" },
  segunda_residencia: { label: "2ª Residência",         bg: "bg-teal-50",     text: "text-teal-700",     border: "border-teal-500/30" },
  compra_para_familiar:{ label: "Compra Familiar",       bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-500/30" },
  locacao:            { label: "Locação",               bg: "bg-[var(--inset)]",     text: "text-[var(--text-secondary)]",     border: "border-[var(--border)]" },
  imovel_comercial:   { label: "Comercial",             bg: "bg-orange-50",   text: "text-orange-700",   border: "border-orange-500/30" },
  cliente_recorrente: { label: "Recorrente",            bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-500/30" },
  potencial_indicacao:{ label: "Indicação",             bg: "bg-rose-50",     text: "text-rose-700",     border: "border-rose-500/30" },
  nao_identificado:   { label: "Sem perfil",            bg: "bg-[var(--inset)]",     text: "text-[var(--text-secondary)]",     border: "border-[var(--border)]" },
};

export const statusConfig: Record<
  StatusRelacionamento,
  { label: string; bg: string; text: string }
> = {
  novo_lead:        { label: "Novo Lead",          bg: "bg-blue-50",    text: "text-blue-700" },
  em_qualificacao:  { label: "Em Qualificação",    bg: "bg-amber-50",   text: "text-amber-700" },
  em_negociacao:    { label: "Em Negociação",      bg: "bg-indigo-50",  text: "text-indigo-700" },
  convertido:       { label: "Convertido",         bg: "bg-emerald-50", text: "text-emerald-700" },
  handoff_pendente: { label: "Handoff Pendente",   bg: "bg-rose-50",    text: "text-rose-700" },
  onboarding:       { label: "Onboarding",         bg: "bg-purple-50",  text: "text-purple-700" },
  pos_venda:        { label: "Pós-Venda",          bg: "bg-teal-50",    text: "text-teal-700" },
  cliente_ativo:    { label: "Ativo",              bg: "bg-emerald-50", text: "text-emerald-700" },
  cliente_inativo:  { label: "Inativo",            bg: "bg-[var(--inset)]",   text: "text-[var(--text-secondary)]" },
  reativacao:       { label: "Reativação",         bg: "bg-amber-50",  text: "text-amber-700" },
  sem_resposta:     { label: "Sem Resposta",       bg: "bg-[var(--inset)]",   text: "text-[var(--text-secondary)]" },
  encerrado:        { label: "Encerrado",          bg: "bg-[var(--inset)]",   text: "text-[var(--text-secondary)]" },
};

export const confiancaConfig: Record<
  NivelConfianca,
  { label: string; bg: string; text: string }
> = {
  alta:              { label: "Alta",             bg: "bg-emerald-50 text-emerald-700 border-emerald-500/30",  text: "text-emerald-700" },
  media:             { label: "Média",            bg: "bg-amber-50 text-amber-700 border-amber-500/30",          text: "text-amber-700" },
  baixa:             { label: "Baixa",            bg: "bg-[var(--inset)] text-[var(--text-secondary)] border-[var(--border)]",             text: "text-[var(--text-secondary)]" },
  revisao_necessaria:{ label: "Revisão",          bg: "bg-rose-50 text-rose-700 border-rose-500/30",             text: "text-rose-700" },
};

export const termometroCXConfig: Record<
  string,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  promotor_mgm:        { label: "Promotor / MGM",   dot: "bg-emerald-500", bg: "bg-emerald-50",   text: "text-emerald-700",   border: "border-emerald-500/30" },
  neutro_nutricao:     { label: "Neutro",            dot: "bg-amber-500",   bg: "bg-amber-50",     text: "text-amber-700",     border: "border-amber-500/30" },
  insatisfeito_distrato: { label: "Risco de Distrato", dot: "bg-rose-500",  bg: "bg-rose-50",     text: "text-rose-700",     border: "border-rose-500/30" },
};

// ─── Avatar helper ───
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

// Cores semânticas para o status (verde saudável / amarelo atenção / vermelho risco / azul info / cinza secundário)
const STATUS_COR: Record<string, string> = {
  novo_lead: "var(--accent)",
  em_qualificacao: "var(--warning)",
  em_negociacao: "var(--warning)",
  convertido: "var(--success)",
  handoff_pendente: "var(--danger)",
  onboarding: "var(--accent)",
  pos_venda: "var(--success)",
  cliente_ativo: "var(--success)",
  cliente_inativo: "var(--text-muted)",
  reativacao: "var(--accent)",
  sem_resposta: "var(--danger)",
  encerrado: "var(--text-muted)",
};

function tempoRelativo(iso?: string | null): string | null {
  if (!iso) return null;
  const data = new Date(iso);
  if (isNaN(data.getTime())) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data);
  alvo.setHours(0, 0, 0, 0);
  const dias = Math.round((hoje.getTime() - alvo.getTime()) / 86400000);
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Ontem";
  if (dias <= 7) return `Há ${dias} dias`;
  return new Date(data).toLocaleDateString("pt-BR");
}

// ─── Component ───
export default function ClienteCard({ cliente, onAtualizado }: ClienteCardProps) {
  const [modalInteracaoAberto, setModalInteracaoAberto] = useState(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [modalHandoffAberto, setModalHandoffAberto] = useState(false);

  const nome = cliente.pessoa?.nome || "Lead Sem Nome";
  const status = statusConfig[cliente.status] ?? { label: cliente.status, bg: "bg-[var(--inset)]", text: "text-[var(--text-secondary)]" };
  const cx = cliente.termometro_cx ? termometroCXConfig[cliente.termometro_cx] : null;

  const empreendimento =
    cliente.empreendimento ||
    (cliente.pessoa?.dados_originais?.empreendimento as string) ||
    (cliente.regiao_interesse ? `Condomínio ${cliente.regiao_interesse}` : null);

  const isDistrato = cliente.termometro_cx === "insatisfeito_distrato" || cliente.alerta_distrato_ativo;

  const ultimoContato = tempoRelativo(cliente.ultima_interacao_em);

  const tarefasPendentes = (cliente.tarefas || []).filter((t) => t.status !== "concluida" && t.status !== "nao_realizada").length;

  return (
    <>
      <article
        className="card card-hover group relative flex flex-col overflow-hidden p-5 shadow-sm"
        style={{
          borderColor: isDistrato ? "var(--danger-border)" : undefined,
        }}
      >
        {/* Stripe de risco discreta */}
        {isDistrato && (
          <span
            className="absolute bottom-0 left-0 top-0 w-1"
            style={{ background: "var(--danger)" }}
          />
        )}

        {/* Linha 1: avatar + nome + estado */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--text-primary)] shadow-md shadow-black/10"
            style={{ background: avatarColor(nome) }}
          >
            {initials(nome)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-[15px] font-black tracking-wide leading-tight truncate text-[var(--text-primary)]">
              <Link
                href={`/clientes/${cliente.id}`}
                className="truncate hover:text-[var(--accent-hover)]"
              >
                {nome}
              </Link>
            </h2>
            {empreendimento && (
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[var(--text-secondary)]">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                <span className="truncate">{empreendimento}{cliente.unidade ? ` · ${cliente.unidade}` : ""}</span>
              </p>
            )}
          </div>

          {/* Estado único com cor semântica */}
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-semibold ${status.bg} ${status.text}`}
            style={{
              borderColor: STATUS_COR[cliente.status] || "var(--border)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COR[cliente.status] || "var(--text-muted)" }} />
            {status.label}
          </span>
        </div>

        {/* Linha 2: termômetro discreto + último contato */}
        <div className="mt-3.5 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          {cx && (
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${cx.dot}`} />
              {cx.label}
            </span>
          )}
          {ultimoContato && (
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <span className="hidden sm:inline">Último contato:</span>
              {ultimoContato}
            </span>
          )}
        </div>

        {/* Linha 3: responsável */}
        {cliente.corretor_original_nome && (
          <p className="mt-2.5 text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">Corretor:</span>{" "}
            <strong className="font-bold text-[var(--text-primary)]">{cliente.corretor_original_nome}</strong>
          </p>
        )}

        {/* Linha 4: pendências que exigem atenção */}
        {(isDistrato || tarefasPendentes > 0 || cliente.oportunidade_upsell) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isDistrato && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--danger-light)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--danger)]">
                <AlertTriangle className="h-3 w-3" />
                Atenção
              </span>
            )}
            {tarefasPendentes > 0 && (
              <span className="rounded-full bg-[var(--inset)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--text-secondary)]">
                {tarefasPendentes} tarefa{tarefasPendentes > 1 ? "s" : ""}
              </span>
            )}
            {cliente.oportunidade_upsell && (
              <span className="rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                Up-Sell
              </span>
            )}
          </div>
        )}

        {/* Footer: ações */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModalInteracaoAberto(true)}
              title="Registrar Interação"
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Interação</span>
            </button>
            <button
              onClick={() => setModalTarefaAberto(true)}
              title="Criar Tarefa"
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Tarefa</span>
            </button>
            <button
              onClick={() => setModalHandoffAberto(true)}
              title="Passagem de Bastão"
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Handoff</span>
            </button>
          </div>

          <Link
            href={`/clientes/${cliente.id}`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--accent-hover)]"
          >
            Ver perfil
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>

      <NovaInteracaoModal
        aberto={modalInteracaoAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalInteracaoAberto(false)}
        aoSalvar={() => { setModalInteracaoAberto(false); onAtualizado?.(); }}
      />
      <NovaTarefaModal
        aberto={modalTarefaAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalTarefaAberto(false)}
        aoSalvar={() => { setModalTarefaAberto(false); onAtualizado?.(); }}
      />
      <HandoffModal
        aberto={modalHandoffAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalHandoffAberto(false)}
        aoSalvar={() => { setModalHandoffAberto(false); onAtualizado?.(); }}
      />
    </>
  );
}
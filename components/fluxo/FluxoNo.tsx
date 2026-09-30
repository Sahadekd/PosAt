"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  CheckCircle2,
  XCircle,
  Circle,
  Clock3,
  Loader2,
  MinusCircle,
  MessageCircle,
} from "lucide-react";
import { META_NOS, META_ESTADOS } from "./meta";
import type {
  EstadoNoExecucao,
  NoGatilho,
  NoMensagem,
  NoAtraso,
  NoCondicao,
  NoAcaoInterna,
  NoNotificacao,
} from "@/core/domain/entities/fluxo";

export type FluxoNodeData = {
  label: string;
  estado?: EstadoNoExecucao;
  previewConteudo?: string;
  contadorDisparos?: number;
  gatilho?: NoGatilho;
  mensagem?: NoMensagem;
  atraso?: NoAtraso;
  condicao?: NoCondicao;
  acao?: NoAcaoInterna;
  notificacao?: NoNotificacao;
  selecionado?: boolean;
};

export type FluxoNode = Node<FluxoNodeData>;

function IconeEstado({ estado }: { estado: EstadoNoExecucao }) {
  const meta = META_ESTADOS[estado];
  const props = { className: "h-3.5 w-3.5", style: { color: meta.cor } };

  switch (estado) {
    case "concluido":
      return <CheckCircle2 {...props} />;
    case "falhou":
      return <XCircle {...props} />;
    case "agendado":
      return <Clock3 {...props} />;
    case "em_execucao":
      return <Loader2 {...props} className="h-3.5 w-3.5 animate-spin" />;
    case "pulado":
      return <MinusCircle {...props} />;
    default:
      return <Circle {...props} />;
  }
}

function BadgeEstado({ estado }: { estado: EstadoNoExecucao }) {
  const meta = META_ESTADOS[estado];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: meta.corLight, color: meta.cor }}
      title={meta.label}
    >
      <IconeEstado estado={estado} />
      {meta.label}
    </span>
  );
}

function NoInterno({ data, selected }: { data: FluxoNodeData; selected?: boolean }) {
  const meta =
    META_NOS[
      data.gatilho
        ? "gatilho"
        : data.mensagem
          ? "mensagem_whatsapp"
          : data.atraso
            ? "atraso"
            : data.condicao
              ? "condicao"
              : data.acao
                ? "acao_interna"
                : "notificacao"
    ];
  const Icon = meta.icon;
  const estado: EstadoNoExecucao = data.estado ?? "pendente";
  const emExecucao = estado === "em_execucao";

  return (
    <div
      className="relative min-w-[190px] max-w-[240px] rounded-xl border bg-[var(--white)] px-3 py-2.5 shadow-lg transition-all"
      style={{
        borderColor: selected
          ? meta.cor
          : emExecucao
            ? meta.cor
            : "var(--border)",
        borderRadius: meta.raio ? meta.raio : undefined,
        boxShadow: emExecucao
          ? `0 0 0 3px ${meta.corLight}, 0 8px 24px rgba(0,0,0,.35)`
          : "0 8px 24px rgba(0,0,0,.28)",
        opacity: estado === "pulado" ? 0.55 : 1,
      }}
      aria-label={`${meta.label}: ${data.label} — ${META_ESTADOS[estado].label}`}
    >
      {/* Pulso no nó em execução */}
      {emExecucao && (
        <span
          className="pointer-events-none absolute inset-0 animate-ping rounded-xl"
          style={{ background: meta.corLight, animationDuration: "1.6s" }}
        />
      )}

      {/* Cabeçalho */}
      <div className="flex items-start gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: meta.corLight, color: meta.cor }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: meta.cor }}>
            {meta.label}
          </p>
          <p className="truncate text-[13px] font-semibold leading-tight text-[var(--text-primary)]">
            {data.label}
          </p>
        </div>
      </div>

      {/* Preview de conteúdo (mensagens) */}
      {data.previewConteudo && (
        <p className="mt-1.5 line-clamp-2 rounded-md bg-[var(--inset)] px-2 py-1.5 text-[11px] leading-snug text-[var(--text-secondary)]">
          {data.previewConteudo}
        </p>
      )}

      {/* Rodapé: contador de disparos + estado */}
      <div className="mt-2 flex items-center justify-between gap-2">
        {typeof data.contadorDisparos === "number" && data.contadorDisparos > 0 ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)]">
            <MessageCircle className="h-3 w-3" />
            {data.contadorDisparos} disparo(s)
          </span>
        ) : (
          <span />
        )}
        <BadgeEstado estado={estado} />
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !bg-[var(--border-strong)]"
        style={{ borderColor: meta.cor }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !bg-[var(--border-strong)]"
        style={{ borderColor: meta.cor }}
      />

      {/* Handles laterais para condição (sim/não) */}
      {data.condicao && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="sim"
            className="!h-3.5 !w-3.5 !border-2"
            style={{ background: "#34D399", borderColor: "#0B0F17", right: -7 }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="nao"
            className="!h-3.5 !w-3.5 !border-2"
            style={{ background: "#F87171", borderColor: "#0B0F17", right: -7, marginTop: 26 }}
          />
          <span className="pointer-events-none absolute -right-1 top-[26px] text-[9px] font-bold text-[#34D399]">
            sim
          </span>
          <span className="pointer-events-none absolute -right-1 top-[54px] text-[9px] font-bold text-[#F87171]">
            não
          </span>
        </>
      )}
    </div>
  );
}

export const FluxoNo = memo(function FluxoNo({ data, selected }: NodeProps<FluxoNode>) {
  return <NoInterno data={data} selected={selected} />;
});

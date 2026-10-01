"use client";

import {
  Play,
  MessageCircle,
  Clock,
  GitBranch,
  ListTodo,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { TipoNo, EstadoNoExecucao } from "@/core/domain/entities/fluxo";

export interface MetaNo {
  tipo: TipoNo;
  label: string;
  descricao: string;
  icon: LucideIcon;
  cor: string;          // cor do acento do tipo
  corLight: string;
  raio?: number;        // raio da borda do nó (gatilho usa arredondamento maior)
}

export const META_NOS: Record<TipoNo, MetaNo> = {
  gatilho: {
    tipo: "gatilho",
    label: "Gatilho",
    descricao: "Entrada no fluxo: manual, novo lead, mudança de estágio, inatividade ou evento.",
    icon: Play,
    cor: "#38BDF8",
    corLight: "rgba(56, 189, 248, 0.14)",
    raio: 18,
  },
  mensagem_whatsapp: {
    tipo: "mensagem_whatsapp",
    label: "Mensagem WhatsApp",
    descricao: "Disparo manual ou automático com template e variáveis.",
    icon: MessageCircle,
    cor: "#34D399",
    corLight: "rgba(52, 211, 153, 0.14)",
  },
  atraso: {
    tipo: "atraso",
    label: "Atraso / Espera",
    descricao: "Intervalo em horas ou dias antes da próxima etapa.",
    icon: Clock,
    cor: "#FBBF24",
    corLight: "rgba(251, 191, 36, 0.14)",
  },
  condicao: {
    tipo: "condicao",
    label: "Condição",
    descricao: "Ramificação: lead respondeu? sim / não.",
    icon: GitBranch,
    cor: "#A78BFA",
    corLight: "rgba(167, 139, 250, 0.14)",
  },
  acao_interna: {
    tipo: "acao_interna",
    label: "Ação interna",
    descricao: "Criar tarefa, atribuir responsável, mudar estágio ou registrar anotação.",
    icon: ListTodo,
    cor: "#F59E0B",
    corLight: "rgba(245, 158, 11, 0.14)",
  },
  notificacao: {
    tipo: "notificacao",
    label: "Notificação",
    descricao: "Alertar atendente ou gestor (in-app / WhatsApp interno).",
    icon: Bell,
    cor: "#FB7185",
    corLight: "rgba(251, 113, 133, 0.14)",
  },
};

// ---- Estados de execução (acento + rótulo + ícone) ----

export interface MetaEstado {
  estado: EstadoNoExecucao;
  label: string;
  cor: string;
  corLight: string;
}

export const META_ESTADOS: Record<EstadoNoExecucao, MetaEstado> = {
  pendente: {
    estado: "pendente",
    label: "Pendente",
    cor: "#64748B",
    corLight: "rgba(100, 116, 139, 0.16)",
  },
  agendado: {
    estado: "agendado",
    label: "Agendado",
    cor: "#FBBF24",
    corLight: "rgba(251, 191, 36, 0.16)",
  },
  em_execucao: {
    estado: "em_execucao",
    label: "Em execução",
    cor: "#38BDF8",
    corLight: "rgba(56, 189, 248, 0.16)",
  },
  concluido: {
    estado: "concluido",
    label: "Concluído",
    cor: "#34D399",
    corLight: "rgba(52, 211, 132, 0.16)",
  },
  falhou: {
    estado: "falhou",
    label: "Falhou",
    cor: "#F87171",
    corLight: "rgba(248, 113, 113, 0.16)",
  },
  pulado: {
    estado: "pulado",
    label: "Pulado",
    cor: "#94A3B8",
    corLight: "rgba(148, 163, 184, 0.12)",
  },
};

export const TIPOS_NO_ARRAY: TipoNo[] = [
  "gatilho",
  "mensagem_whatsapp",
  "atraso",
  "condicao",
  "acao_interna",
  "notificacao",
];

// Labels legíveis para variáveis de template
export const VARIAVEIS_TEMPLATE = [
  { chave: "nome", descricao: "Nome do lead" },
  { chave: "imovel", descricao: "Imóvel de interesse" },
  { chave: "corretor", descricao: "Nome do corretor" },
  { chave: "estagio", descricao: "Estágio atual do lead" },
];

// =====================================================
// FLUXO DE LEADS — Domain Types
// Domínio próprio: acompanhamento e relacionamento com leads.
// Sem conectores genéricos, sem código customizado em nós.
// =====================================================

// ---- Enums ----

export type StatusFluxo =
  | "rascunho"
  | "ativo"
  | "pausado"
  | "concluido"
  | "cancelado";

export type TipoNo =
  | "gatilho"
  | "mensagem_whatsapp"
  | "atraso"
  | "condicao"
  | "acao_interna"
  | "notificacao";

export type EstadoNoExecucao =
  | "pendente"
  | "agendado"
  | "em_execucao"
  | "concluido"
  | "falhou"
  | "pulado";

export type StatusExecucaoFluxo =
  | "ativa"
  | "pausada_por_resposta"
  | "pausada_manual"
  | "concluida"
  | "falhou"
  | "cancelada";

export type TipoGatilho =
  | "manual"
  | "novo_lead"
  | "mudanca_estagio"
  | "inatividade_dias"
  | "evento_sistema";

export type OrigemExecucao = "automatica" | "manual";

export type TipoAcaoInterna =
  | "criar_tarefa"
  | "atribuir_responsavel"
  | "mudar_estagio"
  | "registrar_anotacao";

export type TipoNotificacao = "in_app" | "whatsapp_interno";

export type StatusEntregaMensagem =
  | "enviada"
  | "entregue"
  | "lida"
  | "falhou"
  | null;

// ---- Nós do grafo (definição) ----

export interface NoGatilho {
  tipo: "gatilho";
  gatilho: TipoGatilho;
  // Para 'inatividade_dias': quantos dias de inatividade
  inatividadeDias?: number;
  // Para 'mudanca_estagio': estágio de origem
  estagioOrigem?: string;
  // Para 'evento_sistema': nome do evento
  evento?: string;
}

export interface NoMensagem {
  tipo: "mensagem_whatsapp";
  conteudo: string;                 // template com {{nome}}, {{imovel}}, {{corretor}}
  manual?: boolean;                 // disparo manual (não automático)
  midiaUrl?: string | null;
}

export interface NoAtraso {
  tipo: "atraso";
  quantidade: number;
  unidade: "horas" | "dias";
}

export interface NoCondicao {
  tipo: "condicao";
  // Ex.: { campo: "respondeu", operador: "igual", valor: "sim" }
  campo: string;
  operador: "igual" | "diferente" | "contem" | "vazio" | "preenchido";
  valor?: string;
}

export interface NoAcaoInterna {
  tipo: "acao_interna";
  acao: TipoAcaoInterna;
  titulo?: string;                  // tarefa / anotação
  descricao?: string;
  estagioDestino?: string;          // mudar_estagio
  responsavelId?: string;           // atribuir_responsavel
}

export interface NoNotificacao {
  tipo: "notificacao";
  canal: TipoNotificacao;
  titulo: string;
  mensagem: string;
  para: "responsavel" | "gestor" | "todos";
}

export type DefinicaoNo =
  | NoGatilho
  | NoMensagem
  | NoAtraso
  | NoCondicao
  | NoAcaoInterna
  | NoNotificacao;

// Distribuído explicitamente para permitir narrowing por `tipo`
export type DadosNo =
  | (NoGatilho & { label: string })
  | (NoMensagem & { label: string })
  | (NoAtraso & { label: string })
  | (NoCondicao & { label: string })
  | (NoAcaoInterna & { label: string })
  | (NoNotificacao & { label: string });

// Posição e metadados de renderização
export interface NoFluxo {
  id: string;                       // id único dentro do grafo (text)
  position: { x: number; y: number };
  data: DadosNo;
}

export interface ArestaFluxo {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;            // 'sim' | 'nao' em condições
  label?: string;
  animated?: boolean;
}

export interface GrafoFluxo {
  nodes: NoFluxo[];
  edges: ArestaFluxo[];
}

// ---- Fluxo (definição / template) ----

export interface Fluxo {
  id: string;
  nome: string;
  descricao: string | null;
  status: StatusFluxo;

  template_origem_id: string | null;
  e_template: boolean;
  template_categoria: string | null;

  responsavel_id: string | null;
  equipe_escopo: boolean;

  pausar_quando_responder: boolean;
  janela_envio_inicio: string;      // "08:00"
  janela_envio_fim: string;         // "20:00"
  limite_mensagens_por_dia: number;

  grafo: GrafoFluxo;

  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;

  // Agregados (populados por repositório)
  total_execucoes?: number;
  execucoes_ativas?: number;
  execucoes_com_falha?: number;
}

// ---- Execução (instância por lead) ----

export interface FluxoExecucao {
  id: string;
  fluxo_id: string;
  cliente_id: string;

  status: StatusExecucaoFluxo;

  no_atual_id: string | null;
  no_atual_estado: EstadoNoExecucao;

  proxima_execucao_em: string | null;
  tentativas: number;

  pausada_em: string | null;
  pausada_motivo: string | null;
  retomada_em: string | null;

  contexto: Record<string, unknown>;

  iniciada_por: string | null;
  origem: OrigemExecucao;

  iniciado_em: string;
  concluido_em: string | null;
  cancelada_em: string | null;
  atualizado_em: string;

  // Agregados (populados por repositório — campos podem vir parciais)
  fluxo?: Partial<Fluxo> & { id: string };
  cliente?: {
    id: string;
    nome: string | null;
    telefone: string | null;
    status: string;
    responsavel_id?: string | null;
  };
  no_atual?: FluxoNoExecucao | null;
}

// ---- Execução de nó (linha do tempo / auditoria) ----

export interface FluxoNoExecucao {
  id: string;
  execucao_id: string;
  no_id: string;
  tipo: TipoNo;

  estado: EstadoNoExecucao;

  origem: OrigemExecucao;
  responsavel_id: string | null;

  conteudo_enviado: string | null;
  mensagem_whatsapp_id: string | null;
  status_entrega: StatusEntregaMensagem;
  erro_detalhe: string | null;
  tentativas: number;

  ramificacao: string | null;

  agendado_para: string | null;
  iniciado_em: string | null;
  concluido_em: string | null;

  dados_extra: Record<string, unknown>;
  criado_em: string;
}

// ---- Log de execução ----

export interface FluxoLog {
  id: string;
  execucao_id: string | null;
  fluxo_id: string | null;
  cliente_id: string | null;

  no_id: string | null;
  evento: string;
  detalhe: string | null;
  origem: OrigemExecucao;
  responsavel_id: string | null;

  dados: Record<string, unknown>;
  criado_em: string;
}

// ---- Filtros (compartilhados por use-cases e adapters) ----

export interface FiltrosFluxo {
  status?: string | null;
  busca?: string | null;
  responsavel?: string | null;
  e_template?: boolean | null;
  categoria?: string | null;
}

export interface FiltrosExecucaoFluxo {
  fluxo_id?: string | null;
  cliente_id?: string | null;
  status?: string | null;
  responsavel?: string | null;
  busca?: string | null;
}

// ---- Resumo para painel lateral ----

export interface ResumoExecucaoFluxo {
  execucao: FluxoExecucao;
  nos: FluxoNoExecucao[];
  logs: FluxoLog[];
  proximaAcao: {
    noId: string;
    label: string;
    tipo: TipoNo;
    agendadoPara: string | null;
  } | null;
  progresso: {
    total: number;
    concluidos: number;
    falhados: number;
    pulados: number;
  };
}

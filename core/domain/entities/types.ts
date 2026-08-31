// =====================================================
// CORE DOMAIN – Entity Types & Value Objects
// This file lives at the innermost layer of the hexagon.
// It has ZERO external dependencies.
// =====================================================

export type FinalidadeCliente =
  | "primeiro_imovel"
  | "moradia"
  | "investimento"
  | "possivel_investidor"
  | "upgrade"
  | "segunda_residencia"
  | "compra_para_familiar"
  | "locacao"
  | "imovel_comercial"
  | "cliente_recorrente"
  | "potencial_indicacao"
  | "nao_identificado";

export type NivelConfianca =
  | "alta"
  | "media"
  | "baixa"
  | "revisao_necessaria";

export type StatusRelacionamento =
  | "novo_lead"
  | "em_qualificacao"
  | "em_negociacao"
  | "convertido"
  | "handoff_pendente"
  | "onboarding"
  | "pos_venda"
  | "cliente_ativo"
  | "cliente_inativo"
  | "reativacao"
  | "sem_resposta"
  | "encerrado";

export type OrigemPessoa =
  | "crm"
  | "formulario"
  | "whatsapp"
  | "site"
  | "supabase"
  | "planilha"
  | "manual"
  | "outro";

export type TipoInteracao =
  | "ligacao"
  | "whatsapp"
  | "email"
  | "visita"
  | "proposta"
  | "chamado"
  | "pesquisa"
  | "observacao"
  | "outro";

export type StatusTarefa =
  | "pendente"
  | "em_andamento"
  | "concluida"
  | "nao_realizada"
  | "reagendada"
  | "sem_resposta";

// ---- Entities ----

export interface Pessoa {
  id: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  documento?: string | null;
  origem: OrigemPessoa;
  id_externo?: string | null;
  dados_originais?: Record<string, unknown>;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Cliente {
  id: string;
  pessoa_id: string;
  status: StatusRelacionamento;
  finalidade_principal: FinalidadeCliente;
  finalidades_secundarias: FinalidadeCliente[];
  regiao_interesse: string | null;
  cidade_interesse: string | null;
  bairro_interesse: string | null;
  tipo_imovel: string | null;
  padrao_imovel: string | null;
  valor_minimo: number | null;
  valor_maximo: number | null;
  prazo_compra: string | null;
  forma_pagamento: string | null;
  precisa_financiamento: boolean | null;
  ja_possui_imovel: boolean | null;
  e_investidor_confirmado: boolean;
  indice_completude: number;
  nivel_confianca: NivelConfianca;
  campos_faltantes: string[];
  sinais_classificacao: string[];
  responsavel_id?: string | null;
  ultima_interacao_em?: string | null;
  proxima_acao?: string | null;
  proxima_acao_em?: string | null;
  criado_em: string;
  atualizado_em: string;
  // Aggregate references (populated by repository joins)
  pessoa?: Pessoa;
  interacoes?: Interacao[];
  tarefas?: Tarefa[];
  handoffs?: Handoff[];
}

export interface Interacao {
  id: string;
  cliente_id: string;
  tipo: TipoInteracao;
  canal?: string | null;
  descricao: string;
  resultado?: string | null;
  criado_por?: string | null;
  ocorreu_em: string;
  dados_extra?: Record<string, unknown>;
}

export interface Tarefa {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao?: string | null;
  status: StatusTarefa;
  prioridade: number;
  responsavel_id?: string | null;
  prazo_em?: string | null;
  concluida_em?: string | null;
  criado_em: string;
  atualizado_em?: string;
  cliente?: {
    id: string;
    finalidade_principal: FinalidadeCliente;
    status: StatusRelacionamento;
    pessoa?: {
      nome: string | null;
      telefone: string | null;
      email: string | null;
    };
  };
}

export interface Handoff {
  id: string;
  cliente_id: string;
  responsavel_origem?: string | null;
  responsavel_destino?: string | null;
  status: string;
  motivo?: string | null;
  resumo?: string | null;
  pendencias: string[];
  expectativa_cliente?: string | null;
  enviado_em?: string | null;
  recebido_em?: string | null;
  concluido_em?: string | null;
  criado_em: string;
  cliente?: Cliente;
}

export interface DashboardStats {
  totalClientes: number;
  completudeMedia: number;
  investidores: number;
  tarefasPendentes: number;
  handoffsAtivos: number;
}

// ---- Value Objects for Classification ----

export interface DadosParaClassificacao {
  nome?: string | null;
  telefone?: string | null;
  email?: string | null;
  finalidadeDeclarada?: string | null;
  observacoes?: string | null;
  regiaoInteresse?: string | null;
  cidadeInteresse?: string | null;
  bairroInteresse?: string | null;
  tipoImovel?: string | null;
  padraoImovel?: string | null;
  valorMinimo?: number | null;
  valorMaximo?: number | null;
  prazoCompra?: string | null;
  formaPagamento?: string | null;
  precisaFinanciamento?: boolean | null;
  jaPossuiImovel?: boolean | null;
  eInvestidorConfirmado?: boolean | null;
  quantidadeImoveis?: number | null;
  interacoesRecentes?: number;
  visitasRealizadas?: number;
  propostasEnviadas?: number;
}

export interface ResultadoClassificacao {
  finalidadePrincipal: FinalidadeCliente;
  finalidadesSecundarias: FinalidadeCliente[];
  nivelConfianca: NivelConfianca;
  sinais: string[];
  camposFaltantes: string[];
  proximaAcao: string;
}

// ---- Filter types (shared by use-cases and adapters) ----

export interface FiltrosCliente {
  finalidade?: string | null;
  status?: string | null;
  regiao?: string | null;
  confianca?: string | null;
  completude_maxima?: string | null;
  busca?: string | null;
}

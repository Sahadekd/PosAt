// =====================================================
// PORT – Input (Driving) Side
// Interfaces for all use-case contracts.
// GraphQL resolvers and REST handlers call these.
// =====================================================

import {
  Cliente,
  Pessoa,
  Interacao,
  Tarefa,
  Handoff,
  Oportunidade,
  DashboardStats,
  FiltrosCliente,
  ResultadoClassificacao,
} from "../../domain/entities/types";

// --- Listagens e consultas ---

export interface IListarClientesUseCase {
  execute(filtros?: FiltrosCliente): Promise<Cliente[]>;
}

export interface IObterClienteUseCase {
  execute(id: string): Promise<Cliente | null>;
}

export interface IListarTarefasUseCase {
  execute(): Promise<Tarefa[]>;
}

export interface IListarHandoffsUseCase {
  execute(): Promise<Handoff[]>;
}

export interface IListarOportunidadesUseCase {
  execute(): Promise<Oportunidade[]>;
}

export interface IObterStatsUseCase {
  execute(): Promise<DashboardStats>;
}

// --- Criação ---

export interface ICriarClienteInput {
  pessoa: {
    nome?: string | null;
    telefone?: string | null;
    email?: string | null;
    documento?: string | null;
    origem?: string | null;
    finalidadeDeclarada?: string | null;
    observacoes?: string | null;
  };
  cliente: {
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
  };
}

export interface ICriarClienteUseCase {
  execute(input: ICriarClienteInput): Promise<Cliente>;
}

export interface ICriarInteracaoInput {
  clienteId: string;
  tipo: string;
  canal?: string | null;
  descricao: string;
  resultado?: string | null;
  criadoPor?: string | null;
  ocorreuEm?: string | null;
}

export interface ICriarInteracaoUseCase {
  execute(input: ICriarInteracaoInput): Promise<Interacao>;
}

export interface ICriarTarefaInput {
  clienteId: string;
  titulo: string;
  descricao?: string | null;
  prioridade?: number | null;
  responsavelId?: string | null;
  prazoEm?: string | null;
}

export interface ICriarTarefaUseCase {
  execute(input: ICriarTarefaInput): Promise<Tarefa>;
}

export interface ICriarHandoffInput {
  clienteId: string;
  responsavelOrigem?: string | null;
  responsavelDestino?: string | null;
  motivo?: string | null;
  resumo?: string | null;
  pendencias?: string[];
  expectativaCliente?: string | null;
}

export interface ICriarHandoffUseCase {
  execute(input: ICriarHandoffInput): Promise<Handoff>;
}

export interface ICriarOportunidadeInput {
  clienteId: string;
  tipo: string;
  descricao: string;
  valorEstimado?: number | null;
  prioridade?: number | null;
  evidencia?: string | null;
  criadoPor?: string | null;
  responsavelId?: string | null;
  prazoEm?: string | null;
  proximoPasso?: string | null;
}

export interface ICriarOportunidadeUseCase {
  execute(input: ICriarOportunidadeInput): Promise<Oportunidade>;
}

// --- Atualização ---

export interface IAtualizarTarefaInput {
  id: string;
  status?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  prioridade?: number | null;
  prazoEm?: string | null;
}

export interface IAtualizarTarefaUseCase {
  execute(input: IAtualizarTarefaInput): Promise<Tarefa | null>;
}

export interface IAtualizarHandoffInput {
  id: string;
  status?: string | null;
  resumo?: string | null;
  pendencias?: string[];
  expectativaCliente?: string | null;
  responsavelDestino?: string | null;
}

export interface IAtualizarHandoffUseCase {
  execute(input: IAtualizarHandoffInput): Promise<Handoff | null>;
}

export interface IAtualizarOportunidadeInput {
  id: string;
  status?: string | null;
  descricao?: string | null;
  valorEstimado?: number | null;
  prioridade?: number | null;
  evidencia?: string | null;
  responsavelId?: string | null;
  prazoEm?: string | null;
  proximoPasso?: string | null;
  motivoPerda?: string | null;
}

export interface IAtualizarOportunidadeUseCase {
  execute(input: IAtualizarOportunidadeInput): Promise<Oportunidade | null>;
}

// --- Classificação ---

export interface IClassificarClienteUseCase {
  execute(clienteId: string): Promise<ResultadoClassificacao>;
}

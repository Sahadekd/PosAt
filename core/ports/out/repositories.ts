// =====================================================
// PORT – Output (Driven) Side
// Interfaces that define what the application
// needs from external systems (DB, APIs, etc.)
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
} from "../../domain/entities/types";

// --- Pessoa Repository ---

export interface IPessoaRepository {
  findAll(): Promise<Pessoa[]>;
  findById(id: string): Promise<Pessoa | null>;
  create(data: Partial<Pessoa>): Promise<Pessoa>;
  update(id: string, data: Partial<Pessoa>): Promise<Pessoa | null>;
}

// --- Cliente Repository ---

export interface IClienteRepository {
  findAll(filtros?: FiltrosCliente): Promise<Cliente[]>;
  findById(id: string): Promise<Cliente | null>;
  create(data: Partial<Cliente>): Promise<Cliente>;
  update(id: string, data: Partial<Cliente>): Promise<Cliente | null>;
  getStats(): Promise<DashboardStats>;
}

// --- Interacao Repository ---

export interface IInteracaoRepository {
  findAll(clienteId?: string): Promise<Interacao[]>;
  findById(id: string): Promise<Interacao | null>;
  create(data: Partial<Interacao>): Promise<Interacao>;
}

// --- Tarefa Repository ---

export interface ITarefaRepository {
  findAll(): Promise<Tarefa[]>;
  findById(id: string): Promise<Tarefa | null>;
  create(data: Partial<Tarefa>): Promise<Tarefa>;
  update(id: string, data: Partial<Tarefa>): Promise<Tarefa | null>;
}

// --- Handoff Repository ---

export interface IHandoffRepository {
  findAll(): Promise<Handoff[]>;
  findById(id: string): Promise<Handoff | null>;
  create(data: Partial<Handoff>): Promise<Handoff>;
  update(id: string, data: Partial<Handoff>): Promise<Handoff | null>;
}

// --- Oportunidade Repository ---

export interface IOportunidadeRepository {
  findAll(): Promise<Oportunidade[]>;
  findById(id: string): Promise<Oportunidade | null>;
  create(data: Partial<Oportunidade>): Promise<Oportunidade>;
  update(id: string, data: Partial<Oportunidade>): Promise<Oportunidade | null>;
}

import { PessoaRepository } from "./adapters/repositories/pessoa.repository";
import { ClienteRepository } from "./adapters/repositories/cliente.repository";
import { TarefaRepository } from "./adapters/repositories/tarefa.repository";
import { HandoffRepository } from "./adapters/repositories/handoff.repository";
import { InteracaoRepository } from "./adapters/repositories/interacao.repository";

import { CriarClienteUseCase } from "./use-cases/CriarCliente";
import { ListarClientesUseCase } from "./use-cases/ListarClientes";
import { ObterClienteUseCase } from "./use-cases/ObterCliente";
import { ClassificarClienteUseCase } from "./use-cases/ClassificarCliente";
import { ObterStatsUseCase } from "./use-cases/ObterStats";

import { CriarTarefaUseCase } from "./use-cases/CriarTarefa";
import { ListarTarefasUseCase } from "./use-cases/ListarTarefas";
import { AtualizarTarefaUseCase } from "./use-cases/AtualizarTarefa";

import { CriarHandoffUseCase } from "./use-cases/CriarHandoff";
import { ListarHandoffsUseCase } from "./use-cases/ListarHandoffs";
import { AtualizarHandoffUseCase } from "./use-cases/AtualizarHandoff";

import { CriarInteracaoUseCase } from "./use-cases/CriarInteracao";

// Repositories (Driven Adapters)
export const pessoaRepo = new PessoaRepository();
export const clienteRepo = new ClienteRepository();
export const tarefaRepo = new TarefaRepository();
export const handoffRepo = new HandoffRepository();
export const interacaoRepo = new InteracaoRepository();

// Use Cases (Application Core)
export const criarClienteUseCase = new CriarClienteUseCase(pessoaRepo, clienteRepo);
export const listarClientesUseCase = new ListarClientesUseCase(clienteRepo);
export const obterClienteUseCase = new ObterClienteUseCase(clienteRepo);
export const classificarClienteUseCase = new ClassificarClienteUseCase(clienteRepo);
export const obterStatsUseCase = new ObterStatsUseCase(clienteRepo);

export const criarTarefaUseCase = new CriarTarefaUseCase(tarefaRepo);
export const listarTarefasUseCase = new ListarTarefasUseCase(tarefaRepo);
export const atualizarTarefaUseCase = new AtualizarTarefaUseCase(tarefaRepo);

export const criarHandoffUseCase = new CriarHandoffUseCase(handoffRepo, clienteRepo);
export const listarHandoffsUseCase = new ListarHandoffsUseCase(handoffRepo);
export const atualizarHandoffUseCase = new AtualizarHandoffUseCase(handoffRepo, clienteRepo);

export const criarInteracaoUseCase = new CriarInteracaoUseCase(interacaoRepo, clienteRepo);

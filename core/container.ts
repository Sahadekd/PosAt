import { PessoaRepository } from "./adapters/repositories/pessoa.repository";
import { ClienteRepository } from "./adapters/repositories/cliente.repository";
import { TarefaRepository } from "./adapters/repositories/tarefa.repository";
import { HandoffRepository } from "./adapters/repositories/handoff.repository";
import { InteracaoRepository } from "./adapters/repositories/interacao.repository";
import { OportunidadeRepository } from "./adapters/repositories/oportunidade.repository";
import { VendedorRepository } from "./adapters/repositories/vendedor.repository";
import { ImovelRepository } from "./adapters/repositories/imovel.repository";
import { HistoricoOportunidadeRepository } from "./adapters/repositories/historico-oportunidade.repository";
import { WhatsAppRepository } from "./adapters/repositories/whatsapp.repository";
import { FluxoRepository } from "./adapters/repositories/fluxo.repository";
import { FluxoExecucaoRepository } from "./adapters/repositories/fluxo-execucao.repository";
import { FluxoLogRepository } from "./adapters/repositories/fluxo-log.repository";

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

import { CriarOportunidadeUseCase } from "./use-cases/CriarOportunidade";
import { ListarOportunidadesUseCase } from "./use-cases/ListarOportunidades";
import { AtualizarOportunidadeUseCase } from "./use-cases/AtualizarOportunidade";
import { RemoverOportunidadeUseCase } from "./use-cases/RemoverOportunidade";
import { ConverterOportunidadeUseCase } from "./use-cases/ConverterOportunidade";

import { ListarVendedoresUseCase } from "./use-cases/ListarVendedores";
import { ObterVendedorUseCase } from "./use-cases/ObterVendedor";
import { CriarVendedorUseCase } from "./use-cases/CriarVendedor";
import { AtualizarVendedorUseCase } from "./use-cases/AtualizarVendedor";

import { ListarImoveisUseCase } from "./use-cases/ListarImoveis";
import { ListarHistoricoOportunidadesUseCase } from "./use-cases/ListarHistoricoOportunidades";

import { ListarConversasWhatsAppUseCase } from "./use-cases/ListarConversasWhatsApp";
import { ListarConexoesWhatsAppUseCase } from "./use-cases/ListarConexoesWhatsApp";
import { CriarConexaoWhatsAppUseCase } from "./use-cases/CriarConexaoWhatsApp";
import { ConectarConexaoWhatsAppUseCase } from "./use-cases/ConectarConexaoWhatsApp";
import { ConfirmarConexaoWhatsAppUseCase } from "./use-cases/ConfirmarConexaoWhatsApp";
import { DesconectarConexaoWhatsAppUseCase } from "./use-cases/DesconectarConexaoWhatsApp";
import { AtualizarConexaoWhatsAppUseCase } from "./use-cases/AtualizarConexaoWhatsApp";
import { ReceberMensagemWhatsAppUseCase } from "./use-cases/ReceberMensagemWhatsApp";
import { ResponderMensagemWhatsAppUseCase } from "./use-cases/ResponderMensagemWhatsApp";
import { VincularConversaWhatsAppUseCase } from "./use-cases/VincularConversaWhatsApp";
import { AtualizarEspelhamentoWhatsAppUseCase } from "./use-cases/AtualizarEspelhamentoWhatsApp";
import { ObterMetricasWhatsAppUseCase } from "./use-cases/ObterMetricasWhatsApp";
import { ObterRelatorioGestorWhatsAppUseCase } from "./use-cases/ObterRelatorioGestorWhatsApp";
import { AplicarFollowUpsWhatsAppUseCase } from "./use-cases/AplicarFollowUpsWhatsApp";
import { DispararNpsWhatsAppUseCase } from "./use-cases/DispararNpsWhatsApp";
import { ListarNpsWhatsAppUseCase } from "./use-cases/ListarNpsWhatsApp";
import { ResponderNpsWhatsAppUseCase } from "./use-cases/ResponderNpsWhatsApp";
import { ExportarHistoricoWhatsAppUseCase } from "./use-cases/ExportarHistoricoWhatsApp";
import { ObterLogAcessosWhatsAppUseCase } from "./use-cases/ObterLogAcessosWhatsApp";
import { ExcluirConversaWhatsAppUseCase } from "./use-cases/ExcluirConversaWhatsApp";

import {
  ListarFluxosUseCase,
  CriarFluxoUseCase,
  AtualizarFluxoUseCase,
  DuplicarFluxoUseCase,
  DeletarFluxoUseCase,
  AplicarTemplateUseCase,
  IniciarExecucaoUseCase,
} from "./use-cases/FluxoCrud";
import {
  ExecutarFluxoUseCase,
  PausarFluxoPorRespostaUseCase,
  ControlarExecucaoUseCase,
  ProcessarAgendamentosUseCase,
} from "./use-cases/ExecutarFluxo";
import {
  ListarExecucoesUseCase,
  ObterResumoExecucaoUseCase,
  AuditoriaLeadUseCase,
} from "./use-cases/FluxoConsulta";

// Repositories (Driven Adapters)
export const pessoaRepo = new PessoaRepository();
export const clienteRepo = new ClienteRepository();
export const tarefaRepo = new TarefaRepository();
export const handoffRepo = new HandoffRepository();
export const interacaoRepo = new InteracaoRepository();
export const oportunidadeRepo = new OportunidadeRepository();
export const vendedorRepo = new VendedorRepository();
export const imovelRepo = new ImovelRepository();
export const historicoOportunidadeRepo = new HistoricoOportunidadeRepository();
export const whatsAppRepo = new WhatsAppRepository();
export const fluxoRepo = new FluxoRepository();
export const fluxoExecucaoRepo = new FluxoExecucaoRepository();
export const fluxoLogRepo = new FluxoLogRepository();

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

export const listarOportunidadesUseCase = new ListarOportunidadesUseCase(oportunidadeRepo);
export const criarOportunidadeUseCase = new CriarOportunidadeUseCase(oportunidadeRepo);
export const atualizarOportunidadeUseCase = new AtualizarOportunidadeUseCase(
  oportunidadeRepo,
  historicoOportunidadeRepo
);
export const removerOportunidadeUseCase = new RemoverOportunidadeUseCase(
  oportunidadeRepo,
  historicoOportunidadeRepo
);
export const converterOportunidadeUseCase = new ConverterOportunidadeUseCase(
  oportunidadeRepo,
  pessoaRepo,
  clienteRepo,
  tarefaRepo,
  historicoOportunidadeRepo
);

export const listarVendedoresUseCase = new ListarVendedoresUseCase(vendedorRepo);
export const obterVendedorUseCase = new ObterVendedorUseCase(vendedorRepo);
export const criarVendedorUseCase = new CriarVendedorUseCase(vendedorRepo);
export const atualizarVendedorUseCase = new AtualizarVendedorUseCase(vendedorRepo);

export const listarImoveisUseCase = new ListarImoveisUseCase(imovelRepo);
export const listarHistoricoOportunidadesUseCase =
  new ListarHistoricoOportunidadesUseCase(historicoOportunidadeRepo);

export const listarConversasWhatsAppUseCase = new ListarConversasWhatsAppUseCase(whatsAppRepo);
export const listarConexoesWhatsAppUseCase = new ListarConexoesWhatsAppUseCase(whatsAppRepo);
export const criarConexaoWhatsAppUseCase = new CriarConexaoWhatsAppUseCase(whatsAppRepo);
export const conectarConexaoWhatsAppUseCase = new ConectarConexaoWhatsAppUseCase(whatsAppRepo);
export const confirmarConexaoWhatsAppUseCase = new ConfirmarConexaoWhatsAppUseCase(whatsAppRepo);
export const desconectarConexaoWhatsAppUseCase = new DesconectarConexaoWhatsAppUseCase(whatsAppRepo);
export const atualizarConexaoWhatsAppUseCase = new AtualizarConexaoWhatsAppUseCase(whatsAppRepo);
export const receberMensagemWhatsAppUseCase = new ReceberMensagemWhatsAppUseCase(
  whatsAppRepo,
  interacaoRepo,
  clienteRepo
);
export const responderMensagemWhatsAppUseCase = new ResponderMensagemWhatsAppUseCase(
  whatsAppRepo,
  interacaoRepo
);
export const vincularConversaWhatsAppUseCase = new VincularConversaWhatsAppUseCase(
  whatsAppRepo,
  clienteRepo
);
export const atualizarEspelhamentoWhatsAppUseCase = new AtualizarEspelhamentoWhatsAppUseCase(
  whatsAppRepo
);
export const obterMetricasWhatsAppUseCase = new ObterMetricasWhatsAppUseCase(whatsAppRepo);
export const obterRelatorioGestorWhatsAppUseCase = new ObterRelatorioGestorWhatsAppUseCase(whatsAppRepo);
export const aplicarFollowUpsWhatsAppUseCase = new AplicarFollowUpsWhatsAppUseCase(
  whatsAppRepo,
  tarefaRepo
);
export const dispararNpsWhatsAppUseCase = new DispararNpsWhatsAppUseCase(whatsAppRepo);
export const listarNpsWhatsAppUseCase = new ListarNpsWhatsAppUseCase(whatsAppRepo);
export const responderNpsWhatsAppUseCase = new ResponderNpsWhatsAppUseCase(whatsAppRepo);
export const exportarHistoricoWhatsAppUseCase = new ExportarHistoricoWhatsAppUseCase(whatsAppRepo);
export const obterLogAcessosWhatsAppUseCase = new ObterLogAcessosWhatsAppUseCase(whatsAppRepo);
export const excluirConversaWhatsAppUseCase = new ExcluirConversaWhatsAppUseCase(whatsAppRepo);

// ---- Fluxo de Leads ----
export const listarFluxosUseCase = new ListarFluxosUseCase(fluxoRepo);
export const criarFluxoUseCase = new CriarFluxoUseCase(fluxoRepo);
export const atualizarFluxoUseCase = new AtualizarFluxoUseCase(fluxoRepo);
export const duplicarFluxoUseCase = new DuplicarFluxoUseCase(fluxoRepo);
export const deletarFluxoUseCase = new DeletarFluxoUseCase(fluxoRepo);
export const aplicarTemplateUseCase = new AplicarTemplateUseCase(fluxoRepo, fluxoExecucaoRepo);
export const iniciarExecucaoUseCase = new IniciarExecucaoUseCase(fluxoRepo, fluxoExecucaoRepo);

export const executarFluxoUseCase = new ExecutarFluxoUseCase(
  fluxoRepo,
  fluxoExecucaoRepo,
  fluxoLogRepo,
  tarefaRepo,
  interacaoRepo
);
export const pausarFluxoPorRespostaUseCase = new PausarFluxoPorRespostaUseCase(
  fluxoExecucaoRepo,
  fluxoLogRepo
);
export const controlarExecucaoUseCase = new ControlarExecucaoUseCase(
  fluxoRepo,
  fluxoExecucaoRepo,
  fluxoLogRepo
);
export const processarAgendamentosUseCase = new ProcessarAgendamentosUseCase(
  fluxoExecucaoRepo,
  executarFluxoUseCase
);
export const listarExecucoesUseCase = new ListarExecucoesUseCase(fluxoExecucaoRepo);
export const obterResumoExecucaoUseCase = new ObterResumoExecucaoUseCase(
  fluxoExecucaoRepo,
  fluxoLogRepo
);
export const auditoriaLeadUseCase = new AuditoriaLeadUseCase(fluxoExecucaoRepo, fluxoLogRepo);

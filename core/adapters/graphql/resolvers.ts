import {
  listarClientesUseCase,
  obterClienteUseCase,
  listarTarefasUseCase,
  listarHandoffsUseCase,
  obterStatsUseCase,
  criarClienteUseCase,
  criarTarefaUseCase,
  atualizarTarefaUseCase,
  criarHandoffUseCase,
  atualizarHandoffUseCase,
  criarInteracaoUseCase,
  classificarClienteUseCase,
  interacaoRepo,
} from "../../container";

export const resolvers = {
  Query: {
    clientes: async (_: unknown, args: { filtros?: any }) => {
      const filtrosMapeados = args.filtros
        ? {
            finalidade: args.filtros.finalidade,
            status: args.filtros.status,
            regiao: args.filtros.regiao,
            confianca: args.filtros.confianca,
            completude_maxima: args.filtros.completudeMaxima,
            busca: args.filtros.busca,
          }
        : undefined;
      return listarClientesUseCase.execute(filtrosMapeados);
    },

    cliente: async (_: unknown, args: { id: string }) => {
      return obterClienteUseCase.execute(args.id);
    },

    tarefas: async () => {
      return listarTarefasUseCase.execute();
    },

    handoffs: async () => {
      return listarHandoffsUseCase.execute();
    },

    interacoes: async (_: unknown, args: { clienteId?: string }) => {
      return interacaoRepo.findAll(args.clienteId);
    },

    dashboardStats: async () => {
      return obterStatsUseCase.execute();
    },
  },

  Mutation: {
    criarCliente: async (_: unknown, args: { input: any }) => {
      const input = {
        pessoa: {
          nome: args.input.pessoa.nome,
          telefone: args.input.pessoa.telefone,
          email: args.input.pessoa.email,
          documento: args.input.pessoa.documento,
          origem: args.input.pessoa.origem,
          finalidadeDeclarada: args.input.pessoa.finalidadeDeclarada,
          observacoes: args.input.pessoa.observacoes,
        },
        cliente: args.input.cliente || {},
      };
      return criarClienteUseCase.execute(input);
    },

    criarTarefa: async (_: unknown, args: { input: any }) => {
      return criarTarefaUseCase.execute({
        clienteId: args.input.clienteId,
        titulo: args.input.titulo,
        descricao: args.input.descricao,
        prioridade: args.input.prioridade,
        responsavelId: args.input.responsavelId,
        prazoEm: args.input.prazoEm,
      });
    },

    atualizarTarefa: async (_: unknown, args: { input: any }) => {
      return atualizarTarefaUseCase.execute({
        id: args.input.id,
        status: args.input.status,
        titulo: args.input.titulo,
        descricao: args.input.descricao,
        prioridade: args.input.prioridade,
        prazoEm: args.input.prazoEm,
      });
    },

    criarHandoff: async (_: unknown, args: { input: any }) => {
      return criarHandoffUseCase.execute({
        clienteId: args.input.clienteId,
        responsavelOrigem: args.input.responsavelOrigem,
        responsavelDestino: args.input.responsavelDestino,
        motivo: args.input.motivo,
        resumo: args.input.resumo,
        pendencias: args.input.pendencias,
        expectativaCliente: args.input.expectativaCliente,
      });
    },

    atualizarHandoff: async (_: unknown, args: { input: any }) => {
      return atualizarHandoffUseCase.execute({
        id: args.input.id,
        status: args.input.status,
        resumo: args.input.resumo,
        pendencias: args.input.pendencias,
        expectativaCliente: args.input.expectativaCliente,
        responsavelDestino: args.input.responsavelDestino,
      });
    },

    criarInteracao: async (_: unknown, args: { input: any }) => {
      return criarInteracaoUseCase.execute({
        clienteId: args.input.clienteId,
        tipo: args.input.tipo,
        canal: args.input.canal,
        descricao: args.input.descricao,
        resultado: args.input.resultado,
        criadoPor: args.input.criadoPor,
        ocorreuEm: args.input.ocorreuEm,
      });
    },

    classificarCliente: async (_: unknown, args: { clienteId: string }) => {
      return classificarClienteUseCase.execute(args.clienteId);
    },
  },

  Pessoa: {
    idExterno: (p: any) => p.id_externo,
    dadosOriginais: (p: any) => p.dados_originais,
    criadoEm: (p: any) => p.criado_em,
    atualizadoEm: (p: any) => p.atualizado_em,
  },

  Cliente: {
    pessoaId: (c: any) => c.pessoa_id,
    finalidadePrincipal: (c: any) => c.finalidade_principal,
    finalidadesSecundarias: (c: any) => c.finalidades_secundarias || [],
    regiaoInteresse: (c: any) => c.regiao_interesse,
    cidadeInteresse: (c: any) => c.cidade_interesse,
    bairroInteresse: (c: any) => c.bairro_interesse,
    tipoImovel: (c: any) => c.tipo_imovel,
    padraoImovel: (c: any) => c.padrao_imovel,
    valorMinimo: (c: any) => c.valor_minimo,
    valorMaximo: (c: any) => c.valor_maximo,
    prazoCompra: (c: any) => c.prazo_compra,
    formaPagamento: (c: any) => c.forma_pagamento,
    precisaFinanciamento: (c: any) => c.precisa_financiamento,
    jaPossuiImovel: (c: any) => c.ja_possui_imovel,
    eInvestidorConfirmado: (c: any) => Boolean(c.e_investidor_confirmado),
    indiceCompletude: (c: any) => c.indice_completude ?? 0,
    nivelConfianca: (c: any) => c.nivel_confianca || "baixa",
    camposFaltantes: (c: any) => c.campos_faltantes || [],
    sinaisClassificacao: (c: any) => c.sinais_classificacao || [],
    responsavelId: (c: any) => c.responsavel_id,
    ultimaInteracaoEm: (c: any) => c.ultima_interacao_em,
    proximaAcao: (c: any) => c.proxima_acao,
    proximaAcaoEm: (c: any) => c.proxima_acao_em,
    criadoEm: (c: any) => c.criado_em || new Date().toISOString(),
    atualizadoEm: (c: any) => c.atualizado_em || new Date().toISOString(),
    pessoa: (c: any) => c.pessoa,
    interacoes: (c: any) => c.interacoes || [],
    tarefas: (c: any) => c.tarefas || [],
    handoffs: (c: any) => c.handoffs || [],
  },

  Tarefa: {
    clienteId: (t: any) => t.cliente_id,
    responsavelId: (t: any) => t.responsavel_id,
    prazoEm: (t: any) => t.prazo_em,
    concluidoEm: (t: any) => t.concluido_em,
    criadoEm: (t: any) => t.criado_em || new Date().toISOString(),
    atualizadoEm: (t: any) => t.atualizado_em,
    cliente: (t: any) => {
      if (!t.cliente) return null;
      return {
        id: t.cliente.id,
        finalidadePrincipal: t.cliente.finalidade_principal,
        status: t.cliente.status,
        pessoa: t.cliente.pessoa,
      };
    },
  },

  Handoff: {
    clienteId: (h: any) => h.cliente_id,
    responsavelOrigem: (h: any) => h.responsavel_origem,
    responsavelDestino: (h: any) => h.responsavel_destino,
    expectativaCliente: (h: any) => h.expectativa_cliente,
    enviadoEm: (h: any) => h.enviado_em,
    recebidoEm: (h: any) => h.recebido_em,
    concluidoEm: (h: any) => h.concluido_em,
    criadoEm: (h: any) => h.criado_em || new Date().toISOString(),
    cliente: (h: any) => h.cliente,
  },

  Interacao: {
    clienteId: (i: any) => i.cliente_id,
    criadoPor: (i: any) => i.criado_por,
    ocorreuEm: (i: any) => i.ocorreu_em,
    dadosExtra: (i: any) => i.dados_extra,
  },
};

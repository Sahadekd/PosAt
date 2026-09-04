import {
  ClienteCompleto,
  PessoaCompleta,
  InteracaoItem,
  TarefaItem,
  HandoffItem,
  OportunidadeItem,
} from "./segmentacao/tipos";

// Initial seed data with high context Brazilian real estate examples
const INITIAL_PESSOAS: PessoaCompleta[] = [
  {
    id: "p-001",
    nome: "Carlos Eduardo Silveira",
    telefone: "(11) 98765-4321",
    email: "carlos.silveira@investimentos.com.br",
    documento: "123.456.789-00",
    origem: "formulario",
    dados_originais: {
      observacoes: "Está comparando regiões e buscando valorização com foco em studios para locação.",
      finalidadeDeclarada: "Quero comprar para investir",
    },
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "p-002",
    nome: "Mariana e Rodrigo Castilho",
    telefone: "(11) 97123-8899",
    email: "mariana.castilho@advocacia.com.br",
    documento: "234.567.890-11",
    origem: "whatsapp",
    dados_originais: {
      observacoes: "Família crescendo, procurando apartamento de 3 ou 4 dormitórios próximo ao Parque Ibirapuera.",
      finalidadeDeclarada: "Trocar de imóvel por um maior (upgrade de moradia)",
    },
    criado_em: new Date(Date.now() - 12 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "p-003",
    nome: "Dr. Roberto Albuquerque",
    telefone: "(21) 99888-2233",
    email: "roberto.albuquerque@cardio.med.br",
    documento: "345.678.901-22",
    origem: "crm",
    dados_originais: {
      observacoes: "Já adquiriu 3 unidades no ano passado, busca novos lançamentos em fase pré-reserva.",
      finalidadeDeclarada: "Investidor qualificado - busca rentabilidade acima de 0.7% a.m.",
    },
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "p-004",
    nome: "Beatriz Nogueira",
    telefone: "(11) 96543-2109",
    email: "beatriz.nogueira@techstartup.io",
    documento: "456.789.012-33",
    origem: "site",
    dados_originais: {
      observacoes: "Primeira aquisição, quer entender etapas de financiamento bancário e carência.",
      finalidadeDeclarada: "Primeiro imóvel para sair do aluguel",
    },
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "p-005",
    nome: "Fernando Guimarães",
    telefone: "(19) 99111-4455",
    email: "fernando@guimaraes.agr.br",
    documento: "567.890.123-44",
    origem: "planilha",
    dados_originais: {
      observacoes: "Busca casa em condomínio de campo ou litoral para temporada da família nos fins de semana.",
      finalidadeDeclarada: "Casa de campo / segunda residência",
    },
    criado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "p-006",
    nome: "Juliana Mendes",
    telefone: "(11) 94321-7788",
    email: null,
    documento: null,
    origem: "formulario",
    dados_originais: {
      observacoes: "Preencheu formulário rápido na landing page, faltam dados de orçamento e região.",
      finalidadeDeclarada: null,
    },
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const INITIAL_CLIENTES: ClienteCompleto[] = [
  {
    id: "c-001",
    pessoa_id: "p-001",
    status: "em_negociacao",
    finalidade_principal: "investimento",
    finalidades_secundarias: [],
    regiao_interesse: "Zona Sul",
    cidade_interesse: "São Paulo",
    bairro_interesse: "Moema / Vila Mariana",
    tipo_imovel: "Apartamento compacto / Studio",
    padrao_imovel: "Alto Padrão",
    valor_minimo: 450000,
    valor_maximo: 750000,
    prazo_compra: "3 a 6 meses",
    forma_pagamento: "Financiamento parcial / Recursos próprios",
    precisa_financiamento: true,
    ja_possui_imovel: true,
    e_investidor_confirmado: true,
    indice_completude: 95,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Cliente declarou ou confirmou interesse direto em investimento",
      "Interesse explícito em studios para locação de curta e longa estadia",
    ],
    ultima_interacao_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    proxima_acao: "Apresentar opções de carteira compatíveis com taxa de retorno, liquidez e valorização.",
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "c-002",
    pessoa_id: "p-002",
    status: "convertido",
    finalidade_principal: "upgrade",
    finalidades_secundarias: ["moradia"],
    regiao_interesse: "Zona Sul",
    cidade_interesse: "São Paulo",
    bairro_interesse: "Vila Nova Conceição",
    tipo_imovel: "Apartamento 4 Suítes",
    padrao_imovel: "Luxo",
    valor_minimo: 2500000,
    valor_maximo: 3800000,
    prazo_compra: "Imediato",
    forma_pagamento: "À vista + Financiamento",
    precisa_financiamento: false,
    ja_possui_imovel: true,
    e_investidor_confirmado: false,
    indice_completude: 100,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Cliente demonstra intenção de trocar ou ampliar o imóvel",
      "Família em expansão buscando localização nobre",
    ],
    ultima_interacao_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    proxima_acao: "Realizar handoff para equipe de onboarding e suporte pós-venda.",
    criado_em: new Date(Date.now() - 12 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "c-003",
    pessoa_id: "p-003",
    status: "pos_venda",
    finalidade_principal: "investimento",
    finalidades_secundarias: ["cliente_recorrente"],
    regiao_interesse: "Zona Sul / Centro Expandido",
    cidade_interesse: "São Paulo / Rio de Janeiro",
    bairro_interesse: "Pinheiros / Itaim / Leblon",
    tipo_imovel: "Studios e 1 Dormitório",
    padrao_imovel: "Alto Padrão",
    valor_minimo: 600000,
    valor_maximo: 1800000,
    prazo_compra: "Oportunidade de mercado",
    forma_pagamento: "À vista",
    precisa_financiamento: false,
    ja_possui_imovel: true,
    e_investidor_confirmado: true,
    indice_completude: 100,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Investidor frequente confirmado com múltiplas aquisições anteriores",
      "Foco em rentabilidade contratual e valorização patrimonial",
    ],
    ultima_interacao_em: new Date(Date.now() - 3 * 86400000).toISOString(),
    proxima_acao: "Enviar relatório mensal de valorização das unidades e prévias exclusivas.",
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "c-004",
    pessoa_id: "p-004",
    status: "em_qualificacao",
    finalidade_principal: "primeiro_imovel",
    finalidades_secundarias: ["moradia"],
    regiao_interesse: "Zona Oeste",
    cidade_interesse: "São Paulo",
    bairro_interesse: "Perdizes / Barra Funda",
    tipo_imovel: "Apartamento 2 Dormitórios",
    padrao_imovel: "Médio-Alto",
    valor_minimo: 400000,
    valor_maximo: 620000,
    prazo_compra: "1 a 3 meses",
    forma_pagamento: "Financiamento Caixa / FGTS",
    precisa_financiamento: true,
    ja_possui_imovel: false,
    e_investidor_confirmado: false,
    indice_completude: 90,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Cliente informou busca ativa pelo primeiro imóvel",
      "Desejo de sair do aluguel e usar saldo de FGTS",
    ],
    ultima_interacao_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    proxima_acao: "Oferecer consultoria especializada sobre simulação de financiamento, entrada e documentação.",
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "c-005",
    pessoa_id: "p-005",
    status: "novo_lead",
    finalidade_principal: "segunda_residencia",
    finalidades_secundarias: [],
    regiao_interesse: "Interior de SP",
    cidade_interesse: "Itu / Campinas",
    bairro_interesse: "Fazenda Boa Vista / Condomínios Fechados",
    tipo_imovel: "Casa em condomínio",
    padrao_imovel: "Alto Padrão",
    valor_minimo: 1800000,
    valor_maximo: 3200000,
    prazo_compra: "6 a 12 meses",
    forma_pagamento: "Recursos próprios",
    precisa_financiamento: false,
    ja_possui_imovel: true,
    e_investidor_confirmado: false,
    indice_completude: 85,
    nivel_confianca: "media",
    campos_faltantes: ["forma_pagamento"],
    sinais_classificacao: [
      "Cliente demonstra interesse em segunda residência ou lazer",
    ],
    ultima_interacao_em: new Date(Date.now() - 4 * 86400000).toISOString(),
    proxima_acao: "Apresentar empreendimentos com infraestrutura de lazer, praia ou campo.",
    criado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "c-006",
    pessoa_id: "p-006",
    status: "novo_lead",
    finalidade_principal: "nao_identificado",
    finalidades_secundarias: [],
    regiao_interesse: null,
    cidade_interesse: null,
    bairro_interesse: null,
    tipo_imovel: null,
    padrao_imovel: null,
    valor_minimo: null,
    valor_maximo: null,
    prazo_compra: null,
    forma_pagamento: null,
    precisa_financiamento: null,
    ja_possui_imovel: null,
    e_investidor_confirmado: false,
    indice_completude: 30,
    nivel_confianca: "baixa",
    campos_faltantes: [
      "telefone_ou_email",
      "finalidade",
      "regiao_interesse",
      "tipo_imovel",
      "faixa_de_valor",
      "prazo_compra",
    ],
    sinais_classificacao: [],
    ultima_interacao_em: null,
    proxima_acao: "Confirmar se o imóvel é para moradia, primeiro imóvel ou investimento.",
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const INITIAL_INTERACOES: InteracaoItem[] = [
  {
    id: "int-001",
    cliente_id: "c-001",
    tipo: "whatsapp",
    canal: "WhatsApp Comercial",
    descricao: "Cliente confirmou interesse em 2 unidades no empreendimento Vista Jardins para locação via Airbnb.",
    resultado: "Solicitou simulação de fluxo com 30% no período de obras.",
    criado_por: "Consultor André",
    ocorreu_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "int-002",
    cliente_id: "c-002",
    tipo: "visita",
    canal: "Plantão Decorado",
    descricao: "Visita com casal e arquiteto. Encantados com a planta de 190m² e pé direito duplo.",
    resultado: "Proposta assinada e entrada transferida. Pronto para passagem de bastão.",
    criado_por: "Gerente Patrícia",
    ocorreu_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "int-003",
    cliente_id: "c-003",
    tipo: "ligacao",
    canal: "Telefone Direto",
    descricao: "Check-in trimestral de pós-venda. Cliente satisfeito com a valorização de 18% da primeira unidade.",
    resultado: "Sinalizou interesse em reservar 2 studios no próximo lançamento em Pinheiros.",
    criado_por: "Gestora Fernanda",
    ocorreu_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "int-004",
    cliente_id: "c-004",
    tipo: "email",
    canal: "E-mail Oficial",
    descricao: "Envio de simulação de financiamento habitacional com comparativo SAC vs PRICE.",
    resultado: "Aguardando envio dos holerites para aprovação de crédito.",
    criado_por: "Consultor André",
    ocorreu_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const INITIAL_TAREFAS: TarefaItem[] = [
  {
    id: "tar-001",
    cliente_id: "c-006",
    titulo: "Completar dados cadastrais e qualificação",
    descricao: "Campos faltantes: telefone_ou_email, finalidade, regiao_interesse, tipo_imovel, faixa_de_valor, prazo_compra",
    status: "pendente",
    prioridade: 1,
    prazo_em: new Date(Date.now() + 1 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "tar-002",
    cliente_id: "c-001",
    titulo: "Apresentar estudo de yield e retorno de locação",
    descricao: "Montar lâmina comparativa de valorização e retorno médio de aluguel para Moema e Vila Mariana.",
    status: "em_andamento",
    prioridade: 2,
    prazo_em: new Date(Date.now() + 2 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "tar-003",
    cliente_id: "c-002",
    titulo: "Executar protocolo de Onboarding e boas-vindas pós-compra",
    descricao: "Realizar conferência dos dados de contrato, acesso ao portal do cliente e agendamento de vistoria de obras.",
    status: "pendente",
    prioridade: 1,
    prazo_em: new Date(Date.now() + 1 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "tar-004",
    cliente_id: "c-004",
    titulo: "Coletar documentação para pré-aprovação de crédito bancário",
    descricao: "Solicitar RG, CPF, comprovante de residência e extratos bancários dos últimos 3 meses.",
    status: "em_andamento",
    prioridade: 2,
    prazo_em: new Date(Date.now() + 3 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "tar-005",
    cliente_id: "c-003",
    titulo: "Enviar informe trimestral e convite para preview VIP",
    descricao: "Apresentar primeira mão a maquete do lançamento Pinheiros Urban aos investidores premium.",
    status: "concluida",
    prioridade: 3,
    concluida_em: new Date(Date.now() - 3 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
  }
];

const INITIAL_HANDOFFS: HandoffItem[] = [
  {
    id: "han-001",
    cliente_id: "c-002",
    status: "aguardando_passagem",
    motivo: "Conversão de Venda Concluída",
    resumo: "Cliente comprou unidade 142 do Edifício Origem. Família muito exigente com acabamentos. O casal solicitou contato preferencial por WhatsApp.",
    pendencias: [
      "Conferir envio do kit de boas-vindas físico",
      "Cadastrar login do portal de acompanhamento de obras",
      "Agendar primeira reunião de alinhamento com a engenharia",
    ],
    expectativa_cliente: "Transparência total no cronograma de obras e canal direto com gerente de relacionamento.",
    enviado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  }
];

const INITIAL_OPORTUNIDADES: OportunidadeItem[] = [
  {
    id: "op-001",
    cliente_id: "c-003",
    tipo: "investimento_novo",
    descricao: "Reserva de 2 studios do próximo lançamento em Pinheiros.",
    valor_estimado: 2400000,
    status: "em_avaliacao",
    prioridade: 1,
    evidencia: "Check-in trimestral de pós-venda (int-003): cliente sinalizou interesse em reservar 2 studios no próximo lançamento em Pinheiros.",
    criado_por: "Gestora Fernanda",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 15 * 86400000).toISOString(),
    proximo_passo: "Enviar maquete e previsão de preços do Pinheiros Urban.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    criado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "op-002",
    cliente_id: "c-002",
    tipo: "upgrade",
    descricao: "Possível arremate de vaga de garagem extra ou unidade comercial na torre.",
    valor_estimado: 900000,
    status: "identificada",
    prioridade: 2,
    evidencia: "Conversão concluída (c-002) com família em expansão; pós-venda sinalizou possível ampliação de vaga/garagem.",
    criado_por: "Gerente Patrícia",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 30 * 86400000).toISOString(),
    proximo_passo: "Consultar disponibilidade de vaga extra na planta da torre.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "op-003",
    cliente_id: "c-001",
    tipo: "investimento_novo",
    descricao: "Carteira de 2 unidades no Vista Jardins para locação via Airbnb.",
    valor_estimado: 1200000,
    status: "proposta_enviada",
    prioridade: 1,
    evidencia: "interação int-001: cliente confirmou interesse em 2 unidades no Vista Jardins para locação via Airbnb.",
    criado_por: "Consultor André",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 10 * 86400000).toISOString(),
    proximo_passo: "Encaminhar simulação de fluxo com 30% no período de obras.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// In-memory persistent state during process lifetime
class StorageMemoryFallback {
  private pessoas: PessoaCompleta[] = [...INITIAL_PESSOAS];
  private clientes: ClienteCompleto[] = [...INITIAL_CLIENTES];
  private interacoes: InteracaoItem[] = [...INITIAL_INTERACOES];
  private tarefas: TarefaItem[] = [...INITIAL_TAREFAS];
  private handoffs: HandoffItem[] = [...INITIAL_HANDOFFS];
  private oportunidades: OportunidadeItem[] = [...INITIAL_OPORTUNIDADES];

  getPessoas() {
    return this.pessoas;
  }

  getClientes(filtros?: {
    finalidade?: string | null;
    status?: string | null;
    regiao?: string | null;
    confianca?: string | null;
    completude_maxima?: string | null;
    busca?: string | null;
  }) {
    let list = this.clientes.map((c) => {
      const pessoa = this.pessoas.find((p) => p.id === c.pessoa_id);
      return {
        ...c,
        pessoa,
      };
    });

    if (filtros?.finalidade) {
      list = list.filter((c) => c.finalidade_principal === filtros.finalidade);
    }
    if (filtros?.status) {
      list = list.filter((c) => c.status === filtros.status);
    }
    if (filtros?.confianca) {
      list = list.filter((c) => c.nivel_confianca === filtros.confianca);
    }
    if (filtros?.regiao) {
      const termo = filtros.regiao.toLowerCase();
      list = list.filter(
        (c) =>
          c.regiao_interesse?.toLowerCase().includes(termo) ||
          c.cidade_interesse?.toLowerCase().includes(termo) ||
          c.bairro_interesse?.toLowerCase().includes(termo)
      );
    }
    if (filtros?.completude_maxima) {
      const max = Number(filtros.completude_maxima);
      list = list.filter((c) => c.indice_completude <= max);
    }
    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      list = list.filter(
        (c) =>
          c.pessoa?.nome?.toLowerCase().includes(busca) ||
          c.pessoa?.email?.toLowerCase().includes(busca) ||
          c.pessoa?.telefone?.toLowerCase().includes(busca) ||
          c.tipo_imovel?.toLowerCase().includes(busca) ||
          c.bairro_interesse?.toLowerCase().includes(busca)
      );
    }

    return list.sort(
      (a, b) =>
        new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime()
    );
  }

  getClienteById(id: string): ClienteCompleto | null {
    const cliente = this.clientes.find((c) => c.id === id);
    if (!cliente) return null;
    const pessoa = this.pessoas.find((p) => p.id === cliente.pessoa_id);
    const interacoes = this.interacoes
      .filter((i) => i.cliente_id === id)
      .sort((a, b) => new Date(b.ocorreu_em).getTime() - new Date(a.ocorreu_em).getTime());
    const tarefas = this.tarefas
      .filter((t) => t.cliente_id === id)
      .sort((a, b) => a.prioridade - b.prioridade);
    const handoffs = this.handoffs
      .filter((h) => h.cliente_id === id)
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

    return {
      ...cliente,
      pessoa,
      interacoes,
      tarefas,
      handoffs,
    };
  }

  addPessoa(pessoa: Partial<PessoaCompleta>): PessoaCompleta {
    const newPessoa: PessoaCompleta = {
      id: pessoa.id || `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nome: pessoa.nome || null,
      telefone: pessoa.telefone || null,
      email: pessoa.email || null,
      documento: pessoa.documento || null,
      origem: pessoa.origem || "manual",
      dados_originais: pessoa.dados_originais || {},
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.pessoas.unshift(newPessoa);
    return newPessoa;
  }

  addCliente(cliente: Partial<ClienteCompleto>): ClienteCompleto {
    const newCliente: ClienteCompleto = {
      id: cliente.id || `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      pessoa_id: cliente.pessoa_id!,
      status: cliente.status || "novo_lead",
      finalidade_principal: cliente.finalidade_principal || "nao_identificado",
      finalidades_secundarias: cliente.finalidades_secundarias || [],
      regiao_interesse: cliente.regiao_interesse || null,
      cidade_interesse: cliente.cidade_interesse || null,
      bairro_interesse: cliente.bairro_interesse || null,
      tipo_imovel: cliente.tipo_imovel || null,
      padrao_imovel: cliente.padrao_imovel || null,
      valor_minimo: cliente.valor_minimo ?? null,
      valor_maximo: cliente.valor_maximo ?? null,
      prazo_compra: cliente.prazo_compra || null,
      forma_pagamento: cliente.forma_pagamento || null,
      precisa_financiamento: cliente.precisa_financiamento ?? null,
      ja_possui_imovel: cliente.ja_possui_imovel ?? null,
      e_investidor_confirmado: cliente.e_investidor_confirmado ?? false,
      indice_completude: cliente.indice_completude ?? 0,
      nivel_confianca: cliente.nivel_confianca || "baixa",
      campos_faltantes: cliente.campos_faltantes || [],
      sinais_classificacao: cliente.sinais_classificacao || [],
      responsavel_id: cliente.responsavel_id || null,
      ultima_interacao_em: cliente.ultima_interacao_em || null,
      proxima_acao: cliente.proxima_acao || null,
      proxima_acao_em: cliente.proxima_acao_em || null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.clientes.unshift(newCliente);
    return newCliente;
  }

  updateCliente(id: string, updates: Partial<ClienteCompleto>): ClienteCompleto | null {
    const index = this.clientes.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.clientes[index] = {
      ...this.clientes[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.clientes[index];
  }

  addInteracao(interacao: Partial<InteracaoItem>): InteracaoItem {
    const newInteracao: InteracaoItem = {
      id: interacao.id || `int-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: interacao.cliente_id!,
      tipo: interacao.tipo || "observacao",
      canal: interacao.canal || null,
      descricao: interacao.descricao || "",
      resultado: interacao.resultado || null,
      criado_por: interacao.criado_por || null,
      ocorreu_em: interacao.ocorreu_em || new Date().toISOString(),
      dados_extra: interacao.dados_extra || {},
    };
    this.interacoes.unshift(newInteracao);

    // Update client's last interaction
    this.updateCliente(newInteracao.cliente_id, {
      ultima_interacao_em: newInteracao.ocorreu_em,
    });

    return newInteracao;
  }

  getInteracoes(clienteId?: string) {
    if (clienteId) {
      return this.interacoes.filter((i) => i.cliente_id === clienteId);
    }
    return this.interacoes;
  }

  addTarefa(tarefa: Partial<TarefaItem>): TarefaItem {
    const newTarefa: TarefaItem = {
      id: tarefa.id || `tar-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: tarefa.cliente_id!,
      titulo: tarefa.titulo || "Tarefa sem título",
      descricao: tarefa.descricao || null,
      status: tarefa.status || "pendente",
      prioridade: tarefa.prioridade ?? 3,
      responsavel_id: tarefa.responsavel_id || null,
      prazo_em: tarefa.prazo_em || null,
      concluida_em: tarefa.concluida_em || null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.tarefas.unshift(newTarefa);
    return newTarefa;
  }

  updateTarefa(id: string, updates: Partial<TarefaItem>): TarefaItem | null {
    const index = this.tarefas.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tarefas[index] = {
      ...this.tarefas[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.tarefas[index];
  }

  getTarefas() {
    return this.tarefas.map((t) => {
      const cliente = this.clientes.find((c) => c.id === t.cliente_id);
      const pessoa = cliente ? this.pessoas.find((p) => p.id === cliente.pessoa_id) : null;
      return {
        ...t,
        cliente: cliente
          ? {
              id: cliente.id,
              finalidade_principal: cliente.finalidade_principal,
              status: cliente.status,
              pessoa: pessoa
                ? {
                    nome: pessoa.nome,
                    telefone: pessoa.telefone,
                    email: pessoa.email,
                  }
                : undefined,
            }
          : undefined,
      };
    });
  }

  addHandoff(handoff: Partial<HandoffItem>): HandoffItem {
    const newHandoff: HandoffItem = {
      id: handoff.id || `han-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: handoff.cliente_id!,
      responsavel_origem: handoff.responsavel_origem || null,
      responsavel_destino: handoff.responsavel_destino || null,
      status: handoff.status || "aguardando_passagem",
      motivo: handoff.motivo || null,
      resumo: handoff.resumo || null,
      pendencias: handoff.pendencias || [],
      expectativa_cliente: handoff.expectativa_cliente || null,
      enviado_em: handoff.enviado_em || new Date().toISOString(),
      recebido_em: handoff.recebido_em || null,
      concluido_em: handoff.concluido_em || null,
      criado_em: new Date().toISOString(),
    };
    this.handoffs.unshift(newHandoff);

    // Update client status to handoff_pendente if applicable
    this.updateCliente(newHandoff.cliente_id, {
      status: "handoff_pendente",
    });

    return newHandoff;
  }

  getHandoffs() {
    return this.handoffs.map((h) => {
      const cliente = this.getClienteById(h.cliente_id);
      return {
        ...h,
        cliente: cliente || undefined,
      };
    });
  }

  getOportunidades() {
    return this.oportunidades.map((o) => {
      const cliente = this.getClienteById(o.cliente_id);
      return {
        ...o,
        cliente: cliente
          ? {
              id: cliente.id,
              nome: cliente.pessoa?.nome || null,
              telefone: cliente.pessoa?.telefone || null,
              email: cliente.pessoa?.email || null,
              finalidade_principal: cliente.finalidade_principal,
              status: cliente.status,
              nivel_confianca: cliente.nivel_confianca,
            }
          : undefined,
      };
    });
  }

  addOportunidade(oportunidade: Partial<OportunidadeItem>): OportunidadeItem {
    const newOportunidade: OportunidadeItem = {
      id: oportunidade.id || `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: oportunidade.cliente_id!,
      tipo: oportunidade.tipo || "outro",
      descricao: oportunidade.descricao || "",
      valor_estimado: oportunidade.valor_estimado ?? null,
      status: oportunidade.status || "identificada",
      prioridade: oportunidade.prioridade ?? 3,
      evidencia: oportunidade.evidencia || null,
      criado_por: oportunidade.criado_por || null,
      responsavel_id: oportunidade.responsavel_id || null,
      prazo_em: oportunidade.prazo_em || null,
      proximo_passo: oportunidade.proximo_passo || null,
      ganha_em: oportunidade.ganha_em || null,
      perdida_em: oportunidade.perdida_em || null,
      motivo_perda: oportunidade.motivo_perda || null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.oportunidades.unshift(newOportunidade);
    return newOportunidade;
  }

  updateOportunidade(id: string, updates: Partial<OportunidadeItem>): OportunidadeItem | null {
    const index = this.oportunidades.findIndex((o) => o.id === id);
    if (index === -1) return null;
    const updated: OportunidadeItem = {
      ...this.oportunidades[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    if (updates.status === "ganha" && !updated.ganha_em) {
      updated.ganha_em = new Date().toISOString();
    }
    if (updates.status === "perdida" && !updated.perdida_em) {
      updated.perdida_em = new Date().toISOString();
    }
    this.oportunidades[index] = updated;
    return updated;
  }

  getStats() {
    const totalClientes = this.clientes.length;
    const completudeMedia = totalClientes > 0
      ? Math.round(this.clientes.reduce((sum, c) => sum + Number(c.indice_completude || 0), 0) / totalClientes)
      : 0;
    const investidores = this.clientes.filter(
      (c) => c.finalidade_principal === "investimento" || c.finalidade_principal === "possivel_investidor"
    ).length;
    const tarefasPendentes = this.tarefas.filter(
      (t) => t.status === "pendente" || t.status === "em_andamento"
    ).length;
    const handoffsAtivos = this.handoffs.filter(
      (h) => h.status !== "concluido"
    ).length;
    const oportunidadesAtivas = this.oportunidades.filter(
      (o) => o.status !== "ganha" && o.status !== "perdida" && o.status !== "arquivada"
    ).length;
    const oportunidadesValor = this.oportunidades
      .filter((o) => o.status !== "ganha" && o.status !== "perdida" && o.status !== "arquivada")
      .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
    const investidoresPotenciais = this.clientes.filter(
      (c) => c.finalidade_principal === "possivel_investidor" || c.oportunidade_upsell
    ).length;

    return {
      totalClientes,
      completudeMedia,
      investidores,
      tarefasPendentes,
      handoffsAtivos,
      oportunidadesAtivas,
      oportunidadesValor,
      investidoresPotenciais,
    };
  }
}

// Global singleton for Next.js dev server persistence
const globalForStorage = globalThis as unknown as {
  storageFallbackInstance?: StorageMemoryFallback;
};

export const storageFallback =
  globalForStorage.storageFallbackInstance || new StorageMemoryFallback();

if (process.env.NODE_ENV !== "production") {
  globalForStorage.storageFallbackInstance = storageFallback;
}

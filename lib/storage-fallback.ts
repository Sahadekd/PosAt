import {
  ClienteCompleto,
  PessoaCompleta,
  InteracaoItem,
  TarefaItem,
  HandoffItem,
  OportunidadeItem,
  HistoricoOportunidadeItem,
  VendedorItem,
  ImovelItem,
  ConexaoWhatsAppItem,
  ConversaWhatsAppItem,
  MensagemWhatsAppItem,
  PesquisaNpsItem,
  RegistroAcessoWhatsAppItem,
} from "./segmentacao/tipos";
import { estaSemResposta, normalizarTelefone } from "./whatsapp";

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
    responsavel_id: "ven-001",
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
    responsavel_id: "ven-001",
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
    responsavel_id: "ven-001",
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
    status: "em_andamento",
    prioridade: 1,
    evidencia: "Check-in trimestral de pós-venda (int-003): cliente sinalizou interesse em reservar 2 studios no próximo lançamento em Pinheiros.",
    criado_por: "Gestora Fernanda",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 15 * 86400000).toISOString(),
    proximo_passo: "Enviar maquete e previsão de preços do Pinheiros Urban.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-003",
    imovel_id: "imo-003",
    regra_geradora: "venda_recente",
    tags: ["Investidor", "Lançamento Pinheiros"],
    origem: "crm",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
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
    vendedor_id: "ven-002",
    imovel_id: "imo-005",
    regra_geradora: "origem_manual",
    tags: ["Upgrade", "Garagem"],
    origem: "manual",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "op-003",
    cliente_id: "c-001",
    tipo: "investimento_novo",
    descricao: "Carteira de 2 unidades no Vista Jardins para locação via Airbnb.",
    valor_estimado: 1200000,
    status: "aguardando_decisao",
    prioridade: 1,
    evidencia: "interação int-001: cliente confirmou interesse em 2 unidades no Vista Jardins para locação via Airbnb.",
    criado_por: "Consultor André",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 10 * 86400000).toISOString(),
    proximo_passo: "Encaminhar simulação de fluxo com 30% no período de obras.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-001",
    imovel_id: "imo-001",
    regra_geradora: "venda_recente",
    tags: ["Airbnb", "2 unidades"],
    origem: "crm",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "op-004",
    cliente_id: "c-003",
    tipo: "investimento_novo",
    descricao: "Carteira de 1 unidade em Ribeirão Preto (interior).",
    valor_estimado: 680000,
    status: "removida",
    prioridade: 3,
    evidencia: "Cliente citou em ligação o interesse em investir fora da capital.",
    criado_por: "Gestora Fernanda",
    responsavel_id: null,
    prazo_em: null,
    proximo_passo: null,
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-003",
    imovel_id: null,
    regra_geradora: "base_retrabalho",
    tags: ["Removido"],
    origem: "crm",
    removida_motivo: "Cliente confirmou que já está investindo em outra incorporadora.",
    removida_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "op-005",
    cliente_id: "c-002",
    tipo: "upgrade",
    descricao: "Viabilização de 1 unidade extra na torre para renda.",
    valor_estimado: 780000,
    status: "convertida",
    prioridade: 2,
    evidencia: "Feedback de pós-entrega: família considera nova unidade para renda.",
    criado_por: "Gerente Patrícia",
    responsavel_id: null,
    prazo_em: null,
    proximo_passo: null,
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-002",
    imovel_id: "imo-005",
    regra_geradora: "locacao_recente",
    tags: ["Convertido"],
    origem: "crm",
    removida_motivo: null,
    removida_em: null,
    convertida_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    lead_criado_id: null,
    lead_duplicado_id: "c-002",
    tarefa_primeiro_contato_id: "t-ref-005",
    criado_em: new Date(Date.now() - 6 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "op-006",
    cliente_id: "c-003",
    tipo: "recompra",
    descricao: "Recompra de unidade adicional no Vista Jardins para renda mensal.",
    valor_estimado: 980000,
    status: "em_avaliacao",
    prioridade: 1,
    evidencia: "Conversa no WhatsApp (espelhada): investidor pediu avaliação de mais uma unidade no mesmo empreendimento.",
    criado_por: "Consultor André",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 12 * 86400000).toISOString(),
    proximo_passo: "Levar proposta de permuta do flat atual pela unidade 3 dorm.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-001",
    imovel_id: "imo-001",
    regra_geradora: "base_retrabalho",
    tags: ["Recompra", "Renda mensal"],
    origem: "whatsapp",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "op-007",
    cliente_id: "c-004",
    tipo: "indicacao",
    descricao: "Indicação do casal Castilho: amiga procurando studio no Pinheiros Urban.",
    valor_estimado: 940000,
    status: "proposta_enviada",
    prioridade: 2,
    evidencia: "Formulário de indicação preenchido no site com autorização de contato pela cliente c-002.",
    criado_por: "Gestora Fernanda",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 8 * 86400000).toISOString(),
    proximo_passo: "Aguardar retorno da proposta enviada para a unidade PU-16.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-003",
    imovel_id: "imo-004",
    regra_geradora: "venda_recente",
    tags: ["Indicação", "Site"],
    origem: "formulario",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 7 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "op-008",
    cliente_id: "c-003",
    tipo: "servicos",
    descricao: "Renovação do contrato de serviços do estande e vitrine digital.",
    valor_estimado: 120000,
    status: "negociacao",
    prioridade: 2,
    evidencia: "Renovação anual do pacote de serviços: regularização documental, vitrine digital e relatório de valorização.",
    criado_por: "Gestora Fernanda",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 20 * 86400000).toISOString(),
    proximo_passo: "Fechar escopo e valores finais com o cliente em reunião.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: null,
    imovel_id: null,
    regra_geradora: "origem_manual",
    tags: ["Serviços", "Contrato"],
    origem: "manual",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 6 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "op-009",
    cliente_id: "c-005",
    tipo: "outro",
    descricao: "Permuta parcial avaliada para casa na Fazenda Boa Vista (Itu).",
    valor_estimado: null,
    status: "encerrada",
    prioridade: 3,
    evidencia: "Plano de permuta avaliado; encerrado em reunião com o cliente por decisão de adiar a mudança.",
    criado_por: "Gerente Patrícia",
    responsavel_id: null,
    prazo_em: null,
    proximo_passo: null,
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-002",
    imovel_id: "imo-009",
    regra_geradora: "origem_manual",
    tags: ["Encerrado", "Permuta"],
    origem: "planilha",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 20 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "op-010",
    cliente_id: "c-002",
    tipo: "recompra",
    descricao: "Unidade complementar reservada na Torre Central (renda).",
    valor_estimado: 780000,
    status: "ganha",
    prioridade: 1,
    evidencia: "Unidade TC-77 reservada após negociação de condições especiais de entrada.",
    criado_por: "Gerente Patrícia",
    responsavel_id: null,
    prazo_em: null,
    proximo_passo: null,
    ganha_em: new Date(Date.now() - 3 * 86400000).toISOString(),
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-002",
    imovel_id: "imo-005",
    regra_geradora: "locacao_recente",
    tags: ["Ganha", "Renda"],
    origem: "crm",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 15 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "op-011",
    cliente_id: "c-003",
    tipo: "investimento_novo",
    descricao: "Studio no Pinheiros Urban avaliado e perdido para concorrente.",
    valor_estimado: 940000,
    status: "perdida",
    prioridade: 3,
    evidencia: "Cliente optou por empreendimento de concorrente com entrega mais curta.",
    criado_por: "Gestora Fernanda",
    responsavel_id: null,
    prazo_em: null,
    proximo_passo: null,
    ganha_em: null,
    perdida_em: new Date(Date.now() - 6 * 86400000).toISOString(),
    motivo_perda: "Escolheu outro lançamento com prazo menor de entrega.",
    vendedor_id: "ven-003",
    imovel_id: "imo-004",
    regra_geradora: "base_retrabalho",
    tags: ["Perdido"],
    origem: "planilha",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 18 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "op-012",
    cliente_id: "c-006",
    tipo: "indicacao",
    descricao: "Indicação via WhatsApp de cliente c-004: amiga quer conhecer o Vista Jardins.",
    valor_estimado: 900000,
    status: "identificada",
    prioridade: 2,
    evidencia: "Mensagem espelhada: 'minha amiga quer visitar o Vista Jardins, posso indicar?'",
    criado_por: "Consultor André",
    responsavel_id: null,
    prazo_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    proximo_passo: "Agendar visita e confirmar perfil de compra.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: "ven-001",
    imovel_id: "imo-002",
    regra_geradora: "venda_recente",
    tags: ["Indicação", "WhatsApp"],
    origem: "whatsapp",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "op-013",
    cliente_id: "c-005",
    tipo: "servicos",
    descricao: "Assessoria de aquisição para segunda residência (survey e documentação).",
    valor_estimado: 85000,
    status: "aguardando_decisao",
    prioridade: 2,
    evidencia: "Proposta de assessoria apresentada ao cliente para segunda residência no interior.",
    criado_por: "Gerente Patrícia",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 30 * 86400000).toISOString(),
    proximo_passo: "Aguardar retorno do cliente sobre o pacote de assessoria.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    vendedor_id: null,
    imovel_id: null,
    regra_geradora: "origem_manual",
    tags: ["Assessoria"],
    origem: "manual",
    removida_motivo: null,
    removida_em: null,
    convertida_em: null,
    lead_criado_id: null,
    lead_duplicado_id: null,
    tarefa_primeiro_contato_id: null,
    criado_em: new Date(Date.now() - 4 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_VENDEDORES: VendedorItem[] = [
  {
    id: "ven-001",
    nome: "Consultor André",
    telefone: "(11) 97000-0001",
    email: "andre@quadra.com.br",
    documento_cpf: "411.222.333-44",
    creci: "CRECI 98.765-F",
    status: "ativo",
    origem: "crm",
    criado_em: new Date(Date.now() - 90 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "ven-002",
    nome: "Gerente Patrícia",
    telefone: "(11) 97000-0002",
    email: "patricia@quadra.com.br",
    documento_cpf: "522.333.444-55",
    creci: "CRECI 87.654-F",
    status: "ativo",
    origem: "crm",
    criado_em: new Date(Date.now() - 85 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "ven-003",
    nome: "Gestora Fernanda",
    telefone: "(11) 97000-0003",
    email: "fernanda@quadra.com.br",
    documento_cpf: "633.444.555-66",
    creci: null,
    status: "ativo",
    origem: "manual",
    criado_em: new Date(Date.now() - 40 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "ven-004",
    nome: "Capital Realty (Anunciante)",
    telefone: "(11) 97000-0004",
    email: "unidades@capitalrealty.com.br",
    documento_cpf: null,
    creci: null,
    status: "ativo",
    origem: "planilha",
    criado_em: new Date(Date.now() - 15 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "ven-005",
    nome: "Paula Moreira",
    telefone: "(11) 97000-0005",
    email: "paula.moreira@parceiras.com.br",
    documento_cpf: "744.555.666-77",
    creci: "CRECI SP 12.345-F",
    status: "inativo",
    origem: "formulario",
    criado_em: new Date(Date.now() - 60 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_IMOVEIS: ImovelItem[] = [
  {
    id: "imo-001",
    codigo_imovel: "VJ-202",
    empreendimento: "Vista Jardins",
    bairro: "Jardins",
    cidade: "São Paulo",
    regiao: "Oeste",
    tipologia: "2 dorm (Fitness)",
    padrao: "alto padrão",
    tipo_negocio: "ambos",
    valor_venda: 1200000,
    valor_locacao: 6200,
    status: "disponivel",
    caracteristicas: ["Varanda gourmet", "2 vagas"],
    vendedor_id: "ven-001",
    criado_em: new Date(Date.now() - 10 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "imo-002",
    codigo_imovel: "VJ-418",
    empreendimento: "Vista Jardins",
    bairro: "Jardins",
    cidade: "São Paulo",
    regiao: "Oeste",
    tipologia: "1 dorm (Studio Plus)",
    padrao: "alto padrão",
    tipo_negocio: "venda",
    valor_venda: 900000,
    valor_locacao: null,
    status: "disponivel",
    caracteristicas: ["Mobiliado", "1 vaga"],
    vendedor_id: "ven-001",
    criado_em: new Date(Date.now() - 9 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "imo-003",
    codigo_imovel: "PU-15",
    empreendimento: "Pinheiros Urban",
    bairro: "Pinheiros",
    cidade: "São Paulo",
    regiao: "Oeste",
    tipologia: "Studio",
    padrao: "alto padrão",
    tipo_negocio: "venda",
    valor_venda: 950000,
    valor_locacao: null,
    status: "reservado",
    caracteristicas: ["Lançamento", "Lazer completo"],
    vendedor_id: "ven-003",
    criado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "imo-004",
    codigo_imovel: "PU-16",
    empreendimento: "Pinheiros Urban",
    bairro: "Pinheiros",
    cidade: "São Paulo",
    regiao: "Oeste",
    tipologia: "Studio",
    padrao: "alto padrão",
    tipo_negocio: "venda",
    valor_venda: 940000,
    valor_locacao: null,
    status: "disponivel",
    caracteristicas: ["Lançamento", "Andar alto"],
    vendedor_id: "ven-003",
    criado_em: new Date(Date.now() - 7 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "imo-005",
    codigo_imovel: "TC-77",
    empreendimento: "Torre Central",
    bairro: "Centro",
    cidade: "São Paulo",
    regiao: "Centro",
    tipologia: "1 dorm",
    padrao: "médio padrão",
    tipo_negocio: "ambos",
    valor_venda: 620000,
    valor_locacao: 3400,
    status: "disponivel",
    caracteristicas: ["1 vaga", "Academia"],
    vendedor_id: "ven-002",
    criado_em: new Date(Date.now() - 6 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "imo-006",
    codigo_imovel: "TC-09",
    empreendimento: "Torre Central",
    bairro: "Centro",
    cidade: "São Paulo",
    regiao: "Centro",
    tipologia: "2 dorm",
    padrao: "médio padrão",
    tipo_negocio: "locacao",
    valor_venda: null,
    valor_locacao: 4200,
    status: "locado",
    caracteristicas: ["Varanda", "1 vaga"],
    vendedor_id: "ven-002",
    criado_em: new Date(Date.now() - 45 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "imo-007",
    codigo_imovel: "IBR-55",
    empreendimento: "Ibirapuera Gardens",
    bairro: "Moema",
    cidade: "São Paulo",
    regiao: "Zona Sul",
    tipologia: "3 dorm (Luxo)",
    padrao: "alto padrão",
    tipo_negocio: "venda",
    valor_venda: 2600000,
    valor_locacao: null,
    status: "vendido",
    caracteristicas: ["Lazer rooftop", "2 vagas", "Piscina"],
    vendedor_id: "ven-001",
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "imo-008",
    codigo_imovel: "BTP-101",
    empreendimento: "Barra Funda Ámbit",
    bairro: "Barra Funda",
    cidade: "São Paulo",
    regiao: "Oeste",
    tipologia: "2 dorm",
    padrao: "médio-alto padrão",
    tipo_negocio: "ambos",
    valor_venda: 680000,
    valor_locacao: 3800,
    status: "disponivel",
    caracteristicas: ["Coworking", "Pet place"],
    vendedor_id: "ven-004",
    criado_em: new Date(Date.now() - 14 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "imo-009",
    codigo_imovel: "ITU-03",
    empreendimento: "Fazenda Boa Vista",
    bairro: "Fazenda Boa Vista",
    cidade: "Itu",
    regiao: "Interior",
    tipologia: "Casa 4 dorm (condomínio)",
    padrao: "alto padrão",
    tipo_negocio: "venda",
    valor_venda: 2400000,
    valor_locacao: null,
    status: "disponivel",
    caracteristicas: ["Lote grande", "Segurança 24h"],
    vendedor_id: "ven-002",
    criado_em: new Date(Date.now() - 22 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const INITIAL_HISTORICO_OPORTUNIDADES: HistoricoOportunidadeItem[] = [
  {
    id: "his-001",
    oportunidade_id: "op-001",
    acao: "sugerida",
    de: null,
    para: "identificada",
    observacao: "Regra 'venda recente': cliente converteu em unidade há menos de 90 dias e é investidor confirmado.",
    criado_por: "sistema",
    criado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "his-002",
    oportunidade_id: "op-001",
    acao: "status_alterado",
    de: "identificada",
    para: "em_andamento",
    observacao: "Próximo passo definido: enviar maquete do lançamento.",
    criado_por: "Gestora Fernanda",
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "his-003",
    oportunidade_id: "op-004",
    acao: "removida",
    de: "identificada",
    para: "removida",
    observacao: "Cliente confirmou que já investe em outra incorporadora.",
    criado_por: "Gestora Fernanda",
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "his-004",
    oportunidade_id: "op-005",
    acao: "convertida",
    de: "aguardando_decisao",
    para: "convertida",
    observacao: "Lead criado na base para primeiro contato (deduplicado com cliente c-002).",
    criado_por: "Gerente Patrícia",
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "his-005",
    oportunidade_id: "op-003",
    acao: "sugerida",
    de: null,
    para: "identificada",
    observacao: "Regra 'venda recente': cliente converteu em 2 units e pediu simulação de fluxo.",
    criado_por: "sistema",
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "his-006",
    oportunidade_id: "op-003",
    acao: "status_alterado",
    de: "identificada",
    para: "aguardando_decisao",
    observacao: "Simulação de fluxo encaminhada; aguardando decisão do cliente.",
    criado_por: "Consultor André",
    criado_em: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "his-007",
    oportunidade_id: "op-006",
    acao: "sugerida",
    de: null,
    para: "identificada",
    observacao: "Regra 'base retrabalho': investidor recorrente reativou conversa no WhatsApp.",
    criado_por: "sistema",
    criado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "his-008",
    oportunidade_id: "op-006",
    acao: "status_alterado",
    de: "identificada",
    para: "em_avaliacao",
    observacao: "Investidor pediu avaliação de permuta do flat atual.",
    criado_por: "Consultor André",
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "his-009",
    oportunidade_id: "op-007",
    acao: "status_alterado",
    de: "identificada",
    para: "proposta_enviada",
    observacao: "Proposta enviada para a unidade PU-16 da indicação.",
    criado_por: "Gestora Fernanda",
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "his-010",
    oportunidade_id: "op-008",
    acao: "status_alterado",
    de: "identificada",
    para: "negociacao",
    observacao: "Cliente aceitou negociar escopo do contrato de serviços.",
    criado_por: "Gestora Fernanda",
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "his-011",
    oportunidade_id: "op-009",
    acao: "status_alterado",
    de: "identificada",
    para: "encerrada",
    observacao: "Cliente decidiu adiar a mudança para o interior.",
    criado_por: "Gerente Patrícia",
    criado_em: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "his-012",
    oportunidade_id: "op-010",
    acao: "status_alterado",
    de: "negociacao",
    para: "ganha",
    observacao: "Unidade TC-77 reservada com condições especiais de entrada.",
    criado_por: "Gerente Patrícia",
    criado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "his-013",
    oportunidade_id: "op-011",
    acao: "status_alterado",
    de: "proposta_enviada",
    para: "perdida",
    observacao: "Cliente optou por lançamento de concorrente com entrega mais curta.",
    criado_por: "Gestora Fernanda",
    criado_em: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "his-014",
    oportunidade_id: "op-005",
    acao: "observacao",
    de: null,
    para: null,
    observacao: "Tarefa 'Primeiro contato' agendada para o novo lead.",
    criado_por: "Gerente Patrícia",
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const H = 3600000;
const DIA = 24 * H;

const INITIAL_CONEXOES: ConexaoWhatsAppItem[] = [];

const INITIAL_CONVERSAS: ConversaWhatsAppItem[] = [];

const INITIAL_NPS: PesquisaNpsItem[] = [];

const INITIAL_ACESSOS_WHATSAPP: RegistroAcessoWhatsAppItem[] = [
  {
    id: "acs-001",
    conversa_id: "conv-002",
    cliente: "Dr. Roberto Albuquerque",
    usuario: "gestor@quadra",
    acao: "leitura_relatorio",
    em: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: "acs-002",
    conversa_id: "conv-005",
    cliente: "Mãe do André",
    usuario: "andre@quadra",
    acao: "acesso_restrito",
    em: new Date(Date.now() - 20 * 60000).toISOString(),
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
  private vendedores: VendedorItem[] = [...INITIAL_VENDEDORES];
  private imoveis: ImovelItem[] = [...INITIAL_IMOVEIS];
  private historicoOportunidades: HistoricoOportunidadeItem[] = [...INITIAL_HISTORICO_OPORTUNIDADES];
  private conexoesWhatsApp: ConexaoWhatsAppItem[] = [...INITIAL_CONEXOES];
  private conversasWhatsApp: ConversaWhatsAppItem[] = [...INITIAL_CONVERSAS];
  private npsWhatsApp: PesquisaNpsItem[] = [...INITIAL_NPS];
  private acessosWhatsApp: RegistroAcessoWhatsAppItem[] = [...INITIAL_ACESSOS_WHATSAPP];

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
    responsavel_id?: string | null;
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
    if (filtros?.responsavel_id) {
      list = list.filter((c) => c.responsavel_id === filtros.responsavel_id);
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
      const vendedor = o.vendedor_id
        ? this.vendedores.find((v) => v.id === o.vendedor_id)
        : null;
      const imovel = o.imovel_id ? this.imoveis.find((i) => i.id === o.imovel_id) : null;
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
        vendedor: vendedor
          ? {
              id: vendedor.id,
              nome: vendedor.nome,
            }
          : undefined,
        imovel: imovel
          ? {
              id: imovel.id,
              codigo_imovel: imovel.codigo_imovel,
              empreendimento: imovel.empreendimento,
              bairro: imovel.bairro,
              cidade: imovel.cidade,
              regiao: imovel.regiao,
              tipo_negocio: imovel.tipo_negocio,
              valor_venda: imovel.valor_venda,
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
      vendedor_id: oportunidade.vendedor_id || null,
      imovel_id: oportunidade.imovel_id || null,
      regra_geradora: oportunidade.regra_geradora || "origem_manual",
      tags: oportunidade.tags || [],
      origem: oportunidade.origem || "manual",
      removida_motivo: oportunidade.removida_motivo || null,
      removida_em: oportunidade.removida_em || null,
      convertida_em: oportunidade.convertida_em || null,
      lead_criado_id: oportunidade.lead_criado_id || null,
      lead_duplicado_id: oportunidade.lead_duplicado_id || null,
      tarefa_primeiro_contato_id: oportunidade.tarefa_primeiro_contato_id || null,
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
    if (updates.status === "removida" && !updated.removida_em) {
      updated.removida_em = new Date().toISOString();
    }
    if (updates.status === "convertida" && !updated.convertida_em) {
      updated.convertida_em = new Date().toISOString();
    }
    this.oportunidades[index] = updated;
    return updated;
  }

  getVendedores(): VendedorItem[] {
    return [...this.vendedores];
  }

  getVendedorById(id: string): VendedorItem | null {
    return this.vendedores.find((v) => v.id === id) || null;
  }

  addVendedor(dados: Partial<VendedorItem>): VendedorItem {
    const novo: VendedorItem = {
      id: dados.id || `ven-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nome: dados.nome || "Sem nome",
      telefone: dados.telefone || null,
      email: dados.email || null,
      documento_cpf: dados.documento_cpf || null,
      creci: dados.creci || null,
      status: dados.status || "ativo",
      origem: dados.origem || "manual",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.vendedores.push(novo);
    return novo;
  }

  updateVendedor(id: string, dados: Partial<VendedorItem>): VendedorItem | null {
    const index = this.vendedores.findIndex((v) => v.id === id);
    if (index === -1) return null;
    const atualizado: VendedorItem = {
      ...this.vendedores[index],
      ...dados,
      atualizado_em: new Date().toISOString(),
    };
    this.vendedores[index] = atualizado;
    return atualizado;
  }

  getImoveis(): ImovelItem[] {
    return [...this.imoveis].sort((a, b) => a.codigo_imovel.localeCompare(b.codigo_imovel));
  }

  getImovelById(id: string): ImovelItem | null {
    return this.imoveis.find((i) => i.id === id) || null;
  }

  addImovel(dados: Partial<ImovelItem>): ImovelItem {
    const novo: ImovelItem = {
      id: dados.id || `imo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      codigo_imovel: dados.codigo_imovel || `IMO-${Date.now()}`,
      empreendimento: dados.empreendimento || "—",
      bairro: dados.bairro || "",
      cidade: dados.cidade || "",
      regiao: dados.regiao || "",
      tipologia: dados.tipologia || "",
      padrao: dados.padrao || null,
      tipo_negocio: dados.tipo_negocio || "venda",
      valor_venda: dados.valor_venda ?? null,
      valor_locacao: dados.valor_locacao ?? null,
      status: dados.status || "disponivel",
      caracteristicas: dados.caracteristicas || [],
      vendedor_id: dados.vendedor_id || null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.imoveis.push(novo);
    return novo;
  }

  updateImovel(id: string, dados: Partial<ImovelItem>): ImovelItem | null {
    const index = this.imoveis.findIndex((v) => v.id === id);
    if (index === -1) return null;
    const atualizado: ImovelItem = {
      ...this.imoveis[index],
      ...dados,
      atualizado_em: new Date().toISOString(),
    };
    this.imoveis[index] = atualizado;
    return atualizado;
  }

  getHistoricoOportunidades(oportunidadeId?: string): HistoricoOportunidadeItem[] {
    const lista = oportunidadeId
      ? this.historicoOportunidades.filter((h) => h.oportunidade_id === oportunidadeId)
      : this.historicoOportunidades;
    return [...lista].sort(
      (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );
  }

  addHistoricoOportunidade(dados: Partial<HistoricoOportunidadeItem>): HistoricoOportunidadeItem {
    const novo: HistoricoOportunidadeItem = {
      id: dados.id || `his-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      oportunidade_id: dados.oportunidade_id || "-",
      acao: dados.acao || "status_alterado",
      de: dados.de || null,
      para: dados.para || null,
      observacao: dados.observacao || null,
      criado_por: dados.criado_por || null,
      criado_em: new Date().toISOString(),
    };
    this.historicoOportunidades.unshift(novo);
    return novo;
  }

  // ---- WhatsApp (Espelhamento) ----

  private enriquecerConversa(conversa: ConversaWhatsAppItem): ConversaWhatsAppItem {
    const cliente = conversa.cliente_id
      ? this.clientes.find((c) => c.id === conversa.cliente_id)
      : null;
    const pessoa = cliente ? this.pessoas.find((p) => p.id === cliente.pessoa_id) : null;
    return {
      ...conversa,
      cliente: cliente
        ? {
            id: cliente.id,
            nome: pessoa?.nome || null,
            telefone: pessoa?.telefone || null,
            finalidade_principal: cliente.finalidade_principal,
            status: cliente.status,
          }
        : null,
    };
  }

  getConexoesWhatsApp(): ConexaoWhatsAppItem[] {
    return this.conexoesWhatsApp.map((c) => ({ ...c }));
  }

  addConexaoWhatsApp(conexao: Partial<Omit<ConexaoWhatsAppItem, "id">> & { id?: string }): ConexaoWhatsAppItem {
    const agora = new Date().toISOString();
    const nova: ConexaoWhatsAppItem = {
      id: conexao.id || `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      corretor: conexao.corretor || "Corretor",
      numero: conexao.numero || "",
      sessao_id: conexao.sessao_id || `sessao-${Date.now()}`,
      status: conexao.status || "desconectado",
      qr_code: conexao.qr_code ?? null,
      qr_expira_em: conexao.qr_expira_em ?? null,
      ultimo_ping_em: conexao.ultimo_ping_em ?? null,
      criado_em: agora,
      atualizado_em: agora,
    };
    this.conexoesWhatsApp.unshift(nova);
    return { ...nova };
  }

  updateConexaoWhatsApp(
    id: string,
    updates: Partial<Omit<ConexaoWhatsAppItem, "id">>
  ): ConexaoWhatsAppItem | null {
    const index = this.conexoesWhatsApp.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.conexoesWhatsApp[index] = {
      ...this.conexoesWhatsApp[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.conexoesWhatsApp[index];
  }

  getConversasWhatsApp(): ConversaWhatsAppItem[] {
    return this.conversasWhatsApp
      .map((c) => this.enriquecerConversa(c))
      .sort(
        (a, b) =>
          new Date(b.ultima_mensagem_em).getTime() -
          new Date(a.ultima_mensagem_em).getTime()
      );
  }

  getConversaWhatsAppById(id: string): ConversaWhatsAppItem | null {
    const conversa = this.conversasWhatsApp.find((c) => c.id === id);
    return conversa ? this.enriquecerConversa(conversa) : null;
  }

  getConversaWhatsAppByNumero(conexaoId: string, numero: string): ConversaWhatsAppItem | null {
    const conversa = this.conversasWhatsApp.find(
      (c) => c.conexao_id === conexaoId && c.numero_cliente === numero
    );
    return conversa ? this.enriquecerConversa(conversa) : null;
  }

  addConversaWhatsApp(conversa: Partial<ConversaWhatsAppItem>): ConversaWhatsAppItem {
    const nova: ConversaWhatsAppItem = {
      id: conversa.id || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conexao_id: conversa.conexao_id!,
      corretor: conversa.corretor || null,
      numero_cliente: conversa.numero_cliente!,
      nome_cliente: conversa.nome_cliente || null,
      cliente_id: conversa.cliente_id || null,
      empreendimento: conversa.empreendimento || null,
      etapa: conversa.etapa || null,
      espelhando: conversa.espelhando ?? true,
      privada_motivo: conversa.privada_motivo || null,
      consentimento_lgpd: conversa.consentimento_lgpd || null,
      primeiro_mensagem_em: conversa.primeiro_mensagem_em || new Date().toISOString(),
      ultima_mensagem_em: conversa.ultima_mensagem_em || new Date().toISOString(),
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      mensagens: [],
    };
    this.conversasWhatsApp.unshift(nova);
    return this.enriquecerConversa(nova);
  }

  updateConversaWhatsApp(
    id: string,
    updates: Partial<Omit<ConversaWhatsAppItem, "id" | "mensagens">>
  ): ConversaWhatsAppItem | null {
    const index = this.conversasWhatsApp.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.conversasWhatsApp[index] = {
      ...this.conversasWhatsApp[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.enriquecerConversa(this.conversasWhatsApp[index]);
  }

  addMensagemWhatsApp(
    conversaId: string,
    mensagem: Partial<MensagemWhatsAppItem>
  ): MensagemWhatsAppItem | null {
    const index = this.conversasWhatsApp.findIndex((c) => c.id === conversaId);
    if (index === -1) return null;
    const nova: MensagemWhatsAppItem = {
      id: mensagem.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversa_id: conversaId,
      origem: mensagem.origem || "recebida",
      tipo: mensagem.tipo || "texto",
      conteudo: mensagem.conteudo || "",
      anexo_url: mensagem.anexo_url || null,
      lida: mensagem.lida ?? false,
      enviado_em: mensagem.enviado_em || new Date().toISOString(),
      criado_em: new Date().toISOString(),
    };
    this.conversasWhatsApp[index].mensagens.push(nova);
    this.conversasWhatsApp[index].mensagens.sort(
      (a, b) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime()
    );
    this.conversasWhatsApp[index] = {
      ...this.conversasWhatsApp[index],
      ultima_mensagem_em:
        nova.enviado_em > this.conversasWhatsApp[index].ultima_mensagem_em
          ? nova.enviado_em
          : this.conversasWhatsApp[index].ultima_mensagem_em,
      atualizado_em: new Date().toISOString(),
    };
    return nova;
  }

  getConversaPorCliente(clienteId: string): ConversaWhatsAppItem | null {
    const conversa = this.conversasWhatsApp.find((c) => c.cliente_id === clienteId);
    return conversa ? this.enriquecerConversa(conversa) : null;
  }

  getWhatsAppMetrics(): {
    totalConversas: number;
    espelhadas: number;
    semMatch: number;
    privadas: number;
    semResposta: {
      conversaId: string;
      nomeCliente: string | null;
      numero: string;
      corretor: string | null;
      etapa: string | null;
      ultimaMensagem: string | null;
      vencidoAposHoras: number;
    }[];
    porCorretor: {
      corretor: string;
      conversas: number;
      mensagens: number;
      semResposta: number;
      hoje: number;
    }[];
    volumePorDia: {
      data: string;
      total: number;
      recebidas: number;
      enviadas: number;
    }[];
  } {
    const conversas = this.conversasWhatsApp;
    const totalConversas = conversas.length;
    const espelhadas = conversas.filter(
      (c) => c.espelhando && c.cliente_id && c.numero_cliente.length > 0
    ).length;
    const semMatch = conversas.filter((c) => !c.cliente_id).length;
    const privadas = conversas.filter((c) => !c.espelhando).length;

    const semResposta = conversas
      .filter((c) => estaSemResposta(c.mensagens).semResposta)
      .map((c) => {
        const estado = estaSemResposta(c.mensagens);
        return {
          conversaId: c.id,
          nomeCliente: c.nome_cliente,
          numero: c.numero_cliente,
          corretor: c.corretor,
          etapa: c.etapa,
          ultimaMensagem: estado.ultimaMensagem,
          vencidoAposHoras: estado.vencidoAposHoras,
        };
      });

    const porCorretor = new Map<
      string,
      { corretor: string; conversas: number; mensagens: number; semResposta: number; hoje: number }
    >();
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);
    for (const c of conversas) {
      const corretor = c.corretor || "Sem responsável";
      const entry = porCorretor.get(corretor) || {
        corretor,
        conversas: 0,
        mensagens: 0,
        semResposta: 0,
        hoje: 0,
      };
      entry.conversas += 1;
      entry.mensagens += c.mensagens.length;
      entry.hoje += c.mensagens.filter(
        (m) => new Date(m.enviado_em).getTime() >= hojeInicio.getTime()
      ).length;
      if (estaSemResposta(c.mensagens).semResposta) entry.semResposta += 1;
      porCorretor.set(corretor, entry);
    }

    const volumePorDia: {
      data: string;
      total: number;
      recebidas: number;
      enviadas: number;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(Date.now() - i * DIA);
      const chave = dia.toISOString().slice(0, 10);
      const doDia = conversas.flatMap((c) => c.mensagens).filter(
        (m) => m.enviado_em.slice(0, 10) === chave
      );
      volumePorDia.push({
        data: chave,
        total: doDia.length,
        recebidas: doDia.filter((m) => m.origem === "recebida").length,
        enviadas: doDia.filter((m) => m.origem === "enviada").length,
      });
    }

    return {
      totalConversas,
      espelhadas,
      semMatch,
      privadas,
      semResposta,
      porCorretor: Array.from(porCorretor.values()).sort((a, b) => b.conversas - a.conversas),
      volumePorDia,
    };
  }

  // Busca um cliente ativo pelo telefone normalizado (padrão BR internacional).
  matchClientePorTelefone(numero: string): ClienteCompleto | null {
    const alvo = normalizarTelefone(numero);
    if (!alvo) return null;
    for (const c of this.clientes) {
      const pessoa = this.pessoas.find((p) => p.id === c.pessoa_id);
      const pessoaTel = normalizarTelefone(pessoa?.telefone);
      if (pessoaTel && pessoaTel === alvo) return c;
    }
    return null;
  }

  // ---- NPS (pesquisa de satisfação) ----

  getNpsWhatsApp(): PesquisaNpsItem[] {
    return this.npsWhatsApp
      .map((n) => {
        const conversa = this.conversasWhatsApp.find((c) => c.id === n.conversa_id);
        const cliente = n.cliente_id
          ? this.clientes.find((c) => c.id === n.cliente_id)
          : null;
        const pessoa = cliente ? this.pessoas.find((p) => p.id === cliente.pessoa_id) : null;
        return {
          ...n,
          cliente_nome: pessoa?.nome || n.cliente_nome || conversa?.nome_cliente || null,
        };
      })
      .sort(
        (a, b) => new Date(b.enviada_em).getTime() - new Date(a.enviada_em).getTime()
      );
  }

  addNpsWhatsApp(dados: Partial<PesquisaNpsItem>): PesquisaNpsItem {
    const nova: PesquisaNpsItem = {
      id: dados.id || `nps-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversa_id: dados.conversa_id!,
      cliente_id: dados.cliente_id || null,
      cliente_nome: dados.cliente_nome || null,
      etapa: dados.etapa || "geral",
      status: dados.status || "pendente",
      nota: dados.nota ?? null,
      comentario: dados.comentario || null,
      enviada_em: dados.enviada_em || new Date().toISOString(),
      respondida_em: dados.respondida_em || null,
    };
    this.npsWhatsApp.unshift(nova);
    return nova;
  }

  responderNpsWhatsApp(
    id: string,
    nota: number,
    comentario?: string | null
  ): PesquisaNpsItem | null {
    const index = this.npsWhatsApp.findIndex((n) => n.id === id);
    if (index === -1) return null;
    this.npsWhatsApp[index] = {
      ...this.npsWhatsApp[index],
      nota,
      comentario: comentario ?? this.npsWhatsApp[index].comentario,
      status: "respondida",
      respondida_em: new Date().toISOString(),
    };
    return this.npsWhatsApp[index];
  }

  getNpsPendentePorConversaWhatsApp(conversaId: string): PesquisaNpsItem | null {
    return (
      this.npsWhatsApp.find(
        (n) => n.conversa_id === conversaId && n.status === "pendente"
      ) || null
    );
  }

  // ---- LGPD: direito de exclusão ----

  removerConversaWhatsApp(id: string): boolean {
    const index = this.conversasWhatsApp.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.conversasWhatsApp.splice(index, 1);
    // Apaga também interações espelhadas e pesquisas vinculadas à conversa.
    this.interacoes = this.interacoes.filter(
      (i) => (i.dados_extra as { conversa_id?: string } | undefined)?.conversa_id !== id
    );
    this.npsWhatsApp = this.npsWhatsApp.filter((n) => n.conversa_id !== id);
    return true;
  }

  // ---- Auditoria de acesso (LGPD: log de quem acessou o histórico) ----

  registrarAcessoWhatsApp(
    dados: Partial<RegistroAcessoWhatsAppItem>
  ): RegistroAcessoWhatsAppItem {
    const novo: RegistroAcessoWhatsAppItem = {
      id:
        dados.id ||
        `acs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversa_id: dados.conversa_id || "-",
      cliente: dados.cliente || "—",
      usuario: dados.usuario || "sistema",
      acao: dados.acao || "acesso",
      em: dados.em || new Date().toISOString(),
    };
    this.acessosWhatsApp.unshift(novo);
    return novo;
  }

  getAcessosWhatsApp(): RegistroAcessoWhatsAppItem[] {
    return [...this.acessosWhatsApp].sort(
      (a, b) => new Date(b.em).getTime() - new Date(a.em).getTime()
    );
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
      (o) =>
        o.status !== "ganha" &&
        o.status !== "perdida" &&
        o.status !== "arquivada" &&
        o.status !== "convertida" &&
        o.status !== "removida" &&
        o.status !== "encerrada"
    ).length;
    const oportunidadesValor = this.oportunidades
      .filter(
        (o) =>
          o.status !== "ganha" &&
          o.status !== "perdida" &&
          o.status !== "arquivada" &&
          o.status !== "convertida" &&
          o.status !== "removida" &&
          o.status !== "encerrada"
      )
      .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
    const vendedoresAtivos = this.vendedores.filter((v) => v.status === "ativo").length;
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
      vendedoresAtivos,
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

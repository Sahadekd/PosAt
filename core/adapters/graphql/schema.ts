export const typeDefs = /* GraphQL */ `
  scalar JSON

  type Pessoa {
    id: ID!
    nome: String
    telefone: String
    email: String
    documento: String
    origem: String!
    idExterno: String
    dadosOriginais: JSON
    criadoEm: String
    atualizadoEm: String
  }

  type Cliente {
    id: ID!
    pessoaId: ID!
    status: String!
    finalidadePrincipal: String!
    finalidadesSecundarias: [String!]!
    regiaoInteresse: String
    cidadeInteresse: String
    bairroInteresse: String
    tipoImovel: String
    padraoImovel: String
    valorMinimo: Float
    valorMaximo: Float
    prazoCompra: String
    formaPagamento: String
    precisaFinanciamento: Boolean
    jaPossuiImovel: Boolean
    eInvestidorConfirmado: Boolean!
    indiceCompletude: Int!
    nivelConfianca: String!
    camposFaltantes: [String!]!
    sinaisClassificacao: [String!]!
    responsavelId: String
    ultimaInteracaoEm: String
    proximaAcao: String
    proximaAcaoEm: String
    criadoEm: String!
    atualizadoEm: String!
    pessoa: Pessoa
    interacoes: [Interacao!]
    tarefas: [Tarefa!]
    handoffs: [Handoff!]
  }

  type Interacao {
    id: ID!
    clienteId: ID!
    tipo: String!
    canal: String
    descricao: String!
    resultado: String
    criadoPor: String
    ocorreuEm: String!
    dadosExtra: JSON
  }

  type TarefaClienteInfo {
    id: ID!
    finalidadePrincipal: String!
    status: String!
    pessoa: TarefaPessoaInfo
  }

  type TarefaPessoaInfo {
    nome: String
    telefone: String
    email: String
  }

  type Tarefa {
    id: ID!
    clienteId: ID!
    titulo: String!
    descricao: String
    status: String!
    prioridade: Int!
    responsavelId: String
    prazoEm: String
    concluidoEm: String
    criadoEm: String!
    atualizadoEm: String
    cliente: TarefaClienteInfo
  }

  type Handoff {
    id: ID!
    clienteId: ID!
    responsavelOrigem: String
    responsavelDestino: String
    status: String!
    motivo: String
    resumo: String
    pendencias: [String!]!
    expectativaCliente: String
    enviadoEm: String
    recebidoEm: String
    concluidoEm: String
    criadoEm: String!
    cliente: Cliente
  }

  type OportunidadeClienteInfo {
    id: ID!
    nome: String
    telefone: String
    email: String
    finalidadePrincipal: String!
    status: String!
    nivelConfianca: String!
  }

  type Oportunidade {
    id: ID!
    clienteId: ID!
    tipo: String!
    descricao: String!
    valorEstimado: Float
    status: String!
    prioridade: Int!
    evidencia: String
    criadoPor: String
    responsavelId: String
    prazoEm: String
    proximoPasso: String
    ganhaEm: String
    perdidaEm: String
    motivoPerda: String
    criadoEm: String!
    atualizadoEm: String!
    cliente: OportunidadeClienteInfo
  }

  type DashboardStats {
    totalClientes: Int!
    completudeMedia: Int!
    investidores: Int!
    tarefasPendentes: Int!
    handoffsAtivos: Int!
    oportunidadesAtivas: Int
    oportunidadesValor: Float
    investidoresPotenciais: Int
  }

  type ResultadoClassificacao {
    finalidadePrincipal: String!
    finalidadesSecundarias: [String!]!
    nivelConfianca: String!
    sinais: [String!]!
    camposFaltantes: [String!]!
    proximaAcao: String!
  }

  input FiltrosClienteInput {
    finalidade: String
    status: String
    regiao: String
    confianca: String
    completudeMaxima: String
    busca: String
  }

  input PessoaInput {
    nome: String
    telefone: String
    email: String
    documento: String
    origem: String
    finalidadeDeclarada: String
    observacoes: String
  }

  input ClienteDetailsInput {
    regiaoInteresse: String
    cidadeInteresse: String
    bairroInteresse: String
    tipoImovel: String
    padraoImovel: String
    valorMinimo: Float
    valorMaximo: Float
    prazoCompra: String
    formaPagamento: String
    precisaFinanciamento: Boolean
    jaPossuiImovel: Boolean
    eInvestidorConfirmado: Boolean
  }

  input CriarClienteInput {
    pessoa: PessoaInput!
    cliente: ClienteDetailsInput
  }

  input CriarTarefaInput {
    clienteId: ID!
    titulo: String!
    descricao: String
    prioridade: Int
    responsavelId: String
    prazoEm: String
  }

  input AtualizarTarefaInput {
    id: ID!
    status: String
    titulo: String
    descricao: String
    prioridade: Int
    prazoEm: String
  }

  input CriarHandoffInput {
    clienteId: ID!
    responsavelOrigem: String
    responsavelDestino: String
    motivo: String
    resumo: String
    pendencias: [String!]
    expectativaCliente: String
  }

  input AtualizarHandoffInput {
    id: ID!
    status: String
    resumo: String
    pendencias: [String!]
    expectativaCliente: String
    responsavelDestino: String
  }

  input CriarInteracaoInput {
    clienteId: ID!
    tipo: String!
    canal: String
    descricao: String!
    resultado: String
    criadoPor: String
    ocorreuEm: String
  }

  input CriarOportunidadeInput {
    clienteId: ID!
    tipo: String!
    descricao: String!
    valorEstimado: Float
    prioridade: Int
    evidencia: String
    criadoPor: String
    responsavelId: String
    prazoEm: String
    proximoPasso: String
  }

  input AtualizarOportunidadeInput {
    id: ID!
    status: String
    descricao: String
    valorEstimado: Float
    prioridade: Int
    evidencia: String
    responsavelId: String
    prazoEm: String
    proximoPasso: String
    motivoPerda: String
  }

  type Query {
    clientes(filtros: FiltrosClienteInput): [Cliente!]!
    cliente(id: ID!): Cliente
    tarefas: [Tarefa!]!
    handoffs: [Handoff!]!
    oportunidades: [Oportunidade!]!
    interacoes(clienteId: ID): [Interacao!]!
    dashboardStats: DashboardStats!
  }

  type Mutation {
    criarCliente(input: CriarClienteInput!): Cliente!
    criarTarefa(input: CriarTarefaInput!): Tarefa!
    atualizarTarefa(input: AtualizarTarefaInput!): Tarefa
    criarHandoff(input: CriarHandoffInput!): Handoff!
    atualizarHandoff(input: AtualizarHandoffInput!): Handoff
    criarInteracao(input: CriarInteracaoInput!): Interacao!
    criarOportunidade(input: CriarOportunidadeInput!): Oportunidade!
    atualizarOportunidade(input: AtualizarOportunidadeInput!): Oportunidade
    classificarCliente(clienteId: ID!): ResultadoClassificacao!
  }
`;

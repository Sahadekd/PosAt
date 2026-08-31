/**
 * Cliente GraphQL unificado para web e mobile.
 * Executa queries e mutations via POST no endpoint /api/graphql.
 */

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export async function executeGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error! status: ${response.status}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message || "Erro na execução GraphQL");
  }

  return result.data as T;
}

// Queries pré-definidas
export const QUERIES = {
  GET_DASHBOARD_STATS: /* GraphQL */ `
    query GetDashboardStats {
      dashboardStats {
        totalClientes
        completudeMedia
        investidores
        tarefasPendentes
        handoffsAtivos
      }
    }
  `,

  GET_CLIENTES: /* GraphQL */ `
    query GetClientes($filtros: FiltrosClienteInput) {
      clientes(filtros: $filtros) {
        id
        status
        finalidadePrincipal
        finalidadesSecundarias
        regiaoInteresse
        cidadeInteresse
        bairroInteresse
        tipoImovel
        padraoImovel
        valorMinimo
        valorMaximo
        prazoCompra
        formaPagamento
        precisaFinanciamento
        jaPossuiImovel
        eInvestidorConfirmado
        indiceCompletude
        nivelConfianca
        camposFaltantes
        sinaisClassificacao
        proximaAcao
        criadoEm
        atualizadoEm
        pessoa {
          id
          nome
          telefone
          email
          origem
        }
        interacoes {
          id
          tipo
          canal
          descricao
          resultado
          ocorreuEm
        }
        tarefas {
          id
          titulo
          status
          prioridade
          prazoEm
        }
        handoffs {
          id
          status
          resumo
          pendencias
        }
      }
    }
  `,

  GET_CLIENTE_BY_ID: /* GraphQL */ `
    query GetClienteById($id: ID!) {
      cliente(id: $id) {
        id
        status
        finalidadePrincipal
        finalidadesSecundarias
        regiaoInteresse
        cidadeInteresse
        bairroInteresse
        tipoImovel
        padraoImovel
        valorMinimo
        valorMaximo
        prazoCompra
        formaPagamento
        precisaFinanciamento
        jaPossuiImovel
        eInvestidorConfirmado
        indiceCompletude
        nivelConfianca
        camposFaltantes
        sinaisClassificacao
        proximaAcao
        proximaAcaoEm
        criadoEm
        atualizadoEm
        pessoa {
          id
          nome
          telefone
          email
          documento
          origem
          dadosOriginais
        }
        interacoes {
          id
          tipo
          canal
          descricao
          resultado
          criadoPor
          ocorreuEm
        }
        tarefas {
          id
          titulo
          descricao
          status
          prioridade
          prazoEm
          concluidoEm
          criadoEm
        }
        handoffs {
          id
          status
          motivo
          resumo
          pendencias
          expectativaCliente
          responsavelOrigem
          responsavelDestino
          enviadoEm
          recebidoEm
          concluidoEm
          criadoEm
        }
      }
    }
  `,

  GET_TAREFAS: /* GraphQL */ `
    query GetTarefas {
      tarefas {
        id
        clienteId
        titulo
        descricao
        status
        prioridade
        responsavelId
        prazoEm
        concluidoEm
        criadoEm
        atualizadoEm
        cliente {
          id
          finalidadePrincipal
          status
          pessoa {
            nome
            telefone
            email
          }
        }
      }
    }
  `,

  GET_HANDOFFS: /* GraphQL */ `
    query GetHandoffs {
      handoffs {
        id
        clienteId
        responsavelOrigem
        responsavelDestino
        status
        motivo
        resumo
        pendencias
        expectativaCliente
        enviadoEm
        recebidoEm
        concluidoEm
        criadoEm
        cliente {
          id
          status
          finalidadePrincipal
          pessoa {
            nome
            telefone
            email
          }
        }
      }
    }
  `,
};

// Mutations pré-definidas
export const MUTATIONS = {
  CRIAR_CLIENTE: /* GraphQL */ `
    mutation CriarCliente($input: CriarClienteInput!) {
      criarCliente(input: $input) {
        id
        status
        finalidadePrincipal
        indiceCompletude
        nivelConfianca
        pessoa {
          id
          nome
          telefone
          email
        }
      }
    }
  `,

  CRIAR_TAREFA: /* GraphQL */ `
    mutation CriarTarefa($input: CriarTarefaInput!) {
      criarTarefa(input: $input) {
        id
        titulo
        status
        prioridade
        prazoEm
      }
    }
  `,

  ATUALIZAR_TAREFA: /* GraphQL */ `
    mutation AtualizarTarefa($input: AtualizarTarefaInput!) {
      atualizarTarefa(input: $input) {
        id
        titulo
        status
        prioridade
      }
    }
  `,

  CRIAR_HANDOFF: /* GraphQL */ `
    mutation CriarHandoff($input: CriarHandoffInput!) {
      criarHandoff(input: $input) {
        id
        status
        motivo
        resumo
      }
    }
  `,

  ATUALIZAR_HANDOFF: /* GraphQL */ `
    mutation AtualizarHandoff($input: AtualizarHandoffInput!) {
      atualizarHandoff(input: $input) {
        id
        status
        resumo
      }
    }
  `,

  CRIAR_INTERACAO: /* GraphQL */ `
    mutation CriarInteracao($input: CriarInteracaoInput!) {
      criarInteracao(input: $input) {
        id
        tipo
        descricao
        ocorreuEm
      }
    }
  `,

  CLASSIFICAR_CLIENTE: /* GraphQL */ `
    mutation ClassificarCliente($clienteId: ID!) {
      classificarCliente(clienteId: $clienteId) {
        finalidadePrincipal
        finalidadesSecundarias
        nivelConfianca
        sinais
        camposFaltantes
        proximaAcao
      }
    }
  `,
};

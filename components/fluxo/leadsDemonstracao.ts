import type { LeadTimeline } from "./TimelineNode";

const LEADS_DEMONSTRACAO_BASE: LeadTimeline[] = [
  {
    id: "demo-marina-costa",
    nome: "Marina Costa",
    status: "novo_lead",
    tipo_imovel: "Apartamento · 2 quartos",
    finalidade_principal: "moradia",
    criado_em: "2026-10-06T09:10:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-lucas-almeida",
    nome: "Lucas Almeida",
    status: "novo_lead",
    tipo_imovel: "Casa · investimento",
    finalidade_principal: "investimento",
    criado_em: "2026-10-05T14:30:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-camila-ferreira",
    nome: "Camila Ferreira",
    status: "em_qualificacao",
    tipo_imovel: "Apartamento · 3 quartos",
    finalidade_principal: "moradia",
    indice_completude: 72,
    criado_em: "2026-10-06T10:20:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-rafael-mendes",
    nome: "Rafael Mendes",
    status: "em_qualificacao",
    tipo_imovel: "Casa · financiamento",
    finalidade_principal: "moradia",
    indice_completude: 58,
    criado_em: "2026-10-04T16:15:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-pedro-augusto",
    nome: "Pedro Augusto",
    status: "em_negociacao",
    tipo_imovel: "Apartamento · 1º imóvel",
    finalidade_principal: "moradia",
    indice_completude: 94,
    criado_em: "2026-10-06T12:45:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-beatriz-oliveira",
    nome: "Beatriz Oliveira",
    status: "em_negociacao",
    tipo_imovel: "Cobertura · 3 quartos",
    finalidade_principal: "moradia",
    indice_completude: 88,
    criado_em: "2026-10-03T11:05:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-juliana-rocha",
    nome: "Juliana Rocha",
    status: "convertido",
    tipo_imovel: "Apartamento · unidade 204",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-10-06T13:10:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-felipe-santos",
    nome: "Felipe Santos",
    status: "convertido",
    tipo_imovel: "Casa · unidade 12",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-10-02T15:40:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-patricia-lima",
    nome: "Patrícia Lima",
    status: "handoff_pendente",
    tipo_imovel: "Apartamento · Torre A",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-10-06T14:00:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-bruno-carvalho",
    nome: "Bruno Carvalho",
    status: "handoff_pendente",
    tipo_imovel: "Apartamento · Torre B",
    finalidade_principal: "moradia",
    indice_completude: 96,
    criado_em: "2026-10-01T10:00:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-isabela-nunes",
    nome: "Isabela Nunes",
    status: "onboarding",
    tipo_imovel: "Apartamento · unidade 508",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-10-06T14:45:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-eduardo-ribeiro",
    nome: "Eduardo Ribeiro",
    status: "onboarding",
    tipo_imovel: "Casa · unidade 07",
    finalidade_principal: "moradia",
    indice_completude: 92,
    criado_em: "2026-09-29T09:20:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-renata-alves",
    nome: "Renata Alves",
    status: "pos_venda",
    tipo_imovel: "Apartamento · entrega de chaves",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-10-06T15:30:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-thiago-barros",
    nome: "Thiago Barros",
    status: "pos_venda",
    tipo_imovel: "Casa · acompanhamento",
    finalidade_principal: "moradia",
    indice_completude: 97,
    criado_em: "2026-09-27T12:10:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-carolina-souza",
    nome: "Carolina Souza",
    status: "cliente_ativo",
    tipo_imovel: "Apartamento · cliente ativo",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-10-06T16:10:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-gustavo-melo",
    nome: "Gustavo Melo",
    status: "cliente_ativo",
    tipo_imovel: "Casa · relacionamento",
    finalidade_principal: "investimento",
    indice_completude: 100,
    criado_em: "2026-09-25T08:50:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-fernanda-dias",
    nome: "Fernanda Dias",
    status: "reativacao",
    tipo_imovel: "Apartamento · retorno pendente",
    finalidade_principal: "moradia",
    termometro_cx: "insatisfeito_distrato",
    alerta_distrato_ativo: true,
    criado_em: "2026-10-06T16:50:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-marcelo-freitas",
    nome: "Marcelo Freitas",
    status: "cliente_inativo",
    tipo_imovel: "Casa · novo contato",
    finalidade_principal: "investimento",
    criado_em: "2026-09-22T13:30:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-aline-batista",
    nome: "Aline Batista",
    status: "encerrado",
    tipo_imovel: "Apartamento · jornada concluída",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-10-06T17:20:00.000Z",
    isDemo: true,
  },
  {
    id: "demo-diego-lopes",
    nome: "Diego Lopes",
    status: "encerrado",
    tipo_imovel: "Casa · atendimento encerrado",
    finalidade_principal: "moradia",
    indice_completude: 100,
    criado_em: "2026-09-19T11:25:00.000Z",
    isDemo: true,
  },
];

const QUANTIDADE_POR_ETAPA: {
  status: string;
  quantidade: number;
  statusList?: readonly string[];
}[] = [
  { status: "novo_lead", quantidade: 287 },
  { status: "em_qualificacao", quantidade: 53 },
  { status: "em_negociacao", quantidade: 10 },
  { status: "convertido", quantidade: 8 },
  { status: "handoff_pendente", quantidade: 7 },
  { status: "onboarding", quantidade: 9 },
  { status: "pos_venda", quantidade: 14 },
  { status: "cliente_ativo", quantidade: 21 },
  {
    status: "reativacao",
    statusList: ["reativacao", "cliente_inativo", "sem_resposta"],
    quantidade: 17,
  },
  { status: "encerrado", quantidade: 12 },
];

const NOMES = [
  "Amanda", "André", "Beatriz", "Bruno", "Camila", "Carlos", "Carolina",
  "Daniel", "Eduarda", "Felipe", "Fernanda", "Gabriel", "Isabela", "João",
  "Juliana", "Larissa", "Lucas", "Marcelo", "Mariana", "Mateus", "Nathalia",
  "Paula", "Pedro", "Rafael", "Renata", "Thiago", "Vanessa", "Vinícius",
];

const SOBRENOMES = [
  "Almeida", "Andrade", "Azevedo", "Barbosa", "Batista", "Campos", "Cardoso",
  "Carvalho", "Costa", "Dias", "Duarte", "Fernandes", "Ferreira", "Freitas",
  "Gomes", "Lima", "Lopes", "Mendes", "Monteiro", "Moraes", "Nunes", "Oliveira",
  "Pereira", "Ramos", "Rocha", "Ribeiro", "Santana", "Santos", "Souza", "Teixeira",
];

const TIPOS_IMOVEL = [
  "Apartamento · 2 quartos",
  "Casa · condomínio fechado",
  "Apartamento · varanda gourmet",
  "Studio · investimento",
  "Casa · 3 quartos",
  "Apartamento · 1º imóvel",
  "Sobrado · 2 vagas",
  "Cobertura · 3 quartos",
  "Apartamento · perto do metrô",
];

function criarLeadsAdicionais(): LeadTimeline[] {
  let sequencia = 0;

  return QUANTIDADE_POR_ETAPA.flatMap(
    ({ status, statusList = [status], quantidade }) => {
      const existentes = LEADS_DEMONSTRACAO_BASE.filter((lead) =>
        statusList.includes(lead.status)
      ).length;

      return Array.from(
        { length: Math.max(0, quantidade - existentes) },
        (_, index) => {
          const indiceNome = sequencia++;
          const nome = `${NOMES[indiceNome % NOMES.length]} ${
            SOBRENOMES[
              Math.floor(indiceNome / NOMES.length) % SOBRENOMES.length
            ]
          }`;
          const criadoEm = new Date(
            Date.UTC(2026, 9, 14, 12) - indiceNome * 3 * 60 * 60 * 1000
          ).toISOString();

          return {
            id: `demo-sim-${status}-${index + 1}`,
            nome,
            status,
            tipo_imovel: TIPOS_IMOVEL[indiceNome % TIPOS_IMOVEL.length],
            finalidade_principal:
              indiceNome % 4 === 0 ? "investimento" : "moradia",
            indice_completude:
              status === "novo_lead"
                ? 25 + ((indiceNome * 13) % 70)
                : Math.min(100, 55 + ((indiceNome * 17) % 46)),
            alerta_distrato_ativo:
              status === "reativacao" && indiceNome % 5 === 0,
            criado_em: criadoEm,
            isDemo: true,
          };
        }
      );
    }
  );
}

export const LEADS_DEMONSTRACAO: LeadTimeline[] = [
  ...LEADS_DEMONSTRACAO_BASE,
  ...criarLeadsAdicionais(),
];

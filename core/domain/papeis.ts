export type Papel =
  | "desenvolvedor"
  | "gerente"
  | "secretaria"
  | "corretor"
  | "cliente";

export type Modulo =
  | "dashboard"
  | "clientes"
  | "oportunidades"
  | "tarefas"
  | "fluxos"
  | "kanban"
  | "conversas"
  | "handoffs"
  | "corretores"
  | "whatsapp"
  | "acessos"
  | "portal"
  | "minha-conta";

export type ModuloAcao = "ver" | "criar" | "editar" | "aprovar" | "gerenciar";

export const PAPEIS: Papel[] = [
  "desenvolvedor",
  "gerente",
  "secretaria",
  "corretor",
  "cliente",
];

export const PAPEL_LABEL: Record<Papel, string> = {
  desenvolvedor: "Desenvolvedor",
  gerente: "Gerente",
  secretaria: "Secretária",
  corretor: "Corretor",
  cliente: "Cliente",
};

export const MODULOS: Modulo[] = [
  "dashboard",
  "clientes",
  "oportunidades",
  "tarefas",
  "fluxos",
  "kanban",
  "conversas",
  "handoffs",
  "corretores",
  "whatsapp",
  "acessos",
  "portal",
  "minha-conta",
];

export const MODULO_LABEL: Record<Modulo, string> = {
  dashboard: "Visão geral",
  clientes: "Clientes",
  oportunidades: "Oportunidades",
  tarefas: "Tarefas",
  fluxos: "Fluxos",
  kanban: "Kanban",
  conversas: "Conversas",
  handoffs: "Handoffs",
  corretores: "Corretores",
  whatsapp: "WhatsApp",
  acessos: "Gestão de acessos",
  portal: "Portal do cliente",
  "minha-conta": "Minha conta",
};

const TODAS: readonly ModuloAcao[] = [
  "ver",
  "criar",
  "editar",
  "aprovar",
  "gerenciar",
];

const PERMISSOES: Record<Papel, Partial<Record<Modulo, readonly ModuloAcao[]>>> = {
  desenvolvedor: {
    dashboard: TODAS,
    clientes: TODAS,
    oportunidades: TODAS,
    tarefas: TODAS,
    fluxos: TODAS,
    kanban: TODAS,
    conversas: TODAS,
    handoffs: TODAS,
    corretores: TODAS,
    whatsapp: TODAS,
    acessos: TODAS,
    portal: TODAS,
    "minha-conta": TODAS,
  },
  gerente: {
    dashboard: ["ver"],
    clientes: ["ver", "editar", "gerenciar"],
    oportunidades: ["ver", "criar", "editar", "aprovar"],
    tarefas: ["ver", "criar", "editar"],
    fluxos: ["ver", "criar", "editar", "aprovar"],
    kanban: ["ver", "editar"],
    conversas: ["ver"],
    handoffs: ["ver", "editar", "aprovar"],
    corretores: ["ver"],
    whatsapp: ["ver"],
    acessos: ["ver", "gerenciar"],
    portal: ["ver"],
    "minha-conta": ["ver"],
  },
  secretaria: {
    dashboard: ["ver"],
    clientes: ["ver", "editar"],
    oportunidades: ["ver"],
    tarefas: ["ver", "criar", "editar"],
    fluxos: ["ver"],
    kanban: ["ver", "editar"],
    conversas: ["ver"],
    handoffs: ["ver", "editar"],
    corretores: ["ver"],
    whatsapp: ["ver"],
    "minha-conta": ["ver"],
  },
  corretor: {
    dashboard: ["ver"],
    clientes: ["ver", "editar"],
    oportunidades: ["ver", "criar", "editar"],
    tarefas: ["ver", "criar", "editar"],
    fluxos: ["ver"],
    conversas: ["ver"],
    handoffs: ["ver", "criar"],
    "minha-conta": ["ver"],
  },
  cliente: {
    portal: ["ver"],
    "minha-conta": ["ver"],
  },
};

export function acoesDoPapel(papel: Papel, modulo: Modulo): readonly ModuloAcao[] {
  return PERMISSOES[papel][modulo] ?? [];
}

export function pode(
  papel: Papel,
  modulo: Modulo,
  acao: ModuloAcao = "ver"
): boolean {
  return acoesDoPapel(papel, modulo).includes(acao);
}

export function modulosDoPapel(papel: Papel): { modulo: Modulo; acoes: readonly ModuloAcao[] }[] {
  return MODULOS.filter((m) => (PERMISSOES[papel][m]?.length ?? 0) > 0).map((modulo) => ({
    modulo,
    acoes: acoesDoPapel(papel, modulo),
  }));
}

/*
 * Modelo de acesso por telas.
 * Cada cargo possui uma lista de rotas que pode visualizar; a matriz é editável pela
 * tela de Gestão de Acessos e é a base da navegação, proteção de rotas e segregação de telas.
 */
export type GrupoRota = "principal" | "operacao" | "gestao" | "conta" | "portal";

export type RotaDoSistema = {
  rota: string;
  label: string;
  grupo: GrupoRota;
  modulo: Modulo;
};

export const ROTAS_SISTEMA: readonly RotaDoSistema[] = [
  { rota: "/", label: "Visão geral", grupo: "principal", modulo: "dashboard" },
  { rota: "/clientes", label: "Clientes", grupo: "principal", modulo: "clientes" },
  { rota: "/oportunidades", label: "Oportunidades", grupo: "principal", modulo: "oportunidades" },
  { rota: "/tarefas", label: "Tarefas", grupo: "principal", modulo: "tarefas" },
  { rota: "/mensagens", label: "Conversas", grupo: "principal", modulo: "conversas" },
  { rota: "/fluxos", label: "Fluxos", grupo: "operacao", modulo: "fluxos" },
  { rota: "/kanban", label: "Kanban", grupo: "operacao", modulo: "kanban" },
  { rota: "/handoffs", label: "Handoffs", grupo: "operacao", modulo: "handoffs" },
  { rota: "/vendedores", label: "Corretores", grupo: "gestao", modulo: "corretores" },
  { rota: "/gestor-whatsapp", label: "WhatsApp", grupo: "gestao", modulo: "whatsapp" },
  { rota: "/acessos", label: "Acessos e permissões", grupo: "conta", modulo: "acessos" },
  { rota: "/minha-conta", label: "Meu perfil", grupo: "conta", modulo: "minha-conta" },
  { rota: "/portal", label: "Portal do cliente", grupo: "portal", modulo: "portal" },
];

export const GRUPO_ROTAS_LABEL: Record<GrupoRota, string> = {
  principal: "Principal",
  operacao: "Operação",
  gestao: "Gestão",
  conta: "Conta",
  portal: "Portal",
};

export function rotasPadraoDoPapel(papel: Papel): string[] {
  return ROTAS_SISTEMA.filter((rota) => rotasDessaRotaPermitida(papel, rota)).map((rota) => rota.rota);
}

function rotasDessaRotaPermitida(papel: Papel, rota: RotaDoSistema): boolean {
  if (rota.grupo === "portal" && papel !== "cliente") return false;
  return acoesDoPapel(papel, rota.modulo).includes("ver");
}
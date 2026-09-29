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
    tarefas: ["ver", "criar", "editar"],
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
    oportunidades: ["ver"],
    tarefas: ["ver", "criar", "editar"],
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
export interface ColunaCliente {
  id: string;
  titulo: string;
  statusList: string[];
  accent: string;
  badge: string;
}

export const COLUNAS_CLIENTES: ColunaCliente[] = [
  { id: "novo_lead", titulo: "Novo Lead", statusList: ["novo_lead"], accent: "#64748b", badge: "bg-[var(--inset)] text-[var(--text-secondary)]" },
  { id: "qualificacao", titulo: "Qualificação", statusList: ["em_qualificacao"], accent: "#0284c7", badge: "bg-[var(--accent-light)] text-[var(--accent)]" },
  { id: "negociacao", titulo: "Negociação", statusList: ["em_negociacao"], accent: "#7c3aed", badge: "bg-purple-50 text-purple-700" },
  { id: "convertido", titulo: "Convertido", statusList: ["convertido"], accent: "#0891b2", badge: "bg-cyan-50 text-cyan-700" },
  { id: "handoff", titulo: "Handoff", statusList: ["handoff_pendente"], accent: "#d97706", badge: "bg-amber-50 text-amber-700" },
  { id: "onboarding", titulo: "Onboarding", statusList: ["onboarding"], accent: "#2563eb", badge: "bg-blue-50 text-blue-700" },
  { id: "pos_venda", titulo: "Pós-venda", statusList: ["pos_venda"], accent: "#059669", badge: "bg-emerald-50 text-emerald-700" },
  { id: "cliente_ativo", titulo: "Cliente Ativo", statusList: ["cliente_ativo"], accent: "#14b8a6", badge: "bg-teal-50 text-teal-700" },
  { id: "reativacao", titulo: "Reativação / Inativo", statusList: ["reativacao", "cliente_inativo", "sem_resposta"], accent: "#e11d48", badge: "bg-rose-50 text-rose-700" },
  { id: "encerrado", titulo: "Encerrado", statusList: ["encerrado"], accent: "#64748b", badge: "bg-[var(--inset)] text-[var(--text-secondary)]" },
];

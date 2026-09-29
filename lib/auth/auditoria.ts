export type AcaoAuditoria =
  | "login"
  | "logout"
  | "acesso_negado"
  | "criar_usuario"
  | "alterar_usuario"
  | "alterar_senha";

export type RegistroAuditoria = {
  id: string;
  usuario_id: string;
  email: string;
  acao: AcaoAuditoria;
  detalhe?: string | null;
  em: string;
};

const registros: RegistroAuditoria[] = [];

export function registrarAuditoria(
  entrada: Omit<RegistroAuditoria, "id" | "em">
): RegistroAuditoria {
  const registro: RegistroAuditoria = {
    ...entrada,
    id: `aud-${Math.random().toString(36).slice(2, 10)}`,
    em: new Date().toISOString(),
  };
  registros.push(registro);
  if (registros.length > 500) registros.shift();
  return registro;
}

export function listarAuditoria(limite = 200): RegistroAuditoria[] {
  return [...registros].sort((a, b) => b.em.localeCompare(a.em)).slice(0, limite);
}
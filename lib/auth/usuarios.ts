import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Papel } from "@/core/domain/papeis";

export type UsuarioItem = {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  papel: Papel;
  ativo: boolean;
  vendedor_id?: string | null;
  cliente_id?: string | null;
  criado_por: string;
  criado_em: string;
  ultimo_login_em?: string | null;
};

const SENHA_BASE = "token123";

function hashSenha(senha: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

function verificarSenha(senha: string, armazenado: string): boolean {
  const [sal, hash] = armazenado.split(":");
  if (!sal || !hash) return false;
  const esperado = Buffer.from(hash, "hex");
  const real = scryptSync(senha, sal, 64);
  return esperado.length === real.length && timingSafeEqual(esperado, real);
}

function novoUsuario(dados: {
  nome: string;
  email: string;
  papel: Papel;
  vendedor_id?: string | null;
  cliente_id?: string | null;
  criado_por: string;
}): UsuarioItem {
  return {
    id: `u-${Math.random().toString(36).slice(2, 10)}`,
    nome: dados.nome,
    email: dados.email.toLowerCase().trim(),
    senha_hash: hashSenha(SENHA_BASE),
    papel: dados.papel,
    ativo: true,
    vendedor_id: dados.vendedor_id ?? null,
    cliente_id: dados.cliente_id ?? null,
    criado_por: dados.criado_por,
    criado_em: new Date().toISOString(),
    ultimo_login_em: null,
  };
}

function seed(): UsuarioItem[] {
  const base = new Date(2026, 8, 20, 9, 0, 0).toISOString();
  const criador = "dev-inicial";
  return [
    {
      id: "u-dev",
      nome: "Desenvolvedor",
      email: "desenvolvedor@posat.local",
      senha_hash: hashSenha(SENHA_BASE),
      papel: "desenvolvedor",
      ativo: true,
      vendedor_id: null,
      cliente_id: null,
      criado_por: criador,
      criado_em: base,
      ultimo_login_em: null,
    },
    {
      id: "u-gerente",
      nome: "Gerente Operação",
      email: "gerente@posat.local",
      senha_hash: hashSenha(SENHA_BASE),
      papel: "gerente",
      ativo: true,
      vendedor_id: null,
      cliente_id: null,
      criado_por: "u-dev",
      criado_em: base,
      ultimo_login_em: null,
    },
    {
      id: "u-secretaria",
      nome: "Secretária CS",
      email: "secretaria@posat.local",
      senha_hash: hashSenha(SENHA_BASE),
      papel: "secretaria",
      ativo: true,
      vendedor_id: null,
      cliente_id: null,
      criado_por: "u-gerente",
      criado_em: base,
      ultimo_login_em: null,
    },
    {
      id: "u-corretor",
      nome: "Corretor Demo",
      email: "corretor@posat.local",
      senha_hash: hashSenha(SENHA_BASE),
      papel: "corretor",
      ativo: true,
      vendedor_id: "ven-001",
      cliente_id: null,
      criado_por: "u-gerente",
      criado_em: base,
      ultimo_login_em: null,
    },
    {
      id: "u-cliente",
      nome: "Cliente Portal",
      email: "cliente@posat.local",
      senha_hash: hashSenha(SENHA_BASE),
      papel: "cliente",
      ativo: true,
      vendedor_id: null,
      cliente_id: "c-001",
      criado_por: "u-secretaria",
      criado_em: base,
      ultimo_login_em: null,
    },
  ];
}

const usuarios: Map<string, UsuarioItem> = new Map(
  seed().map((u) => [u.id, u])
);

export function autenticarUsuario(
  email: string,
  senha: string
): UsuarioItem | null {
  const usuario = [...usuarios.values()].find(
    (u) => u.email === email.toLowerCase().trim()
  );
  if (!usuario) return null;
  if (!verificarSenha(senha, usuario.senha_hash)) return null;
  return usuario;
}

export function marcarLogin(usuarioId: string): void {
  const u = usuarios.get(usuarioId);
  if (u) u.ultimo_login_em = new Date().toISOString();
}

export function listarUsuarios(): UsuarioItem[] {
  return [...usuarios.values()].sort((a, b) => a.nome.localeCompare(b.nome));
}

export function obterUsuarioPorId(id: string): UsuarioItem | null {
  return usuarios.get(id) ?? null;
}

export function buscarUsuarioPorEmail(email: string): UsuarioItem | null {
  return [...usuarios.values()].find(
    (u) => u.email === email.toLowerCase().trim()
  ) ?? null;
}

export function criarUsuario(dados: {
  nome: string;
  email: string;
  papel: Papel;
  vendedor_id?: string | null;
  cliente_id?: string | null;
  criado_por: string;
}): UsuarioItem {
  const usuario = novoUsuario(dados);
  if (buscarUsuarioPorEmail(usuario.email)) {
    throw new Error("Já existe um usuário com este e-mail.");
  }
  usuarios.set(usuario.id, usuario);
  return usuario;
}

export function atualizarUsuario(
  id: string,
  dados: Partial<Pick<UsuarioItem, "papel" | "ativo" | "vendedor_id" | "cliente_id">>
): UsuarioItem | null {
  const u = usuarios.get(id);
  if (!u) return null;
  usuarios.set(id, { ...u, ...dados });
  return usuarios.get(id)!;
}

export function alterarSenha(id: string, senhaAtual: string, novaSenha: string): boolean {
  const u = usuarios.get(id);
  if (!u) return false;
  if (!verificarSenha(senhaAtual, u.senha_hash)) return false;
  if (novaSenha.length < 6) return false;
  usuarios.set(id, { ...u, senha_hash: hashSenha(novaSenha) });
  return true;
}

export function resumoPublico(usuario: UsuarioItem) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    ativo: usuario.ativo,
    vendedor_id: usuario.vendedor_id,
    cliente_id: usuario.cliente_id,
    ultimo_login_em: usuario.ultimo_login_em,
  };
}

export const senhaPadraoUsuarios = SENHA_BASE;
import type { Papel } from "@/core/domain/papeis";

export const COOKIE_NAME = "posat_session";

type PayloadSessao = {
  uid: string;
  papel: Papel;
  exp: number;
};

const SEGREDO =
  process.env.AUTH_SECRET || "posat-dev-auth-secret-trocar-em-producao";

const DIAS_VALIDADE = 7;

function bytesParaBase64url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlParaBytes(entrada: string): Uint8Array {
  const pad = entrada.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (entrada.length % 4)) % 4);
  const bin = atob(pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function assinatura(dados: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SEGREDO),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(dados));
  return bytesParaBase64url(new Uint8Array(sig));
}

export async function assinarSessao(payload: PayloadSessao): Promise<string> {
  const corpo = bytesParaBase64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await assinatura(corpo);
  return `${corpo}.${sig}`;
}

export async function verificarSessao(token: string): Promise<PayloadSessao | null> {
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [corpo, sigEsperada] = partes;
  const sigReal = await assinatura(corpo);
  if (sigReal !== sigEsperada) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlParaBytes(corpo))
    ) as PayloadSessao;
    if (!payload?.uid || !payload?.papel) return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function criarCookieSessao(payload: {
  uid: string;
  papel: Papel;
}): Promise<string> {
  const token = await assinarSessao({
    ...payload,
    exp: Date.now() + DIAS_VALIDADE * 24 * 60 * 60 * 1000,
  });
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DIAS_VALIDADE * 86400}`;
}

export function cookieSessaoExpirado(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function tokenDoCookie(cabecalho: string | null): string | null {
  if (!cabecalho) return null;
  const linha = cabecalho.split(";").find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!linha) return null;
  const valor = linha.trim().slice(COOKIE_NAME.length + 1);
  return valor || null;
}

export async function obterSessao(cabecalho: string | null): Promise<PayloadSessao | null> {
  const token = tokenDoCookie(cabecalho);
  if (!token) return null;
  return verificarSessao(token);
}
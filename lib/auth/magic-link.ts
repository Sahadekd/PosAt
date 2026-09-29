import { randomBytes } from "node:crypto";

const tokens = new Map<string, { uid: string; exp: number }>();

const VALIDADE_MS = 15 * 60 * 1000;

export function gerarTokenMagico(uid: string): string {
  const token = randomBytes(24).toString("hex");
  tokens.set(token, { uid, exp: Date.now() + VALIDADE_MS });
  return token;
}

export function validarTokenMagico(token: string): string | null {
  const entrada = tokens.get(token);
  if (!entrada) return null;
  tokens.delete(token);
  if (entrada.exp < Date.now()) return null;
  return entrada.uid;
}
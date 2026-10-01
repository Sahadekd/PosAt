export function normalizeWhatsAppOwner(value: string | null | undefined): string | null {
  const normalized = (value || "").trim();
  return normalized || null;
}

export function readStoredWhatsAppUserIdentity(): {
  id: string | null;
  name: string | null;
  email: string | null;
} {
  if (typeof window === "undefined") {
    return { id: null, name: null, email: null };
  }

  return {
    id: normalizeWhatsAppOwner(
      window.localStorage.getItem("posat:user:id") ||
      window.localStorage.getItem("posat:user") ||
      null
    ),
    name: normalizeWhatsAppOwner(
      window.localStorage.getItem("posat:user:name") ||
      window.localStorage.getItem("posat:whatsapp:owner") ||
      null
    ),
    email: normalizeWhatsAppOwner(window.localStorage.getItem("posat:user:email") || null),
  };
}

export function resolveWhatsAppOwnerFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storageValues = readStoredWhatsAppUserIdentity();
  const owner =
    normalizeWhatsAppOwner(window.localStorage.getItem("posat:whatsapp:owner")) ||
    storageValues.name ||
    normalizeWhatsAppOwner(window.localStorage.getItem("posat:user"));

  return owner || null;
}

export function buildWhatsAppRequestHeaders(
  init?: RequestInit,
  owner?: string | null
): RequestInit {
  const headers = new Headers(init?.headers ?? {});
  const currentOwner = normalizeWhatsAppOwner(owner) || resolveWhatsAppOwnerFromStorage();
  const userIdentity = readStoredWhatsAppUserIdentity();
  const currentUserName = normalizeWhatsAppOwner(userIdentity.name) || currentOwner;

  if (currentOwner) {
    headers.set("x-posat-whatsapp-owner", currentOwner);
    headers.set("x-whatsapp-owner", currentOwner);
  }

  if (userIdentity.id) {
    headers.set("x-posat-user-id", userIdentity.id);
    headers.set("x-user-id", userIdentity.id);
  }

  if (currentUserName) {
    headers.set("x-posat-user-name", currentUserName);
    headers.set("x-user-name", currentUserName);
  }

  if (userIdentity.email) {
    headers.set("x-posat-user-email", userIdentity.email);
    headers.set("x-user-email", userIdentity.email);
  }

  return {
    ...init,
    headers,
  };
}

export function getWhatsAppUserIdentityFromHeaders(headers: Headers): {
  id: string | null;
  name: string | null;
  email: string | null;
} {
  return {
    id: normalizeWhatsAppOwner(headers.get("x-posat-user-id") || headers.get("x-user-id")),
    name: normalizeWhatsAppOwner(headers.get("x-posat-user-name") || headers.get("x-user-name")),
    email: normalizeWhatsAppOwner(headers.get("x-posat-user-email") || headers.get("x-user-email")),
  };
}

export function getWhatsAppOwnerFromHeaders(headers: Headers): string | null {
  const raw =
    headers.get("x-posat-whatsapp-owner") ||
    headers.get("x-whatsapp-owner") ||
    getWhatsAppUserIdentityFromHeaders(headers).name ||
    "";
  return normalizeWhatsAppOwner(raw);
}

export function resolveWhatsAppOwnerFromContext(
  explicitOwner: string | null,
  userIdentity?: { id?: string | null; name?: string | null; email?: string | null }
): string | null {
  const owner = normalizeWhatsAppOwner(explicitOwner) || normalizeWhatsAppOwner(userIdentity?.name);
  return owner || null;
}

export function filterByWhatsAppOwner<T extends { corretor?: string | null }>(items: T[], owner: string | null): T[] {
  const normalizedOwner = normalizeWhatsAppOwner(owner);
  if (!normalizedOwner) return items;
  return items.filter((item) => normalizeWhatsAppOwner(item.corretor) === normalizedOwner);
}

export function assertOwnerAccessForConnection(owner: string | null, corretor: string | null): boolean {
  const normalizedOwner = normalizeWhatsAppOwner(owner);
  if (!normalizedOwner) return true;
  return normalizeWhatsAppOwner(corretor) === normalizedOwner;
}

export function ensureWhatsAppOwnerAccess(owner: string | null, corretor: string | null): boolean {
  return assertOwnerAccessForConnection(owner, corretor);
}

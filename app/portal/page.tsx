"use client";

import { Building2, Construction } from "lucide-react";

export default function PortalPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--surface)] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-900/40">
        <Building2 className="h-7 w-7" />
      </div>
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--text-primary)]">
          <Construction className="h-5 w-5 text-[var(--warning)]" />
          Portal do cliente
        </h1>
        <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          Sua sessão foi validada. O portal com a sua jornada, documentos e
          linha do tempo está sendo preparado.
        </p>
      </div>
    </div>
  );
}
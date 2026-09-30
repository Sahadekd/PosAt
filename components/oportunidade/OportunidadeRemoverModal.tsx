"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";

interface OportunidadeRemoverModalProps {
  aoFechar: () => void;
  aoConfirmar: (motivo: string) => void;
}

export default function OportunidadeRemoverModal({
  aoFechar,
  aoConfirmar,
}: OportunidadeRemoverModalProps) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const confirmar = () => {
    setEnviando(true);
    aoConfirmar(motivo);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={aoFechar}
      />
      <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Perdeu interesse
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              A oportunidade será movida para &ldquo;Removidas&rdquo; com o motivo registrado
              para reavaliação futura.
            </p>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="rounded-xl border border-[var(--border)] p-2 text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:bg-[var(--inset)]/60 hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
            Motivo
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ex.: sem resposta após 2 tentativas, cliente não demonstrou interesse…"
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-rose-500"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Motivo fica visível no card e no histórico da oportunidade.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={aoFechar}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={enviando || !motivo.trim()}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
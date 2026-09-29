"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Check, Loader2, Users } from "lucide-react";
import {
  MODULO_LABEL,
  pode,
  type Modulo,
  type Papel,
} from "@/core/domain/papeis";
import GestaoAcessos from "@/components/GestaoAcessos";

type UsuarioSessao = {
  nome: string;
  papel: Papel;
  papel_label: string;
  modulos: { modulo: Modulo; acoes: string[] }[];
};

type Aba = "permissoes" | "gestao";

export default function AcessosPage() {
  const [aba, setAba] = useState<Aba>("permissoes");
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregado, setCarregado] = useState(false);

  const podeGestao = usuario ? pode(usuario.papel, "acessos", "ver") : false;

  useEffect(() => {
    let ativo = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((dados) => {
        if (ativo) setUsuario(dados.usuario ?? null);
      })
      .catch(() => {
        if (ativo) setUsuario(null);
      })
      .finally(() => {
        if (ativo) setCarregado(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const abas: { chave: Aba; rotulo: string; icone: typeof BadgeCheck; visivel: boolean }[] = [
    { chave: "permissoes", rotulo: "Permissões ativas", icone: BadgeCheck, visivel: true },
    { chave: "gestao", rotulo: "Acessos e permissões", icone: Users, visivel: podeGestao },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Acessos e permissões</h1>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Veja suas permissões e quem tem acesso ao sistema.
        </p>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap gap-1.5">
        {abas
          .filter((a) => a.visivel)
          .map((a) => {
            const ativa = aba === a.chave;
            const Icone = a.icone;
            return (
              <button
                key={a.chave}
                onClick={() => setAba(a.chave)}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  ativa
                    ? "border-[var(--accent-border)] bg-[var(--accent-light)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--inset)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Icone className="h-4 w-4" />
                {a.rotulo}
              </button>
            );
          })}
      </div>

      {/* Conteúdo das abas */}
      {!carregado ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : aba === "gestao" ? (
        <GestaoAcessos />
      ) : (
        <PermissoesAtivas usuario={usuario} />
      )}
    </div>
  );
}

function PermissoesAtivas({ usuario }: { usuario: UsuarioSessao | null }) {
  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--inset)] p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Sessão não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {usuario.modulos.map((m) => (
        <div
          key={m.modulo}
          className="rounded-xl border border-[var(--border)] bg-[var(--inset)] px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {MODULO_LABEL[m.modulo]}
            </span>
            <Check className="h-3.5 w-3.5 text-[var(--success)]" />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {m.acoes.map((acao) => (
              <span
                key={acao}
                className="rounded-md bg-[var(--accent-light)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]"
              >
                {acao}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
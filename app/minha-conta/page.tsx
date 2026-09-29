"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { PAPEL_LABEL, pode, type Papel } from "@/core/domain/papeis";

type UsuarioConta = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  vendedor_id?: string | null;
  cliente_id?: string | null;
  ultimo_login_em?: string | null;
  papel_label: string;
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export default function MinhaContaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioConta | null>(null);
  const [carregado, setCarregado] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

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

  async function alterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      const resposta = await fetch("/api/auth/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setMensagem({ tipo: "erro", texto: dados.erro ?? "Não foi possível alterar." });
        return;
      }
      setMensagem({ tipo: "ok", texto: "Senha alterada com sucesso." });
      setSenhaAtual("");
      setNovaSenha("");
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão." });
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!carregado) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--inset)] p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Sessão não encontrada.</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Meu perfil</h1>
        <div className="flex flex-wrap items-center gap-2">
          {pode(usuario.papel, "acessos", "ver") && (
            <button
              onClick={() => router.push("/acessos")}
              className="flex items-center gap-2 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-light)] px-3 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
            >
              <ShieldCheck className="h-4 w-4" />
              Acessos e permissões
            </button>
          )}
          <button
            onClick={sair}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--danger-border)] hover:text-[var(--danger)]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Identidade */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--inset)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold text-white">
            {iniciais(usuario.nome)}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
              <UserCircle2 className="h-4 w-4 text-[var(--accent)]" />
              {usuario.nome}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Mail className="h-3.5 w-3.5" />
              {usuario.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-light)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                {PAPEL_LABEL[usuario.papel]}
              </span>
              {usuario.papel !== "cliente" && (
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-[11px] text-[var(--text-muted)]">
                  Equipe interna
                </span>
              )}
            </div>
          </div>
        </div>
        <dl className="mt-5 grid gap-y-2 border-t border-[var(--border)] pt-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-[var(--text-muted)]">Último acesso</dt>
            <dd className="mt-0.5 font-medium text-[var(--text-secondary)]">
              {usuario.ultimo_login_em
                ? new Date(usuario.ultimo_login_em).toLocaleString("pt-BR")
                : "Primeiro acesso"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Status</dt>
            <dd className="mt-0.5 font-medium text-[var(--success)]">
              {usuario.ativo ? "Ativo" : "Desativado"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Alterar senha */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--inset)] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <KeyRound className="h-4 w-4 text-[var(--accent)]" />
          Alterar senha
        </h2>
        {mensagem && (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              mensagem.tipo === "ok"
                ? "border-[var(--success-border)] bg-[var(--success-light)] text-[var(--success)]"
                : "border-[var(--danger-border)] bg-[var(--danger-light)] text-[var(--danger)]"
            }`}
          >
            {mensagem.texto}
          </div>
        )}
        <form onSubmit={alterarSenha} className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Senha atual
            </span>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-border)]"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Nova senha
            </span>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              autoComplete="new-password"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-border)]"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={salvando || !senhaAtual || novaSenha.length < 6}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              Alterar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ErroBusca = Record<string, string>;

const MENSAGENS_ERRO: ErroBusca = {
  "token-invalido": "Link inválido ou já utilizado.",
  "token-expirado": "Link expirado. Solicite um novo.",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [emailLink, setEmailLink] = useState("");
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [gerandoLink, setGerandoLink] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      window.location.replace(`/api/auth/magic-link?token=${token}`);
      return;
    }
    const erro = params.get("erro");
    if (erro && MENSAGENS_ERRO[erro]) {
      const t = setTimeout(() => setErro(MENSAGENS_ERRO[erro]), 0);
      return () => clearTimeout(t);
    }
  }, []);

  function destinoAposLogin(papel: string): string {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next && papel !== "cliente") return next;
    if (papel === "cliente") return "/portal";
    return "/";
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível entrar.");
        return;
      }
      router.push(destinoAposLogin(dados.usuario.papel));
      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    if (!emailLink) return;
    setGerandoLink(true);
    setErro(null);
    setLinkGerado(null);
    try {
      const resposta = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLink }),
      });
      const dados = await resposta.json();
      if (resposta.ok && dados.url) {
        setLinkGerado(dados.url);
      } else {
        setErro("Não há um perfil de cliente ativo com este e-mail.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setGerandoLink(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--surface)] px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="login-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_-10%,rgba(37,99,235,0.12),transparent_60%)]" />
        <div className="login-blob -top-[12%] left-[-10%] h-[420px] w-[420px] bg-sky-400/25" />
        <div className="login-blob -bottom-[14%] right-[-8%] h-[460px] w-[460px] bg-blue-500/25" style={{ animationDelay: "-5s" }} />
        <div className="login-blob left-[38%] top-[52%] h-[300px] w-[300px] bg-[var(--accent)]/10" style={{ animationDelay: "-10s" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
      </div>

      <div className="relative w-full max-w-[400px]">
        <div className="animate-fade-up mb-8 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="login-glow absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 blur-xl" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-900/50 ring-1 ring-white/20">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <div className="text-center leading-tight">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Quadra
            </span>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Pós-Atendimento
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              CRM · Quadra Brasileira
            </p>
          </div>
        </div>

        <div
          className="animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--side)]/95 p-6 shadow-[0_20px_60px_-20px_rgba(37,99,235,0.28)] ring-1 ring-black/5 backdrop-blur-xl"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Entrar na sua conta
          </h2>
          {erro && (
            <div className="animate-slide-down mt-3 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-light)] px-3 py-2 text-xs text-[var(--danger)]">
              {erro}
            </div>
          )}
          <form onSubmit={entrar} className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                E-mail
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@posat.local"
                  autoComplete="email"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text-primary)] shadow-sm outline-none placeholder:text-[var(--text-muted)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Senha
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-10 text-sm text-[var(--text-primary)] shadow-sm outline-none placeholder:text-[var(--text-muted)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-secondary)]"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>
            <button
              type="submit"
              disabled={carregando || !email || !senha}
              className="group relative flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 ring-1 ring-inset ring-white/30 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-sky-500 disabled:hover:to-blue-600"
            >
              {!carregando && <span className="login-shimmer" />}
              {carregando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              ou
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Você é cliente? Acesse pelo link de convite
            </p>
            <form onSubmit={enviarLink} className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={emailLink}
                  onChange={(e) => setEmailLink(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text-primary)] shadow-sm outline-none placeholder:text-[var(--text-muted)] transition-all hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                />
              </div>
              <button
                type="submit"
                disabled={gerandoLink || !emailLink}
                className="h-10 shrink-0 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-light)] px-3 text-sm font-medium text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {gerandoLink ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Enviar link"
                )}
              </button>
            </form>
            {linkGerado && (
              <div className="animate-slide-down mt-3 rounded-lg border border-[var(--success-border)] bg-[var(--success-light)] px-3 py-2.5 text-xs">
                <p className="mb-1 font-medium text-[var(--success)]">
                  Link gerado (ambiente de teste)
                </p>
                <a
                  href={linkGerado}
                  className="break-all text-[var(--text-secondary)] underline decoration-dotted underline-offset-2 hover:text-[var(--text-primary)]"
                >
                  {linkGerado}
                </a>
              </div>
            )}
          </div>
        </div>

        <div
          className="animate-fade-up mt-4 rounded-xl border border-[var(--border)] bg-[var(--side)]/80 px-4 py-3 text-[11px] leading-relaxed text-[var(--text-muted)] backdrop-blur-md"
          style={{ animationDelay: "160ms" }}
        >
          <p className="mb-1 font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Contas de demonstração
          </p>
          <p>
            Todos os perfis usam a senha{" "}
            <code className="rounded bg-[var(--inset)] px-1.5 py-0.5 font-medium text-[var(--accent)]">
              token123
            </code>
          </p>
          <ul className="mt-1 space-y-0.5">
            <li>desenvolvedor@posat.local · Desenvolvedor</li>
            <li>gerente@posat.local · Gerente</li>
            <li>secretaria@posat.local · Secretária</li>
            <li>corretor@posat.local · Corretor</li>
            <li>cliente@posat.local · Cliente (portal)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
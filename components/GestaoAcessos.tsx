"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  KeyRound,
  Loader2,
  Plus,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import {
  MODULO_LABEL,
  PAPEL_LABEL,
  modulosDoPapel,
  type Papel,
} from "@/core/domain/papeis";

type UsuarioAdmin = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  vendedor_id?: string | null;
  ultimo_login_em?: string | null;
  papel_label: string;
};

type RegistroAuditoria = {
  id: string;
  usuario_id: string;
  email: string;
  acao: string;
  detalhe?: string | null;
  em: string;
};

const ACAO_LABEL: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  acesso_negado: "Acesso negado",
  criar_usuario: "Criou usuário",
  alterar_usuario: "Alterou usuário",
  alterar_senha: "Alterou senha",
};

export default function GestaoAcessos() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [aberto, setAberto] = useState(false);
  const [expandid, setExpandid] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoPapel, setNovoPapel] = useState<Papel>("secretaria");
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    const [resUsuarios, resAuditoria] = await Promise.all([
      fetch("/api/usuarios"),
      fetch("/api/auth/auditoria"),
    ]);
    if (resUsuarios.ok) {
      const dados = await resUsuarios.json();
      setUsuarios(dados.usuarios);
    }
    if (resAuditoria.ok) {
      const dados = await resAuditoria.json();
      setRegistros(dados.registros);
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    Promise.all([fetch("/api/usuarios"), fetch("/api/auth/auditoria")])
      .then(async ([resUsuarios, resAuditoria]) => {
        if (ativo && resUsuarios.ok) {
          const dados = await resUsuarios.json();
          setUsuarios(dados.usuarios);
        }
        if (ativo && resAuditoria.ok) {
          const dados = await resAuditoria.json();
          setRegistros(dados.registros);
        }
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome || !novoEmail) return;
    setCriando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome, email: novoEmail, papel: novoPapel }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível criar.");
        return;
      }
      setAberto(false);
      setNovoNome("");
      setNovoEmail("");
      setNovoPapel("secretaria");
      await carregar();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCriando(false);
    }
  }

  async function alternarAtivo(usuario: UsuarioAdmin) {
    await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !usuario.ativo }),
    });
    await carregar();
  }

  async function mudarPapel(usuario: UsuarioAdmin, papel: Papel) {
    if (papel === usuario.papel) return;
    await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ papel }),
    });
    await carregar();
  }

  const totalPorPapel = (papel: Papel) =>
    (usuarios ?? []).filter((u) => u.papel === papel).length;

  return (
    <div className="space-y-5">
      {/* Resumo por perfil */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(["desenvolvedor", "gerente", "secretaria", "corretor", "cliente"] as Papel[]).map(
          (papel) => (
            <div
              key={papel}
              className="rounded-xl border border-[var(--border)] bg-[var(--inset)] px-4 py-3"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {PAPEL_LABEL[papel]}
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                {totalPorPapel(papel)}
              </p>
            </div>
          )
        )}
      </div>

      {erro && (
        <div className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-light)] px-3 py-2 text-xs text-[var(--danger)]">
          {erro}
        </div>
      )}

      {/* Lista de usuários */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--inset)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Usuários e permissões
          </h2>
          <button
            onClick={() => setAberto(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            <UserPlus className="h-4 w-4" />
            Novo usuário
          </button>
        </div>
        {!usuarios ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {usuarios.map((usuario) => {
              const expandido = expandid === usuario.id;
              const modulos = modulosDoPapel(usuario.papel);
              return (
                <div key={usuario.id}>
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <button
                      onClick={() => setExpandid(expandido ? null : usuario.id)}
                      className="flex items-center gap-2 text-left"
                      aria-label={`Detalhes de ${usuario.nome}`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${expandido ? "rotate-180" : ""}`}
                      />
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[11px] font-bold text-white">
                        {usuario.nome
                          .split(/\s+/)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {usuario.nome}
                      </p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{usuario.email}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        usuario.ativo
                          ? "border-[var(--success-border)] bg-[var(--success-light)] text-[var(--success)]"
                          : "border-[var(--danger-border)] bg-[var(--danger-light)] text-[var(--danger)]"
                      }`}
                    >
                      {usuario.ativo ? "Ativo" : "Desativado"}
                    </span>
                    <select
                      value={usuario.papel}
                      onChange={(e) => mudarPapel(usuario, e.target.value as Papel)}
                      className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-medium text-[var(--text-secondary)] outline-none focus:border-[var(--accent-border)]"
                      aria-label={`Perfil de ${usuario.nome}`}
                    >
                      {Object.entries(PAPEL_LABEL).map(([valor, label]) => (
                        <option key={valor} value={valor}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => alternarAtivo(usuario)}
                      className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors ${
                        usuario.ativo
                          ? "border-[var(--border)] text-[var(--danger)] hover:border-[var(--danger-border)]"
                          : "border-[var(--success-border)] text-[var(--success)]"
                      }`}
                    >
                      {usuario.ativo ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                  {expandido && (
                    <div className="grid gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:grid-cols-2 lg:grid-cols-3">
                      {modulos.map((m) => (
                        <div
                          key={m.modulo}
                          className="rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2"
                        >
                          <p className="text-[11px] font-semibold text-[var(--text-primary)]">
                            {MODULO_LABEL[m.modulo]}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.acoes.map((acao) => (
                              <span
                                key={acao}
                                className="rounded bg-[var(--accent-light)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]"
                              >
                                {acao}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Auditoria recente */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--inset)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <KeyRound className="h-4 w-4 text-[var(--accent)]" />
            Auditoria de acessos
          </h2>
        </div>
        {registros.length === 0 ? (
          <p className="px-5 py-6 text-xs text-[var(--text-muted)]">
            Nenhum evento registrado ainda.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[var(--inset)]">
                <tr className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                  <th className="px-5 py-2 font-semibold">Quando</th>
                  <th className="px-5 py-2 font-semibold">Ação</th>
                  <th className="px-5 py-2 font-semibold">Usuário</th>
                  <th className="hidden px-5 py-2 font-semibold sm:table-cell">Detalhe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {registros.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-5 py-2.5 text-[var(--text-muted)]">
                      {new Date(r.em).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          r.acao === "acesso_negado"
                            ? "bg-[var(--danger-light)] text-[var(--danger)]"
                            : "bg-[var(--accent-light)] text-[var(--accent)]"
                        }`}
                      >
                        {ACAO_LABEL[r.acao] ?? r.acao}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[var(--text-secondary)]">{r.email}</td>
                    <td className="hidden px-5 py-2.5 text-[var(--text-muted)] sm:table-cell">
                      {r.detalhe ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer novo usuário */}
      {aberto && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAberto(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--side)] shadow-2xl animate-slide-left">
            <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Plus className="h-4 w-4 text-[var(--accent)]" />
                Novo usuário
              </h2>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={criar} className="flex-1 space-y-4 overflow-y-auto p-5">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Nome
                </span>
                <input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome completo"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-border)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  E-mail
                </span>
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="nome@posat.local"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-border)]"
                />
              </label>
              <div>
                <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Perfil
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["gerente", "secretaria", "corretor", "cliente"] as Papel[]).map((papel) => (
                    <button
                      key={papel}
                      type="button"
                      onClick={() => setNovoPapel(papel)}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        novoPapel === papel
                          ? "border-[var(--accent-border)] bg-[var(--accent-light)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <span
                        className={`block text-xs font-semibold ${
                          novoPapel === papel ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                        }`}
                      >
                        {PAPEL_LABEL[papel]}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                  O usuário recebe automaticamente as permissões padrão do perfil. A senha inicial
                  é a senha padrão do sistema.
                </p>
              </div>
              <div className="flex items-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={criando || !novoNome || !novoEmail}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {criando && <Loader2 className="h-4 w-4 animate-spin" />}
                  Criar usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
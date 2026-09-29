"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  CheckSquare,
  ArrowRightLeft,
  LayoutDashboard,
  Building2,
  Menu,
  X,
  Target,
  MessageSquare,
  KanbanSquare,
  Store,
  Smartphone,
  ChevronsLeft,
  ChevronsRight,
  GitBranch,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  UserCircle2,
  LogOut,
} from "lucide-react";
import {
  PAPEL_LABEL,
  pode,
  type Modulo,
  type Papel,
} from "@/core/domain/papeis";

type NavItem = { label: string; href: string; icon: typeof Users; modulo: Modulo };

const GRUPOS: { titulo: string; itens: NavItem[] }[] = [
  {
    titulo: "Principal",
    itens: [
      { label: "Visão geral", href: "/", icon: LayoutDashboard, modulo: "dashboard" },
      { label: "Clientes", href: "/clientes", icon: Users, modulo: "clientes" },
      { label: "Oportunidades", href: "/oportunidades", icon: Target, modulo: "oportunidades" },
      { label: "Tarefas", href: "/tarefas", icon: CheckSquare, modulo: "tarefas" },
      { label: "Conversas", href: "/mensagens", icon: MessageSquare, modulo: "conversas" },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { label: "Fluxos", href: "/fluxos", icon: GitBranch, modulo: "fluxos" },
      { label: "Kanban", href: "/kanban", icon: KanbanSquare, modulo: "kanban" },
      { label: "Handoffs", href: "/handoffs", icon: ArrowRightLeft, modulo: "handoffs" },
    ],
  },
  {
    titulo: "Gestão",
    itens: [
      { label: "Corretores", href: "/vendedores", icon: Store, modulo: "corretores" },
      { label: "WhatsApp", href: "/gestor-whatsapp", icon: Smartphone, modulo: "whatsapp" },
    ],
  },
  {
    titulo: "Conta",
    itens: [{ label: "Meu perfil", href: "/minha-conta", icon: UserCircle2, modulo: "minha-conta" }],
  },
];

interface UsuarioLeve {
  nome: string;
  email: string;
  papel: Papel;
  papel_label: string;
  modulos?: { modulo: Modulo; acoes: string[] }[];
  rotas?: string[];
}

const ROTA_TITULO: { match: RegExp; titulo: string; pai?: string }[] = [
  { match: /^\/clientes\/[^/]+$/, titulo: "Perfil do cliente", pai: "Clientes" },
  { match: /^\/$/, titulo: "Visão geral" },
  { match: /^\/clientes$/, titulo: "Clientes" },
  { match: /^\/oportunidades/, titulo: "Oportunidades" },
  { match: /^\/tarefas$/, titulo: "Tarefas" },
  { match: /^\/fluxos\/[^/]+$/, titulo: "Editor de fluxo", pai: "Fluxos" },
  { match: /^\/fluxos$/, titulo: "Fluxo de Leads" },
  { match: /^\/kanban$/, titulo: "Kanban" },
  { match: /^\/handoffs$/, titulo: "Handoffs" },
  { match: /^\/mensagens$/, titulo: "Conversas" },
  { match: /^\/gestor-whatsapp$/, titulo: "WhatsApp" },
  { match: /^\/vendedores$/, titulo: "Corretores" },
  { match: /^\/minha-conta$/, titulo: "Meu perfil", pai: "Conta" },
  { match: /^\/acessos$/, titulo: "Acessos e permissões", pai: "Conta" },
];

function tituloDaRota(pathname: string) {
  const found = ROTA_TITULO.find((r) => r.match.test(pathname));
  return found || { titulo: "Pós-Atendimento", pai: "" };
}

function isAtiva(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [colapsada, setColapsada] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuPerfil, setMenuPerfil] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioLeve | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const salvo = window.localStorage.getItem("posat:sidebar:colapsada");
      if (salvo !== null) setColapsada(salvo === "1");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("posat:sidebar:colapsada", colapsada ? "1" : "0");
  }, [colapsada]);

  useEffect(() => {
    const t = setTimeout(() => {
      setMenuAberto(false);
      setMenuPerfil(false);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

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

  if (pathname === "/login" || pathname.startsWith("/portal")) {
    return <div className="min-h-screen">{children}</div>;
  }

  const { titulo, pai } = tituloDaRota(pathname);

  function podeVer(item: NavItem): boolean {
    if (!usuario) return false;
    if (usuario.rotas && usuario.rotas.length > 0) {
      return usuario.rotas.includes(item.href);
    }
    return pode(usuario.papel, item.modulo, "ver");
  }

  const gruposVisiveis = GRUPOS.map((grupo) => ({
    ...grupo,
    itens: grupo.itens.filter(podeVer),
  })).filter((grupo) => grupo.itens.length > 0);

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={`min-h-screen transition-[padding] duration-200 ${colapsada ? "lg:pl-0" : "lg:pl-[248px]"}`}>
      {/* ─── Sidebar desktop ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[var(--border)] bg-[var(--side)] transition-transform duration-200 lg:flex ${
          colapsada ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className={`flex h-16 items-center gap-2.5 px-4 ${colapsada ? "justify-center px-0" : ""}`}>
          <Link href="/" className="flex items-center gap-2.5" data-tooltip={colapsada ? "Quadra — Pós-Atendimento" : undefined}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-900/40">
              <Building2 className="h-4 w-4" />
            </div>
            {!colapsada && (
              <div className="leading-tight">
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                  Quadra
                </span>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">
                  Pós-Atendimento
                </span>
              </div>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setColapsada((v) => !v)}
          aria-label={colapsada ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!colapsada}
          data-tooltip={colapsada ? "Expandir menu" : "Recolher menu"}
          className="sidebar-handle absolute right-[-25px] top-1/2 z-30 flex h-12 w-6 -translate-y-1/2 flex-col items-center justify-center rounded-r-lg border border-[var(--border)] bg-[var(--side)] text-[var(--text-muted)] shadow-md transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
        >
          {colapsada ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scroll-thin">
          {gruposVisiveis.map((grupo) => (
            <div key={grupo.titulo}>
              {!colapsada && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {grupo.titulo}
                </p>
              )}
              <div className="space-y-0.5">
                {grupo.itens.map((item) => {
                  const Icon = item.icon;
                  const ativa = isAtiva(item.href, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-tooltip={colapsada ? item.label : undefined}
                      aria-label={item.label}
                      className={`flex items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                        ativa
                          ? "bg-[var(--accent-light)] text-[var(--accent)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
                      } ${colapsada ? "justify-center px-0 py-2.5" : "py-2"}`}
                    >
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${ativa ? "text-[var(--accent)]" : ""}`} />
                      {!colapsada && <span className="truncate">{item.label}</span>}
                      {ativa && !colapsada && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {usuario && (
            <div className="pt-5">
              {!colapsada && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Sessão
                </p>
              )}
              <button
                onClick={sair}
                data-tooltip={colapsada ? "Sair" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--inset)] hover:text-[var(--danger)] ${
                  colapsada ? "justify-center px-0 py-2.5" : "py-2"
                }`}
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" />
                {!colapsada && <span>Sair</span>}
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* ─── Drawer mobile ─── */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuAberto(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-[var(--side)] shadow-2xl animate-slide-right">
            <div className="flex h-16 items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Quadra</span>
                  <span className="block text-sm font-semibold text-[var(--text-primary)]">Pós-Atendimento</span>
                </div>
              </Link>
              <button
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {gruposVisiveis.map((grupo) => (
                <div key={grupo.titulo}>
                  <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {grupo.titulo}
                  </p>
                  <div className="space-y-0.5">
                    {grupo.itens.map((item) => {
                      const Icon = item.icon;
                      const ativa = isAtiva(item.href, pathname);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            ativa
                              ? "bg-[var(--accent-light)] text-[var(--accent)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          <Icon className={`h-[18px] w-[18px] ${ativa ? "text-[var(--accent)]" : ""}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              {usuario && (
                <div>
                  <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Sessão
                  </p>
                  <button
                    onClick={sair}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--inset)] hover:text-[var(--danger)]"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    Sair
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* ─── Área de conteúdo ─── */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--side)]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--inset)] hover:text-[var(--text-primary)] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
              {titulo}
            </h1>
            {pai && (
              <p className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                {pai}
                <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </div>

          <div className="relative ml-auto flex items-center">
            {usuario ? (
              <button
                onClick={() => setMenuPerfil((v) => !v)}
                aria-label="Perfil do usuário"
                aria-expanded={menuPerfil}
                className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--inset)] p-1 pl-2.5 transition-colors hover:border-[var(--accent-border)]"
              >
                <span className="hidden text-right text-xs leading-tight min-[380px]:block">
                  <span className="block max-w-[140px] truncate font-medium text-[var(--text-secondary)]">
                    {usuario.nome}
                  </span>
                  <span className="block pr-1 text-[10px] text-[var(--text-muted)]">
                    {usuario.papel_label}
                  </span>
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[11px] font-bold text-white">
                  {iniciais(usuario.nome)}
                </span>
                <ChevronDown
                  className={`mr-0.5 h-3.5 w-3.5 text-[var(--text-muted)] transition-transform ${menuPerfil ? "rotate-180" : ""}`}
                />
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--inset)] p-1 pl-2.5">
                <span className="hidden text-xs font-medium text-[var(--text-muted)] min-[380px]:block">
                  {carregado ? "Bem-vindo" : "Carregando…"}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--text-muted)]/25 text-[11px] font-bold text-[var(--text-secondary)]">
                  ?
                </span>
              </div>
            )}

            {menuPerfil && usuario && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuPerfil(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--side)] shadow-xl">
                  <div className="flex items-center gap-3 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white">
                      {iniciais(usuario.nome)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {usuario.nome}
                      </p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-light)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                      <ShieldCheck className="h-3 w-3" />
                      {PAPEL_LABEL[usuario.papel]}
                    </span>
                  </div>

                  <div className="grid gap-2 border-t border-[var(--border)] p-3">
                    <button
                      onClick={() => {
                        setMenuPerfil(false);
                        router.push("/minha-conta");
                      }}
                      className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--text-primary)]"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      Meu perfil
                    </button>
                    <button
                      onClick={() => {
                        setMenuPerfil(false);
                        void sair();
                      }}
                      className="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--inset)] hover:text-[var(--danger)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="border-t border-[var(--border)] py-5">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-1.5 px-4 text-[11px] text-[var(--text-muted)] sm:flex-row sm:px-6 lg:px-8">
            <p>&copy; {new Date().getFullYear()} Quadra Brasileira — Pós-Atendimento</p>
            <p className="font-medium">CRM · Next.js + Supabase</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
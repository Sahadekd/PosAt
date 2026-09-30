"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  GitBranch,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: typeof Users };

const GRUPOS: { titulo: string; itens: NavItem[] }[] = [
  {
    titulo: "Principal",
    itens: [
      { label: "Visão geral", href: "/", icon: LayoutDashboard },
      { label: "Clientes", href: "/clientes", icon: Users },
      { label: "Oportunidades", href: "/oportunidades", icon: Target },
      { label: "Tarefas", href: "/tarefas", icon: CheckSquare },
      { label: "Conversas", href: "/mensagens", icon: MessageSquare },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { label: "Fluxos", href: "/fluxos", icon: GitBranch },
      { label: "Kanban", href: "/kanban", icon: KanbanSquare },
      { label: "Handoffs", href: "/handoffs", icon: ArrowRightLeft },
    ],
  },
  {
    titulo: "Gestão",
    itens: [
      { label: "Corretores", href: "/vendedores", icon: Store },
      { label: "WhatsApp", href: "/gestor-whatsapp", icon: Smartphone },
    ],
  },
];

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
];

function tituloDaRota(pathname: string) {
  const found = ROTA_TITULO.find((r) => r.match.test(pathname));
  return found || { titulo: "Pós-Atendimento", pai: "" };
}

function isAtiva(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [colapsada, setColapsada] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

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
    const t = setTimeout(() => setMenuAberto(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const { titulo, pai } = tituloDaRota(pathname);

  return (
    <div className={`min-h-screen transition-[padding] duration-200 ${colapsada ? "lg:pl-[72px]" : "lg:pl-[248px]"}`}>
      {/* ─── Sidebar desktop ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--border)] bg-[var(--side)] transition-[width] duration-200 lg:flex ${
          colapsada ? "w-[72px]" : "w-[248px]"
        }`}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center gap-2.5 px-4 ${colapsada ? "justify-center px-0" : ""}`}>
          <Link href="/" className="flex items-center gap-2.5" data-tooltip={colapsada ? "Quadra — Pós-Atendimento" : undefined}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-900/40">
              <Building2 className="h-4 w-4" />
            </div>
            {!colapsada && (
              <div className="leading-tight">
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-sky-400">
                  Quadra
                </span>
                <span className="block text-sm font-semibold text-slate-100">
                  Pós-Atendimento
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scroll-thin">
          {GRUPOS.map((grupo) => (
            <div key={grupo.titulo}>
              {!colapsada && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
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
                      className={`flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                        ativa
                          ? "bg-[var(--accent-light)] text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
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
        </nav>

        {/* Rodapé da sidebar */}
        <div className="border-t border-[var(--border)] p-3">
          <button
            onClick={() => setColapsada((v) => !v)}
            data-tooltip={colapsada ? "Expandir" : "Recolher"}
            aria-label={colapsada ? "Expandir menu" : "Recolher menu"}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 ${
              colapsada ? "justify-center px-0" : ""
            }`}
          >
            {colapsada ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!colapsada && <span>Recolher menu</span>}
          </button>
        </div>
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
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-sky-400">Quadra</span>
                  <span className="block text-sm font-semibold text-slate-100">Pós-Atendimento</span>
                </div>
              </Link>
              <button
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {GRUPOS.map((grupo) => (
                <div key={grupo.titulo}>
                  <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
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
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            ativa
                              ? "bg-[var(--accent-light)] text-white"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
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
            </nav>
          </div>
        </div>
      )}

      {/* ─── Área de conteúdo ─── */}
      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
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

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--inset)] p-1 pl-2.5">
              <span className="hidden text-xs font-medium text-[var(--text-secondary)] min-[380px]:block">
                Equipe PosAt
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[11px] font-bold text-white">
                EQ
              </span>
            </div>
          </div>
        </header>

        {/* Main */}
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
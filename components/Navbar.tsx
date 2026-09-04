"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Users,
  CheckSquare,
  ArrowRightLeft,
  LayoutDashboard,
  PlusCircle,
  Building2,
  Menu,
  X,
  Moon,
  Sun,
  Target,
  KanbanSquare,
} from "lucide-react";
import NovoClienteModal from "./NovoClienteModal";

const navItems = [
  { label: "Visão Geral", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Oportunidades", href: "/oportunidades", icon: Target },
  { label: "Tarefas", href: "/tarefas", icon: CheckSquare },
  { label: "Kanban", href: "/kanban", icon: KanbanSquare },
  { label: "Handoffs", href: "/handoffs", icon: ArrowRightLeft },
];

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white transition-colors group-hover:bg-black dark:bg-white dark:text-zinc-900 dark:group-hover:bg-zinc-200">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Quadra
              </span>
              <span className="block -mt-0.5 text-sm font-semibold leading-none text-slate-900 dark:text-zinc-100">
                Pós-Atendimento
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  <span
                    className={
                      isActive
                        ? "text-slate-900 dark:text-zinc-50"
                        : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-slate-900 dark:bg-zinc-100" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Alternar tema"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setModalNovoAberto(true)}
              className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-black sm:flex dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Novo Cadastro</span>
            </button>

            {/* Profile */}
            <div className="flex items-center rounded-full border border-slate-200 bg-white p-1.5 pl-3 shadow-sm transition hover:shadow dark:border-zinc-700 dark:bg-zinc-800">
              <span className="hidden pr-2 text-sm font-medium text-slate-700 lg:block dark:text-zinc-200">
                Equipe
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
                ES
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="rounded-full border border-slate-200 p-2 text-slate-600 md:hidden dark:border-zinc-700 dark:text-zinc-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => {
                setModalNovoAberto(true);
                setMobileOpen(false);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Cadastro
            </button>
          </div>
        )}
      </header>

      <NovoClienteModal
        aberto={modalNovoAberto}
        aoFechar={() => setModalNovoAberto(false)}
        aoSalvar={() => {
          setModalNovoAberto(false);
          window.location.reload();
        }}
      />
    </>
  );
}

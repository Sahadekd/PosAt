"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Users,
  CheckSquare,
  ArrowRightLeft,
  LayoutDashboard,
  PlusCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import NovoClienteModal from "./NovoClienteModal";

export default function Navbar() {
  const pathname = usePathname();
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  const navItems = [
    {
      label: "Visão Geral",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Clientes & Leads",
      href: "/clientes",
      icon: Users,
    },
    {
      label: "Pós-Atendimento & Tarefas",
      href: "/tarefas",
      icon: CheckSquare,
    },
    {
      label: "Handoffs",
      href: "/handoffs",
      icon: ArrowRightLeft,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e6decb] bg-[#fffdf8]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e2722] text-[#f4f0e8] shadow-sm transition group-hover:bg-[#b25c3f]">
                <Building2 className="h-5 w-5 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#b25c3f]">
                  Quadra Brasileira
                </span>
                <span className="text-lg font-semibold tracking-tight text-[#1e2722]">
                  Pós-Atendimento
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#1e2722] text-[#fffdf8] shadow-sm"
                        : "text-[#5b625d] hover:bg-[#ede6d8] hover:text-[#1e2722]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-[#d9d2c6] bg-[#f5f1e9] px-3 py-1 text-xs text-[#5b625d]">
              <Sparkles className="h-3.5 w-3.5 text-[#b25c3f]" />
              <span>Motor de Segmentação Ativo</span>
            </div>

            <button
              onClick={() => setModalNovoAberto(true)}
              className="flex items-center gap-2 rounded-xl bg-[#b25c3f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#974b32] active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Cadastro</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-[#e6decb] px-4 py-2 justify-around bg-[#fffdf8]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
                  isActive ? "text-[#b25c3f]" : "text-[#68706a]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
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

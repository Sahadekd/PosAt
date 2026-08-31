import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Pós-Atendimento & Segmentação | Quadra Brasileira",
  description:
    "Sistema unificado de cadastro, segmentação por finalidade, completude cadastral e gestão de pós-atendimento.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col bg-[#f4f0e8] text-[#1e2722]">
        <Navbar />
        <main className="flex-1 px-4 py-8 sm:px-6 md:py-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <footer className="border-t border-[#e6decb] bg-[#fffdf8] py-6 text-center text-xs text-[#8b918c]">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              &copy; {new Date().getFullYear()} Quadra Brasileira — Sistema de Pós-Atendimento & Inteligência de Relacionamento
            </p>
            <p className="text-[11px] text-[#b25c3f] font-medium">
              Arquitetura Monolítica Modular (Next.js + Supabase)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

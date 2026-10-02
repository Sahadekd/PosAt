"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  PartyPopper,
  ShieldCheck,
} from "lucide-react";

type UsuarioPortal = {
  nome: string;
  email: string;
};

const ETAPAS_JORNADA = [
  { id: "ficha", label: "Ficha cadastral", status: "concluida" },
  { id: "financiamento", label: "Condições de pagamento", status: "concluida" },
  { id: "contrato", label: "Contrato", status: "andamento" },
  { id: "obra", label: "Acompanhamento de obra", status: "pendente" },
  { id: "chaves", label: "Entrega das chaves", status: "pendente" },
] as const;

const DOCUMENTOS = [
  {
    id: "doc-1",
    label: "Contrato de compra e venda",
    status: "disponivel",
  },
  {
    id: "doc-2",
    label: "Planilha de evolução de obra",
    status: "disponivel",
  },
  {
    id: "doc-3",
    label: "Guia de entrega de chaves",
    status: "previsto",
  },
] as const;

const TIMELINE = [
  {
    id: "t-1",
    texto: "Contrato assinado · unidade 204, Torre A",
    quando: "há 12 dias",
    tipo: "documento",
  },
  {
    id: "t-2",
    texto: "Página do cliente ativada pela equipe do pós-atendimento",
    quando: "há 12 dias",
    tipo: "sistema",
  },
  {
    id: "t-3",
    texto: "Primeira reunião de alinhamento com o analista de CS",
    quando: "há 5 dias",
    tipo: "conversa",
  },
] as const;

function badgeEtapa(status: string) {
  if (status === "concluida") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success-light)]">
        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
      </span>
    );
  }

  if (status === "andamento") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-light)]">
        <Clock className="h-3.5 w-3.5 animate-pulse text-[var(--accent)]" />
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--inset)]">
      <Circle className="h-3.5 w-3.5 text-[var(--text-muted)]" />
    </span>
  );
}

export default function PortalPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioPortal | null>(null);
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  useEffect(() => {
    let ativo = true;

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((dados) => {
        if (ativo && dados.usuario) {
          setUsuario({
            nome: dados.usuario.nome,
            email: dados.usuario.email,
          });
        }
      })
      .catch(() => undefined);

    return () => {
      ativo = false;
    };
  }, []);

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "Você";

  const etapasConcluidas = ETAPAS_JORNADA.filter(
    (e) => e.status === "concluida"
  ).length;

  const porcentagem = Math.round(
    (etapasConcluidas / ETAPAS_JORNADA.length) * 100
  );

  const iconeDe = (tipo: string) => {
    if (tipo === "conversa") {
      return (
        <MessageCircle className="h-4 w-4 text-[var(--accent)]" />
      );
    }

    if (tipo === "documento") {
      return (
        <FileText className="h-4 w-4 text-[var(--success)]" />
      );
    }

    return (
      <ShieldCheck className="h-4 w-4 text-[var(--warning)]" />
    );
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      {/* Topo */}
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--side)] px-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </span>

          <div>
            <p className="text-sm font-bold leading-tight">
              Portal do cliente
            </p>

            <p className="text-[11px] text-[var(--text-muted)]">
              Quadra Brasileira · Pós-atendimento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs sm:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[10px] font-bold text-white">
              {(usuario?.nome ?? "C")
                .split(/\s+/)
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>

            <span className="font-medium text-[var(--text-secondary)]">
              {usuario?.nome ?? "Cliente"}
            </span>
          </span>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5" />
            {saindo ? "Saindo…" : "Sair"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8 lg:px-8">
        {/* Boas-vindas */}
        <section>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {primeiroNome} 👋
          </h1>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Acompanhe a evolução da sua aquisição, documentos e conversas com
            a nossa equipe.
          </p>
        </section>

        {/* Minha jornada */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--inset)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Home className="h-4 w-4 text-[var(--accent)]" />
              Minha jornada
            </h2>

            <span className="text-xs font-semibold text-[var(--accent)]">
              {porcentagem}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all"
              style={{ width: `${porcentagem}%` }}
            />
          </div>

          <ul className="mt-5 space-y-3.5">
            {ETAPAS_JORNADA.map((etapa) => (
              <li key={etapa.id} className="flex items-center gap-3">
                {badgeEtapa(etapa.status)}

                <span
                  className={`text-sm ${
                    etapa.status === "pendente"
                      ? "text-[var(--text-muted)]"
                      : "font-medium text-[var(--text-primary)]"
                  }`}
                >
                  {etapa.label}
                </span>

                {etapa.status === "andamento" && (
                  <span className="ml-auto rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                    Em andamento
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Meus documentos */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--inset)] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-[var(--accent)]" />
              Meus documentos
            </h2>

            <ul className="mt-4 space-y-2.5">
              {DOCUMENTOS.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
                >
                  <FileText className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />

                  <span className="flex-1 text-sm text-[var(--text-secondary)]">
                    {doc.label}
                  </span>

                  {doc.status === "disponivel" ? (
                    <span className="text-[10px] font-semibold uppercase text-[var(--success)]">
                      Disponível
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                      Em breve
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline">
              Ver todos os documentos
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </section>

          {/* Linha do tempo */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--inset)] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              Minha linha do tempo
            </h2>

            <ol className="relative mt-4 space-y-4 border-l border-[var(--border)] pl-4">
              {TIMELINE.map((item) => (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[21px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--inset)]">
                    {iconeDe(item.tipo)}
                  </span>

                  <p className="text-sm text-[var(--text-primary)]">
                    {item.texto}
                  </p>

                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    {item.quando}
                  </p>
                </li>
              ))}
            </ol>

            <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline">
              Ver todas as atualizações
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </section>
        </div>

        {/* Rodapé */}
        <footer className="flex items-center gap-2 rounded-2xl border border-dashed border-[var(--border-strong)] px-5 py-4 text-xs text-[var(--text-muted)]">
          <PartyPopper className="h-4 w-4 text-[var(--warning)]" />

          Esta é a primeira versão do portal. Em breve você receberá
          comunicados, convites para reuniões e os documentos do seu imóvel
          em um só lugar.
        </footer>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Send,
  Phone,
  Search,
  AlertTriangle,
  Link2,
  User,
  Zap,
  Building2,
  Download,
  Trash2,
  Star,
  Sparkles,
  Smartphone,
  LayoutDashboard,
  ChevronDown,
  X,
  BadgeCheck,
} from "lucide-react";
import WhatsAppConexoesManager from "@/components/WhatsAppConexoesManager";
import WhatsAppGestorDashboard from "@/components/WhatsAppGestorDashboard";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  buildWhatsAppRequestHeaders,
  resolveWhatsAppOwnerFromStorage,
} from "@/lib/whatsapp-access";
import {
  formatarHorario,
  formatarDia,
  estaSemResposta,
  analisarSentimento,
  resumirConversa,
  sugerirProximaAcao,
} from "@/lib/whatsapp";

interface MensagemUI {
  id: string;
  origem: string;
  tipo: string;
  conteudo: string;
  lida: boolean;
  enviado_em: string;
}

interface ClienteVinculavel {
  id: string;
  nome: string;
  telefone: string | null;
  finalidade_principal: string;
  status: string;
}

interface ConversaUI {
  id: string;
  conexao_id: string;
  corretor: string | null;
  numero_cliente: string;
  nome_cliente: string | null;
  cliente_id: string | null;
  empreendimento: string | null;
  etapa: string | null;
  espelhando: boolean;
  privada_motivo: string | null;
  primeiro_mensagem_em: string;
  ultima_mensagem_em: string;
  mensagens: MensagemUI[];
  cliente?: {
    id: string;
    nome: string | null;
    telefone: string | null;
    finalidade_principal: string;
    status: string;
  } | null;
}

interface ConexaoUI {
  id: string;
  corretor: string;
  numero: string;
  sessao_id: string;
  status: string;
}

interface MetricaUI {
  totalConversas: number;
  espelhadas: number;
  semMatch: number;
  privadas: number;
  semResposta: {
    conversaId: string;
    nomeCliente: string | null;
    vencidoAposHoras: number;
  }[];
}

interface NpsUI {
  id: string;
  conversa_id: string;
  cliente_nome: string | null;
  etapa: string;
  status: "pendente" | "respondida";
  nota: number | null;
  comentario: string | null;
  enviada_em: string;
}

function resolveOwnerWhatsApp(): string | null {
  return resolveWhatsAppOwnerFromStorage();
}

function withOwnerHeader(init?: RequestInit, owner?: string | null): RequestInit {
  return buildWhatsAppRequestHeaders(init, owner);
}

function mesclarMensagem(
  conversa: ConversaUI,
  mensagem: MensagemUI
): ConversaUI {
  const mensagens = conversa.mensagens.some((item) => item.id === mensagem.id)
    ? conversa.mensagens.map((item) => item.id === mensagem.id ? mensagem : item)
    : [...conversa.mensagens, mensagem];

  return {
    ...conversa,
    mensagens,
    ultima_mensagem_em:
      mensagem.enviado_em > conversa.ultima_mensagem_em
        ? mensagem.enviado_em
        : conversa.ultima_mensagem_em,
  };
}

function AbaConteudo({
  ativa,
  onClick,
  icone,
  label,
}: {
  ativa: boolean;
  onClick: () => void;
  icone: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        ativa
          ? "bg-[var(--white)] text-[var(--text-primary)] shadow-sm"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {icone}
      {label}
    </button>
  );
}

export default function MensagensPage() {
  const [conversas, setConversas] = useState<ConversaUI[]>([]);
  const [clientes, setClientes] = useState<ClienteVinculavel[]>([]);
  const [conexoes, setConexoes] = useState<ConexaoUI[]>([]);
  const [metricas, setMetricas] = useState<MetricaUI | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [visao, setVisao] = useState<"conversas" | "conexoes" | "gestor">("conversas");
  const [busca, setBusca] = useState("");
  const [novoTexto, setNovoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<string | null>(null);
  const [vinculoBusca, setVinculoBusca] = useState("");
  const [nps, setNps] = useState<NpsUI[]>([]);
  const [respostaNps, setRespostaNps] = useState(9);
  const [comentarioNps, setComentarioNps] = useState("");
  const [ownerSelecionado, setOwnerSelecionado] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const mensagemOtimistaIdRef = useRef(0);

  useEffect(() => {
    let ativo = true;
    const owner = resolveOwnerWhatsApp();

    Promise.all([
      fetch("/api/whatsapp/mensagens", withOwnerHeader(undefined, owner)).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/whatsapp/conexao", withOwnerHeader(undefined, owner)).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/whatsapp/metricas", withOwnerHeader(undefined, owner)).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([msg, con, met]) => {
        if (!ativo) return;

        if (msg?.conversas) setConversas(msg.conversas);
        if (msg?.clientes) setClientes(msg.clientes);
        if (msg?.nps) setNps(msg.nps);
        if (con?.conexoes) {
          setConexoes(con.conexoes);
          const primeiroOwner = con.conexoes[0]?.corretor ?? null;
          const atual = resolveOwnerWhatsApp() ?? primeiroOwner;

          if (!atual && con.conexoes.length === 0 && visao !== "conexoes") {
            setVisao("conexoes");
            setUltimoResultado("Cadastre seu WhatsApp para começar a responder as conversas.");
          }

          if (atual) {
            setOwnerSelecionado(atual);
            window.localStorage.setItem("posat:whatsapp:owner", atual);
          }
        }
        if (met?.metricas) setMetricas(met.metricas);

        const abrir = new URLSearchParams(window.location.search).get("abrir");

        if (
          abrir &&
          msg?.conversas?.some(
            (c: { id: string }) => c.id === abrir
          )
        ) {
          setSelecionada(abrir);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (threadRef.current && selecionada) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [selecionada, conversas]);

  async function refresh() {
    try {
      const owner = resolveOwnerWhatsApp();
      const [msg, con, met] = await Promise.all([
        fetch("/api/whatsapp/mensagens", withOwnerHeader(undefined, owner)).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch("/api/whatsapp/conexao", withOwnerHeader(undefined, owner)).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch("/api/whatsapp/metricas", withOwnerHeader(undefined, owner)).then((r) =>
          r.ok ? r.json() : null
        ),
      ]);

      if (msg?.conversas) setConversas(msg.conversas);
      if (msg?.clientes) setClientes(msg.clientes);
      if (msg?.nps) setNps(msg.nps);
      if (con?.conexoes) setConexoes(con.conexoes);
      if (met?.metricas) setMetricas(met.metricas);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!supabaseBrowser) return;

  const canal = supabaseBrowser
    .channel("whatsapp-mensagens-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "whatsapp_mensagens",
      },
      (payload) => {
        const mensagem = payload.new as MensagemUI & { conversa_id?: string };
        if (!mensagem?.id || !mensagem.conversa_id) return;

        setConversas((atual) => atual.map((conversa) =>
          conversa.id === mensagem.conversa_id
            ? mesclarMensagem(conversa, mensagem)
            : conversa
        ));
      }
    )
    .subscribe((status) => {
      console.log("📡 STATUS REALTIME:", status);
    });

  return () => {
    if (supabaseBrowser) {
      void supabaseBrowser.removeChannel(canal);
    }
  };
  }, []);

  async function toggleEspelhamento(conversa: ConversaUI) {
    const proximo = !conversa.espelhando;
    setConversas((prev) =>
      prev.map((c) =>
        c.id === conversa.id
          ? {
              ...c,
              espelhando: proximo,
              privada_motivo: proximo ? null : c.privada_motivo,
            }
          : c
      )
    );
    try {
      await fetch(`/api/whatsapp/mensagens/${conversa.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          espelhando: proximo,
          privadaMotivo: proximo ? undefined : "Conversa marcada como particular",
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function vincularConversa(conversaId: string, clienteId: string) {
    try {
      await fetch(`/api/whatsapp/mensagens/${conversaId}/vincular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId }),
      });
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function dispararNps(conversaId: string) {
    try {
      const res = await fetch("/api/whatsapp/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversaId }),
      });
      if (res.ok) setUltimoResultado("Pesquisa NPS disparada para a conversa.");
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function responderNpsDaConversa(id: string) {
    try {
      const res = await fetch(`/api/whatsapp/nps/${id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nota: Number(respostaNps),
          comentario: comentarioNps || undefined,
        }),
      });
      if (res.ok) {
        setUltimoResultado(`Resposta NPS (${respostaNps}/10) registrada na pesquisa.`);
        setComentarioNps("");
      }
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function excluirConversa(conversaId: string) {
    if (
      !window.confirm(
        "Excluir esta conversa e todos os registros vinculados? (Direito de exclusão — LGPD)"
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/whatsapp/mensagens/${conversaId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUltimoResultado("Conversa excluída (LGPD). Histórico e referências removidos.");
        setSelecionada(null);
        await refresh();
      } else {
        setUltimoResultado("Erro ao excluir a conversa.");
      }
    } catch (e) {
      console.error(e);
      setUltimoResultado("Falha de rede ao excluir a conversa.");
    }
  }

  async function enviarMensagem(direcao: "enviada" | "recebida") {
    if (!selecionada || !novoTexto.trim()) return;
    const texto = novoTexto.trim();
    const conversaAntesDoEnvio = conversas.find((c) => c.id === selecionada);
    if (!conversaAntesDoEnvio) return;
    if (direcao === "recebida" && !selecionadaLograda) {
      setUltimoResultado("Selecione uma conversa com conexão ativa para simular a resposta do cliente.");
      return;
    }
    mensagemOtimistaIdRef.current += 1;

    const mensagemOtimista: MensagemUI = {
      id: `optimistic-${mensagemOtimistaIdRef.current}`,
      origem: direcao,
      tipo: "texto",
      conteudo: texto,
      lida: direcao === "enviada",
      enviado_em: new Date().toISOString(),
    };
    setConversas((atual) => atual.map((conversa) =>
      conversa.id === selecionada
        ? mesclarMensagem(conversa, mensagemOtimista)
        : conversa
    ));
    setNovoTexto("");
    setEnviando(true);
    try {
      if (direcao === "enviada") {
        const res = await fetch(`/api/whatsapp/mensagens/${selecionada}/responder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conteudo: texto }),
        });
        const json = await res.json();
        setUltimoResultado(
          json.ok
            ? `Enviada no WhatsApp${json.enviadoViaEvolution ? " via Evolution API" : " (simulação)"} · ${json.registradoNoCrm ? "registrada no CRM" : "sem registro no CRM"}`
            : `Erro: ${json.erro || "desconhecido"}`
        );
        setConversas((atual) => atual.map((conversa) => {
          if (conversa.id !== selecionada) return conversa;
          const semOtimista = conversa.mensagens.filter((item) => item.id !== mensagemOtimista.id);
          return json.mensagem
            ? mesclarMensagem({ ...conversa, mensagens: semOtimista }, json.mensagem)
            : { ...conversa, mensagens: semOtimista };
        }));
        return;
      }

      const sessao = selecionadaLograda;
      if (!sessao) return;
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessaoId: sessao.sessaoId,
          numero: sessao.numero,
          direction: "recebida",
          texto,
          nomeContato: sessao.nomeCliente || undefined,
        }),
      });
      const json = await res.json();
      setUltimoResultado(
        json.ok
          ? `Resposta do cliente espelhada${json.matchCliente ? " · match com cliente" : " · sem match no CRM"}${json.registradoNoCrm ? " · registrada na ficha" : ""}`
          : `Erro: ${json.erro || "desconhecido"}`
      );
      if (!res.ok) {
        setConversas((atual) => atual.map((conversa) => conversa.id === selecionada
          ? { ...conversa, mensagens: conversa.mensagens.filter((item) => item.id !== mensagemOtimista.id) }
          : conversa));
      }
    } catch (e) {
      console.error(e);
      setConversas((atual) => atual.map((conversa) => conversa.id === selecionada
        ? { ...conversa, mensagens: conversa.mensagens.filter((item) => item.id !== mensagemOtimista.id) }
        : conversa));
      setUltimoResultado("Falha de rede ao processar webhook.");
    } finally {
      setEnviando(false);
    }
  }

  const conversaSelecionada = conversas.find((c) => c.id === selecionada) || null;

  const sentimentoConversa = conversaSelecionada
    ? analisarSentimento(conversaSelecionada.mensagens)
    : null;

  const resumoConversa = conversaSelecionada
    ? resumirConversa(conversaSelecionada.mensagens)
    : "";

  const semRespostaConversa = conversaSelecionada
    ? estaSemResposta(conversaSelecionada.mensagens)
    : null;

  const proximaAcaoConversa =
    conversaSelecionada && sentimentoConversa && semRespostaConversa
      ? sugerirProximaAcao({
          clienteId: conversaSelecionada.cliente_id,
          etapa: conversaSelecionada.etapa,
          sentimento: sentimentoConversa,
          semResposta: semRespostaConversa.semResposta,
          semRespostaHoras: semRespostaConversa.vencidoAposHoras,
        })
      : null;

  const npsDaConversa = conversaSelecionada
    ? nps.find((n) => n.conversa_id === conversaSelecionada.id) || null
    : null;
  const sessaoDaConversa = conversaSelecionada
    ? conexoes.find((cx) => cx.id === conversaSelecionada.conexao_id) || null
    : null;
  const selecionadaLograda = conversaSelecionada && sessaoDaConversa
    ? {
        sessaoId: sessaoDaConversa.sessao_id,
        numero: conversaSelecionada.numero_cliente,
        nomeCliente: conversaSelecionada.nome_cliente,
      }
    : null;

  const conversasVisiveis = ownerSelecionado
    ? conversas.filter((c) => !c.corretor || c.corretor === ownerSelecionado)
    : conversas;

  const filtradas = conversasVisiveis.filter((c) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      c.nome_cliente?.toLowerCase().includes(termo) ||
      c.numero_cliente.includes(termo) ||
      c.corretor?.toLowerCase().includes(termo) ||
      c.empreendimento?.toLowerCase().includes(termo)
    );
  });

  const clientesFiltrados = clientes.filter((c) => {
    if (!vinculoBusca.trim()) return true;
    const termo = vinculoBusca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      (c.telefone || "").includes(termo)
    );
  });

  const metricasStrip = [
    { label: "Conversas", value: metricas?.totalConversas ?? 0, cor: "var(--text-primary)" },
    { label: "Espelhadas no CRM", value: metricas?.espelhadas ?? 0, cor: "var(--success)" },
    { label: "Sem match", value: metricas?.semMatch ?? 0, cor: "var(--warning)" },
    { label: "Sem resposta (8h+)", value: metricas?.semResposta.length ?? 0, cor: "var(--danger)" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Conversas espelhadas
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Toda conversa do WhatsApp dos corretores vira histórico estruturado no CRM —
            {metricas
              ? ` ${metricas.espelhadas} de ${metricas.totalConversas} conversas espelhadas`
              : " carregando…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conexoes.length > 0 && (
            <select
              value={ownerSelecionado ?? ""}
              onChange={(event) => {
                const valor = event.target.value || null;
                setOwnerSelecionado(valor);
                if (valor) {
                  window.localStorage.setItem("posat:whatsapp:owner", valor);
                } else {
                  window.localStorage.removeItem("posat:whatsapp:owner");
                }
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--white)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
            >
              <option value="">Todos os números</option>
              {conexoes.map((cx) => (
                <option key={cx.id} value={cx.corretor}>
                  {cx.corretor}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={refresh}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* ── Abas de visualização ── */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--inset)] p-1">
        <AbaConteudo
          ativa={visao === "conversas"}
          onClick={() => setVisao("conversas")}
          icone={<MessageSquare className="h-4 w-4" />}
          label="Conversas"
        />
        <AbaConteudo
          ativa={visao === "conexoes"}
          onClick={() => setVisao("conexoes")}
          icone={<Smartphone className="h-4 w-4" />}
          label="Meu WhatsApp"
        />
        <AbaConteudo
          ativa={visao === "gestor"}
          onClick={() => setVisao("gestor")}
          icone={<LayoutDashboard className="h-4 w-4" />}
          label="Painel do gestor"
        />
      </div>

      {!carregando && visao !== "gestor" && visao !== "conexoes" && conexoes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--white)] p-5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Seu WhatsApp ainda não foi cadastrado.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cadastre apenas um número para este usuário e comece a responder as conversas.
          </p>
          <button
            onClick={() => setVisao("conexoes")}
            className="mt-3 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
          >
            Cadastrar meu WhatsApp
          </button>
        </div>
      )}

      {visao === "conexoes" ? (
        <WhatsAppConexoesManager />
      ) : visao === "gestor" ? (
        <WhatsAppGestorDashboard compact />
      ) : (
        <>
          {/* ── Feedback ── */}
          {ultimoResultado && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--success-border)] bg-[var(--success-light)] px-4 py-3 text-sm text-[var(--success)]">
              <span>{ultimoResultado}</span>
              <button onClick={() => setUltimoResultado(null)} className="shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Faixa compacta de métricas ── */}
          {metricas && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {metricasStrip.map((m) => (
                <div key={m.label} className="card flex items-center gap-3 p-3.5">
                  <span className="block min-w-0">
                    <span className="block text-lg font-bold leading-tight tracking-tight" style={{ color: m.cor }}>
                      {m.value}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--text-secondary)]">{m.label}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {carregando ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)]">
              <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
              Carregando conversas…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,340px)_1fr] xl:grid-cols-[minmax(0,320px)_1fr_minmax(0,300px)]">
              {/* ── Coluna 1: Lista ── */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)]">
                <div className="border-b border-[var(--border)] p-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar cliente, número ou corretor…"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--inset)] py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--border-strong)]"
                      style={{ color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
                <div className="max-h-[640px] overflow-y-auto">
                  {filtradas.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                      Nenhuma conversa encontrada.
                    </p>
                  ) : (
                    filtradas.map((c) => {
                      const estado = estaSemResposta(c.mensagens);
                      const semMatch = !c.cliente_id;
                      const privada = !c.espelhando;
                      const ultima = [...c.mensagens].sort(
                        (a, b) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime()
                      )[0];
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelecionada(c.id)}
                          className={`flex w-full items-start gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition ${
                            selecionada === c.id
                              ? "bg-[var(--raised)]"
                              : "bg-[var(--white)] hover:bg-[var(--raised)]"
                          }`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold" style={{ borderColor: "var(--border)", background: "var(--inset)", color: "var(--text-primary)" }}>
                            {(c.nome_cliente || "?").charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                {c.nome_cliente || "Número desconhecido"}
                              </span>
                              <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                                {formatarHorario(ultima?.enviado_em)}
                              </span>
                            </span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                              <span className="truncate">{ultima?.conteudo || "Sem mensagens"}</span>
                            </span>
                            <span className="mt-1.5 flex flex-wrap gap-1.5">
                              {c.corretor && (
                                <span className="rounded-full bg-[var(--inset)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                                  {c.corretor}
                                </span>
                              )}
                              {estado.semResposta && (
                                <span className="rounded-full bg-[var(--danger-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--danger)]">
                                  Sem resposta · {estado.vencidoAposHoras}h
                                </span>
                              )}
                              {semMatch && (
                                <span className="rounded-full bg-[var(--warning-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--warning)]">
                                  Sem match
                                </span>
                              )}
                              {privada && (
                                <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                                  Não espelhar
                                </span>
                              )}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── Coluna 2: Conversa ── */}
              {conversaSelecionada ? (
                <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)]">
                  <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-bold" style={{ background: "var(--inset)", color: "var(--text-primary)" }}>
                      {(conversaSelecionada.nome_cliente || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {conversaSelecionada.nome_cliente || "Número desconhecido"}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {conversaSelecionada.numero_cliente} · {conversaSelecionada.corretor}
                      </p>
                    </div>
                    {conversaSelecionada.cliente?.id && (
                      <Link
                        href={`/clientes/${conversaSelecionada.cliente.id}`}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--raised)]"
                      >
                        <User className="h-3 w-3" />
                        Ficha
                      </Link>
                    )}
                  </div>

                  {!conversaSelecionada.espelhando && (
                    <div className="flex items-start gap-2 border-b border-[var(--border)] bg-[var(--accent-light)] px-4 py-2 text-xs text-[var(--accent)]">
                      <ShieldOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {conversaSelecionada.privada_motivo ||
                        "Esta conversa não é espelhada para o CRM (LGPD)."}
                    </div>
                  )}

                  <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ background: "var(--inset)" }}>
                    {conversaSelecionada.mensagens.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                        Nenhuma mensagem nesta conversa ainda.
                      </p>
                    ) : (
                      [...conversaSelecionada.mensagens]
                        .sort((a, b) => new Date(a.enviado_em).getTime() - new Date(b.enviado_em).getTime())
                        .map((m) => {
                          const ehEnviada = m.origem === "enviada";
                          return (
                            <div key={m.id} className={`flex ${ehEnviada ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                                  ehEnviada
                                    ? "rounded-br-md bg-[var(--accent)] text-white"
                                    : "rounded-bl-md border border-[var(--border)] text-[var(--text-primary)]"
                                }`}
                                style={{ background: ehEnviada ? undefined : "var(--white)" }}
                              >
                                <p className="whitespace-pre-wrap break-words leading-relaxed">
                                  {m.conteudo}
                                </p>
                                <p className={`mt-1 text-right text-[10px] ${ehEnviada ? "text-white/70" : "text-[var(--text-muted)]"}`}>
                                  {formatarDia(m.enviado_em)} {formatarHorario(m.enviado_em)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  <div className="border-t border-[var(--border)] p-3" style={{ background: "var(--white)" }}>
                    <details className="group">
                      <summary className="flex cursor-pointer items-center gap-1.5 pb-2 text-[11px] font-semibold text-[var(--text-muted)]">
                        <Zap className="h-3 w-3" />
                        Simulador do webhook (Evolution API)
                        <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="pb-2 text-[11px] text-[var(--text-muted)]">
                        A mensagem é processada e espelhada como se chegasse pelo WhatsApp.
                      </div>
                    </details>
                    <div className="flex items-end gap-2">
                      <input
                        value={novoTexto}
                        onChange={(e) => setNovoTexto(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void enviarMensagem("enviada");
                        }}
                        placeholder="Digite a mensagem a ser espelhada…"
                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--border-strong)]"
                        style={{ color: "var(--text-primary)" }}
                      />
                      <button
                        onClick={() => enviarMensagem("enviada")}
                        disabled={enviando || !novoTexto.trim()}
                        className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Send className="h-4 w-4" />
                        Enviar
                      </button>
                      <button
                        onClick={() => enviarMensagem("recebida")}
                        disabled={enviando || !novoTexto.trim()}
                        title="Simular cliente respondendo"
                        className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--raised)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Phone className="h-4 w-4" />
                        Receber
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] py-24 text-center">
                  <MessageSquare className="mb-3 h-8 w-8 text-[var(--text-muted)]" />
                  <p className="max-w-xs text-sm text-[var(--text-secondary)]">
                    Selecione uma conversa para ver o histórico espelhado, alternar privacidade ou vincular ao cliente.
                  </p>
                </div>
              )}

              {/* ── Coluna 3: Contexto do cliente ── */}
              {conversaSelecionada && (
                <div className="space-y-4">
                  {/* Cliente */}
                  <div className="card p-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      Contexto do cliente
                    </p>
                    {conversaSelecionada.cliente ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--success)]" />
                          <span className="text-xs font-semibold text-[var(--success)]">
                            Match com cliente · {conversaSelecionada.cliente.status}
                          </span>
                        </div>
                        {conversaSelecionada.empreendimento && (
                          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                            {conversaSelecionada.empreendimento}
                          </div>
                        )}
                        {conversaSelecionada.etapa && (
                          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <Zap className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                            Etapa: {conversaSelecionada.etapa}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 flex items-start gap-2 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-light)] p-2.5 text-xs text-[var(--warning)]">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>
                            Nenhum atendimento ativo correspondeu a {conversaSelecionada.numero_cliente}.
                          </span>
                        </div>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                          <input
                            value={vinculoBusca}
                            onChange={(e) => setVinculoBusca(e.target.value)}
                            placeholder="Buscar cliente (nome ou telefone)…"
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--inset)] py-2 pl-9 pr-3 text-xs outline-none transition focus:border-[var(--border-strong)]"
                            style={{ color: "var(--text-primary)" }}
                          />
                        </div>
                        <div className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto">
                          {clientesFiltrados.slice(0, 8).map((cl) => (
                            <div
                              key={cl.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-1.5"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-[var(--text-primary)]">
                                  {cl.nome}
                                </span>
                                <span className="block text-[11px] text-[var(--text-muted)]">
                                  {cl.telefone || "sem telefone"} · {cl.status}
                                </span>
                              </span>
                              <button
                                onClick={() => vincularConversa(conversaSelecionada.id, cl.id)}
                                className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                              >
                                <Link2 className="h-3 w-3" />
                                Vincular
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Insights */}
                  {sentimentoConversa && (
                    <div className="card p-4">
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                        <Sparkles className="h-3 w-3 text-[var(--accent)]" />
                        Insights
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            sentimentoConversa === "irritado"
                              ? "bg-[var(--danger-light)] text-[var(--danger)]"
                              : sentimentoConversa === "satisfeito"
                                ? "bg-[var(--success-light)] text-[var(--success)]"
                                : "text-[var(--warning)]"
                          }`}
                          style={{ background: sentimentoConversa === "neutro" ? "var(--warning-light)" : undefined }}
                        >
                          Sentimento: {sentimentoConversa}
                        </span>
                      </div>
                      {resumoConversa && (
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">
                          <span className="font-semibold text-[var(--text-primary)]">Resumo: </span>
                          {resumoConversa}
                        </p>
                      )}
                      {proximaAcaoConversa && (
                        <p className="mt-2 text-xs text-[var(--accent)]">
                          <span className="font-semibold">Próxima ação sugerida: </span>
                          {proximaAcaoConversa}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                        Análise heurística local — sem IA em nuvem (LGPD).
                      </p>
                    </div>
                  )}

                  {/* NPS */}
                  <div className="card p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      <Star className="h-3.5 w-3.5 text-[var(--accent)]" />
                      Pesquisa NPS
                      {npsDaConversa && (
                        <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                          {npsDaConversa.status === "respondida" ? `${npsDaConversa.nota}/10` : "pendente"}
                        </span>
                      )}
                    </p>
                    {npsDaConversa?.status === "respondida" && npsDaConversa.comentario && (
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        “{npsDaConversa.comentario}”
                      </p>
                    )}
                    {npsDaConversa?.status === "pendente" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={respostaNps}
                          onChange={(e) => setRespostaNps(Number(e.target.value))}
                          className="w-14 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-2 py-1.5 text-sm outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                        <input
                          value={comentarioNps}
                          onChange={(e) => setComentarioNps(e.target.value)}
                          placeholder="Comentário (opcional)"
                          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-2 py-1.5 text-xs outline-none"
                          style={{ color: "var(--text-primary)" }}
                        />
                        <button
                          onClick={() => responderNpsDaConversa(npsDaConversa.id)}
                          className="rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                        >
                          Registrar
                        </button>
                      </div>
                    )}
                    {!npsDaConversa && conversaSelecionada.cliente_id && (
                      <button
                        onClick={() => dispararNps(conversaSelecionada.id)}
                        className="rounded-lg border border-[var(--border)] bg-[var(--inset)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] transition hover:bg-[var(--raised)]"
                      >
                        Disparar pesquisa NPS
                      </button>
                    )}
                  </div>

                  {/* Opções da conversa */}
                  <div className="card p-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      Opções da conversa
                    </p>
                    <div className="space-y-2">
                      {conversaSelecionada.espelhando ? (
                        <button
                          onClick={() => toggleEspelhamento(conversaSelecionada)}
                          className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--raised)]"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
                          Espelhando
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleEspelhamento(conversaSelecionada)}
                          className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--raised)]"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          Não espelhar
                        </button>
                      )}
                      <a
                        href={`/api/whatsapp/export?conversaId=${conversaSelecionada.id}&formato=csv`}
                        className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--raised)]"
                      >
                        <Download className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        Exportar CSV
                      </a>
                      <button
                        onClick={() => excluirConversa(conversaSelecionada.id)}
                        className="flex w-full items-center gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-light)] px-3 py-2 text-xs font-semibold text-[var(--danger)] transition hover:opacity-80"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir conversa (LGPD)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Como funciona (acordeão discreto) ── */}
          <details className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)]">
            <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-semibold text-[var(--text-primary)]">
              <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
              Como funciona o espelhamento
              <ChevronDown className="ml-auto h-4 w-4 text-[var(--text-muted)] transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-1 gap-2 border-t border-[var(--border)] p-4 text-xs text-[var(--text-secondary)] md:grid-cols-4">
              <div className="rounded-xl bg-[var(--inset)] p-3">
                <b className="block text-[var(--text-primary)]">1. Conexão</b>
                O corretor conecta o WhatsApp via QR Code (Evolution API) — status aparece acima.
              </div>
              <div className="rounded-xl bg-[var(--inset)] p-3">
                <b className="block text-[var(--text-primary)]">2. Evento</b>
                Cada mensagem recebida/enviada dispara um webhook para{" "}
                <code className="font-mono">/api/whatsapp/webhook</code>.
              </div>
              <div className="rounded-xl bg-[var(--inset)] p-3">
                <b className="block text-[var(--text-primary)]">3. Cruzamento</b>
                O número é normalizado (55 + DDD) e cruzado com atendimentos ativos no CRM.
              </div>
              <div className="rounded-xl bg-[var(--inset)] p-3">
                <b className="block text-[var(--text-primary)]">4. Registro</b>
                A mensagem vira interação na ficha, separando recebidas/enviadas — sem trabalho manual.
              </div>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
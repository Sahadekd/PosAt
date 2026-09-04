"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { ClienteCompleto, TermometroCX, OrigemFluxo } from "@/lib/segmentacao/tipos";
import ClienteCard from "@/components/ClienteCard";
import ClienteFilters from "@/components/ClienteFilters";
import NovoClienteModal from "@/components/NovoClienteModal";

function inferirTermometroCX(cliente: ClienteCompleto): TermometroCX {
  if (cliente.termometro_cx) return cliente.termometro_cx;
  if (cliente.alerta_distrato_ativo || cliente.nivel_confianca === "revisao_necessaria") {
    return "insatisfeito_distrato";
  }
  if (
    cliente.e_investidor_confirmado ||
    cliente.finalidade_principal === "investimento" ||
    cliente.finalidade_principal === "potencial_indicacao"
  ) {
    return "promotor_mgm";
  }
  return "neutro_nutricao";
}

function ClientesContent() {
  const searchParams = useSearchParams();

  const [clientes, setClientes] = useState<ClienteCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  const [busca, setBusca] = useState("");
  const [finalidade, setFinalidade] = useState(searchParams.get("finalidade") || "");
  const [confianca, setConfianca] = useState(searchParams.get("confianca") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [completudeMaxima, setCompletudeMaxima] = useState(searchParams.get("completude_maxima") || "");
  const [origemFluxo, setOrigemFluxo] = useState<string>("");
  const [termometroCX, setTermometroCX] = useState<string>("");
  const [empreendimento, setEmpreendimento] = useState<string>("");
  const [corretor, setCorretor] = useState<string>("");
  const [analistaCS, setAnalistaCS] = useState<string>("");

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (finalidade) params.set("finalidade", finalidade);
      if (confianca) params.set("confianca", confianca);
      if (status) params.set("status", status);
      if (completudeMaxima) params.set("completude_maxima", completudeMaxima);
      if (origemFluxo) params.set("origem_fluxo", origemFluxo);
      if (termometroCX) params.set("termometro_cx", termometroCX);
      if (empreendimento) params.set("empreendimento", empreendimento);
      if (corretor) params.set("corretor", corretor);
      if (analistaCS) params.set("analista_cs", analistaCS);

      const res = await fetch(`/api/clientes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const rawClientes: ClienteCompleto[] = json.clientes || json.dados || [];
        const normalizados = rawClientes.map((c) => ({
          ...c,
          termometro_cx: inferirTermometroCX(c),
          origem_fluxo: c.origem_fluxo || (c.pessoa?.origem === "crm" || c.pessoa?.origem === "planilha" ? "re_trabalho" : "tempo_real"),
          empreendimento: c.empreendimento || (c.regiao_interesse ? `Condomínio ${c.regiao_interesse}` : "Lançamento Residencial"),
          corretor_original_nome: c.corretor_original_nome || "Equipe Comercial",
          analista_cs_nome: c.analista_cs_nome || "Mariana (CS)",
        }));
        setClientes(normalizados);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, [busca, finalidade, confianca, status, completudeMaxima, origemFluxo, termometroCX, empreendimento, corretor, analistaCS]);

  useEffect(() => { carregarClientes(); }, [carregarClientes]);

  function handleLimparFiltros() {
    setBusca(""); setFinalidade(""); setConfianca(""); setStatus("");
    setCompletudeMaxima(""); setOrigemFluxo(""); setTermometroCX("");
    setEmpreendimento(""); setCorretor(""); setAnalistaCS("");
  }

  const totalRiscoDistrato = clientes.filter(
    (c) => c.termometro_cx === "insatisfeito_distrato" || c.alerta_distrato_ativo
  ).length;

  const totalPromotoresMGM = clientes.filter((c) => c.termometro_cx === "promotor_mgm").length;

  const totalEmRepasse = clientes.filter(
    (c) => c.status === "em_negociacao" || c.status === "convertido"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
            Pós-Atendimento
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Clientes & Leads
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {clientes.length} cadastro{clientes.length !== 1 ? "s" : ""} na base
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={carregarClientes}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "var(--white)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--white)")}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalNovoAberto(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Cadastro</span>
          </button>
        </div>
      </div>

      {/* Intelligence Metrics — compact row */}
      <div className="grid grid-cols-3 divide-x rounded-2xl overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "#fee2e2" }}>
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{totalRiscoDistrato}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Risco de Distrato</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "#fef3c7" }}>
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{totalEmRepasse}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Em Repasse</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "#d1fae5" }}>
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{totalPromotoresMGM}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Promotores</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ClienteFilters
        busca={busca}
        setBusca={setBusca}
        finalidade={finalidade}
        setFinalidade={setFinalidade}
        confianca={confianca}
        setConfianca={setConfianca}
        status={status}
        setStatus={setStatus}
        completudeMaxima={completudeMaxima}
        setCompletudeMaxima={setCompletudeMaxima}
        origemFluxo={origemFluxo}
        setOrigemFluxo={setOrigemFluxo}
        termometroCX={termometroCX}
        setTermometroCX={setTermometroCX}
        empreendimento={empreendimento}
        setEmpreendimento={setEmpreendimento}
        corretor={corretor}
        setCorretor={setCorretor}
        analistaCS={analistaCS}
        setAnalistaCS={setAnalistaCS}
        onFiltrar={carregarClientes}
        onLimpar={handleLimparFiltros}
      />

      {/* Grid */}
      {carregando ? (
        <div
          className="rounded-2xl py-16 text-center text-sm"
          style={{ background: "var(--white)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <RefreshCw className="mx-auto h-5 w-5 animate-spin mb-3" style={{ color: "var(--accent)" }} />
          Carregando base de clientes…
        </div>
      ) : clientes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {clientes.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} onAtualizado={carregarClientes} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--white)", border: "1px solid var(--border)" }}
        >
          <Users className="mx-auto h-10 w-10 mb-3" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Nenhum cliente encontrado
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Tente ajustar os filtros aplicados.
          </p>
          <button
            onClick={handleLimparFiltros}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--text-primary)" }}
          >
            Limpar Filtros
          </button>
        </div>
      )}

      <NovoClienteModal
        aberto={modalNovoAberto}
        aoFechar={() => setModalNovoAberto(false)}
        aoSalvar={() => { setModalNovoAberto(false); carregarClientes(); }}
      />
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Carregando…</div>}>
      <ClientesContent />
    </Suspense>
  );
}

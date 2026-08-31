"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Users, PlusCircle, RefreshCw, Sparkles, Filter } from "lucide-react";
import { ClienteCompleto } from "@/lib/segmentacao/tipos";
import ClienteCard from "@/components/ClienteCard";
import ClienteFilters from "@/components/ClienteFilters";
import NovoClienteModal from "@/components/NovoClienteModal";

function ClientesContent() {
  const searchParams = useSearchParams();

  const [clientes, setClientes] = useState<ClienteCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  // Filter States
  const [busca, setBusca] = useState("");
  const [finalidade, setFinalidade] = useState(searchParams.get("finalidade") || "");
  const [confianca, setConfianca] = useState(searchParams.get("confianca") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [completudeMaxima, setCompletudeMaxima] = useState(
    searchParams.get("completude_maxima") || ""
  );

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (finalidade) params.set("finalidade", finalidade);
      if (confianca) params.set("confianca", confianca);
      if (status) params.set("status", status);
      if (completudeMaxima) params.set("completude_maxima", completudeMaxima);

      const res = await fetch(`/api/clientes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setClientes(json.clientes || json.dados || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, [busca, finalidade, confianca, status, completudeMaxima]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  function handleLimparFiltros() {
    setBusca("");
    setFinalidade("");
    setConfianca("");
    setStatus("");
    setCompletudeMaxima("");
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#b25c3f]">
              Base de Relacionamento
            </span>
            <span className="rounded-full bg-[#ede6d8] px-2.5 py-0.5 text-xs font-bold text-[#1e2722]">
              {clientes.length} cadastros
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1e2722]">
            Clientes & Leads
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarClientes}
            className="flex items-center gap-1.5 rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1e2722] hover:bg-[#f5f1e9] shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#b25c3f]" />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setModalNovoAberto(true)}
            className="flex items-center gap-2 rounded-xl bg-[#b25c3f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#974b32] transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Cadastro</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
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
        onFiltrar={carregarClientes}
        onLimpar={handleLimparFiltros}
      />

      {/* Client List Content */}
      {carregando ? (
        <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] py-16 text-center text-xs text-[#68706a]">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#b25c3f] mb-3" />
          <span>Carregando base de clientes...</span>
        </div>
      ) : clientes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onAtualizado={carregarClientes}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-[#b8b3a7] mb-3" />
          <h3 className="text-lg font-bold text-[#1e2722]">Nenhum cliente encontrado</h3>
          <p className="mt-1 text-xs text-[#68706a]">
            Não foram encontrados clientes com os filtros aplicados. Tente ajustar a busca.
          </p>
          <button
            onClick={handleLimparFiltros}
            className="mt-4 rounded-xl bg-[#1e2722] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b25c3f] transition"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      <NovoClienteModal
        aberto={modalNovoAberto}
        aoFechar={() => setModalNovoAberto(false)}
        aoSalvar={() => {
          setModalNovoAberto(false);
          carregarClientes();
        }}
      />
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div className="text-xs text-stone-500 py-10 text-center">Carregando módulo...</div>}>
      <ClientesContent />
    </Suspense>
  );
}

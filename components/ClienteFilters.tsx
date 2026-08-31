"use client";

import { Search, Filter, RotateCcw, Sparkles, Shield, Tag } from "lucide-react";
import { FinalidadeCliente, NivelConfianca, StatusRelacionamento } from "@/lib/segmentacao/tipos";
import { finalidadeConfig, statusConfig, confiancaConfig } from "./ClienteCard";

interface ClienteFiltersProps {
  busca: string;
  setBusca: (val: string) => void;
  finalidade: string;
  setFinalidade: (val: string) => void;
  confianca: string;
  setConfianca: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  completudeMaxima: string;
  setCompletudeMaxima: (val: string) => void;
  onFiltrar: () => void;
  onLimpar: () => void;
}

export default function ClienteFilters({
  busca,
  setBusca,
  finalidade,
  setFinalidade,
  confianca,
  setConfianca,
  status,
  setStatus,
  completudeMaxima,
  setCompletudeMaxima,
  onFiltrar,
  onLimpar,
}: ClienteFiltersProps) {
  const temFiltroAtivo = Boolean(
    busca || finalidade || confianca || status || completudeMaxima
  );

  return (
    <section className="mb-8 rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-5 shadow-xs">
      <div className="flex flex-col gap-4">
        {/* Search row */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b918c]" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, telefone, bairro ou tipo de imóvel..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onFiltrar()}
            className="w-full rounded-2xl border border-[#d9d2c6] bg-[#faf8f2] pl-11 pr-4 py-3 text-sm text-[#1e2722] placeholder-[#8b918c] focus:border-[#b25c3f] focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Finalidade */}
          <div className="relative">
            <select
              value={finalidade}
              onChange={(e) => setFinalidade(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#d9d2c6] bg-[#faf8f2] px-3.5 py-2.5 text-xs font-medium text-[#1e2722] focus:border-[#b25c3f] focus:bg-white focus:outline-none transition cursor-pointer"
            >
              <option value="">Todas as finalidades</option>
              {Object.entries(finalidadeConfig).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#d9d2c6] bg-[#faf8f2] px-3.5 py-2.5 text-xs font-medium text-[#1e2722] focus:border-[#b25c3f] focus:bg-white focus:outline-none transition cursor-pointer"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusConfig).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Confiança */}
          <div className="relative">
            <select
              value={confianca}
              onChange={(e) => setConfianca(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#d9d2c6] bg-[#faf8f2] px-3.5 py-2.5 text-xs font-medium text-[#1e2722] focus:border-[#b25c3f] focus:bg-white focus:outline-none transition cursor-pointer"
            >
              <option value="">Todos os níveis de confiança</option>
              <option value="alta">Alta confiança</option>
              <option value="media">Média confiança</option>
              <option value="baixa">Baixa confiança</option>
              <option value="revisao_necessaria">Revisão necessária</option>
            </select>
          </div>

          {/* Completude */}
          <div className="relative">
            <select
              value={completudeMaxima}
              onChange={(e) => setCompletudeMaxima(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#d9d2c6] bg-[#faf8f2] px-3.5 py-2.5 text-xs font-medium text-[#1e2722] focus:border-[#b25c3f] focus:bg-white focus:outline-none transition cursor-pointer"
            >
              <option value="">Qualquer completude</option>
              <option value="50">Completude até 50% (Crítico)</option>
              <option value="70">Completude até 70% (Incompleto)</option>
              <option value="90">Completude até 90%</option>
            </select>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#ede6d8]">
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setFinalidade("possivel_investidor");
                onFiltrar();
              }}
              className="rounded-full bg-[#f5f1e9] hover:bg-[#ede6d8] text-[#1e2722] px-3 py-1 text-[11px] font-medium transition"
            >
              ✨ Possíveis Investidores
            </button>
            <button
              onClick={() => {
                setCompletudeMaxima("70");
                onFiltrar();
              }}
              className="rounded-full bg-[#f5f1e9] hover:bg-[#ede6d8] text-[#1e2722] px-3 py-1 text-[11px] font-medium transition"
            >
              ⚠️ Dados Incompletos (&le; 70%)
            </button>
            <button
              onClick={() => {
                setStatus("pos_venda");
                onFiltrar();
              }}
              className="rounded-full bg-[#f5f1e9] hover:bg-[#ede6d8] text-[#1e2722] px-3 py-1 text-[11px] font-medium transition"
            >
              🤝 Pós-Venda Ativo
            </button>
          </div>

          <div className="flex items-center gap-2">
            {temFiltroAtivo && (
              <button
                onClick={onLimpar}
                className="flex items-center gap-1 rounded-xl border border-[#d9d2c6] bg-white px-3 py-2 text-xs font-semibold text-[#5b625d] hover:bg-[#f5f1e9] transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar
              </button>
            )}

            <button
              onClick={onFiltrar}
              className="flex items-center gap-1.5 rounded-xl bg-[#1e2722] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#35443a] transition"
            >
              <Filter className="h-3.5 w-3.5" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

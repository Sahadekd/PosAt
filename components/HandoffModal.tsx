"use client";

import { useState } from "react";
import { X, ArrowRightLeft, AlertCircle, Plus, Trash2 } from "lucide-react";
import { executeGraphQL, MUTATIONS } from "@/lib/graphql-client";

interface HandoffModalProps {
  aberto: boolean;
  clienteId: string;
  nomeCliente: string;
  aoFechar: () => void;
  aoSalvar: () => void;
}

export default function HandoffModal({
  aberto,
  clienteId,
  nomeCliente,
  aoFechar,
  aoSalvar,
}: HandoffModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [motivo, setMotivo] = useState("Conversão de Venda Concluída");
  const [resumo, setResumo] = useState("");
  const [expectativaCliente, setExpectativaCliente] = useState("");
  const [pendencias, setPendencias] = useState<string[]>([
    "Validar envio do kit de boas-vindas",
    "Liberar acesso ao portal de acompanhamento de obras",
  ]);
  const [novaPendencia, setNovaPendencia] = useState("");

  if (!aberto) return null;

  function adicionarPendencia() {
    if (novaPendencia.trim()) {
      setPendencias([...pendencias, novaPendencia.trim()]);
      setNovaPendencia("");
    }
  }

  function removerPendencia(index: number) {
    setPendencias(pendencias.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      try {
        await executeGraphQL(MUTATIONS.CRIAR_HANDOFF, {
          input: {
            clienteId,
            motivo,
            resumo,
            expectativaCliente: expectativaCliente || null,
            pendencias,
          },
        });
        aoSalvar();
      } catch {
        const res = await fetch("/api/handoffs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clienteId,
            motivo,
            resumo,
            expectativaCliente,
            pendencias,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || "Erro ao registrar handoff.");

        aoSalvar();
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between border-b border-[#ede6d8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b25c3f] text-white">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e2722]">Handoff: Vendas &rarr; Pós-Venda</h2>
              <p className="text-xs text-[#68706a]">Cliente: {nomeCliente}</p>
            </div>
          </div>
          <button onClick={aoFechar} className="rounded-xl p-2 text-[#68706a] hover:bg-[#f5f1e9]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {erro && (
          <div className="my-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1e2722] mb-1">Motivo da Passagem de Bastão</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
            >
              <option value="Conversão de Venda Concluída">Conversão de Venda Concluída</option>
              <option value="Qualificação Comercial Avançada">Qualificação Comercial Avançada</option>
              <option value="Atendimento de Onboarding">Atendimento de Onboarding</option>
              <option value="Suporte Técnico / Dúvida Contratual">Suporte Técnico / Dúvida Contratual</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2722] mb-1">
              Resumo do Perfil e Negociação *
            </label>
            <textarea
              required
              rows={3}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="Descreva particularidades do cliente, tom de conversa preferido e histórico da negociação..."
              className="w-full rounded-xl border border-[#d9d2c6] bg-white p-3 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2722] mb-1">
              Expectativa Principal do Cliente
            </label>
            <input
              type="text"
              value={expectativaCliente}
              onChange={(e) => setExpectativaCliente(e.target.value)}
              placeholder="Ex: Comunicação direta por WhatsApp e acompanhamento das etapas de obra"
              className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
            />
          </div>

          {/* Checklist de Pendências */}
          <div>
            <label className="block text-xs font-semibold text-[#1e2722] mb-1.5">
              Checklist de Pendências para o Pós-Venda
            </label>
            <div className="space-y-1.5 mb-2">
              {pendencias.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f1e9] px-3 py-1.5 text-xs text-[#1e2722]"
                >
                  <span>• {item}</span>
                  <button
                    type="button"
                    onClick={() => removerPendencia(idx)}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={novaPendencia}
                onChange={(e) => setNovaPendencia(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarPendencia();
                  }
                }}
                placeholder="Adicionar item à checklist..."
                className="flex-1 rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
              />
              <button
                type="button"
                onClick={adicionarPendencia}
                className="rounded-xl border border-[#d9d2c6] bg-white px-3 py-2 text-xs font-semibold text-[#1e2722] hover:bg-[#f5f1e9]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#ede6d8] pt-4">
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-xl border border-[#d9d2c6] bg-white px-4 py-2 text-xs font-semibold text-[#5b625d] hover:bg-[#f5f1e9]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-[#b25c3f] px-5 py-2 text-xs font-semibold text-white hover:bg-[#974b32] transition disabled:opacity-50"
            >
              {salvando ? "Transmitindo..." : "Concluir Handoff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

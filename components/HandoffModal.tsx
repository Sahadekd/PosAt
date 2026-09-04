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

  const inputClass =
    "w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-slate-900 focus:outline-none transition dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100";
  const selectClass =
    "w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-transparent focus:ring-2 focus:ring-slate-900 focus:outline-none transition dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-100";
  const textareaClass =
    "w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-slate-900 focus:outline-none transition dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5 dark:text-zinc-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm dark:bg-black/75">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start justify-between border-b border-slate-100 pb-5 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Handoff: Vendas &rarr; Pós-Venda</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Cliente: {nomeCliente}</p>
            </div>
          </div>
          <button onClick={aoFechar} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {erro && (
          <div className="my-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Motivo da Passagem de Bastão</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={selectClass}
            >
              <option value="Conversão de Venda Concluída">Conversão de Venda Concluída</option>
              <option value="Qualificação Comercial Avançada">Qualificação Comercial Avançada</option>
              <option value="Atendimento de Onboarding">Atendimento de Onboarding</option>
              <option value="Suporte Técnico / Dúvida Contratual">Suporte Técnico / Dúvida Contratual</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Resumo do Perfil e Negociação *
            </label>
            <textarea
              required
              rows={3}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="Descreva particularidades do cliente, tom de conversa preferido e histórico da negociação..."
              className={textareaClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Expectativa Principal do Cliente
            </label>
            <input
              type="text"
              value={expectativaCliente}
              onChange={(e) => setExpectativaCliente(e.target.value)}
              placeholder="Ex: Comunicação direta por WhatsApp e acompanhamento das etapas de obra"
              className={inputClass}
            />
          </div>

          {/* Checklist de Pendências */}
          <div>
            <label className={`${labelClass} mb-2`}>
              Checklist de Pendências para o Pós-Venda
            </label>
            <div className="mb-2 space-y-1.5">
              {pendencias.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
                >
                  <span>• {item}</span>
                  <button
                    type="button"
                    onClick={() => removerPendencia(idx)}
                    className="text-slate-400 transition hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
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
                className={inputClass}
              />
              <button
                type="button"
                onClick={adicionarPendencia}
                className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-zinc-700">
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {salvando ? "Transmitindo..." : "Concluir Handoff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

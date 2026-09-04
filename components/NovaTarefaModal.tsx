"use client";

import { useState } from "react";
import { X, CheckSquare, AlertCircle } from "lucide-react";
import { StatusTarefa } from "@/lib/segmentacao/tipos";
import { executeGraphQL, MUTATIONS } from "@/lib/graphql-client";

interface NovaTarefaModalProps {
  aberto: boolean;
  clienteId: string;
  nomeCliente: string;
  aoFechar: () => void;
  aoSalvar: () => void;
}

export default function NovaTarefaModal({
  aberto,
  clienteId,
  nomeCliente,
  aoFechar,
  aoSalvar,
}: NovaTarefaModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<number>(2);
  const [prazoEm, setPrazoEm] = useState<string>(
    new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<StatusTarefa>("pendente");

  if (!aberto) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      try {
        await executeGraphQL(MUTATIONS.CRIAR_TAREFA, {
          input: {
            clienteId,
            titulo,
            descricao: descricao || null,
            prioridade: Number(prioridade),
            prazoEm: prazoEm ? new Date(prazoEm).toISOString() : null,
          },
        });
        aoSalvar();
      } catch {
        const res = await fetch("/api/tarefas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clienteId,
            titulo,
            descricao,
            prioridade: Number(prioridade),
            prazoEm: prazoEm ? new Date(prazoEm).toISOString() : null,
            status,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || "Erro ao criar tarefa.");

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
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start justify-between border-b border-slate-100 pb-5 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Nova Tarefa de Acompanhamento</h2>
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
            <label className={labelClass}>Título da Ação *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Enviar lâmina de rentabilidade e agendar conferência"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Instruções / Detalhes</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva pontos de atenção, documentos a cobrar ou cronograma..."
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(Number(e.target.value))}
                className={selectClass}
              >
                <option value={1}>1 - Crítica / Urgente</option>
                <option value={2}>2 - Alta</option>
                <option value={3}>3 - Média</option>
                <option value={4}>4 - Baixa</option>
                <option value={5}>5 - Planejamento</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Data Limite / Prazo</label>
              <input
                type="date"
                value={prazoEm}
                onChange={(e) => setPrazoEm(e.target.value)}
                className={inputClass}
              />
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
              {salvando ? "Criando..." : "Criar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

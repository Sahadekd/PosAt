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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#ede6d8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e2722] text-[#fffdf8]">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e2722]">Nova Tarefa de Acompanhamento</h2>
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
            <label className="block text-xs font-semibold text-[#1e2722] mb-1">Título da Ação *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Enviar lâmina de rentabilidade e agendar conferência"
              className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2722] mb-1">Instruções / Detalhes</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva pontos de atenção, documentos a cobrar ou cronograma..."
              className="w-full rounded-xl border border-[#d9d2c6] bg-white p-3 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1e2722] mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(Number(e.target.value))}
                className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
              >
                <option value={1}>1 - Crítica / Urgente</option>
                <option value={2}>2 - Alta</option>
                <option value={3}>3 - Média</option>
                <option value={4}>4 - Baixa</option>
                <option value={5}>5 - Planejamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1e2722] mb-1">Data Limite / Prazo</label>
              <input
                type="date"
                value={prazoEm}
                onChange={(e) => setPrazoEm(e.target.value)}
                className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
              />
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
              className="rounded-xl bg-[#1e2722] px-5 py-2 text-xs font-semibold text-white hover:bg-[#b25c3f] transition disabled:opacity-50"
            >
              {salvando ? "Criando..." : "Criar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

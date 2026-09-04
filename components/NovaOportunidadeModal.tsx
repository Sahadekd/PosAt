"use client";

import { useEffect, useState } from "react";
import { X, Target, AlertCircle } from "lucide-react";
import { executeGraphQL, QUERIES, MUTATIONS } from "@/lib/graphql-client";

interface NovaOportunidadeModalProps {
  aberto: boolean;
  clienteId?: string;
  nomeCliente?: string;
  aoFechar: () => void;
  aoSalvar: () => void;
}

interface ClienteOpcao {
  id: string;
  nome: string;
}

interface ClienteRaw {
  id?: string;
  pessoa?: { nome?: string | null };
}

const TIPOS = [
  { value: "recompra", label: "Recompra" },
  { value: "upgrade", label: "Upgrade / Ampliação" },
  { value: "investimento_novo", label: "Novo investimento" },
  { value: "indicacao", label: "Indicação" },
  { value: "servicos", label: "Serviços complementares" },
  { value: "outro", label: "Outro" },
];

export default function NovaOportunidadeModal({
  aberto,
  clienteId: clienteIdInicial = "",
  nomeCliente: nomeClienteInicial = "",
  aoFechar,
  aoSalvar,
}: NovaOportunidadeModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteOpcao[]>([]);

  const [clienteId, setClienteId] = useState(clienteIdInicial);
  const [tipo, setTipo] = useState("investimento_novo");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [prioridade, setPrioridade] = useState<number>(2);
  const [evidencia, setEvidencia] = useState("");
  const [prazoEm, setPrazoEm] = useState("");
  const [proximoPasso, setProximoPasso] = useState("");

  useEffect(() => {
    if (!aberto) return;
    async function carregar() {
      setClientes([]);
      if (clienteIdInicial) setClienteId(clienteIdInicial);
      try {
        try {
          const data = await executeGraphQL<{ clientes: ClienteRaw[] }>(QUERIES.GET_CLIENTES);
          if (data?.clientes) {
            setClientes(data.clientes.map((c) => ({ id: String(c.id), nome: c.pessoa?.nome || "Cliente" })));
            return;
          }
        } catch { /* fallback */ }
        const res = await fetch("/api/clientes");
        if (res.ok) {
          const json = await res.json();
          setClientes((json.clientes || []).map((c: ClienteRaw) => ({ id: String(c.id), nome: c.pessoa?.nome || "Cliente" })));
        }
      } catch (e) {
        console.error(e);
      }
    }
    carregar();
  }, [aberto, clienteIdInicial]);

  if (!aberto) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const valorNum = valor ? Number(valor.replace(/\./g, "").replace(",", ".")) : null;

    const payload = {
      clienteId,
      tipo,
      descricao,
      valorEstimado: valorNum,
      prioridade: Number(prioridade),
      evidencia: evidencia || null,
      prazoEm: prazoEm ? new Date(prazoEm).toISOString() : null,
      proximoPasso: proximoPasso || null,
    };

    const enviar = () => aoSalvar();

    try {
      executeGraphQL(MUTATIONS.CRIAR_OPORTUNIDADE, { input: payload })
        .then(enviar)
        .catch(async () => {
          const res = await fetch("/api/oportunidades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.erro || "Erro ao criar oportunidade.");
          enviar();
        })
        .catch((err) => setErro(err instanceof Error ? err.message : "Erro ao salvar."))
        .finally(() => setSalvando(false));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Nova Oportunidade</h2>
              {nomeClienteInicial && (
                <p className="text-sm text-slate-500 dark:text-zinc-400">Cliente: {nomeClienteInicial}</p>
              )}
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
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
          {!clienteIdInicial && (
            <div>
              <label className={labelClass}>Cliente *</label>
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecione um cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Tipo de Oportunidade *</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={selectClass}
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Descrição *</label>
            <textarea
              rows={2}
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Cliente quer reservar 2 studios no próximo lançamento."
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Valor estimado (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 1200000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Prioridade</label>
              <select value={prioridade} onChange={(e) => setPrioridade(Number(e.target.value))} className={selectClass}>
                <option value={1}>1 - Crítica</option>
                <option value={2}>2 - Alta</option>
                <option value={3}>3 - Média</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Evidência / Origem do sinal</label>
            <textarea
              rows={2}
              value={evidencia}
              onChange={(e) => setEvidencia(e.target.value)}
              placeholder="Onde o interesse foi sinalizado? (ex: interação, pesquisa satisfação…)"
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prazo</label>
              <input
                type="date"
                value={prazoEm}
                onChange={(e) => setPrazoEm(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Próximo passo</label>
              <input
                type="text"
                value={proximoPasso}
                onChange={(e) => setProximoPasso(e.target.value)}
                placeholder="Ex: enviar proposta"
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
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {salvando ? "Criando..." : "Criar Oportunidade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
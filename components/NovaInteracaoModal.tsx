"use client";

import { useState } from "react";
import { X, MessageSquare, Phone, Mail, Calendar, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { TipoInteracao } from "@/lib/segmentacao/tipos";
import { executeGraphQL, MUTATIONS } from "@/lib/graphql-client";

interface NovaInteracaoModalProps {
  aberto: boolean;
  clienteId: string;
  nomeCliente: string;
  aoFechar: () => void;
  aoSalvar: () => void;
}

export default function NovaInteracaoModal({
  aberto,
  clienteId,
  nomeCliente,
  aoFechar,
  aoSalvar,
}: NovaInteracaoModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TipoInteracao>("whatsapp");
  const [canal, setCanal] = useState("WhatsApp Comercial");
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState("");
  const [criadoPor, setCriadoPor] = useState("Consultor Atual");

  if (!aberto) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      try {
        await executeGraphQL(MUTATIONS.CRIAR_INTERACAO, {
          input: {
            clienteId,
            tipo,
            canal,
            descricao,
            resultado: resultado || null,
            criadoPor,
            ocorreuEm: new Date().toISOString(),
          },
        });
        aoSalvar();
      } catch {
        const res = await fetch("/api/interacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clienteId,
            tipo,
            canal,
            descricao,
            resultado,
            criadoPor,
            ocorreuEm: new Date().toISOString(),
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || "Erro ao salvar interação.");

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
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e2722]">Registrar Nova Interação</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1e2722] mb-1">Tipo de Contato</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoInteracao)}
                className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="ligacao">Ligação Telefônica</option>
                <option value="email">E-mail</option>
                <option value="visita">Visita / Reunião</option>
                <option value="proposta">Envio de Proposta</option>
                <option value="chamado">Chamado / Dúvida</option>
                <option value="pesquisa">Pesquisa de Satisfação</option>
                <option value="observacao">Observação Interna</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1e2722] mb-1">Canal / Meio</label>
              <input
                type="text"
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                placeholder="Ex: WhatsApp Oficial, Plantão, etc."
                className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2722] mb-1">Descrição do que foi tratado *</label>
            <textarea
              required
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o contexto da conversa, interesses mencionados e esclarecimentos..."
              className="w-full rounded-xl border border-[#d9d2c6] bg-white p-3 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2722] mb-1">Resultado / Próximo Combinado</label>
            <input
              type="text"
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              placeholder="Ex: Aguardando envio de documentos até quinta-feira"
              className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
            />
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
              {salvando ? "Registrando..." : "Registrar Interação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, Clock, CheckCircle2, AlertCircle, RefreshCw, User, Sparkles } from "lucide-react";
import { HandoffItem } from "@/lib/segmentacao/tipos";
import { finalidadeConfig } from "@/components/ClienteCard";

export default function HandoffsPage() {
  const [handoffs, setHandoffs] = useState<HandoffItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarHandoffs() {
    setCarregando(true);
    try {
      const res = await fetch("/api/handoffs");
      if (res.ok) {
        const json = await res.json();
        setHandoffs(json.handoffs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarHandoffs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b25c3f] text-white">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e2722]">Handoff: Vendas &rarr; Atendimento</h1>
            <p className="text-xs text-[#68706a]">
              Acompanhamento de passagens de bastão, alinhamento de expectativas e checklists de onboarding
            </p>
          </div>
        </div>

        <button
          onClick={carregarHandoffs}
          className="flex items-center gap-1.5 rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2 text-xs font-semibold text-[#1e2722] hover:bg-[#f5f1e9]"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#b25c3f]" />
          <span>Atualizar</span>
        </button>
      </div>

      {carregando ? (
        <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] py-16 text-center text-xs text-[#68706a]">
          Carregando handoffs...
        </div>
      ) : handoffs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {handoffs.map((h) => {
            const cliente = h.cliente;
            const finalidade = cliente ? finalidadeConfig[cliente.finalidade_principal] : null;

            return (
              <article
                key={h.id}
                className="flex flex-col justify-between rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-xs transition hover:shadow-lg hover:border-[#b25c3f]/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-[#ede6d8] pb-3 mb-3">
                    <div>
                      <span className="rounded-full bg-[#ffe8df] text-[#8c351b] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {h.status.replace(/_/g, " ")}
                      </span>
                      <h2 className="mt-2 text-lg font-bold text-[#1e2722]">
                        {cliente?.pessoa?.nome || "Cliente"}
                      </h2>
                    </div>

                    {finalidade && (
                      <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}>
                        {finalidade.label}
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-3">
                    <div>
                      <strong className="text-[#1e2722] block mb-1">Motivo do Handoff:</strong>
                      <p className="text-[#5b625d] leading-relaxed">{h.motivo}</p>
                    </div>

                    {h.resumo && (
                      <div className="rounded-2xl bg-[#faf8f2] p-3.5 border border-[#d9d2c6]">
                        <strong className="text-[#1e2722] block mb-1">Resumo da Negociação:</strong>
                        <p className="text-[#5b625d] leading-relaxed">{h.resumo}</p>
                      </div>
                    )}

                    {h.expectativa_cliente && (
                      <div>
                        <strong className="text-[#1e2722] block mb-0.5">Expectativa do Cliente:</strong>
                        <p className="text-[#5b625d]">{h.expectativa_cliente}</p>
                      </div>
                    )}

                    {h.pendencias && h.pendencias.length > 0 && (
                      <div className="pt-2 border-t border-[#ede6d8]">
                        <strong className="text-[#1e2722] block mb-1.5">Checklist de Passagem:</strong>
                        <ul className="space-y-1">
                          {h.pendencias.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-[#5b625d]">
                              <span className="text-[#b25c3f] font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#ede6d8] pt-4 text-xs">
                  <span className="text-[#8b918c]">
                    Enviado em {new Date(h.criado_em).toLocaleDateString("pt-BR")}
                  </span>

                  {h.cliente_id && (
                    <Link
                      href={`/clientes/${h.cliente_id}`}
                      className="font-semibold text-[#b25c3f] hover:underline"
                    >
                      Acessar Perfil 360° &rarr;
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-12 text-center">
          <ArrowRightLeft className="mx-auto h-12 w-12 text-[#b8b3a7] mb-3" />
          <h3 className="text-lg font-bold text-[#1e2722]">Nenhum handoff registrado</h3>
          <p className="mt-1 text-xs text-[#68706a]">
            Quando um lead for convertido em venda ou necessitar de onboarding, inicie a transição no perfil do cliente.
          </p>
        </div>
      )}
    </div>
  );
}

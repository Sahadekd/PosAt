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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Handoff: Vendas &rarr; Atendimento</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Acompanhamento de passagens de bastão, alinhamento de expectativas e checklists de onboarding
            </p>
          </div>
        </div>

        <button
          onClick={carregarHandoffs}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <RefreshCw className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
          <span>Atualizar</span>
        </button>
      </div>

      {carregando ? (
        <div className="rounded-3xl border border-slate-100 bg-white py-16 text-center text-sm text-slate-400 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-500">
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
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-slate-200 hover:shadow-md dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-600"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-4 dark:border-zinc-700">
                    <div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {h.status.replace(/_/g, " ")}
                      </span>
                      <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-zinc-100">
                        {cliente?.pessoa?.nome || "Cliente"}
                      </h2>
                    </div>

                    {finalidade && (
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}>
                        {finalidade.label}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="mb-1 block text-slate-900 dark:text-zinc-100">Motivo do Handoff:</strong>
                      <p className="leading-relaxed text-slate-500 dark:text-zinc-400">{h.motivo}</p>
                    </div>

                    {h.resumo && (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:bg-zinc-800/60 dark:border-zinc-700">
                        <strong className="mb-1 block text-slate-900 dark:text-zinc-100">Resumo da Negociação:</strong>
                        <p className="leading-relaxed text-slate-500 dark:text-zinc-400">{h.resumo}</p>
                      </div>
                    )}

                    {h.expectativa_cliente && (
                      <div>
                        <strong className="mb-0.5 block text-slate-900 dark:text-zinc-100">Expectativa do Cliente:</strong>
                        <p className="text-slate-500 dark:text-zinc-400">{h.expectativa_cliente}</p>
                      </div>
                    )}

                    {h.pendencias && h.pendencias.length > 0 && (
                      <div className="border-t border-slate-100 pt-2 dark:border-zinc-700">
                        <strong className="mb-1.5 block text-slate-900 dark:text-zinc-100">Checklist de Passagem:</strong>
                        <ul className="space-y-1">
                          {h.pendencias.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                              <span className="font-bold text-slate-900 dark:text-zinc-100">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-zinc-700">
                  <span className="text-slate-400 dark:text-zinc-500">
                    Enviado em {new Date(h.criado_em).toLocaleDateString("pt-BR")}
                  </span>

                  {h.cliente_id && (
                    <Link
                      href={`/clientes/${h.cliente_id}`}
                      className="font-semibold text-slate-900 dark:text-zinc-100 hover:underline"
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
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center dark:bg-zinc-900 dark:border-zinc-700">
          <ArrowRightLeft className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-zinc-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Nenhum handoff registrado</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Quando um lead for convertido em venda ou necessitar de onboarding, inicie a transição no perfil do cliente.
          </p>
        </div>
      )}
    </div>
  );
}

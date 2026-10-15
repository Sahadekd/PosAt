"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowDown, RefreshCw } from "lucide-react";
import { COLUNAS_CLIENTES } from "./etapasClientes";
import ExpandedStageList from "./ExpandedStageList";
import TimelineNode, { type LeadTimeline } from "./TimelineNode";
import { LEADS_DEMONSTRACAO } from "./leadsDemonstracao";

type ClienteApi = Omit<Partial<LeadTimeline>, "id"> & {
  id: string | number;
  pessoa?: { nome?: string | null };
};

interface RespostaClientes {
  clientes?: ClienteApi[];
  erro?: string;
}

interface TimelineConector {
  id: string;
  caminho: string;
}

async function buscarClientes(signal?: AbortSignal): Promise<LeadTimeline[]> {
  const resposta = await fetch("/api/clientes", { signal });
  const dados = (await resposta.json()) as RespostaClientes;
  if (!resposta.ok) {
    throw new Error(
      dados.erro || `Não foi possível carregar os leads (${resposta.status}).`
    );
  }

  return (dados.clientes || []).map((cliente) => ({
    id: String(cliente.id),
    nome: cliente.pessoa?.nome || null,
    status: cliente.status || "",
    finalidade_principal: cliente.finalidade_principal,
    tipo_imovel: cliente.tipo_imovel,
    indice_completude: cliente.indice_completude,
    ultima_interacao_em: cliente.ultima_interacao_em,
    alerta_distrato_ativo: cliente.alerta_distrato_ativo,
    termometro_cx: cliente.termometro_cx,
    criado_em: cliente.criado_em,
  }));
}

function isLeadComAlerta(lead: LeadTimeline) {
  return Boolean(
    lead.alerta_distrato_ativo ||
      lead.termometro_cx === "insatisfeito_distrato"
  );
}

function maisRecente(leads: LeadTimeline[]) {
  return leads.reduce((maisNovo, lead) => {
    const dataMaisNova = Date.parse(maisNovo.criado_em || "");
    const dataLead = Date.parse(lead.criado_em || "");
    if (Number.isNaN(dataMaisNova)) {
      return lead;
    }
    return !Number.isNaN(dataLead) && dataLead >= dataMaisNova
      ? lead
      : maisNovo;
  }, leads[0]);
}

export default function LinhaTempoBoard() {
  const [leads, setLeads] = useState<LeadTimeline[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [etapaSelecionadaId, setEtapaSelecionadaId] = useState<string | null>(
    null
  );
  const timelineCanvasRef = useRef<HTMLOListElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [conectores, setConectores] = useState<TimelineConector[]>([]);
  const [tamanhoCanvas, setTamanhoCanvas] = useState({ width: 0, height: 0 });

  const atualizarLeads = async () => {
    setCarregando(true);
    setErro(null);

    try {
      setLeads(await buscarClientes());
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao carregar os leads.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;

    buscarClientes(controller.signal)
      .then((lista) => {
        if (ativo) setLeads(lista);
      })
      .catch((error: unknown) => {
        if (!ativo || controller.signal.aborted) return;
        setErro(
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao carregar os leads."
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
      controller.abort();
    };
  }, []);

  const todosLeads = useMemo(
    () => [...leads, ...LEADS_DEMONSTRACAO],
    [leads]
  );
  const leadsPorEtapa = useMemo(
    () =>
      COLUNAS_CLIENTES.map((etapa) => {
        const leadsDaEtapa = todosLeads.filter((lead) =>
          etapa.statusList.includes(lead.status)
        );
        return {
          etapa,
          leads: leadsDaEtapa,
          leadsDeDemonstracao: leadsDaEtapa.filter((lead) => lead.isDemo),
          ultimoLead: leadsDaEtapa.length
            ? maisRecente(leadsDaEtapa)
            : undefined,
        };
      }),
    [todosLeads]
  );

  const etapaSelecionada = leadsPorEtapa.find(
    ({ etapa }) => etapa.id === etapaSelecionadaId
  );
  const totalAlertas = todosLeads.filter(isLeadComAlerta).length;
  const totalDemo = LEADS_DEMONSTRACAO.length;

  useEffect(() => {
    const canvas = timelineCanvasRef.current;
    if (!canvas) return;

    let frameId = 0;
    const atualizarConectores = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const canvasRect = canvas.getBoundingClientRect();
        if (!canvasRect.width || !canvasRect.height) {
          setConectores([]);
          return;
        }

        setTamanhoCanvas({
          width: canvasRect.width,
          height: canvasRect.height,
        });

        const anchors = COLUNAS_CLIENTES.map((etapa) => {
          const node = nodeRefs.current.get(etapa.id);
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return {
            left: rect.left - canvasRect.left,
            right: rect.right - canvasRect.left,
            top: rect.top - canvasRect.top,
            bottom: rect.bottom - canvasRect.top,
            centerX: rect.left + rect.width / 2 - canvasRect.left,
            centerY: rect.top + rect.height / 2 - canvasRect.top,
          };
        });

        const novosConectores: TimelineConector[] = [];
        for (let index = 0; index < anchors.length - 1; index += 1) {
          const origem = anchors[index];
          const destino = anchors[index + 1];
          if (!origem || !destino) continue;

          if (index === 4) {
            const inicioX = origem.centerX;
            const inicioY = origem.bottom + 2;
            const fimX = destino.centerX;
            const fimY = destino.top - 2;
            const curvatura = Math.max(28, (fimY - inicioY) * 0.42);
            novosConectores.push({
              id: `${COLUNAS_CLIENTES[index].id}-${COLUNAS_CLIENTES[index + 1].id}`,
              caminho: `M ${inicioX} ${inicioY} C ${inicioX} ${inicioY + curvatura}, ${fimX} ${fimY - curvatura}, ${fimX} ${fimY}`,
            });
            continue;
          }

          const segueParaDireita = index < 4;
          const inicioX = segueParaDireita ? origem.right + 2 : origem.left - 2;
          const fimX = segueParaDireita ? destino.left - 2 : destino.right + 2;
          const distanciaX = fimX - inicioX;
          const alca = Math.min(44, Math.abs(distanciaX) * 0.42);
          const direcao = Math.sign(distanciaX);
          novosConectores.push({
            id: `${COLUNAS_CLIENTES[index].id}-${COLUNAS_CLIENTES[index + 1].id}`,
            caminho: `M ${inicioX} ${origem.centerY} C ${inicioX + direcao * alca} ${origem.centerY}, ${fimX - direcao * alca} ${destino.centerY}, ${fimX} ${destino.centerY}`,
          });
        }

        setConectores(novosConectores);
      });
    };

    const resizeObserver = new ResizeObserver(atualizarConectores);
    resizeObserver.observe(canvas);
    nodeRefs.current.forEach((node) => resizeObserver.observe(node));
    window.addEventListener("resize", atualizarConectores);
    atualizarConectores();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", atualizarConectores);
    };
  }, [leadsPorEtapa]);

  const renderizarNos = (mobile = false) =>
    leadsPorEtapa.map(({
      etapa,
      leads: leadsDaEtapa,
      leadsDeDemonstracao,
      ultimoLead,
    }, index) => (
      <li
        key={etapa.id}
        className={mobile ? "relative pl-9" : "z-10"}
        style={
          mobile
            ? undefined
            : {
                gridColumn: index < 5 ? index + 1 : 10 - index,
                gridRow: index < 5 ? 1 : 2,
                transform: `translateY(${[-8, 12, -10, 8, -4, 10, -8, 12, -6, 6][index]}px)`,
              }
        }
      >
        {mobile && index < leadsPorEtapa.length - 1 && (
          <span
            aria-hidden="true"
            className="absolute -bottom-3 left-[9px] z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-muted)]"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </span>
        )}
        {mobile && (
          <span
            aria-hidden="true"
            className="absolute left-[15px] top-0 h-1/2 w-px bg-[var(--border-strong)]"
          />
        )}
        <TimelineNode
          etapa={etapa}
          quantidade={leadsDaEtapa.length}
          ultimoLead={ultimoLead}
          leadsDeDemonstracao={leadsDeDemonstracao}
          nodeRef={
            mobile
              ? undefined
              : (node) => {
                  if (node) {
                    nodeRefs.current.set(etapa.id, node);
                  } else {
                    nodeRefs.current.delete(etapa.id);
                  }
                }
          }
          onSelecionar={() => setEtapaSelecionadaId(etapa.id)}
        />
      </li>
    ));

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Timeline
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Acompanhe os leads sem alterar os status. Registros “Demo” são dados locais de demonstração.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizarLeads}
          disabled={carregando}
          className="flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--white)] px-3.5 text-sm font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </header>

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </span>
          <button
            type="button"
            onClick={atualizarLeads}
            className="font-semibold underline underline-offset-2"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-sm shadow-sm">
        <span className="font-medium text-[var(--text-primary)]">
          {todosLeads.length} {todosLeads.length === 1 ? "lead" : "leads"} na jornada
        </span>
        <span className="text-[var(--text-muted)]" aria-hidden="true">
          ·
        </span>
        <span className="text-[var(--text-secondary)]">
          {COLUNAS_CLIENTES.length} etapas
        </span>
        <span className="text-[var(--text-muted)]" aria-hidden="true">
          ·
        </span>
        <span className="text-sky-700">
          {totalDemo} leads Demo · somente nesta tela
        </span>
        {totalAlertas > 0 && (
          <>
            <span className="text-[var(--text-muted)]" aria-hidden="true">
              ·
            </span>
            <span className="text-rose-700">
              {totalAlertas} {totalAlertas === 1 ? "lead com alerta" : "leads com alerta"}
            </span>
          </>
        )}
      </div>

      {carregando && leads.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)] shadow-sm">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
          Carregando leads…
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          <div className="hidden xl:block">
            <ol
              ref={timelineCanvasRef}
              aria-label="Etapas da jornada de leads"
              className="relative grid grid-cols-5 grid-rows-[204px_204px] gap-x-10 gap-y-[116px] px-2 py-6"
            >
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
                viewBox={`0 0 ${tamanhoCanvas.width} ${tamanhoCanvas.height}`}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                </defs>
                <g
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                >
                  {conectores.map((conector) => (
                    <path key={conector.id} d={conector.caminho} />
                  ))}
                </g>
              </svg>
              {renderizarNos()}
            </ol>
          </div>

          <div className="xl:hidden">
            <ol
              aria-label="Etapas da jornada de leads"
              className="relative space-y-5 before:absolute before:bottom-8 before:left-[15px] before:top-8 before:w-px before:bg-[var(--border-strong)]"
            >
              {renderizarNos(true)}
            </ol>
          </div>
        </div>
      )}

      {etapaSelecionada && (
        <ExpandedStageList
          etapa={etapaSelecionada.etapa}
          leads={etapaSelecionada.leads}
          onFechar={() => setEtapaSelecionadaId(null)}
        />
      )}
    </section>
  );
}

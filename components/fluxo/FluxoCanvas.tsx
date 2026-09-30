"use client";

import { useCallback, useMemo, useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Edge,
  type NodeTypes,
  type Node as RFNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { FluxoNo, type FluxoNode, type FluxoNodeData } from "./FluxoNo";
import { META_NOS, TIPOS_NO_ARRAY, VARIAVEIS_TEMPLATE } from "./meta";
import {
  COLUNA_LARGURA,
  organizarHorizontal,
  estaNaVertical,
} from "@/lib/fluxo-layout";
import type {
  DadosNo,
  GrafoFluxo,
  TipoNo,
  EstadoNoExecucao,
} from "@/core/domain/entities/fluxo";

const nodeTypes: NodeTypes = { fluxo: FluxoNo };

export interface FluxoCanvasHandle {
  limparSelecao: () => void;
  organizar: () => void;
}

interface FluxoCanvasProps {
  grafo: GrafoFluxo;
  onChange: (grafo: GrafoFluxo) => void;
  estadosNo?: Record<string, EstadoNoExecucao>;   // noId -> estado (modo execução)
  somenteLeitura?: boolean;
  onSelecionarNo?: (noId: string | null) => void;
}

// Gera id curto único para nós/arestas
function novoId(prefixo: string): string {
  return `${prefixo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Campo aninhado da UI correspondente a cada tipo de nó
const CAMPO_POR_TIPO: Record<TipoNo, string> = {
  gatilho: "gatilho",
  mensagem_whatsapp: "mensagem",
  atraso: "atraso",
  condicao: "condicao",
  acao_interna: "acao",
  notificacao: "notificacao",
};

/**
 * Normaliza os dados de um nó para o formato plano do domínio
 * (`{ tipo, label, ... }`), aceitando tanto o formato plano quanto o
 * formato aninhado usado na UI (`{ label, mensagem: { tipo, ... } }`).
 */
function normalizarDadosNo(data: Record<string, unknown>): DadosNo | null {
  for (const [tipo, campo] of Object.entries(CAMPO_POR_TIPO)) {
    const sub = data[campo];
    if (sub && typeof sub === "object" && !Array.isArray(sub)) {
      const subObj = sub as Record<string, unknown>;
      return {
        ...subObj,
        tipo,
        label: (data.label as string) ?? (subObj.label as string) ?? tipo,
      } as unknown as DadosNo;
    }
  }
  if (typeof data.tipo === "string" && data.tipo in CAMPO_POR_TIPO) {
    return data as unknown as DadosNo;
  }
  return null;
}

function paraRF(grafo: GrafoFluxo, estadosNo?: Record<string, EstadoNoExecucao>): RFNode<FluxoNodeData>[] {
  return grafo.nodes.map((n) => {
    const bruto = (n.data ?? {}) as unknown as Record<string, unknown>;
    const plano = normalizarDadosNo(bruto);
    const base: FluxoNodeData = {
      label: (plano?.label as string) ?? (bruto.label as string) ?? "Nó",
      estado: estadosNo?.[n.id],
    };

    if (plano) {
      switch (plano.tipo) {
        case "mensagem_whatsapp":
          base.mensagem = plano;
          base.previewConteudo = plano.conteudo;
          break;
        case "gatilho":
          base.gatilho = plano;
          break;
        case "atraso":
          base.atraso = plano;
          base.previewConteudo = `Espera ${plano.quantidade} ${plano.unidade}`;
          break;
        case "condicao":
          base.condicao = plano;
          base.previewConteudo = `${plano.campo} ${plano.operador} ${plano.valor ?? ""}`.trim();
          break;
        case "acao_interna":
          base.acao = plano;
          base.previewConteudo = plano.titulo ?? plano.descricao;
          break;
        case "notificacao":
          base.notificacao = plano;
          base.previewConteudo = plano.mensagem;
          break;
      }
    }

    return {
      id: n.id,
      type: "fluxo",
      position: n.position,
      data: base,
    } as RFNode<FluxoNodeData>;
  });
}

function paraEdges(grafo: GrafoFluxo): Edge[] {
  return grafo.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    label: e.label,
    animated: e.animated,
    style: { stroke: "var(--border-strong)", strokeWidth: 2 },
  }));
}

// Se o grafo está na vertical (fluxos antigos), reorganiza na horizontal
function prepararGrafo(grafo: GrafoFluxo): GrafoFluxo {
  return estaNaVertical(grafo) ? organizarHorizontal(grafo) : grafo;
}

function paraGrafo(nodes: FluxoNode[], edges: Edge[]): GrafoFluxo {
  // Campos exclusivos de exibição que não devem ser persistidos
  const CAMPOS_DISPLAY = new Set([
    "estado",
    "previewConteudo",
    "contadorDisparos",
    "selecionado",
  ]);

  return {
    nodes: nodes.map((n) => {
      const limpo: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(n.data ?? {})) {
        if (!CAMPOS_DISPLAY.has(k)) limpo[k] = v;
      }

      // Persiste sempre no formato plano do domínio ({ tipo, label, ... })
      const plano = normalizarDadosNo(limpo);

      return {
        id: n.id,
        position: n.position,
        data: (plano ?? limpo) as unknown as GrafoFluxo["nodes"][number]["data"],
      };
    }),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? undefined,
      label: typeof e.label === "string" ? e.label : undefined,
      animated: e.animated,
    })),
  };
}

// Dados padrão por tipo de nó ao criar
function dadosPadrao(tipo: TipoNo): FluxoNodeData {
  switch (tipo) {
    case "gatilho":
      return { label: "Início do fluxo", gatilho: { tipo: "gatilho", gatilho: "manual" } };
    case "mensagem_whatsapp":
      return {
        label: "Nova mensagem",
        mensagem: {
          tipo: "mensagem_whatsapp",
          conteudo: "Olá {{nome}}! Tudo bem?",
        },
        previewConteudo: "Olá {{nome}}! Tudo bem?",
      };
    case "atraso":
      return { label: "Espera", atraso: { tipo: "atraso", quantidade: 1, unidade: "dias" }, previewConteudo: "Espera 1 dias" };
    case "condicao":
      return {
        label: "Lead respondeu?",
        condicao: { tipo: "condicao", campo: "respondeu", operador: "igual", valor: "sim" },
        previewConteudo: "respondeu igual sim",
      };
    case "acao_interna":
      return {
        label: "Criar tarefa",
        acao: { tipo: "acao_interna", acao: "criar_tarefa", titulo: "Fazer follow-up" },
        previewConteudo: "Fazer follow-up",
      };
    case "notificacao":
      return {
        label: "Alertar atendente",
        notificacao: {
          tipo: "notificacao",
          canal: "in_app",
          titulo: "Ação necessária",
          mensagem: "Lead precisa de atenção.",
          para: "responsavel",
        },
        previewConteudo: "Lead precisa de atenção.",
      };
  }
}

export const FluxoCanvas = forwardRef<FluxoCanvasHandle, FluxoCanvasProps>(
  function FluxoCanvas({ grafo, onChange, estadosNo, somenteLeitura, onSelecionarNo }, ref) {
    const [grafoInicial] = useState(() => prepararGrafo(grafo));
    const [nodes, setNodes, onNodesChange] = useNodesState<FluxoNode>(
      paraRF(grafoInicial, estadosNo)
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
      paraEdges(grafoInicial)
    );
    const [noSelecionado, setNoSelecionado] = useState<string | null>(null);
    const [paletaAberta, setPaletaAberta] = useState(false);
    const grafoNotificadoRef = useRef<GrafoFluxo | null>(null);

    const notificar = useCallback(
      (n: FluxoNode[], e: Edge[]) => {
        const g = paraGrafo(n, e);
        grafoNotificadoRef.current = g;
        onChange(g);
      },
      [onChange]
    );

    useImperativeHandle(ref, () => ({
      limparSelecao: () => setNoSelecionado(null),
      organizar: () => {
        const organizado = organizarHorizontal(paraGrafo(nodes, edges));
        const mapa = new Map(organizado.nodes.map((n) => [n.id, n.position]));
        const novos = nodes.map((n) =>
          mapa.has(n.id) ? { ...n, position: mapa.get(n.id)! } : n
        );
        setNodes(novos);
        notificar(novos, edges);
      },
    }));

    // Sincroniza quando o grafo externo muda (ex.: carregou do servidor).
    // Ignora o "eco" da própria UI para não recriar nós a cada tecla digitada
    // (recriação apagava a seleção/estado do painel).
    useEffect(() => {
      if (grafo === grafoNotificadoRef.current) {
        // Eco local: atualiza apenas estados de execução, preservando seleção
        setNodes((nds) => {
          const alterado = nds.some((n) => n.data.estado !== estadosNo?.[n.id]);
          if (!alterado) return nds;
          return nds.map((n) => ({ ...n, data: { ...n.data, estado: estadosNo?.[n.id] } }));
        });
        return;
      }
      const alvo = prepararGrafo(grafo);
      const novos = paraRF(alvo, estadosNo);
      const novasEdges = paraEdges(alvo);
      setNodes(novos);
      setEdges(novasEdges);
      // Fluxo carregado na vertical → notifica o layout horizontal
      if (alvo !== grafo && !somenteLeitura) {
        notificar(novos, novasEdges);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grafo, estadosNo]);

    const onConnect = useCallback(
      (connection: Connection) => {
        const novas = addEdge(
          {
            ...connection,
            id: novoId("e"),
            animated: true,
            style: { stroke: "var(--accent)", strokeWidth: 2 },
          },
          edges
        );
        setEdges(novas);
        notificar(nodes, novas);
      },
      [nodes, edges, setEdges, notificar]
    );

    const atualizarNo = useCallback(
      (noId: string, dados: Partial<FluxoNodeData>) => {
        const novos = nodes.map((n) =>
          n.id === noId ? { ...n, data: { ...n.data, ...dados } } : n
        );
        setNodes(novos);
        notificar(novos, edges);
      },
      [nodes, edges, setNodes, notificar]
    );

    const excluirNo = useCallback(
      (noId: string) => {
        const novos = nodes.filter((n) => n.id !== noId);
        const novas = edges.filter((e) => e.source !== noId && e.target !== noId);
        setNodes(novos);
        setEdges(novas);
        notificar(novos, novas);
        setNoSelecionado(null);
        onSelecionarNo?.(null);
      },
      [nodes, edges, setNodes, setEdges, notificar, onSelecionarNo]
    );

    const adicionarNo = useCallback(
      (tipo: TipoNo) => {
        const id = novoId(tipo.slice(0, 3));
        const dados = dadosPadrao(tipo);
        // Posiciona à direita do nó atual (fluxo cresce horizontalmente)
        const selecionado = nodes.find((n) => n.id === noSelecionado);
        const maxX = nodes.length
          ? Math.max(...nodes.map((n) => n.position.x))
          : -COLUNA_LARGURA;
        const mediaY = nodes.length
          ? nodes.reduce((soma, n) => soma + n.position.y, 0) / nodes.length
          : 80;
        const posicao = {
          x: maxX + COLUNA_LARGURA,
          y: Math.round(selecionado ? selecionado.position.y : mediaY),
        };

        const novos: FluxoNode[] = [
          ...nodes,
          { id, type: "fluxo", position: posicao, data: dados },
        ];
        setNodes(novos);
        notificar(novos, edges);
        setNoSelecionado(id);
        onSelecionarNo?.(id);
        setPaletaAberta(false);
      },
      [nodes, edges, noSelecionado, setNodes, notificar, onSelecionarNo]
    );

    // Persiste a posição do nó após o arraste
    const onNodeDragStop = useCallback(
      (_event: unknown, node: FluxoNode) => {
        const novos = nodes.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        );
        setNodes(novos);
        notificar(novos, edges);
      },
      [nodes, edges, setNodes, notificar]
    );

    const onSelectionChange = useCallback(
      ({ nodes: selecionados }: { nodes: FluxoNode[] }) => {
        const id = selecionados[0]?.id ?? null;
        setNoSelecionado(id);
        onSelecionarNo?.(id);
      },
      [onSelecionarNo]
    );

    const noAtual = useMemo(
      () => nodes.find((n) => n.id === noSelecionado) ?? null,
      [nodes, noSelecionado]
    );

    // Navegação por teclado: Delete remove nó selecionado
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (somenteLeitura) return;
        const alvo = e.target as HTMLElement;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName)) return;
        if ((e.key === "Delete" || e.key === "Backspace") && noSelecionado) {
          e.preventDefault();
          excluirNo(noSelecionado);
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [noSelecionado, excluirNo, somenteLeitura]);

    return (
      <div className="relative h-full w-full">
        <ReactFlow<FluxoNode, Edge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={somenteLeitura ? undefined : onNodesChange}
          onEdgesChange={somenteLeitura ? undefined : onEdgesChange}
          onConnect={somenteLeitura ? undefined : onConnect}
          onNodeDragStop={somenteLeitura ? undefined : onNodeDragStop}
          onSelectionChange={onSelectionChange}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.25}
          maxZoom={2}
          deleteKeyCode={null}
          nodesConnectable={!somenteLeitura}
          nodesDraggable={!somenteLeitura}
          proOptions={{ hideAttribution: true }}
          className="bg-[var(--surface)]"
          aria-label="Canvas do fluxo"
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="#1E293B" />
          <Controls position="bottom-left" className="!bg-[var(--raised)] !border !border-[var(--border)] !rounded-lg !shadow-xl [&>button]:!border-b-[var(--border)] [&>button]:!bg-[var(--raised)] [&>button]:!fill-[var(--text-secondary)]" showInteractive={false} />
          <MiniMap
            position="bottom-right"
            className="!bg-[var(--raised)] !border !border-[var(--border)] !rounded-lg"
            maskColor="rgba(8, 12, 19, 0.75)"
            nodeColor="#3B82F6"
          />
        </ReactFlow>

        {/* ─── Barra superior: paleta + ações ─── */}
        {!somenteLeitura && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
            <button
              onClick={() => setPaletaAberta((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--raised)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-lg hover:border-[var(--border-strong)]"
              aria-expanded={paletaAberta}
            >
              <Plus className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              Adicionar nó
            </button>

            {noSelecionado && (
              <button
                onClick={() => excluirNo(noSelecionado)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-light)] px-3 py-2 text-xs font-semibold text-[var(--danger)] shadow-lg hover:border-[var(--danger)]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir nó
              </button>
            )}
          </div>
        )}

        {/* ─── Paleta de nós ─── */}
        {paletaAberta && !somenteLeitura && (
          <div className="absolute left-3 top-14 z-20 flex max-h-[calc(100%-72px)] w-72 flex-col animate-slide-down rounded-xl border border-[var(--border)] bg-[var(--raised)] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                Tipos de nó
              </p>
              <button onClick={() => setPaletaAberta(false)} aria-label="Fechar paleta" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="scroll-thin -mr-1.5 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1.5">
              {TIPOS_NO_ARRAY.map((tipo) => {
                const meta = META_NOS[tipo];
                const Icon = meta.icon;
                return (
                  <button
                    key={tipo}
                    onClick={() => adicionarNo(tipo)}
                    className="flex w-full items-start gap-2.5 rounded-lg border border-transparent bg-[var(--inset)] p-2.5 text-left transition-colors hover:border-[var(--border-strong)]"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: meta.corLight, color: meta.cor }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-[var(--text-primary)]">
                        {meta.label}
                      </span>
                      <span className="block text-[11px] leading-snug text-[var(--text-secondary)]">
                        {meta.descricao}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Painel de propriedades do nó ─── */}
        {noAtual && !somenteLeitura && (
          <PainelNo
            noId={noAtual.id}
            data={noAtual.data}
            onAlterar={(dados) => atualizarNo(noAtual.id, dados)}
            onFechar={() => {
              setNoSelecionado(null);
              onSelecionarNo?.(null);
            }}
          />
        )}
      </div>
    );
  }
);

// ============================================================
// Painel de propriedades
// ============================================================

function PainelNo({
  noId,
  data,
  onAlterar,
  onFechar,
}: {
  noId: string;
  data: FluxoNodeData;
  onAlterar: (dados: Partial<FluxoNodeData>) => void;
  onFechar: () => void;
}) {
  const tipo: TipoNo = data.gatilho
    ? "gatilho"
    : data.mensagem
      ? "mensagem_whatsapp"
      : data.atraso
        ? "atraso"
        : data.condicao
          ? "condicao"
          : data.acao
            ? "acao_interna"
            : "notificacao";
  const meta = META_NOS[tipo];
  const Icon = meta.icon;

  const campoClasse =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--inset)] px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none";
  const labelClasse = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]";

  return (
    <aside
      className="absolute right-3 top-3 z-20 flex max-h-[calc(100%-24px)] w-[320px] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--raised)] shadow-2xl animate-slide-right"
      aria-label={`Editar nó ${data.label}`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: meta.corLight, color: meta.cor }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: meta.cor }}>
            {meta.label}
          </p>
          <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
            {data.label}
          </p>
        </div>
        <button onClick={onFechar} aria-label="Fechar painel" className="rounded p-1 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Corpo */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 scroll-thin">
        <div>
          <label className={labelClasse} htmlFor={`label-${noId}`}>Nome do nó</label>
          <input
            id={`label-${noId}`}
            className={campoClasse}
            value={data.label}
            onChange={(e) => onAlterar({ label: e.target.value })}
          />
        </div>

        {/* Gatilho */}
        {data.gatilho && (
          <>
            <div>
              <label className={labelClasse} htmlFor={`gatilho-${noId}`}>Tipo de gatilho</label>
              <select
                id={`gatilho-${noId}`}
                className={campoClasse}
                value={data.gatilho.gatilho}
                onChange={(e) =>
                  onAlterar({
                    gatilho: { ...data.gatilho!, gatilho: e.target.value as never },
                  })
                }
              >
                <option value="manual">Manual</option>
                <option value="novo_lead">Novo lead</option>
                <option value="mudanca_estagio">Mudança de estágio</option>
                <option value="inatividade_dias">Inatividade X dias</option>
                <option value="evento_sistema">Evento do sistema</option>
              </select>
            </div>
            {data.gatilho.gatilho === "inatividade_dias" && (
              <div>
                <label className={labelClasse} htmlFor={`dias-${noId}`}>Dias de inatividade</label>
                <input
                  id={`dias-${noId}`}
                  type="number"
                  min={1}
                  className={campoClasse}
                  value={data.gatilho.inatividadeDias ?? 15}
                  onChange={(e) =>
                    onAlterar({
                      gatilho: {
                        ...data.gatilho!,
                        inatividadeDias: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            )}
          </>
        )}

        {/* Mensagem */}
        {data.mensagem && (
          <>
            <div>
              <label className={labelClasse} htmlFor={`conteudo-${noId}`}>
                Conteúdo da mensagem
              </label>
              <textarea
                id={`conteudo-${noId}`}
                rows={7}
                className={`${campoClasse} resize-y leading-relaxed`}
                value={data.mensagem.conteudo}
                onChange={(e) =>
                  onAlterar({
                    mensagem: { ...data.mensagem!, conteudo: e.target.value },
                    previewConteudo: e.target.value,
                  })
                }
                placeholder="Olá {{nome}}, tudo bem?"
              />
            </div>

            <div>
              <p className={labelClasse}>Variáveis</p>
              <div className="flex flex-wrap gap-1.5">
                {VARIAVEIS_TEMPLATE.map((v) => (
                  <button
                    key={v.chave}
                    title={v.descricao}
                    onClick={() =>
                      onAlterar({
                        mensagem: {
                          ...data.mensagem!,
                          conteudo: data.mensagem!.conteudo + ` {{${v.chave}}}`,
                        },
                        previewConteudo:
                          data.mensagem!.conteudo + ` {{${v.chave}}}`,
                      })
                    }
                    className="rounded-md border border-[var(--border)] bg-[var(--inset)] px-2 py-1 font-mono text-[11px] text-[var(--accent)] hover:border-[var(--accent)]"
                  >
                    {`{{${v.chave}}}`}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={data.mensagem.manual ?? false}
                onChange={(e) =>
                  onAlterar({
                    mensagem: { ...data.mensagem!, manual: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
              />
              Disparo manual (alguém confirma o envio)
            </label>
          </>
        )}

        {/* Atraso */}
        {data.atraso && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasse} htmlFor={`qtd-${noId}`}>Quantidade</label>
              <input
                id={`qtd-${noId}`}
                type="number"
                min={1}
                className={campoClasse}
                value={data.atraso.quantidade}
                onChange={(e) => {
                  const quantidade = Number(e.target.value);
                  onAlterar({
                    atraso: { ...data.atraso!, quantidade },
                    previewConteudo: `Espera ${quantidade} ${data.atraso!.unidade}`,
                  });
                }}
              />
            </div>
            <div>
              <label className={labelClasse} htmlFor={`un-${noId}`}>Unidade</label>
              <select
                id={`un-${noId}`}
                className={campoClasse}
                value={data.atraso.unidade}
                onChange={(e) => {
                  const unidade = e.target.value as "horas" | "dias";
                  onAlterar({
                    atraso: { ...data.atraso!, unidade },
                    previewConteudo: `Espera ${data.atraso!.quantidade} ${unidade}`,
                  });
                }}
              >
                <option value="horas">Horas</option>
                <option value="dias">Dias</option>
              </select>
            </div>
          </div>
        )}

        {/* Condição */}
        {data.condicao && (
          <>
            <div>
              <label className={labelClasse} htmlFor={`campo-${noId}`}>Campo avaliado</label>
              <select
                id={`campo-${noId}`}
                className={campoClasse}
                value={data.condicao.campo}
                onChange={(e) =>
                  onAlterar({
                    condicao: { ...data.condicao!, campo: e.target.value },
                  })
                }
              >
                <option value="respondeu">Lead respondeu?</option>
                <option value="estagio">Estágio do lead</option>
                <option value="interacoes">Interações registradas</option>
                <option value="nome">Nome do lead</option>
              </select>
            </div>
            <div>
              <label className={labelClasse} htmlFor={`op-${noId}`}>Operador</label>
              <select
                id={`op-${noId}`}
                className={campoClasse}
                value={data.condicao.operador}
                onChange={(e) =>
                  onAlterar({
                    condicao: { ...data.condicao!, operador: e.target.value as never },
                  })
                }
              >
                <option value="igual">Igual a</option>
                <option value="diferente">Diferente de</option>
                <option value="contem">Contém</option>
                <option value="vazio">Está vazio</option>
                <option value="preenchido">Está preenchido</option>
              </select>
            </div>
            {["igual", "diferente", "contem"].includes(data.condicao.operador) && (
              <div>
                <label className={labelClasse} htmlFor={`valor-${noId}`}>Valor</label>
                <input
                  id={`valor-${noId}`}
                  className={campoClasse}
                  value={data.condicao.valor ?? ""}
                  onChange={(e) =>
                    onAlterar({
                      condicao: { ...data.condicao!, valor: e.target.value },
                    })
                  }
                  placeholder="sim"
                />
              </div>
            )}
            <p className="rounded-lg bg-[var(--inset)] px-3 py-2 text-[11px] leading-snug text-[var(--text-muted)]">
              Use as saídas laterais do nó: verde = sim, vermelho = não.
            </p>
          </>
        )}

        {/* Ação interna */}
        {data.acao && (
          <>
            <div>
              <label className={labelClasse} htmlFor={`acao-${noId}`}>Ação</label>
              <select
                id={`acao-${noId}`}
                className={campoClasse}
                value={data.acao.acao}
                onChange={(e) =>
                  onAlterar({ acao: { ...data.acao!, acao: e.target.value as never } })
                }
              >
                <option value="criar_tarefa">Criar tarefa</option>
                <option value="atribuir_responsavel">Atribuir responsável</option>
                <option value="mudar_estagio">Mudar estágio do lead</option>
                <option value="registrar_anotacao">Registrar anotação</option>
              </select>
            </div>
            {(data.acao.acao === "criar_tarefa" || data.acao.acao === "registrar_anotacao") && (
              <div>
                <label className={labelClasse} htmlFor={`titulo-${noId}`}>
                  {data.acao.acao === "criar_tarefa" ? "Título da tarefa" : "Anotação"}
                </label>
                <textarea
                  id={`titulo-${noId}`}
                  rows={3}
                  className={`${campoClasse} resize-y`}
                  value={data.acao.titulo ?? ""}
                  onChange={(e) =>
                    onAlterar({
                      acao: { ...data.acao!, titulo: e.target.value },
                      previewConteudo: e.target.value,
                    })
                  }
                />
              </div>
            )}
            {data.acao.acao === "mudar_estagio" && (
              <div>
                <label className={labelClasse} htmlFor={`estagio-${noId}`}>Estágio de destino</label>
                <select
                  id={`estagio-${noId}`}
                  className={campoClasse}
                  value={data.acao.estagioDestino ?? ""}
                  onChange={(e) =>
                    onAlterar({ acao: { ...data.acao!, estagioDestino: e.target.value } })
                  }
                >
                  <option value="">Selecionar...</option>
                  <option value="novo_lead">Novo lead</option>
                  <option value="em_qualificacao">Em qualificação</option>
                  <option value="em_negociacao">Em negociação</option>
                  <option value="pos_venda">Pós-venda</option>
                  <option value="reativacao">Reativação</option>
                  <option value="sem_resposta">Sem resposta</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* Notificação */}
        {data.notificacao && (
          <>
            <div>
              <label className={labelClasse} htmlFor={`titulo-nt-${noId}`}>Título</label>
              <input
                id={`titulo-nt-${noId}`}
                className={campoClasse}
                value={data.notificacao.titulo}
                onChange={(e) =>
                  onAlterar({ notificacao: { ...data.notificacao!, titulo: e.target.value } })
                }
              />
            </div>
            <div>
              <label className={labelClasse} htmlFor={`msg-nt-${noId}`}>Mensagem</label>
              <textarea
                id={`msg-nt-${noId}`}
                rows={3}
                className={`${campoClasse} resize-y`}
                value={data.notificacao.mensagem}
                onChange={(e) =>
                  onAlterar({
                    notificacao: { ...data.notificacao!, mensagem: e.target.value },
                    previewConteudo: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasse} htmlFor={`canal-${noId}`}>Canal</label>
                <select
                  id={`canal-${noId}`}
                  className={campoClasse}
                  value={data.notificacao.canal}
                  onChange={(e) =>
                    onAlterar({
                      notificacao: { ...data.notificacao!, canal: e.target.value as never },
                    })
                  }
                >
                  <option value="in_app">In-app</option>
                  <option value="whatsapp_interno">WhatsApp equipe</option>
                </select>
              </div>
              <div>
                <label className={labelClasse} htmlFor={`para-${noId}`}>Para</label>
                <select
                  id={`para-${noId}`}
                  className={campoClasse}
                  value={data.notificacao.para}
                  onChange={(e) =>
                    onAlterar({
                      notificacao: { ...data.notificacao!, para: e.target.value as never },
                    })
                  }
                >
                  <option value="responsavel">Responsável</option>
                  <option value="gestor">Gestor</option>
                  <option value="todos">Todos</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Dica de variáveis no rodapé */}
        {data.mensagem && (
          <p className="flex items-start gap-1.5 rounded-lg bg-[var(--accent-light)] px-3 py-2 text-[11px] leading-snug text-[var(--accent)]">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Variáveis são preenchidas com os dados do lead no momento do disparo.
          </p>
        )}
      </div>
    </aside>
  );
}

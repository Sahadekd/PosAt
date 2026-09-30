// ============================================================
// Motor de execução do Fluxo de Leads
// Responsável por: avançar nós, agendar atrasos, ramificar
// condições, disparar WhatsApp, pausar por resposta e retry.
// ============================================================

import {
  IFluxoRepository,
  IFluxoExecucaoRepository,
  IFluxoLogRepository,
  ITarefaRepository,
  IInteracaoRepository,
} from "../ports/out/repositories";
import {
  Fluxo,
  FluxoExecucao,
  FluxoNoExecucao,
  NoFluxo,
  ArestaFluxo,
  EstadoNoExecucao,
} from "../domain/entities/fluxo";
import { enviarMensagemTextoWaha } from "@/lib/waha";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_TENTATIVAS = 3;

interface ContextoLead {
  nome?: string;
  telefone?: string;
  imovel?: string;
  corretor?: string;
  [chave: string]: unknown;
}

// ---- Utilitários ----

function resolverVariaveis(template: string, contexto: ContextoLead): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, chave: string) => {
    const valor = contexto[chave];
    if (valor === undefined || valor === null) return "";
    return String(valor);
  });
}

function dentroDaJanela(inicio: string, fim: string): boolean {
  const agora = new Date();
  const minutos = agora.getHours() * 60 + agora.getMinutes();
  const [hIni, mIni] = inicio.split(":").map(Number);
  const [hFim, mFim] = fim.split(":").map(Number);
  const ini = hIni * 60 + (mIni || 0);
  const fimMin = hFim * 60 + (mFim || 0);
  return minutos >= ini && minutos <= fimMin;
}

function calcularProximoAgendamento(
  quantidade: number,
  unidade: "horas" | "dias"
): string {
  const data = new Date();
  if (unidade === "horas") {
    data.setHours(data.getHours() + quantidade);
  } else {
    data.setDate(data.getDate() + quantidade);
  }
  return data.toISOString();
}

function encontrarProximoNo(
  noId: string,
  edges: ArestaFluxo[],
  ramificacao?: string
): string | null {
  const saidas = edges.filter((e) => e.source === noId);
  if (saidas.length === 0) return null;

  // Em condições, seleciona pela ramificação
  if (ramificacao) {
    const compativel = saidas.find(
      (e) =>
        !e.sourceHandle ||
        e.sourceHandle === ramificacao ||
        (e.sourceHandle === "sim" && ramificacao === "sim") ||
        (e.sourceHandle === "nao" && ramificacao === "nao")
    );
    if (compativel) return compativel.target;
  }

  return saidas[0].target;
}

function avaliarCondicao(
  condicao: { campo: string; operador: string; valor?: string },
  contexto: ContextoLead,
  estadoExecucao: Record<string, unknown>
): boolean {
  const bruto =
    contexto[condicao.campo] ??
    estadoExecucao[condicao.campo] ??
    null;
  const valor = bruto === null || bruto === undefined ? "" : String(bruto);

  switch (condicao.operador) {
    case "igual":
      return valor.toLowerCase() === (condicao.valor ?? "").toLowerCase();
    case "diferente":
      return valor.toLowerCase() !== (condicao.valor ?? "").toLowerCase();
    case "contem":
      return valor.toLowerCase().includes((condicao.valor ?? "").toLowerCase());
    case "vazio":
      return valor.trim() === "";
    case "preenchido":
      return valor.trim() !== "";
    default:
      return false;
  }
}

// ---- Motor ----

export class ExecutarFluxoUseCase {
  constructor(
    private readonly fluxoRepo: IFluxoRepository,
    private readonly execucaoRepo: IFluxoExecucaoRepository,
    private readonly logRepo: IFluxoLogRepository,
    private readonly tarefaRepo: ITarefaRepository,
    private readonly interacaoRepo: IInteracaoRepository
  ) {}

  /**
   * Processa uma execução específica até o próximo ponto de parada.
   */
  async executar(execucaoId: string): Promise<void> {
    const execucao = await this.execucaoRepo.findById(execucaoId);
    if (!execucao) return;
    if (execucao.status !== "ativa") return;

    const fluxo = await this.fluxoRepo.findById(execucao.fluxo_id);
    if (!fluxo || fluxo.status !== "ativo") return;

    const contexto = execucao.contexto as ContextoLead;
    const grafo = fluxo.grafo;
    const noAtualId = execucao.no_atual_id;

    if (!noAtualId) {
      // Inicia pelo gatilho
      const gatilho = grafo.nodes.find((n) => n.data.tipo === "gatilho");
      if (!gatilho) return;
      await this.execucaoRepo.update(execucao.id, {
        no_atual_id: gatilho.id,
        no_atual_estado: "em_execucao",
      });
      return this.processarNo(execucao, fluxo, gatilho, contexto);
    }

    const noAtual = grafo.nodes.find((n) => n.id === noAtualId);
    if (!noAtual) return;

    // Se o nó atual ainda está pendente/agendado, processa
    if (
      execucao.no_atual_estado === "pendente" ||
      execucao.no_atual_estado === "agendado" ||
      execucao.no_atual_estado === "falhou"
    ) {
      // Verifica janela de envio para mensagens
      if (noAtual.data.tipo === "mensagem_whatsapp" && !noAtual.data.manual) {
        if (!dentroDaJanela(fluxo.janela_envio_inicio, fluxo.janela_envio_fim)) {
          // Reagenda para o próximo início de janela
          const [h] = fluxo.janela_envio_inicio.split(":").map(Number);
          const amanha = new Date();
          amanha.setDate(amanha.getDate() + 1);
          amanha.setHours(h, 0, 0, 0);

          // Se ainda é hoje antes da janela, agenda para hoje
          const hojeInicio = new Date();
          hojeInicio.setHours(h, 0, 0, 0);
          const alvo = hojeInicio > new Date() ? hojeInicio : amanha;

          await this.execucaoRepo.update(execucao.id, {
            proxima_execucao_em: alvo.toISOString(),
            no_atual_estado: "agendado",
          });
          await this.registrarLog(execucao, "aguardando_janela", {
            noId: noAtual.id,
            proximoAgendamento: alvo.toISOString(),
          });
          return;
        }
      }

      await this.processarNo(execucao, fluxo, noAtual, contexto);
    }
  }

  private async processarNo(
    execucao: FluxoExecucao,
    fluxo: Fluxo,
    no: NoFluxo,
    contexto: ContextoLead
  ): Promise<void> {
    const agora = new Date().toISOString();

    // Registra início do nó
    let noExec = await this.encontrarNoExecucao(execucao.id, no.id);
    if (!noExec) {
      noExec = await this.execucaoRepo.criarNo({
        execucao_id: execucao.id,
        no_id: no.id,
        tipo: no.data.tipo,
        estado: "em_execucao",
        origem: execucao.origem,
        responsavel_id: execucao.iniciada_por,
        agendado_para: agora,
        dados_extra: { label: no.data.label },
      });
    } else {
      noExec = (await this.execucaoRepo.atualizarNo(noExec.id, {
        estado: "em_execucao",
        iniciado_em: agora,
      }))!;
    }

    await this.execucaoRepo.update(execucao.id, {
      no_atual_id: no.id,
      no_atual_estado: "em_execucao",
      proxima_execucao_em: null,
    });

    try {
      switch (no.data.tipo) {
        case "gatilho": {
          await this.finalizarNo(noExec, "concluido");
          await this.avancar(execucao, fluxo, no.id, contexto);
          break;
        }

        case "atraso": {
          const { quantidade, unidade } = no.data;
          const agendado = calcularProximoAgendamento(quantidade, unidade);

          await this.execucaoRepo.atualizarNo(noExec.id, {
            estado: "agendado",
            agendado_para: agendado,
          });
          await this.execucaoRepo.update(execucao.id, {
            no_atual_estado: "agendado",
            proxima_execucao_em: agendado,
          });
          await this.registrarLog(execucao, "no_agendado", {
            noId: no.id,
            agendadoPara: agendado,
            atraso: `${quantidade} ${unidade}`,
          });
          break;
        }

        case "mensagem_whatsapp": {
          const conteudoFinal = resolverVariaveis(no.data.conteudo, contexto);
          const telefone = contexto.telefone;

          if (no.data.manual) {
            // Disparo manual: fica aguardando ação do usuário
            await this.execucaoRepo.atualizarNo(noExec.id, {
              estado: "agendado",
              conteudo_enviado: conteudoFinal,
              agendado_para: agora,
            });
            await this.execucaoRepo.update(execucao.id, {
              no_atual_estado: "agendado",
            });
            await this.registrarLog(execucao, "aguardando_disparo_manual", {
              noId: no.id,
              conteudo: conteudoFinal,
            });
            break;
          }

          if (!telefone) {
            await this.falharNo(noExec, execucao, "Lead sem telefone cadastrado.");
            break;
          }

          // Respeita limite de mensagens por dia
          const enviosHoje = await this.contarMensagensHoje(execucao.id);
          if (enviosHoje >= fluxo.limite_mensagens_por_dia) {
            await this.execucaoRepo.atualizarNo(noExec.id, {
              estado: "agendado",
              agendado_para: calcularProximoAgendamento(1, "dias"),
            });
            await this.execucaoRepo.update(execucao.id, {
              no_atual_estado: "agendado",
              proxima_execucao_em: calcularProximoAgendamento(1, "dias"),
            });
            await this.registrarLog(execucao, "limite_dia_atingido", { noId: no.id });
            break;
          }

          await this.dispararMensagem(execucao, fluxo, no, noExec, conteudoFinal, telefone);
          break;
        }

        case "condicao": {
          const estadoExec = {
            respondeu: contexto["respondeu"] ?? false,
            ...contexto,
          };
          const resultado = avaliarCondicao(
            { campo: no.data.campo, operador: no.data.operador, valor: no.data.valor },
            contexto,
            estadoExec
          );
          const ramificacao = resultado ? "sim" : "nao";

          await this.execucaoRepo.atualizarNo(noExec.id, {
            estado: "concluido",
            concluido_em: new Date().toISOString(),
            ramificacao,
          });
          await this.registrarLog(execucao, "condicao_avaliada", {
            noId: no.id,
            campo: no.data.campo,
            resultado: ramificacao,
          });

          await this.avancar(execucao, fluxo, no.id, contexto, ramificacao);
          break;
        }

        case "acao_interna": {
          await this.executarAcaoInterna(execucao, fluxo, no, noExec, contexto);
          break;
        }

        case "notificacao": {
          await this.execucaoRepo.atualizarNo(noExec.id, {
            estado: "concluido",
            concluido_em: new Date().toISOString(),
            dados_extra: {
              label: no.data.label,
              titulo: no.data.titulo,
              mensagem: no.data.mensagem,
              para: no.data.para,
              canal: no.data.canal,
            },
          });
          await this.registrarLog(execucao, "notificacao_enviada", {
            noId: no.id,
            titulo: no.data.titulo,
            para: no.data.para,
          });
          await this.avancar(execucao, fluxo, no.id, contexto);
          break;
        }
      }
    } catch (erro) {
      await this.falharNo(
        noExec,
        execucao,
        erro instanceof Error ? erro.message : "Erro desconhecido"
      );
    }
  }

  private async dispararMensagem(
    execucao: FluxoExecucao,
    fluxo: Fluxo,
    no: NoFluxo,
    noExec: FluxoNoExecucao,
    conteudo: string,
    telefone: string
  ): Promise<void> {
    const sessao = await this.obterSessaoDoResponsavel(
      execucao.cliente?.responsavel_id ?? fluxo.responsavel_id
    );

    if (!sessao) {
      await this.falharNo(noExec, execucao, "Nenhuma sessão WhatsApp disponível para envio.");
      return;
    }

    try {
      await enviarMensagemTextoWaha({ sessao, numero: telefone, texto: conteudo });

      await this.execucaoRepo.atualizarNo(noExec.id, {
        estado: "concluido",
        concluido_em: new Date().toISOString(),
        conteudo_enviado: conteudo,
        status_entrega: "enviada",
        tentativas: noExec.tentativas + 1,
      });

      await this.registrarLog(execucao, "mensagem_enviada", {
        noId: no.id,
        telefone,
        conteudo,
      });

      // Registra interação no histórico do cliente
      try {
        await this.interacaoRepo.create({
          cliente_id: execucao.cliente_id,
          tipo: "whatsapp",
          canal: "fluxo_automatico",
          descricao: `Mensagem automática (fluxo: ${fluxo.nome}): ${conteudo.slice(0, 200)}`,
          resultado: "enviada",
          dados_extra: { fluxo_id: fluxo.id, no_id: no.id, execucao_id: execucao.id },
        });
      } catch {
        // interação é best-effort
      }

      await this.avancar(execucao, fluxo, no.id, execucao.contexto as ContextoLead);
    } catch (erro) {
      const tentativas = noExec.tentativas + 1;
      const msg = erro instanceof Error ? erro.message : "Falha no envio";

      if (tentativas >= MAX_TENTATIVAS) {
        await this.falharNo(noExec, execucao, msg, tentativas);
      } else {
        // Retry com backoff
        const backoff = new Date();
        backoff.setMinutes(backoff.getMinutes() + tentativas * 2);

        await this.execucaoRepo.atualizarNo(noExec.id, {
          estado: "agendado",
          tentativas,
          erro_detalhe: msg,
          agendado_para: backoff.toISOString(),
        });
        await this.execucaoRepo.update(execucao.id, {
          no_atual_estado: "agendado",
          proxima_execucao_em: backoff.toISOString(),
          tentativas,
        });
        await this.registrarLog(execucao, "retry_agendado", {
          noId: no.id,
          tentativas,
          erro: msg,
        });
      }
    }
  }

  private async executarAcaoInterna(
    execucao: FluxoExecucao,
    fluxo: Fluxo,
    no: NoFluxo,
    noExec: FluxoNoExecucao,
    contexto: ContextoLead
  ): Promise<void> {
    const dados = no.data;
    if (dados.tipo !== "acao_interna") return;
    const resultado: Record<string, unknown> = { label: no.data.label };

    switch (dados.acao) {
      case "criar_tarefa": {
        const tarefa = await this.tarefaRepo.create({
          cliente_id: execucao.cliente_id,
          titulo: resolverVariaveis(dados.titulo ?? "Tarefa do fluxo", contexto),
          descricao: dados.descricao
            ? resolverVariaveis(dados.descricao, contexto)
            : null,
          status: "pendente",
          prioridade: 2,
          responsavel_id: execucao.cliente?.responsavel_id ?? null,
          prazo_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        resultado.tarefaId = tarefa.id;
        break;
      }

      case "mudar_estagio": {
        if (dados.estagioDestino && supabaseAdmin) {
          await supabaseAdmin
            .from("clientes")
            .update({ status: dados.estagioDestino })
            .eq("id", execucao.cliente_id);
          resultado.estagio = dados.estagioDestino;
        }
        break;
      }

      case "atribuir_responsavel": {
        if (dados.responsavelId && supabaseAdmin) {
          await supabaseAdmin
            .from("clientes")
            .update({ responsavel_id: dados.responsavelId })
            .eq("id", execucao.cliente_id);
          resultado.responsavelId = dados.responsavelId;
        }
        break;
      }

      case "registrar_anotacao": {
        await this.interacaoRepo.create({
          cliente_id: execucao.cliente_id,
          tipo: "observacao",
          descricao: resolverVariaveis(dados.descricao ?? dados.titulo ?? "", contexto),
          criado_por: execucao.iniciada_por,
          dados_extra: { origem: "fluxo", execucao_id: execucao.id },
        });
        break;
      }
    }

    await this.execucaoRepo.atualizarNo(noExec.id, {
      estado: "concluido",
      concluido_em: new Date().toISOString(),
      dados_extra: resultado,
    });
    await this.registrarLog(execucao, "acao_interna_executada", {
      noId: no.id,
      acao: dados.acao,
      ...resultado,
    });

    await this.avancar(execucao, fluxo, no.id, contexto);
  }

  private async avancar(
    execucao: FluxoExecucao,
    fluxo: Fluxo,
    noId: string,
    contexto: ContextoLead,
    ramificacao?: string
  ): Promise<void> {
    const proximoId = encontrarProximoNo(noId, fluxo.grafo.edges, ramificacao);

    if (!proximoId) {
      // Fim do fluxo
      await this.execucaoRepo.update(execucao.id, {
        status: "concluida",
        concluido_em: new Date().toISOString(),
        proxima_execucao_em: null,
        no_atual_estado: "concluido",
      });
      await this.registrarLog(execucao, "fluxo_concluido", {});
      return;
    }

    const proximoNo = fluxo.grafo.nodes.find((n) => n.id === proximoId);
    if (!proximoNo) {
      await this.execucaoRepo.update(execucao.id, {
        status: "falhou",
        proxima_execucao_em: null,
      });
      return;
    }

    await this.execucaoRepo.update(execucao.id, {
      no_atual_id: proximoId,
      no_atual_estado: "pendente",
      proxima_execucao_em: new Date().toISOString(),
      tentativas: 0,
    });

    // Processa imediatamente o próximo nó
    await this.processarNo(execucao, fluxo, proximoNo, contexto);
  }

  // ---- Helpers ----

  private async encontrarNoExecucao(
    execucaoId: string,
    noId: string
  ): Promise<FluxoNoExecucao | null> {
    const nos = await this.execucaoRepo.listarNos(execucaoId);
    return nos.find((n) => n.no_id === noId) ?? null;
  }

  private async finalizarNo(noExec: FluxoNoExecucao, estado: EstadoNoExecucao) {
    await this.execucaoRepo.atualizarNo(noExec.id, {
      estado,
      concluido_em: new Date().toISOString(),
    });
  }

  private async falharNo(
    noExec: FluxoNoExecucao,
    execucao: FluxoExecucao,
    erro: string,
    tentativas?: number
  ): Promise<void> {
    await this.execucaoRepo.atualizarNo(noExec.id, {
      estado: "falhou",
      erro_detalhe: erro,
      tentativas: tentativas ?? noExec.tentativas,
      concluido_em: new Date().toISOString(),
    });
    await this.execucaoRepo.update(execucao.id, {
      no_atual_estado: "falhou",
      proxima_execucao_em: null,
    });
    await this.registrarLog(execucao, "no_falhou", {
      noId: noExec.no_id,
      erro,
    });
  }

  private async contarMensagensHoje(execucaoId: string): Promise<number> {
    if (!supabaseAdmin) return 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const { count } = await supabaseAdmin
      .from("fluxo_no_execucoes")
      .select("id", { count: "exact", head: true })
      .eq("execucao_id", execucaoId)
      .eq("tipo", "mensagem_whatsapp")
      .gte("criado_em", hoje.toISOString());

    return count ?? 0;
  }

  private async obterSessaoDoResponsavel(
    responsavelId: string | null | undefined
  ): Promise<string | null> {
    if (!supabaseAdmin || !responsavelId) return null;

    const { data } = await supabaseAdmin
      .from("whatsapp_conexoes")
      .select("sessao_id, status")
      .eq("corretor", responsavelId)
      .eq("status", "conectado")
      .limit(1)
      .maybeSingle();

    if (data?.sessao_id) return data.sessao_id;

    // Fallback: primeira sessão conectada
    const { data: primeira } = await supabaseAdmin
      .from("whatsapp_conexoes")
      .select("sessao_id")
      .eq("status", "conectado")
      .limit(1)
      .maybeSingle();

    return primeira?.sessao_id ?? null;
  }

  private async registrarLog(
    execucao: FluxoExecucao,
    evento: string,
    dados: Record<string, unknown>,
    detalhe?: string
  ): Promise<void> {
    try {
      await this.logRepo.create({
        execucao_id: execucao.id,
        fluxo_id: execucao.fluxo_id,
        cliente_id: execucao.cliente_id,
        evento,
        detalhe: detalhe ?? null,
        origem: execucao.origem,
        responsavel_id: execucao.iniciada_por,
        dados,
      });
    } catch {
      // log é best-effort
    }
  }
}

// ---- Pausa por resposta do lead ----

export class PausarFluxoPorRespostaUseCase {
  constructor(
    private readonly execucaoRepo: IFluxoExecucaoRepository,
    private readonly logRepo: IFluxoLogRepository
  ) {}

  /**
   * Chamado pelo webhook quando o lead responde.
   * Pausa IMEDIATAMENTE todas as execuções ativas do lead.
   */
  async execute(clienteId: string, mensagem?: string): Promise<number> {
    const execucoes = await this.execucaoRepo.findAll({
      cliente_id: clienteId,
      status: "ativa",
    });

    let pausadas = 0;
    for (const exec of execucoes) {
      await this.execucaoRepo.update(exec.id, {
        status: "pausada_por_resposta",
        pausada_em: new Date().toISOString(),
        pausada_motivo: "Lead respondeu",
        proxima_execucao_em: null,
      });
      pausadas++;

      try {
        await this.logRepo.create({
          execucao_id: exec.id,
          fluxo_id: exec.fluxo_id,
          cliente_id: clienteId,
          evento: "pausado_por_resposta",
          detalhe: mensagem ? `Última mensagem: ${mensagem.slice(0, 100)}` : null,
          origem: "automatica",
          dados: { motivo: "resposta_do_lead" },
        });
      } catch {
        // best-effort
      }
    }

    return pausadas;
  }
}

// ---- Ações manuais ----

export class ControlarExecucaoUseCase {
  constructor(
    private readonly fluxoRepo: IFluxoRepository,
    private readonly execucaoRepo: IFluxoExecucaoRepository,
    private readonly logRepo: IFluxoLogRepository
  ) {}

  async pausar(execucaoId: string, responsavelId?: string | null): Promise<void> {
    const exec = await this.execucaoRepo.findById(execucaoId);
    if (!exec) throw new Error("Execução não encontrada.");
    if (exec.status !== "ativa") throw new Error("Apenas execuções ativas podem ser pausadas.");

    await this.execucaoRepo.update(execucaoId, {
      status: "pausada_manual",
      pausada_em: new Date().toISOString(),
      pausada_motivo: "Pausa manual",
      proxima_execucao_em: null,
    });
    await this.logRepo.create({
      execucao_id: execucaoId,
      fluxo_id: exec.fluxo_id,
      cliente_id: exec.cliente_id,
      evento: "pausado_manual",
      origem: "manual",
      responsavel_id: responsavelId ?? null,
      dados: {},
    });
  }

  async retomar(execucaoId: string, responsavelId?: string | null): Promise<void> {
    const exec = await this.execucaoRepo.findById(execucaoId);
    if (!exec) throw new Error("Execução não encontrada.");
    if (!exec.status.startsWith("pausada")) {
      throw new Error("Apenas execuções pausadas podem ser retomadas.");
    }

    await this.execucaoRepo.update(execucaoId, {
      status: "ativa",
      retomada_em: new Date().toISOString(),
      pausada_em: null,
      pausada_motivo: null,
      proxima_execucao_em: new Date().toISOString(),
      no_atual_estado: "pendente",
    });
    await this.logRepo.create({
      execucao_id: execucaoId,
      fluxo_id: exec.fluxo_id,
      cliente_id: exec.cliente_id,
      evento: "retomado",
      origem: "manual",
      responsavel_id: responsavelId ?? null,
      dados: {},
    });
  }

  async cancelar(execucaoId: string, responsavelId?: string | null): Promise<void> {
    const exec = await this.execucaoRepo.findById(execucaoId);
    if (!exec) throw new Error("Execução não encontrada.");

    await this.execucaoRepo.update(execucaoId, {
      status: "cancelada",
      cancelada_em: new Date().toISOString(),
      proxima_execucao_em: null,
    });
    await this.logRepo.create({
      execucao_id: execucaoId,
      fluxo_id: exec.fluxo_id,
      cliente_id: exec.cliente_id,
      evento: "cancelado",
      origem: "manual",
      responsavel_id: responsavelId ?? null,
      dados: {},
    });
  }

  async pularEtapa(execucaoId: string, noId: string, responsavelId?: string | null): Promise<void> {
    const exec = await this.execucaoRepo.findById(execucaoId);
    if (!exec) throw new Error("Execução não encontrada.");

    const nos = await this.execucaoRepo.listarNos(execucaoId);
    const noExec = nos.find((n) => n.no_id === noId);

    if (noExec) {
      await this.execucaoRepo.atualizarNo(noExec.id, {
        estado: "pulado",
        concluido_em: new Date().toISOString(),
        origem: "manual",
        responsavel_id: responsavelId ?? null,
      });
    }

    await this.logRepo.create({
      execucao_id: execucaoId,
      fluxo_id: exec.fluxo_id,
      cliente_id: exec.cliente_id,
      no_id: noId,
      evento: "etapa_pulada",
      origem: "manual",
      responsavel_id: responsavelId ?? null,
      dados: {},
    });
  }

  async reexecutarNoFalho(execucaoId: string, responsavelId?: string | null): Promise<void> {
    const exec = await this.execucaoRepo.findById(execucaoId);
    if (!exec) throw new Error("Execução não encontrada.");

    await this.execucaoRepo.update(execucaoId, {
      status: "ativa",
      no_atual_estado: "pendente",
      proxima_execucao_em: new Date().toISOString(),
      tentativas: 0,
      pausada_em: null,
      pausada_motivo: null,
    });
    await this.logRepo.create({
      execucao_id: execucaoId,
      fluxo_id: exec.fluxo_id,
      cliente_id: exec.cliente_id,
      no_id: exec.no_atual_id,
      evento: "no_reexecutado",
      origem: "manual",
      responsavel_id: responsavelId ?? null,
      dados: { noId: exec.no_atual_id },
    });
  }
}

// ---- Scheduler ----

export class ProcessarAgendamentosUseCase {
  constructor(
    private readonly execucaoRepo: IFluxoExecucaoRepository,
    private readonly executarFluxo: ExecutarFluxoUseCase
  ) {}

  /**
   * Roda a cada X segundos. Pega execuções com proxima_execucao_em vencido
   * e processa o próximo nó.
   */
  async execute(): Promise<{ processadas: number; erros: number }> {
    const agora = new Date().toISOString();
    const pendentes = await this.execucaoRepo.listarParaExecucao(agora);

    let processadas = 0;
    let erros = 0;

    for (const exec of pendentes) {
      try {
        await this.executarFluxo.executar(exec.id);
        processadas++;
      } catch (e) {
        erros++;
        console.error(`Erro ao processar execução ${exec.id}:`, e);
      }
    }

    return { processadas, erros };
  }
}

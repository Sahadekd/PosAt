// ============================================================
// Templates iniciais do Fluxo de Leads
// Biblioteca pronta para time-to-value imediato:
// pós-visita, reativação e pós-proposta.
// ============================================================

import type { GrafoFluxo } from "@/core/domain/entities/fluxo";
import { organizarHorizontal } from "./fluxo-layout";

export interface TemplateFluxo {
  categoria: string;
  nome: string;
  descricao: string;
  grafo: GrafoFluxo;
}

function no(
  id: string,
  x: number,
  y: number,
  label: string,
  data: Record<string, unknown>
) {
  return { id, position: { x, y }, data: { label, ...data } } as GrafoFluxo["nodes"][number];
}

function aresta(source: string, target: string, sourceHandle?: string) {
  return {
    id: `${source}->${target}${sourceHandle ?? ""}`,
    source,
    target,
    sourceHandle,
  };
}

// ------------------------------------------------------------
// 1. Pós-visita: agradecimento D+1, pesquisa D+3, retorno D+7
// ------------------------------------------------------------
const posVisita: TemplateFluxo = {
  categoria: "pos_visita",
  nome: "Pós-visita",
  descricao:
    "Follow-up automático após visita a imóvel: agradecimento em D+1, pesquisa de satisfação em D+3 e lembrete de retorno em D+7.",
  grafo: {
    nodes: [
      no("g1", 300, 0, "Lead visitou o imóvel", {
        tipo: "gatilho",
        gatilho: "mudanca_estagio",
        estagioOrigem: "em_qualificacao",
      }),
      no("m1", 300, 130, "Agradecer a visita (D+1)", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "Olá {{nome}}! Aqui é o {{corretor}}. Foi um prazer receber você no imóvel {{imovel}}. Ficou com alguma dúvida? Estou à disposição!",
      }),
      no("a1", 300, 300, "Esperar 1 dia", {
        tipo: "atraso",
        quantidade: 1,
        unidade: "dias",
      }),
      no("c1", 300, 430, "Lead respondeu?", {
        tipo: "condicao",
        campo: "respondeu",
        operador: "igual",
        valor: "sim",
      }),
      no("m2", 560, 560, "Pesquisa de satisfação (D+3)", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "{{nome}}, de 0 a 10, como foi sua experiência na visita ao imóvel {{imovel}}? Sua opinião ajuda muito a equipe!",
      }),
      no("a2", 300, 560, "Esperar 3 dias", {
        tipo: "atraso",
        quantidade: 3,
        unidade: "dias",
      }),
      no("n1", 60, 700, "Avisar atendente", {
        tipo: "notificacao",
        canal: "in_app",
        titulo: "Lead respondeu após visita",
        mensagem: "{{nome}} respondeu à mensagem automática. Retomar contato.",
        para: "responsavel",
      }),
      no("a3", 60, 840, "Esperar 4 dias", {
        tipo: "atraso",
        quantidade: 4,
        unidade: "dias",
      }),
      no("m3", 60, 970, "Lembrete de retorno (D+7)", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "{{nome}}, tudo bem? Seu {{corretor}} aqui. Que tal retomarmos a conversa sobre o imóvel {{imovel}}? Tenho novidades.",
      }),
      no("t1", 600, 840, "Tarefa: ligar para o lead", {
        tipo: "acao_interna",
        acao: "criar_tarefa",
        titulo: "Ligar para {{nome}} — retorno pós-visita",
        descricao: "Lead visitou {{imovel}}. Retomar contato após D+7.",
      }),
      no("m4", 600, 970, "Mensagem final (D+7)", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "{{nome}}, se ainda tiver interesse no imóvel {{imovel}}, o {{corretor}} pode te ajudar com qualquer dúvida. Estou por aqui!",
      }),
    ],
    edges: [
      aresta("g1", "m1"),
      aresta("m1", "a1"),
      aresta("a1", "c1"),
      aresta("c1", "a2", "sim"),
      aresta("c1", "n1", "nao"),
      aresta("a2", "m2"),
      aresta("m2", "t1"),
      aresta("t1", "a3"),
      aresta("a3", "m3"),
      aresta("m3", "m4"),
      aresta("n1", "a3"),
    ],
  },
};

// ------------------------------------------------------------
// 2. Reativação de lead frio (sem resposta há 15 dias)
// ------------------------------------------------------------
const reativacao: TemplateFluxo = {
  categoria: "reativacao",
  nome: "Reativação de lead frio",
  descricao:
    "Lead sem resposta há 15 dias entra em reativação com mensagens espaçadas. Se responder, o fluxo pausa e notifica o atendente.",
  grafo: {
    nodes: [
      no("g1", 320, 0, "Inatividade de 15 dias", {
        tipo: "gatilho",
        gatilho: "inatividade_dias",
        inatividadeDias: 15,
      }),
      no("m1", 320, 130, "Primeira tentativa", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "Olá {{nome}}, aqui é o {{corretor}}. Notei que faz um tempo desde nosso último contato. Ainda tem interesse no imóvel {{imovel}}?",
      }),
      no("a1", 320, 300, "Esperar 3 dias", {
        tipo: "atraso",
        quantidade: 3,
        unidade: "dias",
      }),
      no("c1", 320, 430, "Respondeu?", {
        tipo: "condicao",
        campo: "respondeu",
        operador: "igual",
        valor: "sim",
      }),
      no("n1", 600, 560, "Notificar atendente", {
        tipo: "notificacao",
        canal: "in_app",
        titulo: "Lead reativado!",
        mensagem: "{{nome}} respondeu à reativação. Retomar conversa.",
        para: "responsavel",
      }),
      no("s1", 600, 690, "Marcar estágio: em qualificação", {
        tipo: "acao_interna",
        acao: "mudar_estagio",
        estagioDestino: "em_qualificacao",
      }),
      no("m2", 60, 560, "Segunda tentativa", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "{{nome}}, tudo bem? Sei que a correria é grande, mas não queria que você perdesse as oportunidades no {{imovel}}. Posso te enviar as condições atualizadas?",
      }),
      no("a2", 60, 730, "Esperar 4 dias", {
        tipo: "atraso",
        quantidade: 4,
        unidade: "dias",
      }),
      no("c2", 60, 860, "Respondeu agora?", {
        tipo: "condicao",
        campo: "respondeu",
        operador: "igual",
        valor: "sim",
      }),
      no("m3", 60, 990, "Última mensagem", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "{{nome}}, uma última atualização: o imóvel {{imovel}} continua disponível, mas a demanda está alta. Caso queira retomar, é só responder por aqui.",
      }),
      no("t1", 320, 990, "Tarefa: reavaliar o lead", {
        tipo: "acao_interna",
        acao: "criar_tarefa",
        titulo: "Reavaliar lead frio: {{nome}}",
        descricao: "Após 3 tentativas de reativação sem resposta, decidir próximo passo.",
      }),
      no("n2", 320, 1130, "Avisar gestão", {
        tipo: "notificacao",
        canal: "in_app",
        titulo: "Lead sem resposta após reativação",
        mensagem: "{{nome}} não respondeu a 3 mensagens de reativação.",
        para: "gestor",
      }),
    ],
    edges: [
      aresta("g1", "m1"),
      aresta("m1", "a1"),
      aresta("a1", "c1"),
      aresta("c1", "n1", "sim"),
      aresta("c1", "m2", "nao"),
      aresta("n1", "s1"),
      aresta("m2", "a2"),
      aresta("a2", "c2"),
      aresta("c2", "n1", "sim"),
      aresta("c2", "m3", "nao"),
      aresta("m3", "t1"),
      aresta("t1", "n2"),
    ],
  },
};

// ------------------------------------------------------------
// 3. Pós-proposta: acompanhamento de negociação
// ------------------------------------------------------------
const posProposta: TemplateFluxo = {
  categoria: "pos_proposta",
  nome: "Acompanhamento de negociação",
  descricao:
    "Etapas manuais (ligar, enviar proposta, agendar assinatura) registradas como nós concluídos, visíveis para o gestor.",
  grafo: {
    nodes: [
      no("g1", 320, 0, "Proposta enviada", {
        tipo: "gatilho",
        gatilho: "evento_sistema",
        evento: "proposta_enviada",
      }),
      no("t1", 320, 130, "Ligar para o lead", {
        tipo: "acao_interna",
        acao: "criar_tarefa",
        titulo: "Ligar para {{nome}} — proposta enviada",
        descricao: "Confirmar recebimento da proposta e tirar dúvidas.",
      }),
      no("m1", 320, 300, "Confirmação por WhatsApp", {
        tipo: "mensagem_whatsapp",
        manual: true,
        conteudo:
          "{{nome}}, enviamos a proposta para o imóvel {{imovel}}. Consegue verificar? Fico à disposição para ajustes.",
      }),
      no("a1", 320, 470, "Esperar 2 dias", {
        tipo: "atraso",
        quantidade: 2,
        unidade: "dias",
      }),
      no("c1", 320, 600, "Respondeu?", {
        tipo: "condicao",
        campo: "respondeu",
        operador: "igual",
        valor: "sim",
      }),
      no("t2", 60, 730, "Enviar contraproposta", {
        tipo: "acao_interna",
        acao: "criar_tarefa",
        titulo: "Elaborar contraproposta de {{nome}}",
        descricao: "Lead pediu ajustes na proposta do imóvel {{imovel}}.",
      }),
      no("m2", 60, 900, "Mensagem: seguimos negociando", {
        tipo: "mensagem_whatsapp",
        conteudo:
          "{{nome}}, recebemos seu retorno e já estamos ajustando a proposta. Em breve entro em contato com a contraproposta.",
      }),
      no("n1", 600, 730, "Notificar atendente", {
        tipo: "notificacao",
        canal: "in_app",
        titulo: "Sem resposta na proposta",
        mensagem: "{{nome}} não respondeu a proposta em 2 dias.",
        para: "responsavel",
      }),
      no("t3", 600, 900, "Retomar contato", {
        tipo: "acao_interna",
        acao: "criar_tarefa",
        titulo: "Retomar contato com {{nome}} — proposta sem resposta",
        descricao: "Ligar e enviar mensagem de follow-up.",
      }),
      no("m3", 320, 1050, "Agendar assinatura", {
        tipo: "mensagem_whatsapp",
        manual: true,
        conteudo:
          "{{nome}}, ótima notícia! Podemos seguir para assinatura. Qual melhor horário para você?",
      }),
      no("t4", 320, 1220, "Agendar visita ao escritório", {
        tipo: "acao_interna",
        acao: "mudar_estagio",
        estagioDestino: "em_negociacao",
      }),
    ],
    edges: [
      aresta("g1", "t1"),
      aresta("t1", "m1"),
      aresta("m1", "a1"),
      aresta("a1", "c1"),
      aresta("c1", "t2", "nao"),
      aresta("c1", "m3", "sim"),
      aresta("t2", "m2"),
      aresta("m2", "t3"),
      aresta("n1", "t3"),
      aresta("t3", "m3"),
      aresta("m3", "t4"),
    ],
  },
};

// Posições são organizadas na horizontal (esquerda → direita) na exportação;
// as coordenadas acima servem apenas como referência de ordem das ramificações.
export const TEMPLATES_INICIAIS: TemplateFluxo[] = [posVisita, reativacao, posProposta].map(
  (t) => ({ ...t, grafo: organizarHorizontal(t.grafo) })
);

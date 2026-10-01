import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { receberMensagemWhatsAppUseCase, pausarFluxoPorRespostaUseCase } from "@/core/container";
import { extrairNumeroDeJid } from "@/lib/whatsapp";

// Aceita:
// 1. Formato da Evolution API (event: "messages.upsert")
// 2. Formato WAHA (event: "message")
// 3. Formato simples (usado no simulador da interface)
const simpleSchema = z.object({
  sessaoId: z.string(),
  numero: z.string(),
  direction: z.enum(["recebida", "enviada"]).default("recebida"),
  texto: z.string().min(1),
  nomeContato: z.string().optional(),
  timestamp: z.string().optional(),
});

function extrairTextoDaMensagem(
  message: Record<string, unknown> | undefined
): string {
  if (!message || typeof message !== "object") {
    return "";
  }

  const m = message as Record<string, unknown>;

  // ============================================================
  // WAHA
  // ============================================================
  // No payload real da WAHA, mensagens de texto ficam em:
  // payload.body
  if (typeof m.body === "string" && m.body.trim()) {
    return m.body;
  }

  // Alguns dados podem estar dentro de _data
  const data = m._data as Record<string, unknown> | undefined;

  if (data && typeof data === "object") {
    if (typeof data.body === "string" && data.body.trim()) {
      return data.body;
    }

    const text = data.text as Record<string, unknown> | undefined;

    if (
      text &&
      typeof text.body === "string" &&
      text.body.trim()
    ) {
      return text.body;
    }

    if (
      typeof data.conversation === "string" &&
      data.conversation.trim()
    ) {
      return data.conversation;
    }
  }

  // ============================================================
  // Evolution API
  // ============================================================

  if (
    typeof m.conversation === "string" &&
    m.conversation.trim()
  ) {
    return m.conversation;
  }

  const ext = m.extendedTextMessage as
    | Record<string, unknown>
    | undefined;

  if (
    ext &&
    typeof ext.text === "string" &&
    ext.text.trim()
  ) {
    return ext.text;
  }

  const img = m.imageMessage as
    | Record<string, unknown>
    | undefined;

  if (
    img &&
    typeof img.caption === "string" &&
    img.caption.trim()
  ) {
    return img.caption;
  }

  // Se não houver texto, tratamos como mídia.
  return "[Mídia recebida]";
}

function extrairTipoDoBody(
  message: Record<string, unknown> | undefined
): string {
  if (!message || typeof message !== "object") {
    return "texto";
  }

  const m = message as Record<string, unknown>;

  // ============================================================
  // WAHA
  // ============================================================

  if (m.hasMedia === true) {
    const type =
      typeof m.type === "string"
        ? m.type
        : "";

    if (type === "image") {
      return "imagem";
    }

    if (type === "audio") {
      return "audio";
    }

    if (type === "video") {
      return "video";
    }

    if (type === "document") {
      return "documento";
    }

    if (type === "sticker") {
      return "sticker";
    }

    return "midia";
  }

  // ============================================================
  // Evolution API
  // ============================================================

  if ("imageMessage" in m) {
    return "imagem";
  }

  if ("audioMessage" in m) {
    return "audio";
  }

  if ("videoMessage" in m) {
    return "video";
  }

  if ("documentMessage" in m) {
    return "documento";
  }

  return "texto";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("========== WEBHOOK WHATSAPP ==========");
    console.log(JSON.stringify(body, null, 2));
    console.log("=======================================");

    // ============================================================
    // AUTENTICAÇÃO OPCIONAL
    // ============================================================
    // Mantém compatibilidade com a configuração antiga da Evolution.
    // Só valida quando EVOLUTION_API_KEY estiver configurada.
    const evolApiKey = process.env.EVOLUTION_API_KEY;

    if (evolApiKey) {
      const header =
        request.headers.get("x-api-key") ||
        request.headers
          .get("authorization")
          ?.replace(/^Bearer\s+/i, "") ||
        "";

      if (header !== evolApiKey) {
        return NextResponse.json(
          {
            erro: "Não autorizado.",
          },
          {
            status: 401,
          }
        );
      }
    }

    let sessaoId: string;
    let numero: string;
    let origem: "recebida" | "enviada";
    let conteudo: string;
    let nomeContato: string | null = null;
    let tipo = "texto";
    let enviadoEm: string | null = null;

    const data = body.data as
      | Record<string, unknown>
      | undefined;

    // ============================================================
    // EVENTO DE STATUS DA SESSÃO — WAHA
    // ============================================================
    //
    // O WAHA envia eventos como:
    //
    // session.status
    // SCAN_QR_CODE
    // WORKING
    // FAILED
    // STOPPED
    //
    // Isso NÃO é uma mensagem.
    // Portanto, respondemos 200 imediatamente.
    //
    if (
      body.event === "session.status" &&
      typeof body.session === "string"
    ) {
      console.log(
        `WAHA: status da sessão ${body.session}:`,
        body.payload
      );

      return NextResponse.json(
        {
          ok: true,
          evento: "session.status",
          sessaoId: body.session,
        },
        {
          status: 200,
        }
      );
    }

    // ============================================================
    // FORMATO WAHA
    // ============================================================

    if (
      body.event === "message" &&
      typeof body.session === "string" &&
      body.payload &&
      typeof body.payload === "object"
    ) {
      const payload = body.payload as Record<string, unknown>;

      sessaoId = body.session;

      // ----------------------------------------------------------
      // Remetente
      // ----------------------------------------------------------

      const from =
        typeof payload.from === "string"
          ? payload.from
          : "";

      numero = extrairNumeroDeJid(from);

      // ----------------------------------------------------------
      // Direção
      // ----------------------------------------------------------

      origem =
        payload.fromMe === true
          ? "enviada"
          : "recebida";

      // ----------------------------------------------------------
      // Conteúdo
      // ----------------------------------------------------------

      conteudo = extrairTextoDaMensagem(payload);

      // ----------------------------------------------------------
      // Tipo
      // ----------------------------------------------------------

      tipo = extrairTipoDoBody(payload);

      // ----------------------------------------------------------
      // Nome do contato
      // ----------------------------------------------------------

      nomeContato = null;

      if (
        typeof payload._data === "object" &&
        payload._data !== null
      ) {
        const dadosInternos =
          payload._data as Record<string, unknown>;

        if (
          typeof dadosInternos.notifyName === "string"
        ) {
          nomeContato = dadosInternos.notifyName;
        }
      }

      // Caso notifyName não esteja disponível,
      // tenta alguns campos comuns da WAHA.
      if (!nomeContato) {
        if (
          typeof payload.pushName === "string"
        ) {
          nomeContato = payload.pushName;
        }
      }

      // ----------------------------------------------------------
      // Timestamp
      // ----------------------------------------------------------

      const ts = payload.timestamp;

      if (
        typeof ts === "number" &&
        ts > 0
      ) {
        enviadoEm = new Date(
          ts * 1000
        ).toISOString();
      }

      // Caso alguma versão da WAHA envie timestamp em milissegundos.
      if (
        typeof ts === "number" &&
        ts > 100000000000
      ) {
        enviadoEm = new Date(
          ts
        ).toISOString();
      }
    }

    // ============================================================
    // FORMATO EVOLUTION API
    // ============================================================

    else if (
      data &&
      (
        typeof body.instance === "string" ||
        body.event === "messages.upsert"
      )
    ) {
      sessaoId = body.instance as string;

      const key = data.key as
        | Record<string, unknown>
        | undefined;

      const jid =
        typeof key?.remoteJid === "string"
          ? key.remoteJid
          : "";

      numero = extrairNumeroDeJid(jid);

      origem =
        key?.fromMe === true
          ? "enviada"
          : "recebida";

      const mensagem = data.message as
        | Record<string, unknown>
        | undefined;

      conteudo =
        extrairTextoDaMensagem(mensagem);

      tipo =
        extrairTipoDoBody(mensagem);

      nomeContato =
        typeof data.pushName === "string"
          ? data.pushName
          : null;

      const ts =
        data.messageTimestamp;

      if (
        typeof ts === "number" &&
        ts > 0
      ) {
        enviadoEm = new Date(
          ts * 1000
        ).toISOString();
      }
    }

    // ============================================================
    // FORMATO SIMPLES — SIMULADOR DO CRM
    // ============================================================

    else {
      const parsed =
        simpleSchema.parse(body);

      sessaoId =
        parsed.sessaoId;

      numero =
        parsed.numero;

      origem =
        parsed.direction;

      conteudo =
        parsed.texto;

      nomeContato =
        parsed.nomeContato ?? null;

      enviadoEm =
        parsed.timestamp ?? null;
    }

    // ============================================================
    // VALIDAÇÕES FINAIS
    // ============================================================

    if (!sessaoId) {
      return NextResponse.json(
        {
          erro:
            "Sessão WhatsApp não informada.",
        },
        {
          status: 422,
        }
      );
    }

    if (!numero) {
      return NextResponse.json(
        {
          erro:
            "Número do remetente não informado.",
        },
        {
          status: 422,
        }
      );
    }

    if (!conteudo) {
      conteudo = "[Mídia recebida]";
    }

    // ============================================================
    // ENTREGA PARA O CASO DE USO DO POSAT
    // ============================================================

    const resultado =
      await receberMensagemWhatsAppUseCase.execute({
        sessaoId,
        numero,
        origem,
        conteudo,
        nomeContato,
        tipo,
        enviadoEm,
      });

    // ============================================================
    // PAUSA AUTOMÁTICA DE FLUXO (lead respondeu)
    // ============================================================
    // Quando a mensagem veio DO LEAD (recebida), pausa imediatamente
    // todas as execuções de fluxo ativas dele — evita automação
    // "pisando" na conversa humana. Critério de sucesso: até 30s.
    let fluxosPausados = 0;
    if (origem === "recebida" && resultado.conversa?.cliente_id) {
      try {
        fluxosPausados = await pausarFluxoPorRespostaUseCase.execute(
          resultado.conversa.cliente_id,
          conteudo
        );
      } catch (e) {
        console.error("Erro ao pausar fluxos por resposta:", e);
      }
    }

    // ============================================================
    // RESPOSTA
    // ============================================================

    return NextResponse.json(
      {
        ok: true,
        matchCliente:
          resultado.matchCliente,

        registradoNoCrm:
          resultado.registradoNoCrm,

        escalonado:
          resultado.escalonadoParaGestor,

        npsRespondido:
          resultado.npsRespondido,

        conversaId:
          resultado.conversa.id,

        mensagemId:
          resultado.mensagem.id,

        espelhando:
          resultado.conversa.espelhando,

        fluxosPausados,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "========== ERRO WEBHOOK WHATSAPP =========="
    );

    console.error(error);

    console.error(
      error instanceof Error
        ? error.stack
        : "Sem stack disponível"
    );

    console.error(
      "==========================================="
    );

    return NextResponse.json(
      {
        erro:
          "Erro ao processar webhook WhatsApp.",

        detalhe:
          error instanceof Error
            ? error.message
            : "Erro desconhecido",
      },
      {
        status: 500,
      }
    );
  }
}
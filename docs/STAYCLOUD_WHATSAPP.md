# StayCloud + Evolution API — Integração WhatsApp → CRM

> **Desativado:** as telas e endpoints de WhatsApp estão indisponíveis, os webhooks
> são rejeitados e os fluxos não enviam mensagens. Este documento descreve uma
> integração antiga e não deve ser usado para configurar o sistema atual.

Parte 1 — StayCloud: hospedar o WhatsApp (infraestrutura)

A arquitetura correta é: o WhatsApp fica conectado num gateway chamado Evolution API (open source, o mais usado no Brasil), rodando na VPS da StayCloud. É ele que mantém a sessão 24/7 e entrega as mensagens para o seu CRM.

Passo 1 — Criar a VPS na StayCloud

Entre em staycloud.com e contrate um plano VPS Cloud (acesso root, pagamento em real, sem fidelidade). Para a Evolution API, o mínimo recomendado é 2 vCPU / 4 GB RAM — ela consome memória para manter várias sessões de WhatsApp ativas.

Passo 2 — Instalar a Evolution API em 1 clique

No painel da StayCloud, ao criar a VPS, escolha a opção de aplicação em 1 clique → Evolution API. A StayCloud provisiona o servidor já com o gateway instalado e configurado (documentação oficial: docs.evolutionfoundation.com.br).

Passo 3 — Pegar a URL da API e a chave de acesso

Quando o VPS estiver pronto, o painel mostra a URL da Evolution API (ex.: https://evo.seudominio.com.br) e a API Key (token de autenticação). Guarde os dois — serão usados para o CRM se comunicar com o WhatsApp.

Passo 4 — Conectar o WhatsApp do corretor (QR code)

Acesse o painel da Evolution (o "Manager"), crie uma instância com o nome do corretor (ex.: corretor_joao) e clique em Conectar. Vai aparecer um QR code — o corretor escaneia com o WhatsApp dele, igual ao WhatsApp Web. A partir daí a sessão fica viva no servidor, mesmo com o celular dele offline.

Passo 5 — Configurar o webhook (o "cano" que entrega as mensagens)

Na instância, configure o webhook de eventos:
- Evento: messages.upsert (recebe toda mensagem nova)
- URL: https://seu-crm.com/api/webhook/whatsapp
- Header de autenticação: a API Key (ou um token só para webhooks)

Pronto: toda mensagem que chegar no WhatsApp daquele corretor será enviada automaticamente para o seu CRM. Isso é o que mantém o sistema sincronizado 24h.

Parte 2 — O que adicionar no sistema (Lovable)

2.1. Prompt pronto para colar no Lovable

Adicione ao CRM uma integração completa com WhatsApp via Evolution API:

- Tela "Meu WhatsApp" em que cada corretor conecta sua própria instância: o sistema cria a instância na Evolution API, exibe o QR code para o corretor escanear e mostra o status (conectado/desconectado).
- Endpoint /api/webhook/whatsapp que recebe os eventos da Evolution (messages.upsert) na URL pública do app, autenticando via header.
- Ao receber uma mensagem: identificar o corretor pela instância de origem, normalizar o número do remetente para formato internacional (55 + DDD + número) e buscar o atendimento ativo daquele corretor cujo telefone corresponda ao número.
- Se encontrar: registrar a mensagem no histórico do atendimento, atualizar a última interação e a etapa do funil. Se não encontrar: criar um novo lead, marcado como "aguardando classificação".
- Permitir responder pelo mesmo número pelo painel (chamada POST /message/sendText da Evolution), mantendo a conversa sincronizada nos dois lados.

2.2. Código da lógica de cruzamento (o coração do sistema)

Esse trecho normaliza o número e encontra o atendimento ativo do corretor — cole na parte do backend que recebe o webhook:

```js
// 1. Normaliza qualquer formato para o padrão internacional do WhatsApp (55 + DDD + número)
function normalizarNumero(raw) {
  let d = String(raw).replace(/\D/g, '').replace('@s.whatsapp.net', '');
  if (d.startsWith('55') && d.length > 12) d = d.slice(2);      // remove 55 duplicado
  if (d.length === 10) d = d.slice(0, 2) + '9' + d.slice(2);    // (DDD + 8 díg.) → adiciona o 9
  if (d.length === 11) d = '55' + d;                            // garante o código do país
  return d;                                                     // ex.: 5511998765432
}

// 2. Cruzamento: acha o atendimento ativo cujo telefone bate com o número
function acharAtendimento(numeroRemetente, atendimentosAtivos) {
  const alvo = normalizarNumero(numeroRemetente);
  return atendimentosAtivos.find(a =>
    [a.telefone, a.telefone2].filter(Boolean)
      .some(t => normalizarNumero(t) === alvo)
  );
}

// 3. Uso no webhook
app.post('/api/webhook/whatsapp', (req, res) => {
  const { instance, data } = req.body;              // instance = corretor, data.message = conversa
  const remetente = data.key.remoteJid;             // ex.: "5511998765432@s.whatsapp.net"
  const corretor = buscarCorretorPorInstancia(instance);
  const atendimento = acharAtendimento(remetente, corretor.atendimentosAtivos);

  if (atendimento) {
    registrarMensagem(atendimento.id, data.message);       // histórico + última interação
    atualizarFunil(atendimento.id);                        // funil atualizado automaticamente
  } else {
    criarLeadPendente(corretor.id, remetente, data.message);
  }
  res.sendStatus(200);
});
```

O fluxo total fica assim: WhatsApp do corretor → Evolution API (VPS StayCloud) → webhook → CRM (Lovable) → cruzamento por número → atendimento atualizado.

## Resumindo

A parte da StayCloud é rápida: VPS com Evolution API em 1 clique, criar instância, escanear QR e configurar o webhook — sem precisar instalar nada na mão.

No Lovable, o essencial é o prompt (tela de conexão, endpoint webhook, cruzamento e resposta) + a lógica de normalização/cruzamento de números acima.

O cruzamento identifica o corretor pela instância e o atendimento pelo número normalizado, atualizando histórico e funil automaticamente.
// =====================================================
// CORE DOMAIN – Business Rules
// Pure functions. No framework, no DB, no HTTP.
// =====================================================

import {
  DadosParaClassificacao,
  FinalidadeCliente,
  NivelConfianca,
  ResultadoClassificacao,
} from "../entities/types";

// ---- Completude ----

interface CampoComPeso {
  nome: string;
  preenchido: boolean;
  peso: number;
}

export function calcularCompletude(dados: DadosParaClassificacao): number {
  const campos: CampoComPeso[] = [
    { nome: "nome", preenchido: Boolean(dados.nome), peso: 10 },
    { nome: "telefone", preenchido: Boolean(dados.telefone), peso: 10 },
    { nome: "email", preenchido: Boolean(dados.email), peso: 5 },
    { nome: "finalidade_declarada", preenchido: Boolean(dados.finalidadeDeclarada), peso: 15 },
    { nome: "regiao_interesse", preenchido: Boolean(dados.regiaoInteresse || dados.cidadeInteresse || dados.bairroInteresse), peso: 10 },
    { nome: "tipo_imovel", preenchido: Boolean(dados.tipoImovel), peso: 10 },
    { nome: "faixa_de_valor", preenchido: dados.valorMinimo != null || dados.valorMaximo != null, peso: 15 },
    { nome: "prazo_compra", preenchido: Boolean(dados.prazoCompra), peso: 10 },
    { nome: "forma_pagamento", preenchido: Boolean(dados.formaPagamento), peso: 10 },
    { nome: "ja_possui_imovel", preenchido: dados.jaPossuiImovel != null, peso: 5 },
    { nome: "precisa_financiamento", preenchido: dados.precisaFinanciamento != null, peso: 5 },
    { nome: "padrao_imovel", preenchido: Boolean(dados.padraoImovel), peso: 5 },
  ];

  const totalPeso = campos.reduce((sum, c) => sum + c.peso, 0);
  const pesoPreen = campos
    .filter((c) => c.preenchido)
    .reduce((sum, c) => sum + c.peso, 0);

  return Math.round((pesoPreen / totalPeso) * 100);
}

export function detectarCamposFaltantes(dados: DadosParaClassificacao): string[] {
  const faltantes: string[] = [];
  if (!dados.nome) faltantes.push("nome");
  if (!dados.telefone && !dados.email) faltantes.push("telefone_ou_email");
  if (!dados.finalidadeDeclarada) faltantes.push("finalidade");
  if (!dados.regiaoInteresse && !dados.cidadeInteresse && !dados.bairroInteresse)
    faltantes.push("regiao_interesse");
  if (!dados.tipoImovel) faltantes.push("tipo_imovel");
  if (dados.valorMinimo == null && dados.valorMaximo == null) faltantes.push("faixa_de_valor");
  if (!dados.prazoCompra) faltantes.push("prazo_compra");
  if (!dados.formaPagamento) faltantes.push("forma_pagamento");
  return faltantes;
}

// ---- Classification ----

function textoNormalizado(valor?: string | null): string {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function contemPalavras(texto: string, palavras: string[]): boolean {
  return palavras.some((p) => texto.includes(p));
}

export function classificarCliente(dados: DadosParaClassificacao): ResultadoClassificacao {
  const declarada = textoNormalizado(dados.finalidadeDeclarada);
  const obs = textoNormalizado(dados.observacoes);
  const texto = `${declarada} ${obs}`;

  const sinais: string[] = [];
  const finalidades: FinalidadeCliente[] = [];

  // --- Investimento ---
  if (
    dados.eInvestidorConfirmado ||
    contemplaPalavras(texto, ["investir", "investimento", "renda", "locacao", "aluguel", "yield", "rentabilidade", "airbnb", "fundo"])
  ) {
    if (dados.eInvestidorConfirmado) {
      sinais.push("Cliente declarou ou confirmou interesse direto em investimento");
      finalidades.unshift("investimento");
    } else {
      sinais.push("Palavras-chave de investimento detectadas no texto");
      finalidades.push("possivel_investidor");
    }
    if (contemplaPalavras(texto, ["studio", "studios", "compacto", "1 dorm"])) {
      sinais.push("Interesse explícito em studios para locação de curta e longa estadia");
    }
  }

  // --- Recorrente ---
  if (
    (dados.quantidadeImoveis ?? 0) >= 2 ||
    contemplaPalavras(texto, ["recorrente", "varias unidades", "portfolio", "carteira", "lancamento"])
  ) {
    sinais.push("Investidor frequente confirmado com múltiplas aquisições anteriores");
    if (!finalidades.includes("investimento")) finalidades.push("investimento");
    finalidades.push("cliente_recorrente");
  }

  // --- Upgrade ---
  if (contemplaPalavras(texto, ["upgrade", "trocar", "mudar", "maior", "ampliar", "vender o atual"])) {
    sinais.push("Cliente demonstra intenção de trocar ou ampliar o imóvel");
    finalidades.push("upgrade");
  }

  // --- Primeiro imóvel ---
  if (
    (!dados.jaPossuiImovel && dados.jaPossuiImovel !== null) ||
    contemplaPalavras(texto, ["primeiro imovel", "sair do aluguel", "fgts", "minha casa", "financiamento"])
  ) {
    sinais.push("Cliente informou busca ativa pelo primeiro imóvel");
    finalidades.push("primeiro_imovel");
  }

  // --- Moradia ---
  if (contemplaPalavras(texto, ["moradia", "morar", "residencia", "casa propria", "familia"])) {
    sinais.push("Cliente busca imóvel para uso residencial próprio");
    finalidades.push("moradia");
  }

  // --- Segunda residência ---
  if (contemplaPalavras(texto, ["segunda residencia", "segunda casa", "final de semana", "campo", "praia", "litoral", "lazer"])) {
    sinais.push("Cliente demonstra interesse em segunda residência ou lazer");
    finalidades.push("segunda_residencia");
  }

  // --- Comercial ---
  if (contemplaPalavras(texto, ["comercial", "sala", "escritorio", "loja", "galpao", "pj"])) {
    sinais.push("Imóvel de uso comercial ou misto identificado");
    finalidades.push("imovel_comercial");
  }

  // --- Compra para familiar ---
  if (contemplaPalavras(texto, ["filho", "filha", "pai", "mae", "familiar", "parente", "presentear"])) {
    sinais.push("Imóvel destinado a familiar identificado");
    finalidades.push("compra_para_familiar");
  }

  // --- Indicação ---
  if (contemplaPalavras(texto, ["indica", "parceiro", "network", "conhecidos"])) {
    sinais.push("Potencial de indicação para rede de contatos");
    finalidades.push("potencial_indicacao");
  }

  const finalidadePrincipal: FinalidadeCliente =
    finalidades.length > 0 ? finalidades[0] : "nao_identificado";
  const finalidadesSecundarias = finalidades.slice(1).filter((f) => f !== finalidadePrincipal);

  // --- Nível de confiança ---
  let nivelConfianca: NivelConfianca = "baixa";
  const camposFaltantes = detectarCamposFaltantes(dados);
  const completude = calcularCompletude(dados);

  if (completude >= 80 && sinais.length >= 2 && camposFaltantes.length <= 1) {
    nivelConfianca = "alta";
  } else if (completude >= 50 && sinais.length >= 1) {
    nivelConfianca = "media";
  } else if (sinais.length === 0 && camposFaltantes.length >= 4) {
    nivelConfianca = "revisao_necessaria";
  }

  // --- Próxima ação ---
  const proximaAcao = gerarProximaAcao(finalidadePrincipal, camposFaltantes);

  return {
    finalidadePrincipal,
    finalidadesSecundarias,
    nivelConfianca,
    sinais,
    camposFaltantes,
    proximaAcao,
  };
}

function contemplaPalavras(texto: string, palavras: string[]): boolean {
  return palavras.some((p) => texto.includes(p));
}

function gerarProximaAcao(finalidade: FinalidadeCliente, camposFaltantes: string[]): string {
  if (camposFaltantes.length >= 3) {
    return "Completar qualificação básica: " + camposFaltantes.slice(0, 3).join(", ") + ".";
  }
  const acoes: Record<FinalidadeCliente, string> = {
    investimento: "Apresentar opções de carteira compatíveis com taxa de retorno, liquidez e valorização.",
    possivel_investidor: "Confirmar perfil de investidor e oferecer análise de rentabilidade.",
    primeiro_imovel: "Oferecer consultoria especializada sobre simulação de financiamento, entrada e documentação.",
    moradia: "Apresentar opções de moradia alinhadas ao orçamento e região de preferência.",
    upgrade: "Avaliar imóvel atual e apresentar opções compatíveis com a necessidade de expansão.",
    segunda_residencia: "Apresentar empreendimentos com infraestrutura de lazer, praia ou campo.",
    compra_para_familiar: "Entender necessidades do familiar e alinhar expectativas de localização e budget.",
    locacao: "Apresentar opções com alto índice de liquidez para locação no bairro de interesse.",
    imovel_comercial: "Mapear necessidades comerciais e apresentar espaços adequados ao negócio.",
    cliente_recorrente: "Enviar relatório mensal de valorização das unidades e prévias exclusivas.",
    potencial_indicacao: "Identificar perfil da rede de contatos e acionar programa de indicação.",
    nao_identificado: "Confirmar se o imóvel é para moradia, primeiro imóvel ou investimento.",
  };
  return acoes[finalidade];
}

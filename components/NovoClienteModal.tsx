"use client";

import { useState, useMemo } from "react";
import {
  X,
  UserPlus,
  Sparkles,
  Building,
  DollarSign,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { classificarCliente, calcularCompletude } from "@/core/domain/rules/classificacao";
import { executeGraphQL, MUTATIONS } from "@/lib/graphql-client";
import { DadosCliente } from "@/lib/segmentacao/tipos";
import { finalidadeConfig, confiancaConfig } from "./ClienteCard";

interface NovoClienteModalProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: () => void;
}

export default function NovoClienteModal({
  aberto,
  aoFechar,
  aoSalvar,
}: NovoClienteModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [origem, setOrigem] = useState<
    "crm" | "formulario" | "whatsapp" | "site" | "supabase" | "planilha" | "manual" | "outro"
  >("formulario");

  const [finalidadeDeclarada, setFinalidadeDeclarada] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [regiaoInteresse, setRegiaoInteresse] = useState("");
  const [cidadeInteresse, setCidadeInteresse] = useState("São Paulo");
  const [bairroInteresse, setBairroInteresse] = useState("");

  const [tipoImovel, setTipoImovel] = useState("");
  const [padraoImovel, setPadraoImovel] = useState("Alto Padrão");

  const [valorMinimo, setValorMinimo] = useState<string>("");
  const [valorMaximo, setValorMaximo] = useState<string>("");

  const [prazoCompra, setPrazoCompra] = useState("1 a 3 meses");
  const [formaPagamento, setFormaPagamento] = useState("Financiamento bancário");
  const [precisaFinanciamento, setPrecisaFinanciamento] = useState<boolean>(true);

  const [jaPossuiImovel, setJaPossuiImovel] = useState<boolean>(false);
  const [eInvestidorConfirmado, setEInvestidorConfirmado] = useState<boolean>(false);
  const [quantidadeImoveis, setQuantidadeImoveis] = useState<string>("0");

  // Real-time live inference preview
  const dadosParaCalculo: DadosCliente = useMemo(() => {
    return {
      nome: nome || null,
      telefone: telefone || null,
      email: email || null,
      finalidadeDeclarada: finalidadeDeclarada || null,
      observacoes: observacoes || null,
      regiaoInteresse: regiaoInteresse || null,
      cidadeInteresse: cidadeInteresse || null,
      bairroInteresse: bairroInteresse || null,
      tipoImovel: tipoImovel || null,
      padraoImovel: padraoImovel || null,
      valorMinimo: valorMinimo ? Number(valorMinimo) : null,
      valorMaximo: valorMaximo ? Number(valorMaximo) : null,
      prazoCompra: prazoCompra || null,
      formaPagamento: formaPagamento || null,
      precisaFinanciamento,
      jaPossuiImovel,
      eInvestidorConfirmado,
      quantidadeImoveis: quantidadeImoveis ? Number(quantidadeImoveis) : 0,
    };
  }, [
    nome,
    telefone,
    email,
    finalidadeDeclarada,
    observacoes,
    regiaoInteresse,
    cidadeInteresse,
    bairroInteresse,
    tipoImovel,
    padraoImovel,
    valorMinimo,
    valorMaximo,
    prazoCompra,
    formaPagamento,
    precisaFinanciamento,
    jaPossuiImovel,
    eInvestidorConfirmado,
    quantidadeImoveis,
  ]);

  const previewClassificacao = useMemo(
    () => classificarCliente(dadosParaCalculo),
    [dadosParaCalculo]
  );
  const previewCompletude = useMemo(
    () => calcularCompletude(dadosParaCalculo),
    [dadosParaCalculo]
  );

  const finalidadeObj =
    finalidadeConfig[previewClassificacao.finalidadePrincipal] ||
    finalidadeConfig.nao_identificado;
  const confiancaObj =
    confiancaConfig[previewClassificacao.nivelConfianca] ||
    confiancaConfig.baixa;

  if (!aberto) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      const payload = {
        nome: nome.trim() || undefined,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
        documento: documento.trim() || undefined,
        origem,
        finalidadeDeclarada: finalidadeDeclarada.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        regiaoInteresse: regiaoInteresse.trim() || undefined,
        cidadeInteresse: cidadeInteresse.trim() || undefined,
        bairroInteresse: bairroInteresse.trim() || undefined,
        tipoImovel: tipoImovel.trim() || undefined,
        padraoImovel: padraoImovel.trim() || undefined,
        valorMinimo: valorMinimo ? Number(valorMinimo) : null,
        valorMaximo: valorMaximo ? Number(valorMaximo) : null,
        prazoCompra: prazoCompra.trim() || undefined,
        formaPagamento: formaPagamento.trim() || undefined,
        precisaFinanciamento,
        jaPossuiImovel,
        eInvestidorConfirmado,
        quantidadeImoveis: quantidadeImoveis ? Number(quantidadeImoveis) : 0,
      };

      try {
        await executeGraphQL(MUTATIONS.CRIAR_CLIENTE, {
          input: {
            pessoa: {
              nome: payload.nome,
              telefone: payload.telefone,
              email: payload.email,
              documento: payload.documento,
              origem: payload.origem,
              finalidadeDeclarada: payload.finalidadeDeclarada,
              observacoes: payload.observacoes,
            },
            cliente: {
              regiaoInteresse: payload.regiaoInteresse,
              cidadeInteresse: payload.cidadeInteresse,
              bairroInteresse: payload.bairroInteresse,
              tipoImovel: payload.tipoImovel,
              padraoImovel: payload.padraoImovel,
              valorMinimo: payload.valorMinimo,
              valorMaximo: payload.valorMaximo,
              prazoCompra: payload.prazoCompra,
              formaPagamento: payload.formaPagamento,
              precisaFinanciamento: payload.precisaFinanciamento,
              jaPossuiImovel: payload.jaPossuiImovel,
              eInvestidorConfirmado: payload.eInvestidorConfirmado,
            },
          },
        });
        aoSalvar();
      } catch (gqlErr) {
        // Fallback to REST
        const res = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.erro || json.detalhe || "Erro ao salvar cliente.");
        }

        aoSalvar();
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setSalvando(false);
    }
  }

  const inputClass =
    "w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-slate-900 focus:outline-none transition dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100";
  const selectClass =
    "w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-transparent focus:ring-2 focus:ring-slate-900 focus:outline-none transition dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-100";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5 dark:text-zinc-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/75">
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-8 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                Cadastro Unificado de Lead / Cliente
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Normalização, motor de segmentação e índice de completude em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={aoFechar}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Segmenter Badge Bar */}
        <div className="my-4 shrink-0 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-200">
                Inferência do Motor:
              </span>
              <span
                className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${finalidadeObj.bg} ${finalidadeObj.text} ${finalidadeObj.border}`}
              >
                {finalidadeObj.label}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${confiancaObj.bg}`}
              >
                {confiancaObj.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-zinc-400">Completude:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {previewCompletude}%
              </span>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-300 dark:bg-zinc-100"
                  style={{ width: `${previewCompletude}%` }}
                />
              </div>
            </div>
          </div>

          {previewClassificacao.sinais.length > 0 && (
            <div className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              <span className="font-semibold">Sinais identificados: </span>
              {previewClassificacao.sinais.join(" • ")}
            </div>
          )}
        </div>

        {erro && (
          <div className="mx-6 mb-3 flex shrink-0 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 sm:mx-8 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Form Body */}
        <form id="form-novo-cliente" onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-6 pb-6 sm:px-8">
          {/* Section 1: Dados Pessoais */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              1. Identificação e Contato
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="carlos@exemplo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  CPF / Documento
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Canal de Origem
                </label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value as any)}
                  className={selectClass}
                >
                  <option value="formulario">Formulário Landing Page</option>
                  <option value="whatsapp">WhatsApp Direto</option>
                  <option value="crm">CRM Integrado</option>
                  <option value="site">Site Oficial</option>
                  <option value="planilha">Planilha / Importação</option>
                  <option value="manual">Manual / Indicação</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Investidor Confirmado?
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={eInvestidorConfirmado}
                      onChange={(e) => setEInvestidorConfirmado(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-zinc-600 dark:text-zinc-100 dark:focus:ring-zinc-100"
                    />
                    <span>Sim, perfil investidor</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Finalidade e Intenção */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              2. Finalidade e Análise Textual
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Finalidade Declarada pelo Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Quero comprar para investir em studios para aluguel"
                  value={finalidadeDeclarada}
                  onChange={(e) => setFinalidadeDeclarada(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Observações e Contexto do Atendimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Está comparando bairros e busca alta valorização"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Preferências do Imóvel & Localização */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              3. Preferência de Imóvel e Localização
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Região de Interesse
                </label>
                <input
                  type="text"
                  placeholder="Ex: Zona Sul"
                  value={regiaoInteresse}
                  onChange={(e) => setRegiaoInteresse(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Bairro(s) de Preferência
                </label>
                <input
                  type="text"
                  placeholder="Ex: Moema, Itaim, Vila Mariana"
                  value={bairroInteresse}
                  onChange={(e) => setBairroInteresse(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Tipo de Imóvel
                </label>
                <input
                  type="text"
                  placeholder="Ex: Studio compacto / Apartamento 3 dorms"
                  value={tipoImovel}
                  onChange={(e) => setTipoImovel(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Condições Financeiras e Prazos */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              4. Faixa de Investimento e Condições
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className={labelClass}>
                  Valor Máximo (R$)
                </label>
                <input
                  type="number"
                  placeholder="650000"
                  value={valorMaximo}
                  onChange={(e) => setValorMaximo(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Prazo Pretendido
                </label>
                <select
                  value={prazoCompra}
                  onChange={(e) => setPrazoCompra(e.target.value)}
                  className={selectClass}
                >
                  <option value="Imediato">Imediato (30 dias)</option>
                  <option value="1 a 3 meses">1 a 3 meses</option>
                  <option value="3 a 6 meses">3 a 6 meses</option>
                  <option value="6 a 12 meses">6 a 12 meses</option>
                  <option value="Planejamento futuro">Planejamento futuro</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Forma de Pagamento
                </label>
                <input
                  type="text"
                  placeholder="Financiamento parcial / À vista"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Imóveis que já possui
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantidadeImoveis}
                  onChange={(e) => {
                    setQuantidadeImoveis(e.target.value);
                    setJaPossuiImovel(Number(e.target.value) > 0);
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions (fixed outside scroll) */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 sm:px-8 dark:border-zinc-700">
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-novo-cliente"
            disabled={salvando}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {salvando ? "Processando e Classificando..." : "Salvar e Classificar"}
          </button>
        </div>
      </div>
    </div>
  );
}

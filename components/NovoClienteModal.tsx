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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative my-8 w-full max-w-4xl rounded-3xl border border-[#d9d2c6] bg-[#fffdf8] p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#ede6d8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b25c3f] text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e2722]">
                Cadastro Unificado de Lead / Cliente
              </h2>
              <p className="text-xs text-[#68706a]">
                Normalização, motor de segmentação e índice de completude em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={aoFechar}
            className="rounded-xl p-2 text-[#68706a] hover:bg-[#f5f1e9] hover:text-[#1e2722] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Segmenter Badge Bar */}
        <div className="my-5 rounded-2xl border border-[#d9d2c6] bg-[#f7f4ec] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#b25c3f]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e2722]">
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
              <span className="text-xs text-[#68706a]">Completude:</span>
              <span className="font-bold text-sm text-[#1e2722]">
                {previewCompletude}%
              </span>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-[#ded6c7]">
                <div
                  className="h-full bg-[#b25c3f] transition-all duration-300"
                  style={{ width: `${previewCompletude}%` }}
                />
              </div>
            </div>
          </div>

          {previewClassificacao.sinais.length > 0 && (
            <div className="mt-2 text-xs text-[#5b625d]">
              <span className="font-semibold">Sinais identificados: </span>
              {previewClassificacao.sinais.join(" • ")}
            </div>
          )}
        </div>

        {erro && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Dados Pessoais */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b25c3f] mb-3">
              1. Identificação e Contato
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="carlos@exemplo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  CPF / Documento
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Canal de Origem
                </label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value as any)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
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
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Investidor Confirmado?
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-1.5 text-xs text-[#1e2722] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eInvestidorConfirmado}
                      onChange={(e) => setEInvestidorConfirmado(e.target.checked)}
                      className="rounded border-[#d9d2c6] text-[#b25c3f] focus:ring-[#b25c3f]"
                    />
                    <span>Sim, perfil investidor</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Finalidade e Intenção */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b25c3f] mb-3">
              2. Finalidade e Análise Textual
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Finalidade Declarada pelo Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Quero comprar para investir em studios para aluguel"
                  value={finalidadeDeclarada}
                  onChange={(e) => setFinalidadeDeclarada(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Observações e Contexto do Atendimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Está comparando bairros e busca alta valorização"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Preferências do Imóvel & Localização */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b25c3f] mb-3">
              3. Preferência de Imóvel e Localização
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Região de Interesse
                </label>
                <input
                  type="text"
                  placeholder="Ex: Zona Sul"
                  value={regiaoInteresse}
                  onChange={(e) => setRegiaoInteresse(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Bairro(s) de Preferência
                </label>
                <input
                  type="text"
                  placeholder="Ex: Moema, Itaim, Vila Mariana"
                  value={bairroInteresse}
                  onChange={(e) => setBairroInteresse(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Tipo de Imóvel
                </label>
                <input
                  type="text"
                  placeholder="Ex: Studio compacto / Apartamento 3 dorms"
                  value={tipoImovel}
                  onChange={(e) => setTipoImovel(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Condições Financeiras e Prazos */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b25c3f] mb-3">
              4. Faixa de Investimento e Condições
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Valor Máximo (R$)
                </label>
                <input
                  type="number"
                  placeholder="650000"
                  value={valorMaximo}
                  onChange={(e) => setValorMaximo(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Prazo Pretendido
                </label>
                <select
                  value={prazoCompra}
                  onChange={(e) => setPrazoCompra(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                >
                  <option value="Imediato">Imediato (30 dias)</option>
                  <option value="1 a 3 meses">1 a 3 meses</option>
                  <option value="3 a 6 meses">3 a 6 meses</option>
                  <option value="6 a 12 meses">6 a 12 meses</option>
                  <option value="Planejamento futuro">Planejamento futuro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
                  Forma de Pagamento
                </label>
                <input
                  type="text"
                  placeholder="Financiamento parcial / À vista"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2722] mb-1">
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
                  className="w-full rounded-xl border border-[#d9d2c6] bg-white px-3.5 py-2.5 text-xs text-[#1e2722] focus:border-[#b25c3f] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#ede6d8] pt-4">
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-xl border border-[#d9d2c6] bg-white px-5 py-2.5 text-xs font-semibold text-[#5b625d] hover:bg-[#f5f1e9] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-xl bg-[#1e2722] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#b25c3f] transition disabled:opacity-50"
            >
              {salvando ? "Processando e Classificando..." : "Salvar e Classificar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

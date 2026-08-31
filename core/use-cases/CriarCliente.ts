import {
  IPessoaRepository,
  IClienteRepository,
} from "../ports/out/repositories";
import {
  ICriarClienteUseCase,
  ICriarClienteInput,
} from "../ports/in/use-cases";
import {
  classificarCliente,
  calcularCompletude,
} from "../domain/rules/classificacao";
import { Cliente, OrigemPessoa, StatusRelacionamento } from "../domain/entities/types";

export class CriarClienteUseCase implements ICriarClienteUseCase {
  constructor(
    private readonly pessoaRepo: IPessoaRepository,
    private readonly clienteRepo: IClienteRepository
  ) {}

  async execute(input: ICriarClienteInput): Promise<Cliente> {
    // 1. Persist pessoa
    const pessoa = await this.pessoaRepo.create({
      nome: input.pessoa.nome,
      telefone: input.pessoa.telefone,
      email: input.pessoa.email,
      documento: input.pessoa.documento,
      origem: (input.pessoa.origem as OrigemPessoa) || "manual",
      dados_originais: {
        finalidadeDeclarada: input.pessoa.finalidadeDeclarada,
        observacoes: input.pessoa.observacoes,
      },
    });

    // 2. Run classification rules (pure domain)
    const dadosParaClassificar = {
      nome: input.pessoa.nome,
      telefone: input.pessoa.telefone,
      email: input.pessoa.email,
      finalidadeDeclarada: input.pessoa.finalidadeDeclarada,
      observacoes: input.pessoa.observacoes,
      regiaoInteresse: input.cliente.regiaoInteresse,
      cidadeInteresse: input.cliente.cidadeInteresse,
      bairroInteresse: input.cliente.bairroInteresse,
      tipoImovel: input.cliente.tipoImovel,
      padraoImovel: input.cliente.padraoImovel,
      valorMinimo: input.cliente.valorMinimo,
      valorMaximo: input.cliente.valorMaximo,
      prazoCompra: input.cliente.prazoCompra,
      formaPagamento: input.cliente.formaPagamento,
      precisaFinanciamento: input.cliente.precisaFinanciamento,
      jaPossuiImovel: input.cliente.jaPossuiImovel,
      eInvestidorConfirmado: input.cliente.eInvestidorConfirmado,
    };

    const classificacao = classificarCliente(dadosParaClassificar);
    const completude = calcularCompletude(dadosParaClassificar);

    // 3. Persist cliente with computed values
    const cliente = await this.clienteRepo.create({
      pessoa_id: pessoa.id,
      status: "novo_lead" as StatusRelacionamento,
      finalidade_principal: classificacao.finalidadePrincipal,
      finalidades_secundarias: classificacao.finalidadesSecundarias,
      regiao_interesse: input.cliente.regiaoInteresse ?? null,
      cidade_interesse: input.cliente.cidadeInteresse ?? null,
      bairro_interesse: input.cliente.bairroInteresse ?? null,
      tipo_imovel: input.cliente.tipoImovel ?? null,
      padrao_imovel: input.cliente.padraoImovel ?? null,
      valor_minimo: input.cliente.valorMinimo ?? null,
      valor_maximo: input.cliente.valorMaximo ?? null,
      prazo_compra: input.cliente.prazoCompra ?? null,
      forma_pagamento: input.cliente.formaPagamento ?? null,
      precisa_financiamento: input.cliente.precisaFinanciamento ?? null,
      ja_possui_imovel: input.cliente.jaPossuiImovel ?? null,
      e_investidor_confirmado: input.cliente.eInvestidorConfirmado ?? false,
      indice_completude: completude,
      nivel_confianca: classificacao.nivelConfianca,
      campos_faltantes: classificacao.camposFaltantes,
      sinais_classificacao: classificacao.sinais,
      proxima_acao: classificacao.proximaAcao,
    });

    return { ...cliente, pessoa };
  }
}

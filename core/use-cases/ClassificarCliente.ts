import { IClienteRepository } from "../ports/out/repositories";
import { IClassificarClienteUseCase } from "../ports/in/use-cases";
import {
  classificarCliente,
  calcularCompletude,
} from "../domain/rules/classificacao";
import { ResultadoClassificacao, DadosParaClassificacao } from "../domain/entities/types";

export class ClassificarClienteUseCase implements IClassificarClienteUseCase {
  constructor(private readonly clienteRepo: IClienteRepository) {}

  async execute(clienteId: string): Promise<ResultadoClassificacao> {
    const cliente = await this.clienteRepo.findById(clienteId);
    if (!cliente) {
      throw new Error(`Cliente não encontrado: ${clienteId}`);
    }

    const dadosParaClassificar: DadosParaClassificacao = {
      nome: cliente.pessoa?.nome,
      telefone: cliente.pessoa?.telefone,
      email: cliente.pessoa?.email,
      finalidadeDeclarada: cliente.finalidade_principal,
      regiaoInteresse: cliente.regiao_interesse,
      cidadeInteresse: cliente.cidade_interesse,
      bairroInteresse: cliente.bairro_interesse,
      tipoImovel: cliente.tipo_imovel,
      padraoImovel: cliente.padrao_imovel,
      valorMinimo: cliente.valor_minimo,
      valorMaximo: cliente.valor_maximo,
      prazoCompra: cliente.prazo_compra,
      formaPagamento: cliente.forma_pagamento,
      precisaFinanciamento: cliente.precisa_financiamento,
      jaPossuiImovel: cliente.ja_possui_imovel,
      eInvestidorConfirmado: cliente.e_investidor_confirmado,
      observacoes: (cliente.pessoa?.dados_originais as any)?.observacoes,
    };

    const resultado = classificarCliente(dadosParaClassificar);
    const completude = calcularCompletude(dadosParaClassificar);

    await this.clienteRepo.update(clienteId, {
      finalidade_principal: resultado.finalidadePrincipal,
      finalidades_secundarias: resultado.finalidadesSecundarias,
      indice_completude: completude,
      nivel_confianca: resultado.nivelConfianca,
      campos_faltantes: resultado.camposFaltantes,
      sinais_classificacao: resultado.sinais,
      proxima_acao: resultado.proximaAcao,
    });

    return resultado;
  }
}

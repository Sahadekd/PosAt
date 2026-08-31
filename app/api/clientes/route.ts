import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarClienteUseCase, listarClientesUseCase } from "@/core/container";

const clienteSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  telefone: z.string().trim().optional(),
  email: z.string().email().optional().or(z.literal("")),
  documento: z.string().trim().optional(),
  finalidadeDeclarada: z.string().optional(),
  observacoes: z.string().optional(),
  regiaoInteresse: z.string().optional(),
  cidadeInteresse: z.string().optional(),
  bairroInteresse: z.string().optional(),
  tipoImovel: z.string().optional(),
  padraoImovel: z.string().optional(),
  valorMinimo: z.number().nonnegative().nullable().optional(),
  valorMaximo: z.number().nonnegative().nullable().optional(),
  prazoCompra: z.string().optional(),
  formaPagamento: z.string().optional(),
  precisaFinanciamento: z.boolean().nullable().optional(),
  jaPossuiImovel: z.boolean().nullable().optional(),
  eInvestidorConfirmado: z.boolean().nullable().optional(),
  quantidadeImoveis: z.number().int().nonnegative().nullable().optional(),
  origem: z
    .enum([
      "crm",
      "formulario",
      "whatsapp",
      "site",
      "supabase",
      "planilha",
      "manual",
      "outro",
    ])
    .default("manual"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dados = clienteSchema.parse(body);

    const input = {
      pessoa: {
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email,
        documento: dados.documento,
        origem: dados.origem,
        finalidadeDeclarada: dados.finalidadeDeclarada,
        observacoes: dados.observacoes,
      },
      cliente: {
        regiaoInteresse: dados.regiaoInteresse,
        cidadeInteresse: dados.cidadeInteresse,
        bairroInteresse: dados.bairroInteresse,
        tipoImovel: dados.tipoImovel,
        padraoImovel: dados.padraoImovel,
        valorMinimo: dados.valorMinimo,
        valorMaximo: dados.valorMaximo,
        prazoCompra: dados.prazoCompra,
        formaPagamento: dados.formaPagamento,
        precisaFinanciamento: dados.precisaFinanciamento,
        jaPossuiImovel: dados.jaPossuiImovel,
        eInvestidorConfirmado: dados.eInvestidorConfirmado,
      },
    };

    const cliente = await criarClienteUseCase.execute(input);

    return NextResponse.json(
      {
        cliente,
        classificacao: {
          finalidadePrincipal: cliente.finalidade_principal,
          finalidadesSecundarias: cliente.finalidades_secundarias,
          nivelConfianca: cliente.nivel_confianca,
          sinais: cliente.sinais_classificacao,
          camposFaltantes: cliente.campos_faltantes,
          proximaAcao: cliente.proxima_acao,
        },
        completude: cliente.indice_completude,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          erro: "Dados inválidos.",
          campos: error.flatten(),
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        erro: "Erro interno ao processar o cliente.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filtros = {
      finalidade: searchParams.get("finalidade"),
      status: searchParams.get("status"),
      regiao: searchParams.get("regiao"),
      confianca: searchParams.get("confianca"),
      completude_maxima: searchParams.get("completude_maxima"),
      busca: searchParams.get("busca"),
    };

    const clientes = await listarClientesUseCase.execute(filtros);
    return NextResponse.json({ clientes });
  } catch {
    return NextResponse.json(
      { erro: "Erro ao buscar clientes." },
      { status: 500 }
    );
  }
}

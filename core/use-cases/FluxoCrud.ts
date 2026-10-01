import { IFluxoRepository } from "../ports/out/repositories";
import { Fluxo, FluxoExecucao, FiltrosFluxo, GrafoFluxo } from "../domain/entities/fluxo";
import { supabaseAdmin } from "@/lib/supabase-admin";

export class ListarFluxosUseCase {
  constructor(private readonly fluxoRepo: IFluxoRepository) {}

  async execute(filtros?: FiltrosFluxo): Promise<Fluxo[]> {
    return this.fluxoRepo.findAll(filtros);
  }
}

export class CriarFluxoUseCase {
  constructor(private readonly fluxoRepo: IFluxoRepository) {}

  async execute(dados: {
    nome: string;
    descricao?: string | null;
    status?: Fluxo["status"];
    e_template?: boolean;
    template_categoria?: string | null;
    responsavel_id?: string | null;
    equipe_escopo?: boolean;
    grafo?: GrafoFluxo;
    criado_por?: string | null;
  }): Promise<Fluxo> {
    if (!dados.nome || !dados.nome.trim()) {
      throw new Error("Nome do fluxo é obrigatório.");
    }

    return this.fluxoRepo.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao ?? null,
      status: dados.status ?? "rascunho",
      e_template: dados.e_template ?? false,
      template_categoria: dados.template_categoria ?? null,
      responsavel_id: dados.responsavel_id ?? null,
      equipe_escopo: dados.equipe_escopo ?? true,
      grafo: dados.grafo ?? { nodes: [], edges: [] },
      criado_por: dados.criado_por ?? null,
    });
  }
}

export class AtualizarFluxoUseCase {
  constructor(private readonly fluxoRepo: IFluxoRepository) {}

  async execute(
    id: string,
    dados: Partial<
      Pick<
        Fluxo,
        | "nome"
        | "descricao"
        | "status"
        | "template_categoria"
        | "responsavel_id"
        | "equipe_escopo"
        | "pausar_quando_responder"
        | "janela_envio_inicio"
        | "janela_envio_fim"
        | "limite_mensagens_por_dia"
        | "grafo"
        | "e_template"
      >
    >
  ): Promise<Fluxo> {
    const existente = await this.fluxoRepo.findById(id);
    if (!existente) {
      throw new Error("Fluxo não encontrado.");
    }

    if (dados.grafo) {
      this.validarGrafo(dados.grafo);
    }

    const atualizado = await this.fluxoRepo.update(id, dados);
    if (!atualizado) {
      throw new Error("Erro ao atualizar fluxo.");
    }
    return atualizado;
  }

  private validarGrafo(grafo: GrafoFluxo): void {
    if (!grafo.nodes || !Array.isArray(grafo.nodes)) {
      throw new Error("Grafo inválido: nodes deve ser um array.");
    }
    if (!grafo.edges || !Array.isArray(grafo.edges)) {
      throw new Error("Grafo inválido: edges deve ser um array.");
    }

    const ids = new Set(grafo.nodes.map((n) => n.id));
    if (ids.size !== grafo.nodes.length) {
      throw new Error("Grafo inválido: IDs de nós duplicados.");
    }

    for (const aresta of grafo.edges) {
      if (!ids.has(aresta.source) || !ids.has(aresta.target)) {
        throw new Error(`Grafo inválido: aresta ${aresta.id} referencia nó inexistente.`);
      }
    }

    // Todo fluxo precisa de exatamente um gatilho
    const gatilhos = grafo.nodes.filter((n) => n.data.tipo === "gatilho");
    if (gatilhos.length > 1) {
      throw new Error("Grafo inválido: apenas um gatilho é permitido.");
    }
  }
}

export class DuplicarFluxoUseCase {
  constructor(private readonly fluxoRepo: IFluxoRepository) {}

  async execute(id: string, criadoPor?: string | null): Promise<Fluxo> {
    const copia = await this.fluxoRepo.duplicar(id, criadoPor);
    if (!copia) {
      throw new Error("Fluxo não encontrado para duplicação.");
    }
    return copia;
  }
}

export class DeletarFluxoUseCase {
  constructor(private readonly fluxoRepo: IFluxoRepository) {}

  async execute(id: string): Promise<boolean> {
    const existente = await this.fluxoRepo.findById(id);
    if (!existente) {
      throw new Error("Fluxo não encontrado.");
    }
    return this.fluxoRepo.delete(id);
  }
}

export class AplicarTemplateUseCase {
  constructor(
    private readonly fluxoRepo: IFluxoRepository,
    private readonly execucaoRepo: import("../ports/out/repositories").IFluxoExecucaoRepository
  ) {}

  /**
   * Aplica template a um lead ou segmento.
   */
  async execute(params: {
    templateId: string;
    clienteIds: string[];
    iniciadoPor?: string | null;
  }): Promise<{ criadas: number; erros: string[] }> {
    const template = await this.fluxoRepo.findById(params.templateId);
    if (!template) {
      throw new Error("Template não encontrado.");
    }
    if (!template.e_template) {
      throw new Error("O fluxo informado não é um template.");
    }
    if (!params.clienteIds.length) {
      return { criadas: 0, erros: [] };
    }

    // Cria uma instância de fluxo para este aplicação (a partir do template)
    const fluxoAplicado = await this.fluxoRepo.create({
      nome: template.nome,
      descricao: template.descricao,
      status: "ativo",
      template_origem_id: template.id,
      e_template: false,
      template_categoria: template.template_categoria,
      responsavel_id: template.responsavel_id,
      equipe_escopo: template.equipe_escopo,
      pausar_quando_responder: template.pausar_quando_responder,
      janela_envio_inicio: template.janela_envio_inicio,
      janela_envio_fim: template.janela_envio_fim,
      limite_mensagens_por_dia: template.limite_mensagens_por_dia,
      grafo: template.grafo,
      criado_por: params.iniciadoPor ?? null,
    });

    const gatilho = fluxoAplicado.grafo.nodes.find((n) => n.data.tipo === "gatilho");
    let criadas = 0;
    const erros: string[] = [];

    for (const clienteId of params.clienteIds) {
      try {
        const existente = await this.execucaoRepo.findAtiva(fluxoAplicado.id, clienteId);
        if (existente) {
          erros.push(`Lead já possui execução ativa neste fluxo.`);
          continue;
        }

        await this.execucaoRepo.create({
          fluxo_id: fluxoAplicado.id,
          cliente_id: clienteId,
          status: "ativa",
          no_atual_id: gatilho?.id ?? null,
          no_atual_estado: "pendente",
          proxima_execucao_em: new Date().toISOString(),
          origem: params.iniciadoPor ? "manual" : "automatica",
          iniciada_por: params.iniciadoPor ?? null,
        });
        criadas++;
      } catch (e) {
        erros.push(`Lead ${clienteId}: ${e instanceof Error ? e.message : "erro"}`);
      }
    }

    return { criadas, erros };
  }
}

export class IniciarExecucaoUseCase {
  constructor(
    private readonly fluxoRepo: IFluxoRepository,
    private readonly execucaoRepo: import("../ports/out/repositories").IFluxoExecucaoRepository
  ) {}

  /**
   * Inicia uma execução do fluxo para um lead específico.
   * Usado para testar o fluxo com leads de teste.
   * Ativa o fluxo automaticamente se necessário (o motor só processa fluxos ativos).
   */
  async execute(params: {
    fluxoId: string;
    clienteId: string;
    iniciadoPor?: string | null;
  }): Promise<FluxoExecucao> {
    const fluxo = await this.fluxoRepo.findById(params.fluxoId);
    if (!fluxo) {
      throw new Error("Fluxo não encontrado.");
    }

    if (supabaseAdmin) {
      const { data: cliente } = await supabaseAdmin
        .from("clientes")
        .select("id")
        .eq("id", params.clienteId)
        .maybeSingle();
      if (!cliente) {
        throw new Error(
          "Lead não encontrado no banco. Crie o lead (nome, telefone, email) antes de iniciar o teste."
        );
      }
    }

    const existente = await this.execucaoRepo.findAtiva(params.fluxoId, params.clienteId);
    if (existente) {
      throw new Error("Lead já possui execução ativa neste fluxo.");
    }

    const gatilho = fluxo.grafo.nodes.find((n) => n.data.tipo === "gatilho");

    const execucao = await this.execucaoRepo.create({
      fluxo_id: fluxo.id,
      cliente_id: params.clienteId,
      status: "ativa",
      no_atual_id: gatilho?.id ?? null,
      no_atual_estado: "pendente",
      proxima_execucao_em: new Date().toISOString(),
      origem: "manual",
      iniciada_por: params.iniciadoPor ?? null,
    });

    // O motor só processa fluxos ativos — ativa para não travar o teste
    if (fluxo.status !== "ativo") {
      await this.fluxoRepo.update(fluxo.id, { status: "ativo" });
    }

    return execucao;
  }
}

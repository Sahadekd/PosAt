import {
  PAPEIS,
  ROTAS_SISTEMA,
  rotasPadraoDoPapel,
  type Papel,
} from "@/core/domain/papeis";

// Matriz editável cargo × rota, espelhando a abordagem do Flow63/Pedrin0405
// (tabela `role_permissions`). Nesta fase a fonte é memória (mock-first);
// na integração com o Supabase, `role_permissions` passa a ser a fonte real.
const sobreposicoes = new Map<Papel, string[]>();

const ROTAS_VALIDAS = new Set(ROTAS_SISTEMA.map((r) => r.rota));

function validarRotas(rotas: string[]): string[] {
  return [...new Set(rotas)].filter((rota) => ROTAS_VALIDAS.has(rota));
}

/** Rotas que um cargo pode visualizar no momento (sobreposição ou padrão). */
export function rotasPermitidas(papel: Papel): string[] {
  if (papel === "desenvolvedor") {
    return ROTAS_SISTEMA.map((r) => r.rota);
  }
  return sobreposicoes.get(papel) ?? rotasPadraoDoPapel(papel);
}

/** Matriz completa cargo → rotas (o que a tela de Gestão de Acessos edita). */
export function matrizPermissoes(): Record<Papel, string[]> {
  const matriz = {} as Record<Papel, string[]>;
  for (const papel of PAPEIS) {
    matriz[papel] = rotasPermitidas(papel);
  }
  return matriz;
}

/**
 * Substitui as permissões dos cargos informados. O cargo Desenvolvedor é
 * protegido e sempre mantém o acesso total a todas as telas.
 */
export function definirPermissoes(
  novaMatriz: Partial<Record<Papel, string[]>>
): Record<Papel, string[]> {
  for (const [papel, rotas] of Object.entries(novaMatriz)) {
    const p = papel as Papel;
    if (p === "desenvolvedor") continue;
    sobreposicoes.set(p, validarRotas(rotas ?? []));
  }
  return matrizPermissoes();
}

/** Limpa sobreposições, voltando à matriz padrão (derivada de papeis.ts). */
export function restaurarPermissoesPadrao(): Record<Papel, string[]> {
  sobreposicoes.clear();
  return matrizPermissoes();
}
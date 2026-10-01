"use client";

import { useEffect, useMemo, useState } from "react";
import { pode, type Modulo, type ModuloAcao, type Papel } from "@/core/domain/papeis";

export type UsuarioPermissoes = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  papel_label: string;
  modulos: { modulo: Modulo; acoes: string[] }[];
  rotas: string[];
};

export interface UsePermissionsResult {
  usuario: UsuarioPermissoes | null;
  papel: Papel | null;
  carregando: boolean;
  isDesenvolvedor: boolean;
  isGerente: boolean;
  isSecretaria: boolean;
  isCorretor: boolean;
  isCliente: boolean;
  pode: (modulo: Modulo, acao?: ModuloAcao) => boolean;
  podeRota: (rota: string) => boolean;
  podeOportunidade: (acao?: ModuloAcao) => boolean;
  podeGerenciarAcessos: boolean;
  podeVerOportunidades: boolean;
}

/**
 * Carrega a sessão do usuário e expõe funções booleanas limpas para a UI,
 * no mesmo espírito do projeto de referência (Flow63/Pedrin0405).
 */
export function usePermissions(): UsePermissionsResult {
  const [usuario, setUsuario] = useState<UsuarioPermissoes | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((dados) => {
        if (ativo) setUsuario(dados.usuario ?? null);
      })
      .catch(() => {
        if (ativo) setUsuario(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return useMemo<UsePermissionsResult>(() => {
    const papel = usuario?.papel ?? null;

    const podeModulo = (modulo: Modulo, acao: ModuloAcao = "ver") =>
      !!papel && pode(papel, modulo, acao);

    return {
      usuario,
      papel,
      carregando,
      isDesenvolvedor: papel === "desenvolvedor",
      isGerente: papel === "gerente",
      isSecretaria: papel === "secretaria",
      isCorretor: papel === "corretor",
      isCliente: papel === "cliente",
      pode: podeModulo,
      podeRota: (rota: string) => !!usuario && usuario.rotas.includes(rota),
      podeOportunidade: (acao: ModuloAcao = "ver") => podeModulo("oportunidades", acao),
      podeGerenciarAcessos: podeModulo("acessos", "gerenciar"),
      podeVerOportunidades: podeModulo("oportunidades", "ver"),
    };
  }, [usuario, carregando]);
}
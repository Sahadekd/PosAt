import { NextRequest, NextResponse } from "next/server";
import { obterSessao, criarCookieSessao } from "@/lib/auth/sessao";
import type { Papel } from "@/core/domain/papeis";
import { rotasPermitidas } from "@/lib/rbac/role-permissoes";

const ROTAS_PUBLICAS = ["/login", "/api", "/_next", "/favicon.ico"];

const DEV = process.env.NODE_ENV !== "production";

const USUARIO_DEV = { uid: "u-dev", papel: "desenvolvedor" as const };

function ehPublica(pathname: string): boolean {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

function redirecionar(request: NextRequest, destino: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = destino;
  url.search = "";
  return NextResponse.redirect(url);
}

function rotaPermitida(papel: Papel, pathname: string): boolean {
  const rotas = rotasPermitidas(papel);
  if (pathname === "/") return rotas.includes("/");
  return rotas.some(
    (r) => r !== "/" && (pathname === r || pathname.startsWith(`${r}/`))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ehPublica(pathname)) {
    return NextResponse.next();
  }

  return obterSessao(request.headers.get("cookie")).then(async (sessao) => {
    // Durante o desenvolvimento, a home principal é a do desenvolvedor:
    // cria a sessão de dev quando não existe e sobrepõe sessões de cliente
    // remanescentes. Em produção isso nunca acontece.
    if (DEV) {
      if (!sessao || sessao.papel === "cliente") {
        const cookie = await criarCookieSessao(USUARIO_DEV);
        const resposta = NextResponse.next();
        resposta.headers.set("Set-Cookie", cookie);
        return resposta;
      }
      return NextResponse.next();
    }

    if (!sessao) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const papel: Papel = sessao.papel;

    if (papel === "cliente") {
      if (!pathname.startsWith("/portal")) {
        return redirecionar(request, "/portal");
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/portal")) {
      return redirecionar(request, "/");
    }

    // Segregação por matriz de acessos: cargos sem permissão para a rota
    // são redirecionados para a visão geral (a coluna "Desenvolvedor" é
    // protegida, portanto nunca é bloqueada por aqui).
    if (!rotaPermitida(papel, pathname)) {
      return redirecionar(request, "/");
    }

    return NextResponse.next();
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
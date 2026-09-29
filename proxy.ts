import { NextRequest, NextResponse } from "next/server";
import { obterSessao } from "@/lib/auth/sessao";
import type { Papel } from "@/core/domain/papeis";

const ROTAS_PUBLICAS = ["/login", "/api", "/_next", "/favicon.ico"];

function ehPublica(pathname: string): boolean {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

function redirecionar(request: NextRequest, destino: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = destino;
  url.search = "";
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ehPublica(pathname)) {
    return NextResponse.next();
  }

  return obterSessao(request.headers.get("cookie")).then((sessao) => {
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

    return NextResponse.next();
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
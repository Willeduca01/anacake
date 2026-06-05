import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verificarSessao } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessao = await verificarSessao(token);

  if (isLogin) {
    if (sessao) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!sessao) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

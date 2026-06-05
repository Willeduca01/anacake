import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verificarSessao } from "@/lib/auth";
import { contarPedidosPendentes } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sessao = await verificarSessao(token);
  if (!sessao) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const count = await contarPedidosPendentes();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

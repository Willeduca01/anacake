import { NextResponse } from "next/server";
import { listarCardapioPublico } from "@/lib/produtos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const produtos = await listarCardapioPublico();
    return NextResponse.json(produtos);
  } catch {
    return NextResponse.json(
      { error: "Falha ao consultar produtos no banco" },
      { status: 500 }
    );
  }
}

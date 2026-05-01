import { NextResponse } from "next/server";
import { API_CARDAPIO_URL } from "@/constants/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(API_CARDAPIO_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `API retornou status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Falha ao conectar com a API de cardápio" },
      { status: 502 }
    );
  }
}

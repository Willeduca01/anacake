import { getReceitaImagem } from "@/lib/receitas";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  const imagem = await getReceitaImagem(id);
  if (!imagem) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(imagem.dados), {
    headers: {
      "Content-Type": imagem.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

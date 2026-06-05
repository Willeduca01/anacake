import { getProdutoImagem } from "@/lib/produtos";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const produtoId = Number(id);
  if (Number.isNaN(produtoId)) {
    return new Response("Not found", { status: 404 });
  }

  const imagem = await getProdutoImagem(produtoId);
  if (!imagem) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(imagem.dados), {
    headers: {
      "Content-Type": imagem.mime,
      // imutavel: a url muda (?v=) quando a imagem troca, entao pode cachear
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

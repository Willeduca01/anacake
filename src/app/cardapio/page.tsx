import {
  type ProdutoAPI,
  API_CARDAPIO_URL,
  parseProdutoAPI,
} from "@/constants/products";
import CardapioClient from "@/components/CardapioClient";

async function buscarProdutos() {
  try {
    const res = await fetch(API_CARDAPIO_URL, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const lista: ProdutoAPI[] = Array.isArray(data) ? data : data.value ?? [];
    return lista.map(parseProdutoAPI);
  } catch {
    return [];
  }
}

export default async function CardapioPage() {
  const produtos = await buscarProdutos();

  return (
    <section className="py-16 sm:py-24 bg-warm-white min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wider text-rose-pastel">
            Delícias artesanais
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-chocolate">
            Nosso Cardápio
          </h1>
          <p className="mt-4 text-chocolate-muted max-w-xl mx-auto">
            Explore nossos produtos feitos com ingredientes selecionados e muito carinho.
          </p>
        </div>

        {produtos.length === 0 ? (
          <p className="text-center text-chocolate-muted py-20">
            Nenhum produto disponível no momento.
          </p>
        ) : (
          <CardapioClient produtos={produtos} />
        )}
      </div>
    </section>
  );
}

import { listarCardapioPublico } from "@/lib/produtos";
import CardapioClient from "@/components/CardapioClient";

export const dynamic = "force-dynamic";

export default async function CardapioPage() {
  const produtos = await listarCardapioPublico();

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

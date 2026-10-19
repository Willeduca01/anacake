import { listarCardapioPublico } from "@/lib/produtos";
import CardapioClient from "@/components/CardapioClient";

export const dynamic = "force-dynamic";

export default async function CardapioPage({
  searchParams,
}: {
  searchParams?: Promise<{ categoria?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const categoriaInicial = resolvedParams?.categoria;
  const produtos = await listarCardapioPublico();

  return (
    <section className="pt-4 pb-16 sm:py-16 bg-warm-white min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-5 sm:mb-8">
          <span className="inline-block mb-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#C88A8A]">
            Delícias artesanais
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#4A2B20] tracking-tight">
            Nosso Cardápio
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#8B6E60] max-w-md mx-auto">
            Doces finos, bolos e salgados feitos com amor e ingredientes selecionados.
          </p>
        </div>

        {produtos.length === 0 ? (
          <p className="text-center text-chocolate-muted py-20">
            Nenhum produto disponível no momento.
          </p>
        ) : (
          <CardapioClient
            produtos={produtos}
            categoriaInicial={categoriaInicial}
          />
        )}
      </div>
    </section>
  );
}

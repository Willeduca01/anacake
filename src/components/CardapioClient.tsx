"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Produto } from "@/constants/products";
import MenuFilter from "@/components/MenuFilter";
import ProductCard from "@/components/ProductCard";
import { sanitizarTexto } from "@/lib/sanitize";

interface CardapioClientProps {
  produtos: Produto[];
  categoriaInicial?: string;
}

export default function CardapioClient({
  produtos,
  categoriaInicial,
}: CardapioClientProps) {
  const categorias = useMemo(
    () => [...new Set(produtos.map((p) => sanitizarTexto(p.categoria) || "Outros"))],
    [produtos]
  );

  const [filtro, setFiltro] = useState<string>(() => {
    if (!categoriaInicial) return "Todos";
    const sanitizado = sanitizarTexto(categoriaInicial).toLowerCase();
    const encontrada = categorias.find(
      (c) => sanitizarTexto(c).toLowerCase() === sanitizado
    );
    return encontrada || "Todos";
  });

  const [prevCategoriaInicial, setPrevCategoriaInicial] = useState(categoriaInicial);

  if (categoriaInicial !== prevCategoriaInicial) {
    setPrevCategoriaInicial(categoriaInicial);
    if (categoriaInicial) {
      const sanitizado = sanitizarTexto(categoriaInicial).toLowerCase();
      const encontrada = categorias.find(
        (c) => sanitizarTexto(c).toLowerCase() === sanitizado
      );
      setFiltro(encontrada || "Todos");
    } else {
      setFiltro("Todos");
    }
  }

  const filtroSanitizado = sanitizarTexto(filtro) || "Todos";

  const produtosFiltrados =
    filtroSanitizado === "Todos"
      ? produtos
      : produtos.filter((p) => (sanitizarTexto(p.categoria) || "Outros") === filtroSanitizado);

  return (
    <>
      <div className="mb-10">
        <MenuFilter
          categorias={categorias}
          filtroAtivo={filtro}
          onFiltrar={setFiltro}
        />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={filtro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {produtosFiltrados.map((produto) => (
            <ProductCard key={produto.nome} produto={produto} />
          ))}
        </motion.div>
      </AnimatePresence>

      {produtosFiltrados.length === 0 && (
        <div className="text-center text-chocolate-muted mt-12 space-y-2">
          <p className="font-semibold text-chocolate">
            Nenhum produto encontrado nesta categoria no momento.
          </p>
          <button
            onClick={() => setFiltro("Todos")}
            className="text-xs text-rose-pastel font-semibold hover:underline"
          >
            Ver todos os produtos do cardápio
          </button>
        </div>
      )}
    </>
  );
}

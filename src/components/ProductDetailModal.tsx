"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import { type Produto, formatarPreco, fonteImagem } from "@/constants/products";
import { useCart } from "@/contexts/CartContext";

interface ProductDetailModalProps {
  produto: Produto | null;
  onClose: () => void;
}

export default function ProductDetailModal({
  produto,
  onClose,
}: ProductDetailModalProps) {
  const { itens, adicionar } = useCart();
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [adicionado, setAdicionado] = useState(false);

  // Reseta quantidade, observação e feedback quando o produto selecionado muda
  useEffect(() => {
    if (produto) {
      setQuantidade(1);
      setAdicionado(false);
      const existente = itens.find((i) => i.produto.nome === produto.nome);
      setObservacao(existente?.observacao || "");
    }
  }, [produto, itens]);

  // Trava a rolagem da página de fundo enquanto o modal estiver aberto
  useEffect(() => {
    if (!produto) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [produto, onClose]);

  if (!produto) return null;

  const esgotado = produto.estoque === 0;
  const maxEstoque = produto.estoque > 0 ? produto.estoque : 99;
  const itemNaSacola = itens.find((i) => i.produto.nome === produto.nome);
  const imagemSrc = fonteImagem(produto);

  const handleIncrementar = () => {
    setQuantidade((prev) => Math.min(prev + 1, maxEstoque));
  };

  const handleDecrementar = () => {
    setQuantidade((prev) => Math.max(1, prev - 1));
  };

  const handleAdicionarAoCarrinho = () => {
    if (esgotado || adicionado) return;
    adicionar(produto, quantidade, observacao);
    setAdicionado(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const totalCalculado = formatarPreco(produto.preco * quantidade);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop escuro com desfoque */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          aria-hidden="true"
        />

        {/* Conteúdo do Modal (Bottom sheet no mobile / Dialog centralizado no desktop) */}
        <motion.div
          key="modal-content"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col border border-[#F3E8E2]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-produto-titulo"
        >
          {/* Barra de arraste visual para mobile */}
          <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 z-30 w-10 h-1 bg-white/80 rounded-full shadow-xs" />

          {/* Botão de Fechar flutuante */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-30 h-9 w-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            aria-label="Fechar detalhes do produto"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Área da Imagem do Produto */}
          <div className="relative h-60 sm:h-72 w-full flex-shrink-0 bg-[#FDF6F0]">
            <Image
              src={imagemSrc}
              alt={produto.nome}
              fill
              unoptimized={imagemSrc.startsWith("/api/")}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
              priority
            />

            {/* Badges sobrepostos na imagem */}
            <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap gap-1.5 items-center">
              <span className="inline-flex items-center rounded-lg bg-white/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-[#8B6E60] capitalize shadow-xs">
                {produto.categoria}
              </span>

              {esgotado ? (
                <span className="inline-flex items-center rounded-lg bg-rose-100/95 px-2.5 py-1 text-xs font-bold text-rose-800 shadow-xs">
                  Esgotado
                </span>
              ) : produto.estoque <= 5 ? (
                <span className="inline-flex items-center rounded-lg bg-amber-100/95 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-xs">
                  Restam {produto.estoque}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-lg bg-emerald-100/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                  Em estoque
                </span>
              )}
            </div>

            {/* Gradiente sutil inferior na imagem */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/40 to-transparent" />
          </div>

          {/* Área Rolável de Detalhes e Descrição */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            <div>
              <h2
                id="modal-produto-titulo"
                className="text-xl sm:text-2xl font-bold text-[#4A2B20] tracking-tight"
              >
                {produto.nome}
              </h2>
              <p className="text-xl sm:text-2xl font-black text-[#C88A8A] mt-1">
                {formatarPreco(produto.preco)}
              </p>
            </div>

            {/* Descrição Completa do Produto */}
            <div className="pt-2 border-t border-[#F8EFEA]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B6E60] mb-1.5">
                Descrição do Produto
              </h3>
              <p className="text-sm sm:text-base text-[#5C3D31] leading-relaxed whitespace-pre-line">
                {produto.descricao?.trim() ||
                  `Delicioso doce artesanal de ${produto.categoria}. Preparado artesanalmente com ingredientes de alta qualidade e todo o carinho da confeitaria Ana Cake.`}
              </p>
            </div>

            {/* Campo de observação / anotação específica para este produto */}
            {!esgotado && (
              <div className="pt-2 border-t border-[#F8EFEA] space-y-1.5">
                <label
                  htmlFor="modal-observacao"
                  className="block text-xs font-bold uppercase tracking-wider text-[#8B6E60]"
                >
                  Alguma observação ou preferência? (opcional)
                </label>
                <input
                  id="modal-observacao"
                  type="text"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex: sem canela, bem gelado, escrever nome..."
                  maxLength={150}
                  className="w-full text-xs sm:text-sm rounded-xl border border-[#E8D8CF] bg-[#FAF6F2]/70 px-3.5 py-2 text-[#4A2B20] placeholder:text-[#8B6E60]/50 focus:border-[#C88A8A] focus:outline-none focus:ring-1 focus:ring-[#C88A8A]/30 transition-all"
                />
              </div>
            )}

            {/* Aviso caso o item já esteja na sacola */}
            {itemNaSacola && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#FAF0EB] border border-[#F3E2D8] px-3 py-2 text-xs font-medium text-[#8B6E60]">
                <Check className="h-4 w-4 text-[#C88A8A] stroke-[2.5]" />
                <span>
                  Você já tem <strong>{itemNaSacola.quantidade}</strong> deste item
                  na sacola
                </span>
              </div>
            )}
          </div>

          {/* Rodapé Fixo com Seletor de Quantidade e Botão de Adicionar */}
          <div className="p-4 sm:p-5 bg-[#FAF6F2] border-t border-[#F0E4DC] flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Seletor de quantidade */}
            {!esgotado && (
              <div className="flex items-center bg-white rounded-2xl border border-[#E8D8CF] p-1 shadow-xs">
                <button
                  type="button"
                  onClick={handleDecrementar}
                  disabled={quantidade <= 1 || adicionado}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-[#4A2B20] hover:bg-[#F8EFEA] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-9 text-center font-bold text-sm sm:text-base text-[#4A2B20]">
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={handleIncrementar}
                  disabled={quantidade >= maxEstoque || adicionado}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-[#4A2B20] hover:bg-[#F8EFEA] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Botão de Adicionar ao Carrinho */}
            <button
              type="button"
              onClick={handleAdicionarAoCarrinho}
              disabled={esgotado || adicionado}
              className={`flex-1 h-12 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-between px-4 sm:px-5 shadow-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                adicionado
                  ? "bg-[#A76D6D] text-white shadow-[#A76D6D]/30"
                  : "bg-[#C88A8A] hover:bg-[#B77979] text-white shadow-[#C88A8A]/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {adicionado ? (
                  <>
                    <Check className="h-5 w-5 stroke-[2.5]" />
                    <span>Adicionado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>{esgotado ? "Esgotado" : "Adicionar"}</span>
                  </>
                )}
              </div>

              {!esgotado && (
                <span className="font-extrabold text-white text-sm sm:text-base">
                  {totalCalculado}
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

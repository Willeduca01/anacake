"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type Produto, formatarPreco } from "@/constants/products";

export interface ItemSacola {
  produto: Produto;
  quantidade: number;
}

interface CartContextType {
  itens: ItemSacola[];
  aberta: boolean;
  abrirSacola: () => void;
  fecharSacola: () => void;
  toggleSacola: () => void;
  adicionar: (produto: Produto) => void;
  remover: (nome: string) => void;
  incrementar: (nome: string) => void;
  decrementar: (nome: string) => void;
  limpar: () => void;
  totalItens: number;
  totalPreco: number;
  totalPrecoFormatado: string;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemSacola[]>([]);
  const [aberta, setAberta] = useState(false);

  const abrirSacola = useCallback(() => setAberta(true), []);
  const fecharSacola = useCallback(() => setAberta(false), []);
  const toggleSacola = useCallback(() => setAberta((v) => !v), []);

  const adicionar = useCallback((produto: Produto) => {
    setItens((prev) => {
      const existente = prev.find((i) => i.produto.nome === produto.nome);
      if (existente) {
        return prev.map((i) =>
          i.produto.nome === produto.nome
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  }, []);

  const remover = useCallback((nome: string) => {
    setItens((prev) => prev.filter((i) => i.produto.nome !== nome));
  }, []);

  const incrementar = useCallback((nome: string) => {
    setItens((prev) =>
      prev.map((i) =>
        i.produto.nome === nome
          ? { ...i, quantidade: i.quantidade + 1 }
          : i
      )
    );
  }, []);

  const decrementar = useCallback((nome: string) => {
    setItens((prev) =>
      prev
        .map((i) =>
          i.produto.nome === nome
            ? { ...i, quantidade: i.quantidade - 1 }
            : i
        )
        .filter((i) => i.quantidade > 0)
    );
  }, []);

  const limpar = useCallback(() => {
    setItens([]);
  }, []);

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const totalPreco = itens.reduce(
    (acc, i) => acc + i.produto.preco * i.quantidade,
    0
  );
  const totalPrecoFormatado = formatarPreco(totalPreco);

  return (
    <CartContext.Provider
      value={{
        itens,
        aberta,
        abrirSacola,
        fecharSacola,
        toggleSacola,
        adicionar,
        remover,
        incrementar,
        decrementar,
        limpar,
        totalItens,
        totalPreco,
        totalPrecoFormatado,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}

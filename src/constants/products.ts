export interface ProdutoAPI {
  nome: string;
  preco: string;
  estoque_atual: number;
  categoria: string;
  url_imagem?: string | null;
}

export interface Produto {
  nome: string;
  descricao?: string | null;
  preco: number;
  estoque: number;
  categoria: string;
  imagem?: string | null;
}

export const API_CARDAPIO_URL =
  process.env.NEXT_PUBLIC_API_CARDAPIO_URL ||
  "http://localhost:5678/webhook/Cardapio";

const imagensPorCategoria: Record<string, string> = {
  doces: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop",
  salgados: "https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=400&h=300&fit=crop",
  sobremesas: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
  encomendas: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
};

export function iconePorCategoria(categoria: string): string {
  const cat = categoria.toLowerCase().trim();
  if (cat.includes("bolo")) return "🧁";
  if (cat.includes("doce") || cat.includes("brigadeiro") || cat.includes("trufa")) return "🍫";
  if (cat.includes("salgado") || cat.includes("coxinha") || cat.includes("torta")) return "🥟";
  if (cat.includes("sobremesa") || cat.includes("pudim") || cat.includes("mousse")) return "🍨";
  if (cat.includes("bebida") || cat.includes("cafe") || cat.includes("café") || cat.includes("suco")) return "☕";
  if (cat.includes("encomenda") || cat.includes("festa") || cat.includes("kit")) return "🎁";
  if (cat.includes("pao") || cat.includes("pão")) return "🥖";
  return "✨";
}

export function imagemPorCategoria(categoria: string): string {
  return (
    imagensPorCategoria[categoria.toLowerCase()] ??
    "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=300&fit=crop"
  );
}

export function parseProdutoAPI(item: ProdutoAPI): Produto {
  const imagem = item.url_imagem?.trim();
  return {
    nome: item.nome,
    preco: parseFloat(item.preco),
    estoque: item.estoque_atual,
    categoria: item.categoria,
    imagem: imagem ? imagem : null,
  };
}

export function fonteImagem(produto: Produto): string {
  return produto.imagem ?? imagemPorCategoria(produto.categoria);
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

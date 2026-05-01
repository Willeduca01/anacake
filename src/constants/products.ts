export interface ProdutoAPI {
  nome: string;
  preco: string;
  estoque_atual: number;
  categoria: string;
}

export interface Produto {
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
}

export const API_CARDAPIO_URL =
  "http://4.204.40.176:5678/webhook/Cardapio";

const imagensPorCategoria: Record<string, string> = {
  doces: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop",
  salgados: "https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=400&h=300&fit=crop",
  sobremesas: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
  encomendas: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
};

export function imagemPorCategoria(categoria: string): string {
  return (
    imagensPorCategoria[categoria.toLowerCase()] ??
    "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=300&fit=crop"
  );
}

export function parseProdutoAPI(item: ProdutoAPI): Produto {
  return {
    nome: item.nome,
    preco: parseFloat(item.preco),
    estoque: item.estoque_atual,
    categoria: item.categoria,
  };
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

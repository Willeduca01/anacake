import { getPool } from "@/lib/db";

export interface ProdutoAdmin {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque_atual: number;
  categoria: string | null;
  url_imagem: string | null;
  ativo: boolean;
}

export interface ProdutoInput {
  nome: string;
  descricao: string | null;
  preco: number;
  estoque_atual: number;
  categoria: string | null;
  url_imagem: string | null;
  ativo: boolean;
}

const SELECT_COLS =
  "id, nome, descricao, preco::float8 AS preco, estoque_atual, categoria, url_imagem, ativo";

export async function listarProdutos(): Promise<ProdutoAdmin[]> {
  const { rows } = await getPool().query<ProdutoAdmin>(
    `SELECT ${SELECT_COLS} FROM produtos ORDER BY id ASC`
  );
  return rows;
}

export async function criarProduto(input: ProdutoInput): Promise<ProdutoAdmin> {
  const { rows } = await getPool().query<ProdutoAdmin>(
    `INSERT INTO produtos (nome, descricao, preco, estoque_atual, categoria, url_imagem, ativo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${SELECT_COLS}`,
    [
      input.nome,
      input.descricao,
      input.preco,
      input.estoque_atual,
      input.categoria,
      input.url_imagem,
      input.ativo,
    ]
  );
  return rows[0];
}

export async function atualizarProduto(
  id: number,
  input: ProdutoInput
): Promise<ProdutoAdmin | null> {
  const { rows } = await getPool().query<ProdutoAdmin>(
    `UPDATE produtos
     SET nome = $1, descricao = $2, preco = $3, estoque_atual = $4,
         categoria = $5, url_imagem = $6, ativo = $7
     WHERE id = $8
     RETURNING ${SELECT_COLS}`,
    [
      input.nome,
      input.descricao,
      input.preco,
      input.estoque_atual,
      input.categoria,
      input.url_imagem,
      input.ativo,
      id,
    ]
  );
  return rows[0] ?? null;
}

export async function excluirProduto(id: number): Promise<void> {
  await getPool().query("DELETE FROM produtos WHERE id = $1", [id]);
}

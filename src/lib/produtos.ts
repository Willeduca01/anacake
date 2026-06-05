import { getPool } from "@/lib/db";

export interface ProdutoAdmin {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque_atual: number;
  categoria: string | null;
  url_imagem: string | null;
  tem_imagem: boolean;
  ativo: boolean;
}

export interface ProdutoInput {
  nome: string;
  descricao: string | null;
  preco: number;
  estoque_atual: number;
  categoria: string | null;
  ativo: boolean;
}

const SELECT_COLS =
  "id, nome, descricao, preco::float8 AS preco, estoque_atual, categoria, url_imagem, (imagem_dados IS NOT NULL) AS tem_imagem, ativo";

export async function listarProdutos(): Promise<ProdutoAdmin[]> {
  const { rows } = await getPool().query<ProdutoAdmin>(
    `SELECT ${SELECT_COLS} FROM produtos ORDER BY id ASC`
  );
  return rows;
}

export async function criarProduto(input: ProdutoInput): Promise<ProdutoAdmin> {
  const { rows } = await getPool().query<ProdutoAdmin>(
    `INSERT INTO produtos (nome, descricao, preco, estoque_atual, categoria, ativo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${SELECT_COLS}`,
    [
      input.nome,
      input.descricao,
      input.preco,
      input.estoque_atual,
      input.categoria,
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
         categoria = $5, ativo = $6
     WHERE id = $7
     RETURNING ${SELECT_COLS}`,
    [
      input.nome,
      input.descricao,
      input.preco,
      input.estoque_atual,
      input.categoria,
      input.ativo,
      id,
    ]
  );
  return rows[0] ?? null;
}

export async function excluirProduto(id: number): Promise<void> {
  await getPool().query("DELETE FROM produtos WHERE id = $1", [id]);
}

export async function definirImagemProduto(
  id: number,
  dados: Buffer,
  mime: string
): Promise<void> {
  // url_imagem aponta para a rota que serve os bytes; ?v=<epoch> invalida cache
  // ao trocar a imagem. O webhook do n8n devolve essa url para o site publico.
  const url = `/api/produtos/${id}/imagem?v=${Date.now()}`;
  await getPool().query(
    `UPDATE produtos SET imagem_dados = $1, imagem_mime = $2, url_imagem = $3 WHERE id = $4`,
    [dados, mime, url, id]
  );
}

export async function removerImagemProduto(id: number): Promise<void> {
  await getPool().query(
    `UPDATE produtos SET imagem_dados = NULL, imagem_mime = NULL, url_imagem = NULL WHERE id = $1`,
    [id]
  );
}

export async function getProdutoImagem(
  id: number
): Promise<{ dados: Buffer; mime: string } | null> {
  const { rows } = await getPool().query<{
    imagem_dados: Buffer | null;
    imagem_mime: string | null;
  }>(`SELECT imagem_dados, imagem_mime FROM produtos WHERE id = $1`, [id]);
  const row = rows[0];
  if (!row || !row.imagem_dados) return null;
  return { dados: row.imagem_dados, mime: row.imagem_mime ?? "image/jpeg" };
}

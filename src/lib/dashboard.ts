import { getPool } from "@/lib/db";

export interface ResumoVendas {
  faturamento_total: number;
  total_vendas: number;
  ticket_medio: number;
  faturamento_mes: number;
  vendas_mes: number;
  itens_vendidos: number;
}

export interface ResumoEstoque {
  total_produtos: number;
  produtos_ativos: number;
  itens_estoque: number;
  valor_estoque: number;
}

export interface PontoFaturamento {
  dia: string;
  total: number;
}

export interface TopProduto {
  nome: string;
  quantidade: number;
  faturamento: number;
}

export interface FaturamentoCategoria {
  categoria: string;
  total: number;
}

export interface ProdutoEstoqueBaixo {
  id: number;
  nome: string;
  estoque_atual: number;
}

const ESTOQUE_BAIXO = 5;

export async function getResumoVendas(): Promise<ResumoVendas> {
  const { rows } = await getPool().query<ResumoVendas>(
    `SELECT
       COALESCE(SUM(valor_total), 0)::float8 AS faturamento_total,
       COUNT(*)::int AS total_vendas,
       COALESCE(AVG(valor_total), 0)::float8 AS ticket_medio,
       COALESCE(SUM(valor_total) FILTER (WHERE date_trunc('month', data_venda) = date_trunc('month', CURRENT_DATE)), 0)::float8 AS faturamento_mes,
       COUNT(*) FILTER (WHERE date_trunc('month', data_venda) = date_trunc('month', CURRENT_DATE))::int AS vendas_mes,
       COALESCE(SUM(quantidade), 0)::int AS itens_vendidos
     FROM vendas`
  );
  return rows[0];
}

export async function getResumoEstoque(): Promise<ResumoEstoque> {
  const { rows } = await getPool().query<ResumoEstoque>(
    `SELECT
       COUNT(*)::int AS total_produtos,
       COUNT(*) FILTER (WHERE ativo)::int AS produtos_ativos,
       COALESCE(SUM(estoque_atual), 0)::int AS itens_estoque,
       COALESCE(SUM(preco * estoque_atual), 0)::float8 AS valor_estoque
     FROM produtos`
  );
  return rows[0];
}

export async function getFaturamento30Dias(): Promise<PontoFaturamento[]> {
  const { rows } = await getPool().query<PontoFaturamento>(
    `SELECT to_char(d.dia, 'YYYY-MM-DD') AS dia,
            COALESCE(SUM(v.valor_total), 0)::float8 AS total
     FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') AS d(dia)
     LEFT JOIN vendas v ON date_trunc('day', v.data_venda) = d.dia
     GROUP BY d.dia
     ORDER BY d.dia ASC`
  );
  return rows;
}

export async function getTopProdutos(limit = 5): Promise<TopProduto[]> {
  const { rows } = await getPool().query<TopProduto>(
    `SELECT p.nome,
            SUM(v.quantidade)::int AS quantidade,
            SUM(v.valor_total)::float8 AS faturamento
     FROM vendas v
     JOIN produtos p ON p.id = v.produto_id
     GROUP BY p.nome
     ORDER BY quantidade DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getFaturamentoPorCategoria(): Promise<
  FaturamentoCategoria[]
> {
  const { rows } = await getPool().query<FaturamentoCategoria>(
    `SELECT COALESCE(p.categoria, 'Sem categoria') AS categoria,
            SUM(v.valor_total)::float8 AS total
     FROM vendas v
     JOIN produtos p ON p.id = v.produto_id
     GROUP BY COALESCE(p.categoria, 'Sem categoria')
     ORDER BY total DESC`
  );
  return rows;
}

export async function getEstoqueBaixo(): Promise<ProdutoEstoqueBaixo[]> {
  const { rows } = await getPool().query<ProdutoEstoqueBaixo>(
    `SELECT id, nome, estoque_atual
     FROM produtos
     WHERE ativo AND estoque_atual <= $1
     ORDER BY estoque_atual ASC`,
    [ESTOQUE_BAIXO]
  );
  return rows;
}

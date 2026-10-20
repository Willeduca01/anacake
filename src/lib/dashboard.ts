import { getPool } from "@/lib/db";

export type PeriodoFiltro = "7d" | "mes" | "30d";

export interface MovimentacaoFluxo {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  titulo: string;
  detalhe?: string | null;
  valor: number;
  data: string;
  metodo_ou_local?: string | null;
}

export interface PontoFluxoTemporal {
  dia: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface InsumoEstoqueAlerta {
  id: string;
  nome: string;
  tipo_medida: string;
  estoque_atual: number;
  estoque_minimo: number;
}

export interface DashboardFinanceiro {
  periodo: PeriodoFiltro;
  receita_total: number;
  gastos_insumos: number;
  resultado_operacional: number;
  margem_bruta_pct: number;
  ticket_medio: number;
  total_vendas: number;
  total_compras_insumos: number;
  pontos_fluxo: PontoFluxoTemporal[];
  ultimas_movimentacoes: MovimentacaoFluxo[];
  insumos_estoque_baixo: InsumoEstoqueAlerta[];
}

export async function getDashboardFinanceiro(
  periodo: PeriodoFiltro = "30d"
): Promise<DashboardFinanceiro> {
  const pool = getPool();

  // Define data de início com base no filtro
  let queryDataInicio = "CURRENT_DATE - INTERVAL '29 days'";
  if (periodo === "7d") {
    queryDataInicio = "CURRENT_DATE - INTERVAL '6 days'";
  } else if (periodo === "mes") {
    queryDataInicio = "date_trunc('month', CURRENT_DATE)::date";
  }

  // 1. Receita e vendas do período
  const { rows: vendasRows } = await pool.query<{
    receita_total: number;
    total_vendas: number;
  }>(
    `SELECT 
       COALESCE(SUM(valor_total), 0)::float8 AS receita_total,
       COUNT(*)::int AS total_vendas
     FROM vendas
     WHERE data_venda >= ${queryDataInicio} AND data_venda <= CURRENT_TIMESTAMP`
  );
  const receitaTotal = vendasRows[0]?.receita_total ?? 0;
  const totalVendas = vendasRows[0]?.total_vendas ?? 0;

  // 2. Gastos com insumos do período
  const { rows: comprasRows } = await pool.query<{
    gastos_insumos: number;
    total_compras: number;
  }>(
    `SELECT 
       COALESCE(SUM(preco_total), 0)::float8 AS gastos_insumos,
       COUNT(*)::int AS total_compras
     FROM insumo_compras
     WHERE data_compra >= ${queryDataInicio} AND data_compra <= CURRENT_TIMESTAMP`
  );
  const gastosInsumos = comprasRows[0]?.gastos_insumos ?? 0;
  const totalCompras = comprasRows[0]?.total_compras ?? 0;

  // 3. Resultado Operacional e Margem Bruta
  const resultadoOperacional = Number((receitaTotal - gastosInsumos).toFixed(2));
  const margemBrutaPct =
    receitaTotal > 0
      ? Number(((resultadoOperacional / receitaTotal) * 100).toFixed(1))
      : 0;
  const ticketMedio =
    totalVendas > 0 ? Number((receitaTotal / totalVendas).toFixed(2)) : 0;

  // 4. Comparativo temporal diário (Entradas vs Saídas)
  const { rows: pontosFluxo } = await pool.query<PontoFluxoTemporal>(
    `WITH range_dias AS (
       SELECT d::date AS dia
       FROM generate_series(${queryDataInicio}, CURRENT_DATE, '1 day'::interval) d
     ),
     vendas_dia AS (
       SELECT date_trunc('day', data_venda)::date AS dia,
              COALESCE(SUM(valor_total), 0)::float8 AS total
       FROM vendas
       WHERE data_venda >= ${queryDataInicio} AND data_venda <= CURRENT_TIMESTAMP
       GROUP BY 1
     ),
     compras_dia AS (
       SELECT date_trunc('day', data_compra)::date AS dia,
              COALESCE(SUM(preco_total), 0)::float8 AS total
       FROM insumo_compras
       WHERE data_compra >= ${queryDataInicio} AND data_compra <= CURRENT_TIMESTAMP
       GROUP BY 1
     )
     SELECT 
       to_char(r.dia, 'YYYY-MM-DD') AS dia,
       COALESCE(v.total, 0)::float8 AS entradas,
       COALESCE(c.total, 0)::float8 AS saidas,
       (COALESCE(v.total, 0) - COALESCE(c.total, 0))::float8 AS saldo
     FROM range_dias r
     LEFT JOIN vendas_dia v ON v.dia = r.dia
     LEFT JOIN compras_dia c ON c.dia = r.dia
     ORDER BY r.dia ASC`
  );

  // 5. Últimas 5 Movimentações (Entradas e Saídas combinadas)
  const { rows: ultimasMovimentacoes } = await pool.query<MovimentacaoFluxo>(
    `SELECT id, tipo, titulo, detalhe, valor, data, metodo_ou_local FROM (
       (
         SELECT 
           'venda-' || v.id::text AS id,
           'ENTRADA' AS tipo,
           COALESCE(p.nome, v.descricao_avulsa, 'Venda Balcão') AS titulo,
           CASE 
             WHEN v.tipo_venda = 'AVULSA' THEN 'Venda Avulsa' 
             ELSE 'Venda Cardápio' 
           END AS detalhe,
           v.valor_total::float8 AS valor,
           to_char(v.data_venda, 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM') AS data,
           v.metodo_pagamento AS metodo_ou_local,
           v.data_venda AS raw_date
         FROM vendas v
         LEFT JOIN produtos p ON p.id = v.produto_id
         ORDER BY v.data_venda DESC
         LIMIT 5
       )
       UNION ALL
       (
         SELECT 
           'compra-' || c.id::text AS id,
           'SAIDA' AS tipo,
           'Insumo: ' || i.nome AS titulo,
           COALESCE(c.estabelecimento, 'Compra de Insumo') AS detalhe,
           c.preco_total::float8 AS valor,
           to_char(c.data_compra, 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM') AS data,
           c.estabelecimento AS metodo_ou_local,
           c.data_compra AS raw_date
         FROM insumo_compras c
         JOIN insumos i ON i.id = c.insumo_id
         ORDER BY c.data_compra DESC
         LIMIT 5
       )
     ) AS uniao
     ORDER BY raw_date DESC
     LIMIT 5`
  );

  // 6. Insumos com estoque baixo (≤ estoque_minimo)
  const { rows: insumosEstoqueBaixo } = await pool.query<InsumoEstoqueAlerta>(
    `SELECT 
       id::text,
       nome,
       tipo_medida,
       COALESCE(estoque_atual, 0)::float8 AS estoque_atual,
       COALESCE(estoque_minimo, 5)::float8 AS estoque_minimo
     FROM insumos
     WHERE COALESCE(estoque_atual, 0) <= COALESCE(estoque_minimo, 5)
     ORDER BY estoque_atual ASC, nome ASC
     LIMIT 5`
  );

  return {
    periodo,
    receita_total: receitaTotal,
    gastos_insumos: gastosInsumos,
    resultado_operacional: resultadoOperacional,
    margem_bruta_pct: margemBrutaPct,
    ticket_medio: ticketMedio,
    total_vendas: totalVendas,
    total_compras_insumos: totalCompras,
    pontos_fluxo: pontosFluxo,
    ultimas_movimentacoes: ultimasMovimentacoes,
    insumos_estoque_baixo: insumosEstoqueBaixo,
  };
}

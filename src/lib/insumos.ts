import { getPool } from "@/lib/db";

export type TipoMedida = "UNIDADE" | "GRAMA" | "MILILITRO";
export type FormatoCompra = "UNIDADE" | "PACK";

export interface InsumoBase {
  id: string;
  nome: string;
  tipo_medida: TipoMedida;
  unidade_padrao: string; // 'kg' | 'g' | 'l' | 'ml' | 'un'
  quantidade_padrao: number;
  quantidade_base: number;
  created_at: string;
  updated_at: string;
}

export interface InsumoBaseInput {
  nome: string;
  unidade_padrao: string;
  quantidade_padrao: number;
}

export interface Insumo {
  id: string;
  insumo_base_id: string | null;
  nome: string;
  tipo_medida: TipoMedida;
  formato_compra: FormatoCompra;
  unidades_por_pack: number;
  peso_unitario: number | null;
  quantidade_embalagem: number;
  preco_embalagem: number;
  custo_por_unidade_base: number;
  estoque_atual: number;
  estoque_minimo: number;
  created_at: string;
  updated_at: string;
}

export interface InsumoInput {
  insumo_base_id?: string | null;
  nome: string;
  tipo_medida: TipoMedida;
  formato_compra: FormatoCompra;
  unidades_por_pack: number;
  peso_unitario: number;
  quantidade_embalagem: number;
  preco_embalagem: number;
  estoque_atual?: number;
  estoque_minimo?: number;
}

export interface InsumoCompra {
  id: string;
  insumo_id: string;
  insumo_nome?: string;
  tipo_medida?: TipoMedida;
  quantidade: number;
  preco_total: number;
  preco_unitario: number;
  estabelecimento: string | null;
  data_compra: string;
  observacoes: string | null;
}

export interface InsumoCompraInput {
  insumo_id: string;
  quantidade: number;
  preco_total: number;
  estabelecimento?: string | null;
  data_compra?: string | null;
  observacoes?: string | null;
}

export function converterParaUnidadeBase(quantidade: number, unidade: string): {
  tipo_medida: TipoMedida;
  quantidade_base: number;
} {
  const u = unidade.toLowerCase().trim();
  if (u === "kg") {
    return { tipo_medida: "GRAMA", quantidade_base: Math.round(quantidade * 1000 * 100) / 100 };
  }
  if (u === "g" || u === "gr" || u === "grama" || u === "gramas") {
    return { tipo_medida: "GRAMA", quantidade_base: quantidade };
  }
  if (u === "l" || u === "litro" || u === "litros") {
    return { tipo_medida: "MILILITRO", quantidade_base: Math.round(quantidade * 1000 * 100) / 100 };
  }
  if (u === "ml") {
    return { tipo_medida: "MILILITRO", quantidade_base: quantidade };
  }
  return { tipo_medida: "UNIDADE", quantidade_base: quantidade };
}

/* ==========================================================
   PRODUTOS / ITENS BASE (CATÁLOGO PADRÃO)
   ========================================================== */

export async function listarInsumosBase(): Promise<InsumoBase[]> {
  const { rows } = await getPool().query<InsumoBase>(
    `SELECT 
       id, 
       nome, 
       tipo_medida, 
       unidade_padrao,
       quantidade_padrao::float8 AS quantidade_padrao, 
       quantidade_base::float8 AS quantidade_base, 
       to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
       to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS updated_at
     FROM insumos_base
     ORDER BY nome ASC`
  );
  return rows;
}

export async function criarInsumoBase(input: InsumoBaseInput): Promise<InsumoBase> {
  const conv = converterParaUnidadeBase(input.quantidade_padrao, input.unidade_padrao);

  const { rows } = await getPool().query<InsumoBase>(
    `INSERT INTO insumos_base (nome, tipo_medida, unidade_padrao, quantidade_padrao, quantidade_base)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING 
       id, 
       nome, 
       tipo_medida, 
       unidade_padrao,
       quantidade_padrao::float8 AS quantidade_padrao, 
       quantidade_base::float8 AS quantidade_base`,
    [
      input.nome,
      conv.tipo_medida,
      input.unidade_padrao.toLowerCase(),
      input.quantidade_padrao,
      conv.quantidade_base,
    ]
  );
  return rows[0];
}

export async function atualizarInsumoBase(
  id: string,
  input: InsumoBaseInput
): Promise<InsumoBase | null> {
  const conv = converterParaUnidadeBase(input.quantidade_padrao, input.unidade_padrao);

  const { rows } = await getPool().query<InsumoBase>(
    `UPDATE insumos_base
     SET nome = $1, tipo_medida = $2, unidade_padrao = $3, quantidade_padrao = $4, quantidade_base = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING 
       id, 
       nome, 
       tipo_medida, 
       unidade_padrao,
       quantidade_padrao::float8 AS quantidade_padrao, 
       quantidade_base::float8 AS quantidade_base`,
    [
      input.nome,
      conv.tipo_medida,
      input.unidade_padrao.toLowerCase(),
      input.quantidade_padrao,
      conv.quantidade_base,
      id,
    ]
  );
  return rows[0] ?? null;
}

export async function excluirInsumoBase(id: string): Promise<void> {
  await getPool().query("DELETE FROM insumos_base WHERE id = $1", [id]);
}

/* ==========================================================
   INSUMOS (ESTOQUE / ENTRADAS / COMPRAS)
   ========================================================== */

export async function listarInsumos(): Promise<Insumo[]> {
  const { rows } = await getPool().query<Insumo>(
    `SELECT 
       id, 
       insumo_base_id,
       nome, 
       tipo_medida, 
       COALESCE(formato_compra, 'UNIDADE') AS formato_compra,
       COALESCE(unidades_por_pack, 1)::float8 AS unidades_por_pack,
       peso_unitario::float8 AS peso_unitario,
       quantidade_embalagem::float8 AS quantidade_embalagem, 
       preco_embalagem::float8 AS preco_embalagem, 
       custo_por_unidade_base::float8 AS custo_por_unidade_base, 
       COALESCE(estoque_atual, 0)::float8 AS estoque_atual,
       COALESCE(estoque_minimo, 5)::float8 AS estoque_minimo,
       to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
       to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS updated_at
     FROM insumos
     ORDER BY created_at DESC, nome ASC`
  );
  return rows;
}

export async function criarInsumo(input: InsumoInput): Promise<Insumo> {
  const quantidadeTotal =
    (input.unidades_por_pack || 1) * (input.peso_unitario || input.quantidade_embalagem);

  const custoBase = input.preco_embalagem / (quantidadeTotal || 1);
  const estoqueInicial =
    input.estoque_atual !== undefined
      ? input.estoque_atual
      : input.unidades_por_pack || 1;
  const estoqueMinimo = input.estoque_minimo !== undefined ? input.estoque_minimo : 5;

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<Insumo>(
      `INSERT INTO insumos (
         insumo_base_id, 
         nome, 
         tipo_medida, 
         formato_compra, 
         unidades_por_pack, 
         peso_unitario, 
         quantidade_embalagem, 
         preco_embalagem, 
         custo_por_unidade_base,
         estoque_atual,
         estoque_minimo
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING 
         id, 
         insumo_base_id, 
         nome, 
         tipo_medida, 
         formato_compra, 
         unidades_por_pack::float8 AS unidades_por_pack, 
         peso_unitario::float8 AS peso_unitario, 
         quantidade_embalagem::float8 AS quantidade_embalagem, 
         preco_embalagem::float8 AS preco_embalagem, 
         custo_por_unidade_base::float8 AS custo_por_unidade_base,
         estoque_atual::float8 AS estoque_atual,
         estoque_minimo::float8 AS estoque_minimo`,
      [
        input.insumo_base_id || null,
        input.nome,
        input.tipo_medida,
        input.formato_compra || "UNIDADE",
        input.unidades_por_pack || 1,
        input.peso_unitario || input.quantidade_embalagem,
        quantidadeTotal,
        input.preco_embalagem,
        custoBase,
        estoqueInicial,
        estoqueMinimo,
      ]
    );

    const novoInsumo = rows[0];

    // Registra a compra inicial em insumo_compras para constar no fluxo financeiro do dashboard
    if (input.preco_embalagem > 0) {
      const qtdCompra = input.unidades_por_pack || 1;
      const precoUnitCompra = input.preco_embalagem / (qtdCompra || 1);

      await client.query(
        `INSERT INTO insumo_compras (
           insumo_id,
           quantidade,
           preco_total,
           preco_unitario,
           estabelecimento,
           data_compra,
           observacoes
         )
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)`,
        [
          novoInsumo.id,
          qtdCompra,
          input.preco_embalagem,
          precoUnitCompra,
          "Cadastro de Insumo",
          "Entrada inicial registrada no cadastro do insumo",
        ]
      );
    }

    await client.query("COMMIT");
    return novoInsumo;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function atualizarInsumo(
  id: string,
  input: InsumoInput
): Promise<Insumo | null> {
  const quantidadeTotal =
    (input.unidades_por_pack || 1) * (input.peso_unitario || input.quantidade_embalagem);

  const custoBase = input.preco_embalagem / (quantidadeTotal || 1);

  const { rows } = await getPool().query<Insumo>(
    `UPDATE insumos
     SET 
       insumo_base_id = $1,
       nome = $2, 
       tipo_medida = $3, 
       formato_compra = $4,
       unidades_por_pack = $5,
       peso_unitario = $6,
       quantidade_embalagem = $7, 
       preco_embalagem = $8, 
       custo_por_unidade_base = $9, 
       estoque_atual = COALESCE($10, estoque_atual),
       estoque_minimo = COALESCE($11, estoque_minimo),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $12
     RETURNING 
       id, 
       insumo_base_id, 
       nome, 
       tipo_medida, 
       formato_compra, 
       unidades_por_pack::float8 AS unidades_por_pack, 
       peso_unitario::float8 AS peso_unitario, 
       quantidade_embalagem::float8 AS quantidade_embalagem, 
       preco_embalagem::float8 AS preco_embalagem, 
       custo_por_unidade_base::float8 AS custo_por_unidade_base,
       estoque_atual::float8 AS estoque_atual,
       estoque_minimo::float8 AS estoque_minimo`,
    [
      input.insumo_base_id || null,
      input.nome,
      input.tipo_medida,
      input.formato_compra || "UNIDADE",
      input.unidades_por_pack || 1,
      input.peso_unitario || input.quantidade_embalagem,
      quantidadeTotal,
      input.preco_embalagem,
      custoBase,
      input.estoque_atual !== undefined ? input.estoque_atual : null,
      input.estoque_minimo !== undefined ? input.estoque_minimo : null,
      id,
    ]
  );
  return rows[0] ?? null;
}

export async function excluirInsumo(id: string): Promise<void> {
  await getPool().query("DELETE FROM insumos WHERE id = $1", [id]);
}

/* ==========================================================
   COMPRAS / ENTRADAS DE INSUMOS COM HISTÓRICO
   ========================================================== */

export async function registrarCompraInsumo(
  input: InsumoCompraInput
): Promise<InsumoCompra> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    // 1. Busca e bloqueia o insumo para atualização
    const { rows: insumosRows } = await client.query<Insumo>(
      `SELECT 
         id, nome, tipo_medida, formato_compra, unidades_por_pack, peso_unitario,
         quantidade_embalagem, preco_embalagem, custo_por_unidade_base,
         COALESCE(estoque_atual, 0)::float8 AS estoque_atual,
         COALESCE(estoque_minimo, 5)::float8 AS estoque_minimo
       FROM insumos 
       WHERE id = $1 
       FOR UPDATE`,
      [input.insumo_id]
    );

    if (insumosRows.length === 0) {
      throw new Error("Insumo não encontrado.");
    }

    const insumo = insumosRows[0];
    const precoUnitario = Number((input.preco_total / (input.quantidade || 1)).toFixed(4));

    // 2. Registra na tabela insumo_compras
    const { rows: compraRows } = await client.query<InsumoCompra>(
      `INSERT INTO insumo_compras (
         insumo_id, 
         quantidade, 
         preco_total, 
         preco_unitario, 
         estabelecimento, 
         data_compra, 
         observacoes
       )
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP), $7)
       RETURNING 
         id, 
         insumo_id, 
         quantidade::float8 AS quantidade, 
         preco_total::float8 AS preco_total, 
         preco_unitario::float8 AS preco_unitario, 
         estabelecimento, 
         to_char(data_compra, 'YYYY-MM-DD"T"HH24:MI:SS') AS data_compra, 
         observacoes`,
      [
        input.insumo_id,
        input.quantidade,
        input.preco_total,
        precoUnitario,
        input.estabelecimento || null,
        input.data_compra || null,
        input.observacoes || null,
      ]
    );

    // 3. Atualiza o estoque e recalcula custo unitário via média ponderada
    const estoqueAnterior = Number(insumo.estoque_atual || 0);
    const novoEstoque = estoqueAnterior + input.quantidade;

    const unidadesPack = Number(insumo.unidades_por_pack || 1);
    const pesoUnitario = Number(insumo.peso_unitario || insumo.quantidade_embalagem || 1);
    const qtdBasePorEmbalagem = unidadesPack * pesoUnitario;

    const qtdBaseComprada = input.quantidade * qtdBasePorEmbalagem;
    const custoBaseDestaCompra = input.preco_total / (qtdBaseComprada || 1);

    const estoqueBaseAnterior = estoqueAnterior * qtdBasePorEmbalagem;
    const novoEstoqueBaseTotal = estoqueBaseAnterior + qtdBaseComprada;

    const novoCustoBase =
      novoEstoqueBaseTotal > 0
        ? (estoqueBaseAnterior * Number(insumo.custo_por_unidade_base) + input.preco_total) /
          novoEstoqueBaseTotal
        : custoBaseDestaCompra;

    const novoPrecoEmbalagem = Number((input.preco_total / input.quantidade).toFixed(2));

    await client.query(
      `UPDATE insumos
       SET 
         estoque_atual = $1,
         custo_por_unidade_base = $2,
         preco_embalagem = $3,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [novoEstoque, novoCustoBase, novoPrecoEmbalagem, input.insumo_id]
    );

    await client.query("COMMIT");
    return {
      ...compraRows[0],
      insumo_nome: insumo.nome,
      tipo_medida: insumo.tipo_medida,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listarComprasInsumos(
  insumoId?: string,
  limit = 50
): Promise<InsumoCompra[]> {
  const query = insumoId
    ? `SELECT 
         c.id, 
         c.insumo_id, 
         i.nome AS insumo_nome,
         i.tipo_medida,
         c.quantidade::float8 AS quantidade, 
         c.preco_total::float8 AS preco_total, 
         c.preco_unitario::float8 AS preco_unitario, 
         c.estabelecimento, 
         to_char(c.data_compra, 'YYYY-MM-DD"T"HH24:MI:SS') AS data_compra, 
         c.observacoes
       FROM insumo_compras c
       JOIN insumos i ON i.id = c.insumo_id
       WHERE c.insumo_id = $1
       ORDER BY c.data_compra DESC, c.id DESC
       LIMIT $2`
    : `SELECT 
         c.id, 
         c.insumo_id, 
         i.nome AS insumo_nome,
         i.tipo_medida,
         c.quantidade::float8 AS quantidade, 
         c.preco_total::float8 AS preco_total, 
         c.preco_unitario::float8 AS preco_unitario, 
         c.estabelecimento, 
         to_char(c.data_compra, 'YYYY-MM-DD"T"HH24:MI:SS') AS data_compra, 
         c.observacoes
       FROM insumo_compras c
       JOIN insumos i ON i.id = c.insumo_id
       ORDER BY c.data_compra DESC, c.id DESC
       LIMIT $1`;

  const params = insumoId ? [insumoId, limit] : [limit];
  const { rows } = await getPool().query<InsumoCompra>(query, params);
  return rows;
}

export async function getHistoricoPrecosInsumos(): Promise<
  {
    insumo_id: string;
    insumo_nome: string;
    data_compra: string;
    preco_unitario: number;
    preco_total: number;
    quantidade: number;
    estabelecimento: string | null;
  }[]
> {
  const { rows } = await getPool().query(
    `SELECT 
       c.insumo_id,
       i.nome AS insumo_nome,
       to_char(c.data_compra, 'YYYY-MM-DD') AS data_compra,
       c.preco_unitario::float8 AS preco_unitario,
       c.preco_total::float8 AS preco_total,
       c.quantidade::float8 AS quantidade,
       COALESCE(c.estabelecimento, 'Não informado') AS estabelecimento
     FROM insumo_compras c
     JOIN insumos i ON i.id = c.insumo_id
     ORDER BY c.data_compra ASC`
  );
  return rows;
}

export async function getInsumosEstoqueBaixo(): Promise<Insumo[]> {
  const { rows } = await getPool().query<Insumo>(
    `SELECT 
       id, 
       insumo_base_id,
       nome, 
       tipo_medida, 
       COALESCE(formato_compra, 'UNIDADE') AS formato_compra,
       COALESCE(unidades_por_pack, 1)::float8 AS unidades_por_pack,
       peso_unitario::float8 AS peso_unitario,
       quantidade_embalagem::float8 AS quantidade_embalagem, 
       preco_embalagem::float8 AS preco_embalagem, 
       custo_por_unidade_base::float8 AS custo_por_unidade_base, 
       COALESCE(estoque_atual, 0)::float8 AS estoque_atual,
       COALESCE(estoque_minimo, 5)::float8 AS estoque_minimo,
       to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
       to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS updated_at
     FROM insumos
     WHERE COALESCE(estoque_atual, 0) <= COALESCE(estoque_minimo, 5)
     ORDER BY estoque_atual ASC, nome ASC`
  );
  return rows;
}

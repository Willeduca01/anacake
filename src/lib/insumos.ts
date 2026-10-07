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

  const { rows } = await getPool().query<Insumo>(
    `INSERT INTO insumos (
       insumo_base_id, 
       nome, 
       tipo_medida, 
       formato_compra, 
       unidades_por_pack, 
       peso_unitario, 
       quantidade_embalagem, 
       preco_embalagem, 
       custo_por_unidade_base
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
       custo_por_unidade_base::float8 AS custo_por_unidade_base`,
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
    ]
  );
  return rows[0];
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
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
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
       custo_por_unidade_base::float8 AS custo_por_unidade_base`,
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
      id,
    ]
  );
  return rows[0] ?? null;
}

export async function excluirInsumo(id: string): Promise<void> {
  await getPool().query("DELETE FROM insumos WHERE id = $1", [id]);
}

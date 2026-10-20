import { getPool } from "@/lib/db";

export type TipoVenda = "PADRAO" | "AVULSA";

export interface VendaInput {
  produto_id?: number | null;
  descricao_avulsa?: string | null;
  quantidade: number;
  valor_total?: number | null;
  metodo_pagamento: string | null;
  tipo_venda?: TipoVenda;
  baixa_estoque_realizada?: boolean;
}

export interface VendaRegistro {
  id: number;
  produto_id: number | null;
  produto_nome: string | null;
  descricao_avulsa: string | null;
  tipo_venda: TipoVenda;
  baixa_estoque_realizada: boolean;
  conciliado_por_admin: boolean;
  quantidade: number;
  valor_total: number;
  data_venda: string;
  metodo_pagamento: string | null;
}

export class EstoqueInsuficienteError extends Error {
  constructor(disponivel: number) {
    super(`Estoque insuficiente (disponível: ${disponivel}).`);
    this.name = "EstoqueInsuficienteError";
  }
}

export async function registrarVenda(input: VendaInput): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const tipoVenda: TipoVenda = input.tipo_venda || (input.produto_id ? "PADRAO" : "AVULSA");
    const baixaEstoque =
      tipoVenda === "AVULSA" ? (input.baixa_estoque_realizada ?? false) : true;
    const conciliado = false;

    let valorTotal = input.valor_total ?? 0;

    if (input.produto_id) {
      const { rows } = await client.query<{
        preco: number;
        estoque_atual: number;
      }>(
        "SELECT preco::float8 AS preco, estoque_atual FROM produtos WHERE id = $1 FOR UPDATE",
        [input.produto_id]
      );

      if (rows.length === 0) {
        throw new Error("Produto não encontrado.");
      }

      const { preco, estoque_atual } = rows[0];

      if (!input.valor_total || input.valor_total <= 0) {
        valorTotal = Number((preco * input.quantidade).toFixed(2));
      }

      if (baixaEstoque) {
        if (estoque_atual < input.quantidade) {
          throw new EstoqueInsuficienteError(estoque_atual);
        }
        await client.query(
          "UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id = $2",
          [input.quantidade, input.produto_id]
        );
      }
    } else {
      // Venda avulsa sem vínculo a produto cadastrado
      if (!input.descricao_avulsa || input.descricao_avulsa.trim().length === 0) {
        throw new Error("Informe a descrição do item vendido avulso.");
      }
      if (!input.valor_total || input.valor_total <= 0) {
        throw new Error("Informe o valor total da venda avulsa.");
      }
    }

    await client.query(
      `INSERT INTO vendas (
         produto_id, 
         descricao_avulsa, 
         tipo_venda, 
         baixa_estoque_realizada, 
         conciliado_por_admin, 
         quantidade, 
         valor_total, 
         metodo_pagamento
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.produto_id || null,
        input.descricao_avulsa?.trim() || null,
        tipoVenda,
        baixaEstoque,
        conciliado,
        input.quantidade,
        valorTotal,
        input.metodo_pagamento,
      ]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function conciliarEstoqueVenda(
  vendaId: number,
  produtoIdParaBaixa?: number | null,
  quantidadeParaBaixa?: number | null
): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{
      id: number;
      produto_id: number | null;
      quantidade: number;
      baixa_estoque_realizada: boolean;
    }>(
      `SELECT id, produto_id, quantidade, baixa_estoque_realizada 
       FROM vendas 
       WHERE id = $1 
       FOR UPDATE`,
      [vendaId]
    );

    if (rows.length === 0) {
      throw new Error("Venda não encontrada.");
    }

    const prodId = produtoIdParaBaixa || rows[0].produto_id;
    const qtd =
      quantidadeParaBaixa && quantidadeParaBaixa > 0
        ? quantidadeParaBaixa
        : rows[0].quantidade;

    if (prodId && qtd > 0) {
      const { rows: prodRows } = await client.query<{ estoque_atual: number }>(
        "SELECT estoque_atual FROM produtos WHERE id = $1 FOR UPDATE",
        [prodId]
      );
      if (prodRows.length > 0) {
        if (prodRows[0].estoque_atual < qtd) {
          throw new EstoqueInsuficienteError(prodRows[0].estoque_atual);
        }
        await client.query(
          "UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id = $2",
          [qtd, prodId]
        );
      }
    }

    await client.query(
      `UPDATE vendas 
       SET baixa_estoque_realizada = true, 
           conciliado_por_admin = true,
           produto_id = COALESCE($1, produto_id)
       WHERE id = $2`,
      [prodId || null, vendaId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listarVendas(limit = 100): Promise<VendaRegistro[]> {
  const { rows } = await getPool().query<VendaRegistro>(
    `SELECT v.id, 
            v.produto_id, 
            COALESCE(p.nome, v.descricao_avulsa, 'Venda Avulsa') AS produto_nome, 
            v.descricao_avulsa,
            COALESCE(v.tipo_venda, 'PADRAO') AS tipo_venda,
            COALESCE(v.baixa_estoque_realizada, true) AS baixa_estoque_realizada,
            COALESCE(v.conciliado_por_admin, false) AS conciliado_por_admin,
            v.quantidade,
            v.valor_total::float8 AS valor_total,
            to_char(v.data_venda, 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM') AS data_venda,
            v.metodo_pagamento
     FROM vendas v
     LEFT JOIN produtos p ON p.id = v.produto_id
     ORDER BY v.data_venda DESC, v.id DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

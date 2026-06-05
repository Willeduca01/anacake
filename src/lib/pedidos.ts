import { getPool } from "@/lib/db";

export interface PedidoItemInput {
  produto_nome: string;
  quantidade: number;
  preco_unit: number;
}

export interface PedidoItem extends PedidoItemInput {
  id: number;
}

export interface Pedido {
  id: number;
  status: "pendente" | "confirmado" | "recusado";
  cliente_nome: string | null;
  total: number;
  created_at: string;
  itens: PedidoItem[];
}

export class PedidoVazioError extends Error {
  constructor() {
    super("Pedido sem itens válidos.");
    this.name = "PedidoVazioError";
  }
}

export class ProdutoNaoEncontradoError extends Error {
  constructor(nome: string) {
    super(`Produto "${nome}" não encontrado no cardápio (pode ter sido renomeado/removido).`);
    this.name = "ProdutoNaoEncontradoError";
  }
}

export class EstoqueInsuficientePedidoError extends Error {
  constructor(nome: string, disponivel: number) {
    super(`Estoque insuficiente de "${nome}" (disponível: ${disponivel}).`);
    this.name = "EstoqueInsuficientePedidoError";
  }
}

export async function criarPedido(
  clienteNome: string | null,
  itens: PedidoItemInput[]
): Promise<number> {
  const validos = itens.filter(
    (i) => i.produto_nome && i.quantidade > 0 && i.preco_unit >= 0
  );
  if (validos.length === 0) throw new PedidoVazioError();

  const total = Number(
    validos
      .reduce((acc, i) => acc + i.preco_unit * i.quantidade, 0)
      .toFixed(2)
  );

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO pedidos (cliente_nome, total) VALUES ($1, $2) RETURNING id`,
      [clienteNome, total]
    );
    const pedidoId = rows[0].id;

    for (const item of validos) {
      await client.query(
        `INSERT INTO pedido_itens (pedido_id, produto_nome, quantidade, preco_unit)
         VALUES ($1, $2, $3, $4)`,
        [pedidoId, item.produto_nome, Math.trunc(item.quantidade), item.preco_unit]
      );
    }

    await client.query("COMMIT");
    return pedidoId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listarPedidosPendentes(): Promise<Pedido[]> {
  const { rows } = await getPool().query<{
    id: number;
    status: Pedido["status"];
    cliente_nome: string | null;
    total: number;
    created_at: string;
    itens: PedidoItem[] | null;
  }>(
    `SELECT p.id, p.status, p.cliente_nome, p.total::float8 AS total,
            to_char(p.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', i.id,
                  'produto_nome', i.produto_nome,
                  'quantidade', i.quantidade,
                  'preco_unit', i.preco_unit::float8
                ) ORDER BY i.id
              ) FILTER (WHERE i.id IS NOT NULL),
              '[]'
            ) AS itens
     FROM pedidos p
     LEFT JOIN pedido_itens i ON i.pedido_id = p.id
     WHERE p.status = 'pendente'
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  return rows.map((r) => ({ ...r, itens: r.itens ?? [] }));
}

export async function contarPedidosPendentes(): Promise<number> {
  const { rows } = await getPool().query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM pedidos WHERE status = 'pendente'`
  );
  return rows[0].total;
}

export async function confirmarPedido(pedidoId: number): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const { rows: pedidoRows } = await client.query<{ status: string }>(
      `SELECT status FROM pedidos WHERE id = $1 FOR UPDATE`,
      [pedidoId]
    );
    if (pedidoRows.length === 0) throw new Error("Pedido não encontrado.");
    if (pedidoRows[0].status !== "pendente") {
      throw new Error("Pedido já processado.");
    }

    const { rows: itens } = await client.query<{
      produto_nome: string;
      quantidade: number;
      preco_unit: number;
    }>(
      `SELECT produto_nome, quantidade, preco_unit::float8 AS preco_unit
       FROM pedido_itens WHERE pedido_id = $1`,
      [pedidoId]
    );

    for (const item of itens) {
      const { rows: prod } = await client.query<{
        id: number;
        estoque_atual: number;
      }>(
        `SELECT id, estoque_atual FROM produtos WHERE nome = $1 FOR UPDATE`,
        [item.produto_nome]
      );
      if (prod.length === 0) {
        throw new ProdutoNaoEncontradoError(item.produto_nome);
      }
      const { id: produtoId, estoque_atual } = prod[0];
      if (estoque_atual < item.quantidade) {
        throw new EstoqueInsuficientePedidoError(item.produto_nome, estoque_atual);
      }

      const valorTotal = Number((item.preco_unit * item.quantidade).toFixed(2));
      await client.query(
        `INSERT INTO vendas (produto_id, quantidade, valor_total, metodo_pagamento)
         VALUES ($1, $2, $3, 'WhatsApp')`,
        [produtoId, item.quantidade, valorTotal]
      );
      await client.query(
        `UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id = $2`,
        [item.quantidade, produtoId]
      );
    }

    await client.query(
      `UPDATE pedidos SET status = 'confirmado', confirmado_em = CURRENT_TIMESTAMP WHERE id = $1`,
      [pedidoId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function recusarPedido(pedidoId: number): Promise<void> {
  await getPool().query(
    `UPDATE pedidos SET status = 'recusado' WHERE id = $1 AND status = 'pendente'`,
    [pedidoId]
  );
}

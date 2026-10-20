import { getPool } from "@/lib/db";

export interface PedidoItemInput {
  produto_nome: string;
  quantidade: number;
  preco_unit: number;
  observacao?: string | null;
}

export interface PedidoItem extends PedidoItemInput {
  id: number;
}

export interface Pedido {
  id: number;
  status: "pendente" | "confirmado" | "recusado";
  cliente_nome: string | null;
  metodo_pagamento: string | null;
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
  readonly itemNome: string;
  constructor(nome: string) {
    super(`Produto "${nome}" não encontrado no cardápio ou indisponível.`);
    this.name = "ProdutoNaoEncontradoError";
    this.itemNome = nome;
  }
}

export class EstoqueInsuficientePedidoError extends Error {
  readonly itemNome: string;
  readonly disponivel: number;
  constructor(nome: string, disponivel: number) {
    super(
      disponivel > 0
        ? `Estoque insuficiente de "${nome}" (disponível: ${disponivel}).`
        : `O produto "${nome}" está esgotado no momento.`
    );
    this.name = "EstoqueInsuficientePedidoError";
    this.itemNome = nome;
    this.disponivel = disponivel;
  }
}

export async function criarPedido(
  clienteNome: string | null,
  metodoPagamento: string | null,
  itens: PedidoItemInput[]
): Promise<number> {
  const validos = itens.filter(
    (i) => i.produto_nome && i.quantidade > 0 && i.preco_unit >= 0
  );
  if (validos.length === 0) throw new PedidoVazioError();

  // Consolidar quantidades caso haja itens repetidos na sacola
  const mapaItens = new Map<string, { quantidade: number; preco_unit: number }>();
  for (const item of validos) {
    const nome = item.produto_nome.trim();
    const atual = mapaItens.get(nome);
    if (atual) {
      atual.quantidade += Math.trunc(item.quantidade);
    } else {
      mapaItens.set(nome, {
        quantidade: Math.trunc(item.quantidade),
        preco_unit: item.preco_unit,
      });
    }
  }

  // Ordenar nomes alfabeticamente para ordenação determinística de lock e evitar deadlocks concorrentes
  const nomesOrdenados = Array.from(mapaItens.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  const total = Number(
    Array.from(mapaItens.entries())
      .reduce((acc, [, i]) => acc + i.preco_unit * i.quantidade, 0)
      .toFixed(2)
  );

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    // Trava de concorrência com SELECT ... FOR UPDATE e dedução condicional atômica
    for (const nome of nomesOrdenados) {
      const itemInfo = mapaItens.get(nome)!;

      const { rows: prodRows } = await client.query<{
        id: number;
        estoque_atual: number;
        ativo: boolean;
      }>(
        `SELECT id, estoque_atual, ativo FROM produtos WHERE nome = $1 FOR UPDATE`,
        [nome]
      );

      if (prodRows.length === 0) {
        throw new ProdutoNaoEncontradoError(nome);
      }

      const prod = prodRows[0];
      if (!prod.ativo || prod.estoque_atual < itemInfo.quantidade) {
        throw new EstoqueInsuficientePedidoError(nome, prod.estoque_atual);
      }

      // Dedução atômica condicional de estoque
      const updateRes = await client.query<{ estoque_atual: number }>(
        `UPDATE produtos 
         SET estoque_atual = estoque_atual - $1 
         WHERE id = $2 AND estoque_atual >= $1 
         RETURNING estoque_atual`,
        [itemInfo.quantidade, prod.id]
      );

      if (updateRes.rowCount === 0) {
        throw new EstoqueInsuficientePedidoError(nome, prod.estoque_atual);
      }
    }

    // Criação do registro do pedido
    const { rows: pedidoRows } = await client.query<{ id: number }>(
      `INSERT INTO pedidos (cliente_nome, metodo_pagamento, total) VALUES ($1, $2, $3) RETURNING id`,
      [clienteNome, metodoPagamento, total]
    );
    const pedidoId = pedidoRows[0].id;

    // Inserção dos itens do pedido (preservando observação específica de cada item)
    for (const item of validos) {
      await client.query(
        `INSERT INTO pedido_itens (pedido_id, produto_nome, quantidade, preco_unit, observacao)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          pedidoId,
          item.produto_nome.trim(),
          item.quantidade,
          item.preco_unit,
          item.observacao?.trim() || null,
        ]
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
    metodo_pagamento: string | null;
    total: number;
    created_at: string;
    itens: PedidoItem[] | null;
  }>(
    `SELECT p.id, p.status, p.cliente_nome, p.metodo_pagamento, p.total::float8 AS total,
            to_char(p.created_at, 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM') AS created_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', i.id,
                  'produto_nome', i.produto_nome,
                  'quantidade', i.quantidade,
                  'preco_unit', i.preco_unit::float8,
                  'observacao', i.observacao
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

    const { rows: pedidoRows } = await client.query<{
      status: string;
      metodo_pagamento: string | null;
    }>(
      `SELECT status, metodo_pagamento FROM pedidos WHERE id = $1 FOR UPDATE`,
      [pedidoId]
    );
    if (pedidoRows.length === 0) throw new Error("Pedido não encontrado.");
    if (pedidoRows[0].status !== "pendente") {
      throw new Error("Pedido já processado.");
    }
    const metodoPagamento = pedidoRows[0].metodo_pagamento ?? "WhatsApp";

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
      const { rows: prod } = await client.query<{ id: number }>(
        `SELECT id FROM produtos WHERE nome = $1`,
        [item.produto_nome]
      );
      const produtoId = prod.length > 0 ? prod[0].id : null;
      const valorTotal = Number((item.preco_unit * item.quantidade).toFixed(2));

      await client.query(
        `INSERT INTO vendas (produto_id, quantidade, valor_total, metodo_pagamento)
         VALUES ($1, $2, $3, $4)`,
        [produtoId, item.quantidade, valorTotal, metodoPagamento]
      );
      // Nota: A dedução de estoque_atual foi realizada atomicamente na criação do pedido no checkout
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
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    const { rows: pedidoRows } = await client.query<{ status: string }>(
      `SELECT status FROM pedidos WHERE id = $1 FOR UPDATE`,
      [pedidoId]
    );
    if (pedidoRows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Pedido não encontrado.");
    }
    if (pedidoRows[0].status !== "pendente") {
      await client.query("ROLLBACK");
      throw new Error("Pedido já processado.");
    }

    const { rows: itens } = await client.query<{
      produto_nome: string;
      quantidade: number;
    }>(
      `SELECT produto_nome, quantidade FROM pedido_itens WHERE pedido_id = $1`,
      [pedidoId]
    );

    // Devolve o estoque que foi reservado atomicamente na criação do pedido no checkout
    for (const item of itens) {
      await client.query(
        `UPDATE produtos SET estoque_atual = estoque_atual + $1 WHERE nome = $2`,
        [item.quantidade, item.produto_nome]
      );
    }

    await client.query(
      `UPDATE pedidos SET status = 'recusado' WHERE id = $1`,
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

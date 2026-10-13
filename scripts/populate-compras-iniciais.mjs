import pg from 'pg';
import { getDatabaseUrl } from './get-db-url.mjs';

const { Pool } = pg;
const connectionString = getDatabaseUrl();

if (!connectionString) {
  console.error('DATABASE_URL não configurada.');
  process.exit(1);
}

async function run() {
  const pool = new Pool({ connectionString });
  console.log('Conectando ao banco para verificar compras iniciais de insumos...');

  const queryVerificar = `
    SELECT 
      i.id,
      i.nome,
      COALESCE(i.unidades_por_pack, 1)::float8 as quantidade,
      i.preco_embalagem::float8 as preco_total,
      (i.preco_embalagem / COALESCE(i.unidades_por_pack, 1))::float8 as preco_unitario,
      i.created_at
    FROM insumos i
    WHERE NOT EXISTS (
      SELECT 1 FROM insumo_compras ic WHERE ic.insumo_id = i.id
    )
    ORDER BY i.created_at ASC
  `;

  const { rows } = await pool.query(queryVerificar);
  console.log(`Encontrados ${rows.length} insumos sem histórico de compra:`);
  console.log(rows);

  if (rows.length > 0) {
    const queryInserir = `
      INSERT INTO insumo_compras (
        insumo_id,
        quantidade,
        preco_total,
        preco_unitario,
        estabelecimento,
        data_compra,
        observacoes
      )
      SELECT 
        i.id,
        COALESCE(i.unidades_por_pack, 1),
        i.preco_embalagem,
        i.preco_embalagem / COALESCE(i.unidades_por_pack, 1),
        'Cadastro Inicial',
        i.created_at,
        'Compra/aquisição registrada no cadastro do insumo'
      FROM insumos i
      WHERE NOT EXISTS (
        SELECT 1 FROM insumo_compras ic WHERE ic.insumo_id = i.id
      )
      RETURNING id, insumo_id, preco_total, data_compra
    `;

    const res = await pool.query(queryInserir);
    console.log(`✅ Inseridas ${res.rowCount} compras iniciais em insumo_compras!`);
  }

  await pool.end();
}

run().catch((err) => {
  console.error('Erro:', err);
  process.exit(1);
});

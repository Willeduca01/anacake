import pg from 'pg';
import { getDatabaseUrl } from './get-db-url.mjs';

const { Pool } = pg;
const connectionString = getDatabaseUrl();

if (!connectionString) {
  console.error('Erro: DATABASE_URL não configurada no ambiente nem no arquivo .env.');
  process.exit(1);
}

async function migrate() {
  const pool = new Pool({ connectionString });
  console.log('Conectando ao PostgreSQL para migração de insumos avulsos...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Atualizando tabela insumo_compras (permitir insumo_id nulo para compras avulsas)...');
    await client.query(`
      ALTER TABLE insumo_compras ALTER COLUMN insumo_id DROP NOT NULL;
    `);

    console.log('2. Adicionando colunas tipo_compra, descricao_avulsa e categoria_gasto em insumo_compras...');
    await client.query(`
      ALTER TABLE insumo_compras ADD COLUMN IF NOT EXISTS tipo_compra VARCHAR(20) NOT NULL DEFAULT 'PADRAO';
      ALTER TABLE insumo_compras ADD COLUMN IF NOT EXISTS descricao_avulsa VARCHAR(255);
      ALTER TABLE insumo_compras ADD COLUMN IF NOT EXISTS categoria_gasto VARCHAR(50) DEFAULT 'GASTO';
      CREATE INDEX IF NOT EXISTS idx_insumo_compras_tipo ON insumo_compras(tipo_compra);
      CREATE INDEX IF NOT EXISTS idx_insumo_compras_categoria ON insumo_compras(categoria_gasto);
    `);

    await client.query('COMMIT');
    console.log('✅ Migração de insumos avulsos executada com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Falha na migração:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

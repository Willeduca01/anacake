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
  console.log('Conectando ao PostgreSQL para migração de compras e vendas avulsas...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Atualizando tabela insumos (estoque_atual e estoque_minimo)...');
    await client.query(`
      ALTER TABLE insumos ADD COLUMN IF NOT EXISTS estoque_atual NUMERIC(10, 2) DEFAULT 0;
      ALTER TABLE insumos ADD COLUMN IF NOT EXISTS estoque_minimo NUMERIC(10, 2) DEFAULT 5;
      UPDATE insumos 
      SET estoque_atual = quantidade_embalagem 
      WHERE estoque_atual IS NULL OR estoque_atual = 0;
    `);

    console.log('2. Criando tabela insumo_compras...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS insumo_compras (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
        quantidade NUMERIC(10, 2) NOT NULL,
        preco_total NUMERIC(10, 2) NOT NULL,
        preco_unitario NUMERIC(10, 4) NOT NULL,
        estabelecimento VARCHAR(255),
        data_compra TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        observacoes TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_insumo_compras_insumo ON insumo_compras(insumo_id);
      CREATE INDEX IF NOT EXISTS idx_insumo_compras_data ON insumo_compras(data_compra);
    `);

    console.log('3. Atualizando tabela vendas (tipo_venda, baixa_estoque, conciliação e descricao_avulsa)...');
    await client.query(`
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS tipo_venda VARCHAR(20) NOT NULL DEFAULT 'PADRAO';
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS baixa_estoque_realizada BOOLEAN NOT NULL DEFAULT true;
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS conciliado_por_admin BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS descricao_avulsa VARCHAR(255);
    `);

    await client.query('COMMIT');
    console.log('✅ Migração executada com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Falha na migração:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));

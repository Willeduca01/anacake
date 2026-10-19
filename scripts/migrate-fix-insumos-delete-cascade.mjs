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
  console.log('Conectando ao PostgreSQL para ajustar restrição de exclusão de insumos...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Removendo constraint RESTRICT existente em receita_insumos.insumo_id...');
    await client.query(`
      ALTER TABLE receita_insumos 
      DROP CONSTRAINT IF EXISTS receita_insumos_insumo_id_fkey;
    `);

    console.log('2. Adicionando constraint ON DELETE CASCADE em receita_insumos.insumo_id...');
    await client.query(`
      ALTER TABLE receita_insumos 
      ADD CONSTRAINT receita_insumos_insumo_id_fkey 
      FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE;
    `);

    console.log('3. Verificando constraint em insumo_compras...');
    await client.query(`
      ALTER TABLE insumo_compras 
      DROP CONSTRAINT IF EXISTS insumo_compras_insumo_id_fkey;

      ALTER TABLE insumo_compras 
      ADD CONSTRAINT insumo_compras_insumo_id_fkey 
      FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE;
    `);

    await client.query('COMMIT');
    console.log('✅ Migração executada com sucesso! Insumos agora podem ser excluídos com CASCADE.');
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

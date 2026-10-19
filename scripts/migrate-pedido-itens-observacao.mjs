import pg from 'pg';
import { getDatabaseUrl } from './get-db-url.mjs';

const { Pool } = pg;
const connectionString = getDatabaseUrl();

if (!connectionString) {
  console.error('Erro: DATABASE_URL não configurada.');
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS observacao TEXT;
    `);
    console.log('Coluna observacao adicionada com sucesso em pedido_itens.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

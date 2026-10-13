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
  const client = await pool.connect();

  try {
    console.log('Adding publication and image columns to receitas table...');
    await client.query(`
      ALTER TABLE receitas ADD COLUMN IF NOT EXISTS produto_id INT REFERENCES produtos(id) ON DELETE SET NULL;
      ALTER TABLE receitas ADD COLUMN IF NOT EXISTS publicado BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE receitas ADD COLUMN IF NOT EXISTS descricao TEXT;
      ALTER TABLE receitas ADD COLUMN IF NOT EXISTS categoria VARCHAR(100) DEFAULT 'doces';
      ALTER TABLE receitas ADD COLUMN IF NOT EXISTS url_imagem TEXT;
      ALTER TABLE receitas ADD COLUMN IF NOT EXISTS imagem_dados BYTEA;
      ALTER TABLE receitas ADD COLUMN IF NOT EXISTS imagem_mime VARCHAR(50);

      CREATE INDEX IF NOT EXISTS idx_receitas_produto_id ON receitas(produto_id);
    `);
    console.log('Columns added successfully to receitas!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);

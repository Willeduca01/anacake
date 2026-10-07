import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://neondb_owner:npg_aUgOIK0HkTE2@ep-dark-boat-b6q25xt7-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

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

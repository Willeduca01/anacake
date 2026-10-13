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
    console.log('Creating configuracoes_promocao table if not exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracoes_promocao (
        id INT PRIMARY KEY DEFAULT 1,
        titulo VARCHAR(255) NOT NULL DEFAULT 'Coleção Especial de Dia das Mães',
        subtitulo VARCHAR(255) NOT NULL DEFAULT 'Novidade da Temporada',
        descricao TEXT NOT NULL DEFAULT 'Kits exclusivos com brigadeiros, trufas e mini bolos decorados. Encomende até 5 de maio e ganhe uma caixa personalizada de presente.',
        categoria VARCHAR(100) NOT NULL DEFAULT 'promocoes',
        ativo BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO configuracoes_promocao (id, titulo, subtitulo, descricao, categoria, ativo)
      VALUES (
        1,
        'Coleção Especial de Dia das Mães',
        'Novidade da Temporada',
        'Kits exclusivos com brigadeiros, trufas e mini bolos decorados. Encomende até 5 de maio e ganhe uma caixa personalizada de presente.',
        'promocoes',
        true
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Table configuracoes_promocao checked/created successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);

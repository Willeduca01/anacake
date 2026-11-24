import pg from 'pg';
import { getDatabaseUrl } from './get-db-url.mjs';

const { Pool } = pg;
const connectionString = getDatabaseUrl();

if (!connectionString) {
  console.error('Erro: DATABASE_URL não configurada no ambiente nem no arquivo .env.');
  process.exit(1);
}

async function migrate() {
  const pool = new Pool({
    connectionString,
    options: "-c timezone=America/Sao_Paulo",
  });
  const client = await pool.connect();

  try {
    console.log('Iniciando migração de data_comemorativa_config e data_comemorativa_produtos...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS data_comemorativa_config (
        id INT PRIMARY KEY DEFAULT 1,
        ativo BOOLEAN NOT NULL DEFAULT false,
        nome_aba TEXT NOT NULL DEFAULT 'Natal',
        tema_slug TEXT NOT NULL DEFAULT 'natal',
        badge_texto TEXT DEFAULT 'Especial de Fim de Ano',
        subtitulo TEXT DEFAULT 'Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia.',
        fonte_titulo TEXT DEFAULT 'great-vibes',
        tamanho_titulo TEXT DEFAULT 'medio',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO data_comemorativa_config (id, ativo, nome_aba, tema_slug, badge_texto, subtitulo, fonte_titulo, tamanho_titulo)
      VALUES (
        1,
        false,
        'Natal',
        'natal',
        'Especial de Fim de Ano',
        'Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia.',
        'great-vibes',
        'medio'
      )
      ON CONFLICT (id) DO NOTHING;

      CREATE TABLE IF NOT EXISTS data_comemorativa_produtos (
        produto_id INT PRIMARY KEY REFERENCES produtos(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_data_comemorativa_produtos_id ON data_comemorativa_produtos (produto_id);
    `);

    console.log('Tabelas de data comemorativa verificadas/criadas com sucesso!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Erro ao executar migração:', err);
  process.exit(1);
});

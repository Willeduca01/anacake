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
    console.log('Adicionando colunas de customização visual em data_comemorativa_config...');

    await client.query(`
      ALTER TABLE data_comemorativa_config
      ADD COLUMN IF NOT EXISTS badge_texto TEXT DEFAULT 'Especial de Fim de Ano',
      ADD COLUMN IF NOT EXISTS subtitulo TEXT DEFAULT 'Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia.',
      ADD COLUMN IF NOT EXISTS fonte_titulo TEXT DEFAULT 'great-vibes',
      ADD COLUMN IF NOT EXISTS tamanho_titulo TEXT DEFAULT 'medio';

      UPDATE data_comemorativa_config
      SET
        badge_texto = COALESCE(badge_texto, 'Especial de Fim de Ano'),
        subtitulo = COALESCE(subtitulo, 'Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia.'),
        fonte_titulo = COALESCE(fonte_titulo, 'great-vibes'),
        tamanho_titulo = COALESCE(tamanho_titulo, 'medio')
      WHERE id = 1;
    `);

    console.log('Colunas de customização adicionadas e atualizadas com sucesso!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Erro ao executar migração:', err);
  process.exit(1);
});

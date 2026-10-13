import fs from 'fs';
import path from 'path';

/**
 * Obtém a DATABASE_URL a partir do ambiente ou do arquivo .env local.
 * Isso evita gravar credenciais hardcoded em scripts de migração/seed.
 */
export function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.trim();
  }

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^DATABASE_URL=(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // Ignora erro de leitura e cai no fallback nulo
  }

  return null;
}

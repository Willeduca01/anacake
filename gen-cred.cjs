/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const senha = process.argv[2];
if (!senha || senha.trim().length === 0) {
  console.error("Erro: Nenhuma senha informada.");
  console.error("Uso: node gen-cred.cjs \"SuaSenhaSeguraAqui\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(senha, 10);

console.log("# Copie os valores abaixo para as respectivas variáveis no seu arquivo .env:");
console.log("ADMIN_USER=admin");
console.log("ADMIN_PASSWORD_HASH_B64=" + Buffer.from(hash, "utf8").toString("base64"));
console.log("AUTH_SECRET=" + crypto.randomBytes(32).toString("hex"));

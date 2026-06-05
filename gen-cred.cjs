const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const senha = process.argv[2] || "AnaCake@Admin2026";
const hash = bcrypt.hashSync(senha, 10);

console.log("ADMIN_USER=admin");
console.log("ADMIN_PASSWORD_PLAIN=" + senha);
console.log("ADMIN_PASSWORD_HASH=" + hash);
console.log("ADMIN_PASSWORD_HASH_B64=" + Buffer.from(hash, "utf8").toString("base64"));
console.log("AUTH_SECRET=" + crypto.randomBytes(32).toString("hex"));

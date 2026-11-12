// Jalankan dari root project:
//   node --env-file=.env.local scripts/seed.js
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const accounts = [
  { nama: "Administrator", email: "admin@spmb.local", password: "admin321", role: "admin" },
  { nama: "Kepala Sekolah", email: "kepsek@spmb.local", password: "kepsek321", role: "kepsek" },
];

const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "spmb",
});

for (const a of accounts) {
  const hash = await bcrypt.hash(a.password, 10);
  await db.query(
    `INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nama = VALUES(nama), password_hash = VALUES(password_hash), role = VALUES(role)`,
    [a.nama, a.email, hash, a.role]
  );
  console.log(`OK: ${a.email} (${a.role})`);
}

await db.end();

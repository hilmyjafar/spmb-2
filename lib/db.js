import mysql from "mysql2/promise";

// Pool disimpan di globalThis supaya tidak bikin koneksi baru tiap hot-reload
const g = globalThis;

export const db =
  g.__spmbPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "spmb",
    waitForConnections: true,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") g.__spmbPool = db;

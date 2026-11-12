import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const nama = String(body.nama || "").trim();
  const nisn = String(body.nisn || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const konfirmasi = String(body.konfirmasi || "");

  if (!nama || !nisn || !email || !password) {
    return Response.json({ error: "Semua field wajib diisi." }, { status: 400 });
  }
  if (!/^\d{10}$/.test(nisn)) {
    return Response.json({ error: "NISN harus 10 digit angka." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Format email tidak valid." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
  }
  if (password !== konfirmasi) {
    return Response.json({ error: "Konfirmasi kata sandi tidak cocok." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const conn = await db.getConnection();
  try {
    // Dua langkah harus berhasil bersamaan: bikin akun + bikin data pendaftarannya
    await conn.beginTransaction();
    const [r] = await conn.query(
      "INSERT INTO users (nama, nisn, email, password_hash, role) VALUES (?, ?, ?, ?, 'siswa')",
      [nama, nisn, email, hash]
    );
    await conn.query(
      "INSERT INTO calon_siswa (user_id, nama, asal_sekolah) VALUES (?, ?, '')",
      [r.insertId, nama]
    );
    await conn.commit();
    return Response.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      const msg = String(err.sqlMessage || "").includes("nisn")
        ? "NISN sudah terdaftar."
        : "Email sudah terdaftar.";
      return Response.json({ error: msg }, { status: 409 });
    }
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  } finally {
    conn.release();
  }
}

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

// Reset kata sandi akun siswa (admin yang menentukan sandi barunya)
export async function PUT(req, { params }) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");

  if (password.length < 8) {
    return Response.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ? AND role = 'siswa'",
      [hash, id]
    );
    if (r.affectedRows === 0) {
      return Response.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// Hapus akun siswa. Data pendaftarannya (calon_siswa) tetap ada, hanya terlepas dari akun.
export async function DELETE(_req, { params }) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  try {
    const [r] = await db.query("DELETE FROM users WHERE id = ? AND role = 'siswa'", [id]);
    if (r.affectedRows === 0) {
      return Response.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

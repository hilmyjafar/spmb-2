import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, dashboardPath } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const identifier = String(body.identifier || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!identifier || !password) {
    return Response.json({ error: "Email/NISN dan kata sandi wajib diisi." }, { status: 400 });
  }

  try {
    // Bisa login pakai email ATAU NISN
    const [rows] = await db.query(
      "SELECT id, nama, role, password_hash FROM users WHERE email = ? OR nisn = ? LIMIT 1",
      [identifier, identifier]
    );
    const user = rows[0];
    const valid = user && (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      return Response.json({ error: "Email/NISN atau kata sandi salah." }, { status: 401 });
    }

    await createSession(user);
    return Response.json({ ok: true, redirect: dashboardPath(user.role) });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

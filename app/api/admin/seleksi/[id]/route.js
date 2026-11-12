import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

const ALLOWED = ["menunggu", "lulus", "tidak_lulus"];

// Simpan hasil seleksi satu calon siswa
export async function PUT(req, { params }) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status_seleksi;
  const keterangan = String(body.keterangan || "").trim().slice(0, 255);

  if (!ALLOWED.includes(status)) {
    return Response.json({ error: "Status seleksi tidak valid." }, { status: 400 });
  }

  try {
    const [[c]] = await db.query("SELECT nilai_tpa FROM calon_siswa WHERE id = ?", [id]);
    if (!c) return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });

    // Keputusan lulus/tidak lulus hanya boleh kalau sudah ada nilai TPA
    if (status !== "menunggu" && c.nilai_tpa === null) {
      return Response.json({ error: "Calon siswa ini belum memiliki nilai TPA." }, { status: 400 });
    }

    await db.query(
      "UPDATE calon_siswa SET status_seleksi = ?, keterangan_seleksi = ? WHERE id = ?",
      [status, keterangan || null, id]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

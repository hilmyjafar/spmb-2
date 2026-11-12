import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { parseSoal, soalTerkunci } from "@/lib/tpa";

const TERKUNCI = "Soal terkunci karena sudah ada siswa yang mengerjakan tes. Reset hasil tes siswa itu dulu kalau perlu mengubah soal.";

// Edit soal
export async function PUT(req, { params }) {
  if (!(await requireAdmin())) return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  const { id } = await params;
  const { data, error } = parseSoal(await req.json().catch(() => ({})));
  if (error) return Response.json({ error }, { status: 400 });
  try {
    if (await soalTerkunci()) return Response.json({ error: TERKUNCI }, { status: 409 });
    const [r] = await db.query(
      "UPDATE soal_tpa SET pertanyaan = ?, opsi_a = ?, opsi_b = ?, opsi_c = ?, opsi_d = ?, jawaban_benar = ? WHERE id = ?",
      [data.pertanyaan, data.opsi_a, data.opsi_b, data.opsi_c, data.opsi_d, data.jawaban_benar, id]
    );
    if (r.affectedRows === 0) return Response.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// Hapus soal
export async function DELETE(_req, { params }) {
  if (!(await requireAdmin())) return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  const { id } = await params;
  try {
    if (await soalTerkunci()) return Response.json({ error: TERKUNCI }, { status: 409 });
    const [r] = await db.query("DELETE FROM soal_tpa WHERE id = ?", [id]);
    if (r.affectedRows === 0) return Response.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

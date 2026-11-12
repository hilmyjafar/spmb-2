import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { parseSoal, soalTerkunci } from "@/lib/tpa";

const TERKUNCI = "Soal terkunci karena sudah ada siswa yang mengerjakan tes. Reset hasil tes siswa itu dulu kalau perlu mengubah soal.";

// Tambah soal
export async function POST(req) {
  if (!(await requireAdmin())) return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  const { data, error } = parseSoal(await req.json().catch(() => ({})));
  if (error) return Response.json({ error }, { status: 400 });
  try {
    if (await soalTerkunci()) return Response.json({ error: TERKUNCI }, { status: 409 });
    await db.query(
      "INSERT INTO soal_tpa (pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar) VALUES (?, ?, ?, ?, ?, ?)",
      [data.pertanyaan, data.opsi_a, data.opsi_b, data.opsi_c, data.opsi_d, data.jawaban_benar]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

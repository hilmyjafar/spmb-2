import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { parseSiswa } from "@/lib/calon-siswa";

// Tambah calon siswa
export async function POST(req) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { data, error } = parseSiswa(await req.json().catch(() => ({})));
  if (error) return Response.json({ error }, { status: 400 });

  try {
    const [r] = await db.query(
      "INSERT INTO calon_siswa (nama, asal_sekolah, jurusan_id, status_data) VALUES (?, ?, ?, ?)",
      [data.nama, data.asal_sekolah, data.jurusan_id, data.status_data]
    );
    return Response.json({ ok: true, id: r.insertId });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return Response.json({ error: "Jurusan tidak valid." }, { status: 400 });
    }
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

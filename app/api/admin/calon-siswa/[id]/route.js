import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { parseSiswa } from "@/lib/calon-siswa";

// Data diri yang diisi siswa (untuk modal Lihat)
export async function GET(_req, { params }) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  try {
    const [[b]] = await db.query(
      "SELECT b.*, DATE_FORMAT(b.tanggal_lahir, '%d-%m-%Y') AS tgl_lahir FROM biodata b WHERE b.calon_siswa_id = ?",
      [id]
    );
    return Response.json({ biodata: b || null });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// Edit calon siswa
export async function PUT(req, { params }) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const { data, error } = parseSiswa(await req.json().catch(() => ({})));
  if (error) return Response.json({ error }, { status: 400 });

  try {
    const [r] = await db.query(
      "UPDATE calon_siswa SET nama = ?, asal_sekolah = ?, jurusan_id = ?, status_data = ? WHERE id = ?",
      [data.nama, data.asal_sekolah, data.jurusan_id, data.status_data, id]
    );
    if (r.affectedRows === 0) {
      return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return Response.json({ error: "Jurusan tidak valid." }, { status: 400 });
    }
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// Hapus calon siswa
export async function DELETE(_req, { params }) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  try {
    const [r] = await db.query("DELETE FROM calon_siswa WHERE id = ?", [id]);
    if (r.affectedRows === 0) {
      return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

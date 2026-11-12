import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

const unauthorized = () => Response.json({ error: "Tidak diizinkan." }, { status: 401 });

// Daftar berkas milik satu calon siswa (untuk modal "Lihat")
export async function GET(_req, { params }) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;
  try {
    const [[c]] = await db.query(
      "SELECT status_dokumen, catatan_dokumen FROM calon_siswa WHERE id = ?",
      [id]
    );
    if (!c) return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
    const [berkas] = await db.query(
      "SELECT id, jenis, nama_file, uploaded_at FROM berkas WHERE calon_siswa_id = ? ORDER BY id",
      [id]
    );
    return Response.json({ status: c.status_dokumen, catatan: c.catatan_dokumen || "", berkas });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// aksi: verifikasi | tolak (wajib catatan) | reset (kembali ke menunggu)
export async function PUT(req, { params }) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const aksi = body.aksi;
  const catatan = String(body.catatan || "").trim().slice(0, 255);

  try {
    const [[c]] = await db.query(
      "SELECT (SELECT COUNT(*) FROM berkas b WHERE b.calon_siswa_id = s.id) AS jumlah FROM calon_siswa s WHERE s.id = ?",
      [id]
    );
    if (!c) return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });

    if (aksi === "verifikasi") {
      if (!Number(c.jumlah)) {
        return Response.json({ error: "Belum ada dokumen yang diunggah." }, { status: 400 });
      }
      await db.query(
        "UPDATE calon_siswa SET status_dokumen = 'terverifikasi', catatan_dokumen = NULL WHERE id = ?",
        [id]
      );
    } else if (aksi === "tolak") {
      if (!catatan) {
        return Response.json({ error: "Isi alasan penolakan dulu." }, { status: 400 });
      }
      await db.query(
        "UPDATE calon_siswa SET status_dokumen = 'ditolak', catatan_dokumen = ? WHERE id = ?",
        [catatan, id]
      );
    } else if (aksi === "reset") {
      await db.query(
        "UPDATE calon_siswa SET status_dokumen = 'menunggu', catatan_dokumen = NULL WHERE id = ?",
        [id]
      );
    } else {
      return Response.json({ error: "Aksi tidak dikenal." }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

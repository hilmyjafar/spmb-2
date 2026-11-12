import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

// Reset hasil tes satu siswa (id = id calon siswa): sesi dihapus, nilai dikosongkan, siswa bisa mengerjakan lagi
export async function POST(_req, { params }) {
  if (!(await requireAdmin())) return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  const { id } = await params;
  try {
    const [[p]] = await db.query("SELECT status FROM pembayaran WHERE calon_siswa_id = ?", [id]);
    if (p?.status === "lunas") {
      return Response.json({ error: "Siswa ini sudah membayar, hasil tesnya tidak bisa direset." }, { status: 409 });
    }
    await db.query("DELETE FROM sesi_tpa WHERE calon_siswa_id = ?", [id]);
    const [r] = await db.query(
      `UPDATE calon_siswa
       SET nilai_tpa = NULL, tanggal_tpa = NULL, status_seleksi = 'menunggu', keterangan_seleksi = NULL
       WHERE id = ?`,
      [id]
    );
    if (r.affectedRows === 0) return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

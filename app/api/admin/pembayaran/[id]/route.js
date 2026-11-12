import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { getPengaturan, totalTagihan } from "@/lib/pengaturan";

// id = id calon siswa. aksi: konfirmasi | tolak (wajib catatan) | batalkan
export async function PUT(req, { params }) {
  if (!(await requireAdmin())) return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const aksi = body.aksi;
  const catatan = String(body.catatan || "").trim().slice(0, 255);

  try {
    const [[c]] = await db.query("SELECT status_seleksi FROM calon_siswa WHERE id = ?", [id]);
    if (!c) return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
    if (c.status_seleksi !== "lulus") {
      return Response.json({ error: "Hanya calon siswa yang lulus seleksi yang punya tagihan." }, { status: 400 });
    }
    const [[p]] = await db.query("SELECT status FROM pembayaran WHERE calon_siswa_id = ?", [id]);

    if (aksi === "konfirmasi") {
      const jumlah = totalTagihan(await getPengaturan());
      // Kalau siswa belum mengirim apa pun (mis. bayar tunai), baris pembayaran dibuatkan
      await db.query(
        `INSERT INTO pembayaran (calon_siswa_id, metode, status, jumlah, dikonfirmasi_at)
         VALUES (?, 'langsung', 'lunas', ?, NOW())
         ON DUPLICATE KEY UPDATE status = 'lunas', catatan = NULL, dikonfirmasi_at = NOW()`,
        [id, jumlah]
      );
      await db.query("UPDATE calon_siswa SET status_pembayaran = 'sudah_bayar' WHERE id = ?", [id]);
    } else if (aksi === "tolak") {
      if (!p) return Response.json({ error: "Siswa belum mengirim pembayaran." }, { status: 400 });
      if (!catatan) return Response.json({ error: "Isi alasan penolakan." }, { status: 400 });
      await db.query("UPDATE pembayaran SET status = 'ditolak', catatan = ?, dikonfirmasi_at = NULL WHERE calon_siswa_id = ?", [catatan, id]);
      await db.query("UPDATE calon_siswa SET status_pembayaran = 'belum_bayar' WHERE id = ?", [id]);
    } else if (aksi === "batalkan") {
      if (!p) return Response.json({ error: "Belum ada data pembayaran." }, { status: 400 });
      await db.query("UPDATE pembayaran SET status = 'menunggu_konfirmasi', dikonfirmasi_at = NULL WHERE calon_siswa_id = ?", [id]);
      await db.query("UPDATE calon_siswa SET status_pembayaran = 'belum_bayar' WHERE id = ?", [id]);
    } else {
      return Response.json({ error: "Aksi tidak dikenal." }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

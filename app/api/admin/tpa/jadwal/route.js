import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

// Simpan jadwal tes (satu jadwal untuk semua siswa)
export async function PUT(req) {
  if (!(await requireAdmin())) return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const re = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  const mulai = String(b.mulai || "");
  const selesai = String(b.selesai || "");
  const durasi = Number(b.durasi_menit);

  if (!re.test(mulai) || !re.test(selesai)) {
    return Response.json({ error: "Isi tanggal dan jam mulai serta selesai." }, { status: 400 });
  }
  if (selesai <= mulai) {
    return Response.json({ error: "Waktu ditutup harus setelah waktu dibuka." }, { status: 400 });
  }
  if (!Number.isInteger(durasi) || durasi < 5 || durasi > 240) {
    return Response.json({ error: "Durasi harus 5 sampai 240 menit." }, { status: 400 });
  }

  try {
    const [[w]] = await db.query("SELECT COUNT(*) AS n FROM sesi_tpa WHERE selesai_at IS NULL");
    if (Number(w.n) > 0) {
      return Response.json({ error: "Ada siswa yang sedang mengerjakan tes. Ubah jadwal setelah mereka selesai." }, { status: 409 });
    }
    await db.query(
      `INSERT INTO jadwal_tpa (id, mulai, selesai, durasi_menit) VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE mulai = VALUES(mulai), selesai = VALUES(selesai), durasi_menit = VALUES(durasi_menit)`,
      [mulai.replace("T", " "), selesai.replace("T", " "), durasi]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { requireSiswa, getMyRecord } from "@/lib/siswa";
import { getJadwal, bersihkanJawaban, selesaikanSesi } from "@/lib/tpa";

// Kumpulkan jawaban: simpan jawaban terakhir, lalu nilai otomatis
export async function POST(req) {
  const s = await requireSiswa();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const c = await getMyRecord(s);
  const j = await getJadwal();
  if (!j) return Response.json({ error: "Jadwal tidak ditemukan." }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  const [[sesi]] = await db.query(
    `SELECT id, selesai_at IS NOT NULL AS selesai,
            TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(mulai_at, INTERVAL ? MINUTE)) AS sisa
     FROM sesi_tpa WHERE calon_siswa_id = ?`,
    [j.durasi_menit, c.id]
  );
  if (!sesi) return Response.json({ error: "Sesi tes tidak ditemukan." }, { status: 404 });
  if (sesi.selesai) return Response.json({ ok: true });

  try {
    // Jawaban terakhir dari layar hanya dipakai kalau masih dalam batas waktu (+15 detik toleransi)
    if (body.jawaban && Number(sesi.sisa) >= -15) {
      await db.query("UPDATE sesi_tpa SET jawaban = ? WHERE id = ?", [JSON.stringify(bersihkanJawaban(body.jawaban)), sesi.id]);
    }
    await selesaikanSesi(c.id, sesi.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

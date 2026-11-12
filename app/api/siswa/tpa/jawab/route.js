import { db } from "@/lib/db";
import { requireSiswa, getMyRecord } from "@/lib/siswa";
import { getJadwal, bersihkanJawaban } from "@/lib/tpa";

// Simpan otomatis seluruh jawaban yang sudah dipilih (dipanggil tiap siswa memilih jawaban)
export async function PUT(req) {
  const s = await requireSiswa();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const c = await getMyRecord(s);
  const j = await getJadwal();
  if (!j) return Response.json({ error: "Jadwal tidak ditemukan." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const jawaban = bersihkanJawaban(body.jawaban);

  const [[sesi]] = await db.query(
    `SELECT id, selesai_at IS NOT NULL AS selesai,
            TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(mulai_at, INTERVAL ? MINUTE)) AS sisa
     FROM sesi_tpa WHERE calon_siswa_id = ?`,
    [j.durasi_menit, c.id]
  );
  if (!sesi || sesi.selesai) return Response.json({ error: "Sesi tes tidak aktif." }, { status: 409 });
  if (Number(sesi.sisa) < -10) return Response.json({ error: "Waktu tes sudah habis." }, { status: 409 });

  await db.query("UPDATE sesi_tpa SET jawaban = ? WHERE id = ?", [JSON.stringify(jawaban), sesi.id]);
  return Response.json({ ok: true });
}

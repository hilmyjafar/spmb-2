import { db } from "@/lib/db";
import { requireSiswa, getMyRecord } from "@/lib/siswa";
import { getJadwal } from "@/lib/tpa";

// Siswa menekan "Mulai Tes": bikin sesi dan mulai hitung mundur dari sekarang
export async function POST() {
  const s = await requireSiswa();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const c = await getMyRecord(s);

  if (c.status_dokumen !== "terverifikasi") {
    return Response.json({ error: "Dokumenmu belum diverifikasi panitia." }, { status: 403 });
  }
  const j = await getJadwal();
  if (!j) return Response.json({ error: "Jadwal tes belum ditentukan." }, { status: 400 });
  if (Number(j.detik_ke_mulai) > 0) return Response.json({ error: "Tes belum dimulai." }, { status: 400 });
  if (Number(j.detik_ke_selesai) < 0) return Response.json({ error: "Waktu tes sudah berakhir." }, { status: 400 });

  const [[{ n }]] = await db.query("SELECT COUNT(*) AS n FROM soal_tpa");
  if (!Number(n)) return Response.json({ error: "Soal belum tersedia." }, { status: 400 });

  try {
    await db.query("INSERT INTO sesi_tpa (calon_siswa_id, mulai_at) VALUES (?, NOW())", [c.id]);
  } catch (err) {
    if (err.code !== "ER_DUP_ENTRY") {
      console.error(err);
      return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
    }
    // sudah pernah mulai: lanjutkan sesi yang ada
  }
  return Response.json({ ok: true });
}

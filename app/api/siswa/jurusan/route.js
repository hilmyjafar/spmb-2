import { db } from "@/lib/db";
import { requireSiswa, getMyRecord, terkunci, syncStatusData } from "@/lib/siswa";

// Simpan pilihan jurusan
export async function PUT(req) {
  const s = await requireSiswa();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const c = await getMyRecord(s);
  if (terkunci(c)) {
    return Response.json({ error: "Pendaftaran sudah dikunci karena hasil seleksi sudah keluar." }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.jurusan_id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Pilih salah satu jurusan." }, { status: 400 });
  }

  try {
    const [[j]] = await db.query("SELECT id FROM jurusan WHERE id = ?", [id]);
    if (!j) return Response.json({ error: "Jurusan tidak ditemukan." }, { status: 400 });
    await db.query("UPDATE calon_siswa SET jurusan_id = ? WHERE id = ?", [id, c.id]);
    await syncStatusData(c.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { requireSiswa, getMyRecord, terkunci, syncStatusData } from "@/lib/siswa";
import { DOKUMEN } from "@/lib/dokumen";
import { periksaUpload, simpanFile, hapusFile } from "@/lib/upload";

// Unggah (atau ganti) satu dokumen. Satu jenis dokumen hanya punya satu file.
export async function POST(req) {
  const s = await requireSiswa();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const c = await getMyRecord(s);
  if (terkunci(c)) {
    return Response.json({ error: "Pendaftaran sudah dikunci karena hasil seleksi sudah keluar." }, { status: 409 });
  }

  const form = await req.formData().catch(() => null);
  const jenis = String(form?.get("jenis") || "");
  if (!DOKUMEN.some((d) => d.jenis === jenis)) {
    return Response.json({ error: "Jenis dokumen tidak dikenal." }, { status: 400 });
  }
  const cek = await periksaUpload(form?.get("file"));
  if (cek.error) return Response.json({ error: cek.error }, { status: 400 });

  try {
    const slug = jenis.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const nama = `${slug}-${Date.now()}.${cek.ext}`;
    const folder = `dokumen/${c.id}`;
    await simpanFile(folder, nama, cek.buf);

    const [lama] = await db.query("SELECT nama_file FROM berkas WHERE calon_siswa_id = ? AND jenis = ?", [c.id, jenis]);
    await db.query("DELETE FROM berkas WHERE calon_siswa_id = ? AND jenis = ?", [c.id, jenis]);
    await db.query("INSERT INTO berkas (calon_siswa_id, jenis, nama_file) VALUES (?, ?, ?)", [c.id, jenis, nama]);
    for (const l of lama) await hapusFile(folder, l.nama_file);

    // Dokumen baru harus diperiksa ulang oleh panitia
    await db.query("UPDATE calon_siswa SET status_dokumen = 'menunggu', catatan_dokumen = NULL WHERE id = ?", [c.id]);
    await syncStatusData(c.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

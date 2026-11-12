import { db } from "@/lib/db";
import { requireSiswa, getMyRecord } from "@/lib/siswa";
import { getPengaturan, totalTagihan } from "@/lib/pengaturan";
import { periksaUpload, simpanFile, hapusFile } from "@/lib/upload";

// Siswa mengirim pembayaran: pilih metode (+ unggah bukti kalau transfer). Admin yang mengonfirmasi.
export async function POST(req) {
  const s = await requireSiswa();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const c = await getMyRecord(s);
  if (c.status_seleksi !== "lulus") {
    return Response.json({ error: "Pembayaran hanya untuk calon siswa yang lulus seleksi." }, { status: 403 });
  }

  const [[lama]] = await db.query("SELECT status, bukti_file FROM pembayaran WHERE calon_siswa_id = ?", [c.id]);
  if (lama?.status === "lunas") return Response.json({ error: "Pembayaran sudah lunas." }, { status: 409 });

  const form = await req.formData().catch(() => null);
  const metode = String(form?.get("metode") || "");
  if (!["transfer", "langsung"].includes(metode)) {
    return Response.json({ error: "Pilih metode pembayaran." }, { status: 400 });
  }

  try {
    const folder = `bukti/${c.id}`;
    let namaFile = null;
    if (metode === "transfer") {
      const file = form.get("file");
      if (file && typeof file !== "string" && file.size) {
        const cek = await periksaUpload(file);
        if (cek.error) return Response.json({ error: cek.error }, { status: 400 });
        namaFile = `bukti-${Date.now()}.${cek.ext}`;
        await simpanFile(folder, namaFile, cek.buf);
      } else if (lama?.bukti_file) {
        namaFile = lama.bukti_file; // pakai bukti yang sudah ada
      } else {
        return Response.json({ error: "Unggah bukti pembayaran dulu." }, { status: 400 });
      }
    }
    if (lama?.bukti_file && namaFile !== lama.bukti_file) await hapusFile(folder, lama.bukti_file);

    const jumlah = totalTagihan(await getPengaturan());
    await db.query(
      `INSERT INTO pembayaran (calon_siswa_id, metode, bukti_file, status, jumlah)
       VALUES (?, ?, ?, 'menunggu_konfirmasi', ?)
       ON DUPLICATE KEY UPDATE metode = VALUES(metode), bukti_file = VALUES(bukti_file),
         status = 'menunggu_konfirmasi', catatan = NULL, jumlah = VALUES(jumlah), dikirim_at = NOW()`,
      [c.id, metode, namaFile, jumlah]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

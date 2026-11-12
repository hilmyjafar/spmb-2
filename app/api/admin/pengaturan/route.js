import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

// Simpan pengaturan tagihan (nominal, batas waktu, rekening tujuan)
export async function PUT(req) {
  if (!(await requireAdmin())) return Response.json({ error: "Tidak diizinkan." }, { status: 401 });
  const b = await req.json().catch(() => ({}));

  const angka = (v) => {
    const n = Number(String(v ?? "").replace(/\D/g, ""));
    return Number.isInteger(n) && n >= 0 && n <= 100000000 ? n : null;
  };
  const data = {
    biaya_daftar_ulang: angka(b.biaya_daftar_ulang),
    biaya_seragam: angka(b.biaya_seragam),
    biaya_administrasi: angka(b.biaya_administrasi),
  };
  if (Object.values(data).some((v) => v === null)) {
    return Response.json({ error: "Nominal biaya harus berupa angka." }, { status: 400 });
  }
  const batas = String(b.batas_bayar || "").trim();
  if (batas && !/^\d{4}-\d{2}-\d{2}$/.test(batas)) {
    return Response.json({ error: "Format batas waktu tidak valid." }, { status: 400 });
  }
  const info = String(b.info_transfer || "").trim().slice(0, 500);

  try {
    const pairs = [...Object.entries(data).map(([k, v]) => [k, String(v)]), ["batas_bayar", batas], ["info_transfer", info]];
    for (const [k, v] of pairs) {
      await db.query(
        "INSERT INTO pengaturan (kunci, nilai) VALUES (?, ?) ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)",
        [k, v]
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { requireSiswa, getMyRecord, terkunci, parseBiodata, syncStatusData } from "@/lib/siswa";

// Simpan Data Diri siswa yang sedang login
export async function PUT(req) {
  const s = await requireSiswa();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const c = await getMyRecord(s);
  if (terkunci(c)) {
    return Response.json({ error: "Pendaftaran sudah dikunci karena hasil seleksi sudah keluar." }, { status: 409 });
  }

  const r = parseBiodata(await req.json().catch(() => ({})));
  if (r.error) return Response.json({ error: r.error }, { status: 400 });

  const cols = Object.keys(r.data);
  try {
    await db.query(
      `INSERT INTO biodata (calon_siswa_id, ${cols.join(", ")})
       VALUES (?, ${cols.map(() => "?").join(", ")})
       ON DUPLICATE KEY UPDATE ${cols.map((k) => `${k} = VALUES(${k})`).join(", ")}`,
      [c.id, ...cols.map((k) => r.data[k])]
    );
    await db.query("UPDATE calon_siswa SET nama = ?, asal_sekolah = ? WHERE id = ?", [r.nama, r.asal_sekolah, c.id]);
    await db.query("UPDATE users SET nama = ? WHERE id = ?", [r.nama, s.id]);
    await syncStatusData(c.id);
    return Response.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "NIK ini sudah terdaftar atas nama siswa lain." }, { status: 409 });
    }
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

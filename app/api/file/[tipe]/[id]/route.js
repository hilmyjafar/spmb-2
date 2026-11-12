import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { bacaFile, mimeDari } from "@/lib/upload";

// Membuka file upload. Hanya admin atau pemilik file yang boleh.
//   /api/file/dokumen/<id berkas>    /api/file/bukti/<id pembayaran>
export async function GET(_req, { params }) {
  const s = await getSession();
  if (!s) return Response.json({ error: "Silakan login dulu." }, { status: 401 });
  const { tipe, id } = await params;

  let row = null;
  let folderDari = null;
  if (tipe === "dokumen") {
    [[row]] = await db.query(
      `SELECT b.nama_file AS nama, b.calon_siswa_id AS cid, c.user_id
       FROM berkas b JOIN calon_siswa c ON c.id = b.calon_siswa_id WHERE b.id = ?`,
      [id]
    );
    folderDari = (r) => `dokumen/${r.cid}`;
  } else if (tipe === "bukti") {
    [[row]] = await db.query(
      `SELECT p.bukti_file AS nama, p.calon_siswa_id AS cid, c.user_id
       FROM pembayaran p JOIN calon_siswa c ON c.id = p.calon_siswa_id WHERE p.id = ?`,
      [id]
    );
    folderDari = (r) => `bukti/${r.cid}`;
  }
  if (!row || !row.nama) return Response.json({ error: "File tidak ditemukan." }, { status: 404 });

  if (s.role !== "admin" && row.user_id !== s.id) {
    return Response.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  try {
    const buf = await bacaFile(folderDari(row), row.nama);
    return new Response(buf, {
      headers: {
        "Content-Type": mimeDari(row.nama),
        "Content-Disposition": `inline; filename="${row.nama}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json({ error: "File tidak ditemukan di server." }, { status: 404 });
  }
}

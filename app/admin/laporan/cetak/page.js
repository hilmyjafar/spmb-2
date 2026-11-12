import { db } from "@/lib/db";
import PrintButton from "../PrintButton";
import { FROM, NO_PENDAFTARAN, laporanFilter } from "@/lib/admin-list";

const SELEKSI = { menunggu: "Menunggu", lulus: "Lulus", tidak_lulus: "Tidak Lulus" };

// Halaman cetak: menampilkan SEMUA data sesuai filter (bukan cuma satu halaman)
export default async function CetakLaporanPage({ searchParams }) {
  const sp = await searchParams;
  const { periode, jurusan, where, params } = laporanFilter(sp);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `SELECT c.id, c.nama, j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran,
            c.status_seleksi, c.status_pembayaran
     ${FROM} ${whereSql} ORDER BY c.id`,
    params
  );
  let namaJurusan = "Semua Jurusan";
  if (jurusan) {
    const [[j]] = await db.query("SELECT kode, nama FROM jurusan WHERE id = ?", [jurusan]);
    if (j) namaJurusan = `${j.kode} - ${j.nama}`;
  }

  const count = (fn) => rows.filter(fn).length;
  const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="adm-print">
      <div className="adm-print-bar no-print">
        <PrintButton />
        <span className="adm-hint">Tekan Cetak, lalu pilih printer atau &quot;Simpan sebagai PDF&quot;.</span>
      </div>

      <h1>Laporan Rekap Penerimaan Siswa Baru</h1>
      <p className="adm-hint">
        SPMB Sekolah - SMK Negeri Unggulan<br />
        Periode: {periode ? `Tahun ${periode}` : "Semua Periode"} · Jurusan: {namaJurusan} · Dicetak: {tanggal}
      </p>

      <p>
        Total pendaftar <strong>{rows.length}</strong> · Lulus <strong>{count((r) => r.status_seleksi === "lulus")}</strong> ·
        Tidak lulus <strong>{count((r) => r.status_seleksi === "tidak_lulus")}</strong> ·
        Menunggu pembayaran{" "}
        <strong>{count((r) => r.status_seleksi === "lulus" && r.status_pembayaran === "belum_bayar")}</strong>
      </p>

      <table className="adm-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Lengkap</th>
            <th>No. Pendaftaran</th>
            <th>Jurusan</th>
            <th>Status Seleksi</th>
            <th>Status Pembayaran</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.nama}</td>
              <td>{r.no_pendaftaran}</td>
              <td>{r.jurusan_kode || "-"}</td>
              <td>{SELEKSI[r.status_seleksi]}</td>
              <td>
                {r.status_seleksi === "lulus"
                  ? r.status_pembayaran === "sudah_bayar" ? "Sudah Bayar" : "Belum Bayar"
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
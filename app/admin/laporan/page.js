import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import Pager from "@/components/admin/Pager";
import { FROM, NO_PENDAFTARAN, runList, laporanFilter } from "@/lib/admin-list";

const BASE = "/admin/laporan";
const SELEKSI = { menunggu: ["Menunggu", "amber"], lulus: ["Lulus", "green"], tidak_lulus: ["Tidak Lulus", "red"] };

export default async function LaporanPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const { periode, jurusan, where, params } = laporanFilter(sp);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [[s]] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(c.status_seleksi = 'lulus') AS lulus,
            SUM(c.status_seleksi = 'tidak_lulus') AS tidak_lulus,
            SUM(c.status_seleksi = 'lulus' AND c.status_pembayaran = 'belum_bayar') AS menunggu_bayar
     ${FROM} ${whereSql}`,
    params
  );
  const { rows, total, totalPages, current } = await runList(db, {
    where,
    params,
    page,
    select: `c.id, c.nama, j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran,
             c.status_seleksi, c.status_pembayaran`,
  });
  const [jurusanList] = await db.query("SELECT id, kode, nama FROM jurusan ORDER BY id");
  const [tahunList] = await db.query(
    "SELECT DISTINCT YEAR(created_at) AS tahun FROM calon_siswa ORDER BY tahun DESC"
  );

  const qs = new URLSearchParams();
  if (periode) qs.set("periode", periode);
  if (jurusan) qs.set("jurusan", jurusan);
  const cetakHref = `${BASE}/cetak${qs.toString() ? `?${qs}` : ""}`;

  const stats = [
    { label: "Total Pendaftar", value: s.total, note: "Seluruh calon siswa" },
    { label: "Lulus Seleksi", value: s.lulus, note: "Calon siswa diterima" },
    { label: "Tidak Lulus", value: s.tidak_lulus, note: "Hasil seleksi" },
    { label: "Menunggu Pembayaran", value: s.menunggu_bayar, note: "Belum melakukan pembayaran" },
  ];

  return (
    <>
      <PageHeader
        title="Laporan"
        desc="Lihat rekap data dan hasil proses SPMB."
        action={
          <a href={cetakHref} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-primary">
            <Icon name="printer" size={16} /> Cetak Laporan
          </a>
        }
      />

      <form method="get" className="adm-card adm-filter lap">
        <label>Periode
          <select name="periode" defaultValue={periode}>
            <option value="">Semua Periode</option>
            {tahunList.map((t) => (
              <option key={t.tahun} value={t.tahun}>Tahun {t.tahun}</option>
            ))}
          </select>
        </label>
        <label>Jurusan
          <select name="jurusan" defaultValue={jurusan}>
            <option value="">Semua Jurusan</option>
            {jurusanList.map((j) => (
              <option key={j.id} value={j.id}>{j.kode}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="adm-btn adm-btn-outline">Tampilkan Laporan</button>
      </form>

      <div className="adm-stats">
        {stats.map((c) => (
          <div key={c.label} className="adm-card adm-stat">
            <div>
              <small>{c.label}</small>
              <strong>{Number(c.value || 0)}</strong>
              <span className="adm-sub">{c.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-card-head">
          <h2>Rekap Calon Siswa</h2>
          <div className="adm-meta">Menampilkan {rows.length} dari {total} data</div>
        </div>
        <div className="adm-tablewrap">
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
              {rows.length === 0 && (
                <tr><td colSpan={6} className="adm-empty">Tidak ada data yang cocok.</td></tr>
              )}
              {rows.map((r, i) => {
                const [label, tone] = SELEKSI[r.status_seleksi];
                const lulus = r.status_seleksi === "lulus";
                const bayar = r.status_pembayaran === "sudah_bayar";
                return (
                  <tr key={r.id}>
                    <td>{(current - 1) * 10 + i + 1}</td>
                    <td>{r.nama}</td>
                    <td>{r.no_pendaftaran}</td>
                    <td>{r.jurusan_kode || "-"}</td>
                    <td><span className={`adm-badge ${tone}`}>{label}</span></td>
                    <td>
                      {lulus ? (
                        <span className={`adm-badge ${bayar ? "green" : "amber"}`}>{bayar ? "Sudah Bayar" : "Belum Bayar"}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="adm-card-foot">
          <span className="adm-meta">Menampilkan {rows.length} dari {total} data</span>
          <Pager basePath={BASE} params={{ periode, jurusan }} current={current} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
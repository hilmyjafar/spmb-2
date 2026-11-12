import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import FilterBar from "./FilterBar";
import { SiswaModalProvider, AddButton, RowActions } from "./SiswaModal";
import { STATUS_SQL, statusUtama } from "@/lib/calon-siswa";

const PER_PAGE = 10;
const NO_PENDAFTARAN = "CONCAT('SPMB', LPAD(c.id, 3, '0'))";

export default async function CalonSiswaPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp.q || "").trim();
  const jurusanId = String(sp.jurusan || "");
  const status = String(sp.status || "");
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  // ----- filter -----
  const where = [];
  const params = [];
  if (q) {
    const like = `%${q}%`;
    where.push(
      `(c.nama LIKE ? OR c.asal_sekolah LIKE ? OR j.kode LIKE ? OR j.nama LIKE ? OR ${NO_PENDAFTARAN} LIKE ?)`
    );
    params.push(like, like, like, like, like);
  }
  if (jurusanId) {
    where.push("c.jurusan_id = ?");
    params.push(jurusanId);
  }
  if (STATUS_SQL[status]) where.push(STATUS_SQL[status]);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // ----- data -----
  const FROM = "FROM calon_siswa c LEFT JOIN jurusan j ON j.id = c.jurusan_id";

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total ${FROM} ${whereSql}`, params);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, totalPages);

  const [rows] = await db.query(
    `SELECT c.id, c.nama, c.asal_sekolah, c.jurusan_id, c.status_data, c.status_dokumen, c.status_seleksi,
            j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran
     ${FROM} ${whereSql}
     ORDER BY c.id ASC LIMIT ? OFFSET ?`,
    [...params, PER_PAGE, (current - 1) * PER_PAGE]
  );

  const [[s]] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(status_data = 'belum_lengkap') AS belum_lengkap,
            SUM(status_dokumen = 'terverifikasi') AS terverifikasi,
            SUM(status_seleksi = 'lulus') AS lulus
     FROM calon_siswa`
  );
  const [jurusan] = await db.query("SELECT id, kode, nama FROM jurusan ORDER BY id");

  const stats = [
    { label: "Total Pendaftar", value: s.total, icon: "users", tone: "green", note: "Seluruh calon siswa", up: true },
    { label: "Belum Lengkap", value: s.belum_lengkap, icon: "alert", tone: "amber", note: "Perlu dilengkapi" },
    { label: "Verifikasi Dokumen", value: s.terverifikasi, icon: "check", tone: "blue", note: "Dokumen sudah terverifikasi", up: true },
    { label: "Lulus Seleksi", value: s.lulus, icon: "award", tone: "purple", note: "Dinyatakan lulus", up: true },
  ];

  // ----- pagination: pertahankan filter di link -----
  const href = (p) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (jurusanId) u.set("jurusan", jurusanId);
    if (status) u.set("status", status);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return qs ? `/admin/calon-siswa?${qs}` : "/admin/calon-siswa";
  };
  const start = Math.max(1, Math.min(current - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  const Pager = () => (
    <div className="adm-pager">
      {current > 1 ? <Link href={href(current - 1)}>‹</Link> : <span className="off">‹</span>}
      {pages.map((p) => (
        <Link key={p} href={href(p)} className={p === current ? "on" : ""}>{p}</Link>
      ))}
      {current < totalPages ? <Link href={href(current + 1)}>›</Link> : <span className="off">›</span>}
    </div>
  );

  return (
    <SiswaModalProvider jurusan={jurusan}>
      <PageHeader
        title="Data Calon Siswa"
        desc="Kelola data calon siswa yang mendaftar di sistem SPMB. Anda dapat menambah, mengedit, menghapus, dan melihat detail data calon siswa."
        action={<AddButton />}
      />

      <FilterBar jurusan={jurusan} initial={{ q, jurusan: jurusanId, status }} />

      <div className="adm-stats">
        {stats.map((c) => (
          <div key={c.label} className="adm-card adm-stat">
            <span className={`adm-stat-icon ${c.tone}`}><Icon name={c.icon} /></span>
            <div>
              <small>{c.label}</small>
              <strong>{Number(c.value || 0)}</strong>
              <span className={`adm-trend ${c.up ? "up" : "warn"}`}>{c.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-card-head">
          <h2>Daftar Calon Siswa</h2>
          <div className="adm-meta">
            Menampilkan {rows.length} dari {total} data
            {totalPages > 1 && <Pager />}
          </div>
        </div>

        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Lengkap</th>
                <th>No. Pendaftaran</th>
                <th>Asal Sekolah</th>
                <th>Jurusan Pilihan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} className="adm-empty">Tidak ada data yang cocok.</td></tr>
              )}
              {rows.map((r, i) => {
                const st = statusUtama(r);
                return (
                  <tr key={r.id}>
                    <td>{(current - 1) * PER_PAGE + i + 1}</td>
                    <td>{r.nama}</td>
                    <td>{r.no_pendaftaran}</td>
                    <td>{r.asal_sekolah || "-"}</td>
                    <td>{r.jurusan_kode || "-"}</td>
                    <td><span className={`adm-badge ${st.tone}`}>{st.label}</span></td>
                    <td><RowActions row={r} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="adm-card-foot">
          <span className="adm-meta">Menampilkan {rows.length} dari {total} data</span>
          {totalPages > 1 && <Pager />}
        </div>
      </div>
    </SiswaModalProvider>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import SearchBar from "./SearchBar";
import RowActions from "./RowActions";

const PER_PAGE = 10;
const NO_PENDAFTARAN = "CONCAT('SPMB', LPAD(c.id, 3, '0'))";
const fmtTanggal = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export default async function AkunSiswaPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const where = ["u.role = 'siswa'"];
  const params = [];
  if (q) {
    const like = `%${q}%`;
    where.push(`(u.nama LIKE ? OR u.nisn LIKE ? OR u.email LIKE ? OR ${NO_PENDAFTARAN} LIKE ?)`);
    params.push(like, like, like, like);
  }
  const whereSql = `WHERE ${where.join(" AND ")}`;
  const FROM = "FROM users u LEFT JOIN calon_siswa c ON c.user_id = u.id";

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total ${FROM} ${whereSql}`, params);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, totalPages);

  // Akun terbaru di atas
  const [rows] = await db.query(
    `SELECT u.id, u.nama, u.nisn, u.email, u.created_at, ${NO_PENDAFTARAN} AS no_pendaftaran
     ${FROM} ${whereSql}
     ORDER BY u.id DESC LIMIT ? OFFSET ?`,
    [...params, PER_PAGE, (current - 1) * PER_PAGE]
  );

  const [[s]] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(c.id IS NOT NULL) AS terhubung,
            SUM(c.id IS NULL) AS belum,
            SUM(DATE(u.created_at) = CURDATE()) AS hari_ini
     ${FROM} WHERE u.role = 'siswa'`
  );

  const stats = [
    { label: "Total Akun Siswa", value: s.total, icon: "users", tone: "green" },
    { label: "Sudah Punya Data Pendaftaran", value: s.terhubung, icon: "check", tone: "blue" },
    { label: "Belum Punya Data Pendaftaran", value: s.belum, icon: "alert", tone: "amber" },
    { label: "Mendaftar Hari Ini", value: s.hari_ini, icon: "key", tone: "purple" },
  ];

  const href = (p) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return qs ? `/admin/akun-siswa?${qs}` : "/admin/akun-siswa";
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
    <>
      <PageHeader
        title="Akun Siswa"
        desc="Daftar akun login siswa yang terdaftar di sistem SPMB. Anda dapat mereset kata sandi atau menghapus akun."
      />

      <SearchBar initial={q} />

      <div className="adm-stats">
        {stats.map((c) => (
          <div key={c.label} className="adm-card adm-stat">
            <span className={`adm-stat-icon ${c.tone}`}><Icon name={c.icon} /></span>
            <div>
              <small>{c.label}</small>
              <strong>{Number(c.value || 0)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-card-head">
          <h2>Daftar Akun Siswa</h2>
          <div className="adm-meta">
            Menampilkan {rows.length} dari {total} akun
            {totalPages > 1 && <Pager />}
          </div>
        </div>

        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Lengkap</th>
                <th>NISN</th>
                <th>Email</th>
                <th>Terdaftar</th>
                <th>No. Pendaftaran</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} className="adm-empty">Belum ada akun siswa yang cocok.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{(current - 1) * PER_PAGE + i + 1}</td>
                  <td>{r.nama}</td>
                  <td>{r.nisn || "-"}</td>
                  <td>{r.email}</td>
                  <td>{fmtTanggal(r.created_at)}</td>
                  <td>
                    {r.no_pendaftaran ? r.no_pendaftaran : <span className="adm-badge amber">Belum ada</span>}
                  </td>
                  <td><RowActions row={{ id: r.id, nama: r.nama, email: r.email }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-card-foot">
          <span className="adm-meta">Menampilkan {rows.length} dari {total} akun</span>
          {totalPages > 1 && <Pager />}
        </div>
      </div>
    </>
  );
}

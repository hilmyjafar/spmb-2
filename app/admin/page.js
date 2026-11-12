import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import { statusUtama } from "@/lib/calon-siswa";
import { FROM, NO_PENDAFTARAN } from "@/lib/admin-list";

export default async function AdminDashboard() {
  const [[s]] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(c.created_at >= NOW() - INTERVAL 7 DAY) AS baru_minggu_ini,
            SUM(c.status_dokumen = 'menunggu'
                AND EXISTS (SELECT 1 FROM berkas b WHERE b.calon_siswa_id = c.id)) AS menunggu_verifikasi,
            SUM(c.status_seleksi = 'lulus') AS lulus,
            SUM(c.status_seleksi = 'lulus' AND c.status_pembayaran = 'belum_bayar') AS menunggu_bayar,
            SUM(c.status_data = 'belum_lengkap') AS belum_lengkap,
            SUM(c.status_data = 'lengkap' AND c.nilai_tpa IS NULL) AS belum_tes,
            SUM(c.nilai_tpa IS NOT NULL AND c.status_seleksi = 'menunggu') AS menunggu_keputusan
     FROM calon_siswa c`
  );
  const n = (v) => Number(v || 0);

  const [terbaru] = await db.query(
    `SELECT c.id, c.nama, c.asal_sekolah, c.status_data, c.status_dokumen, c.status_seleksi,
            j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran
     ${FROM} ORDER BY c.id DESC LIMIT 8`
  );

  const cards = [
    { label: "Total Pendaftar", value: n(s.total), icon: "users", tone: "green", note: `↑ ${n(s.baru_minggu_ini)} baru 7 hari terakhir`, up: true },
    { label: "Menunggu Verifikasi", value: n(s.menunggu_verifikasi), icon: "file", tone: "amber", note: "Perlu diperiksa admin" },
    { label: "Lulus Seleksi", value: n(s.lulus), icon: "award", tone: "blue", note: `${n(s.total) ? Math.round((n(s.lulus) / n(s.total)) * 100) : 0}% dari total pendaftar`, up: true },
    { label: "Menunggu Pembayaran", value: n(s.menunggu_bayar), icon: "wallet", tone: "purple", note: "Belum melakukan pembayaran" },
  ];

  const tugas = [
    { href: "/admin/verifikasi-dokumen?status=menunggu", icon: "file", tone: "amber", judul: "Dokumen belum diverifikasi", ket: "Periksa dokumen pendaftar", n: n(s.menunggu_verifikasi) },
    { href: "/admin/calon-siswa?status=belum_lengkap", icon: "alert", tone: "blue", judul: "Pendaftar belum lengkap", ket: "Data pendaftaran belum lengkap", n: n(s.belum_lengkap) },
    { href: "/admin/laporan", icon: "wallet", tone: "purple", judul: "Menunggu pembayaran", ket: "Cek status pembayaran", n: n(s.menunggu_bayar) },
    { href: "/admin/tes-tpa?status=belum", icon: "clipboard", tone: "green", judul: "Belum mengikuti Tes TPA", ket: "Data lengkap, belum ada nilai", n: n(s.belum_tes) },
    { href: "/admin/seleksi?status=menunggu", icon: "checksquare", tone: "amber", judul: "Hasil seleksi", ket: "Menunggu keputusan panitia", n: n(s.menunggu_keputusan) },
  ];

  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <>
      <PageHeader
        title="Dashboard Admin"
        desc="Pantau data pendaftar dan proses penerimaan siswa baru."
        action={<span className="adm-datechip">{tanggal}</span>}
      />

      <div className="adm-stats">
        {cards.map((c) => (
          <div key={c.label} className="adm-card adm-stat">
            <span className={`adm-stat-icon ${c.tone}`}><Icon name={c.icon} /></span>
            <div>
              <small>{c.label}</small>
              <strong>{c.value}</strong>
              <span className={`adm-trend ${c.up ? "up" : "warn"}`}>{c.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-dash">
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>Pendaftar Terbaru</h2>
            <Link href="/admin/calon-siswa" className="adm-link">Lihat Semua »</Link>
          </div>
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nama</th>
                  <th>Asal Sekolah</th>
                  <th>Jurusan Pilihan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {terbaru.length === 0 && (
                  <tr><td colSpan={5} className="adm-empty">Belum ada pendaftar.</td></tr>
                )}
                {terbaru.map((r, i) => {
                  const st = statusUtama(r);
                  return (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.nama}</td>
                      <td>{r.asal_sekolah || "-"}</td>
                      <td>{r.jurusan_kode || "-"}</td>
                      <td><span className={`adm-badge ${st.tone}`}>{st.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ height: 12 }} />
        </div>

        <div className="adm-side">
          <div className="adm-card">
            <div className="adm-card-head"><h2>Tugas yang Perlu Dilakukan</h2></div>
            {tugas.map((t) => (
              <Link key={t.judul} href={t.href} className="adm-task">
                <span className={`adm-stat-icon ${t.tone}`}><Icon name={t.icon} size={16} /></span>
                <span className="grow">
                  <strong>{t.judul}</strong>
                  <small>{t.ket}</small>
                </span>
                <span className={`adm-badge ${t.tone === "blue" ? "teal" : t.tone === "purple" ? "gray" : t.tone}`}>{t.n}</span>
                <Icon name="chevron" size={16} />
              </Link>
            ))}
          </div>

          <div className="adm-card adm-info">
            <h3>Informasi</h3>
            <ul>
              <li>{n(s.belum_lengkap)} pendaftar belum melengkapi data pendaftaran.</li>
              <li>{n(s.menunggu_verifikasi)} dokumen menunggu untuk diverifikasi.</li>
              <li>{n(s.lulus)} calon siswa dinyatakan lulus seleksi.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
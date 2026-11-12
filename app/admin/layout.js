import { redirect } from "next/navigation";
import { getSession, dashboardPath } from "@/lib/auth";
import { db } from "@/lib/db";
import Sidebar from "@/components/admin/Sidebar";
import TopbarMenus from "@/components/admin/TopbarMenus";
import Icon from "@/components/admin/Icon";
import "./admin.css";

// Layout ini membungkus SEMUA halaman di /admin sekaligus melindunginya:
// belum login -> ke /login, bukan admin -> ke dashboard rolenya sendiri.
export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect(dashboardPath(session.role));

  // Isi lonceng notifikasi. Kalau ada tabel yang belum dibuat (SQL belum dijalankan),
  // bagian itu dilewati supaya halaman admin tetap bisa dibuka.
  const notif = [];
  try {
    const [[n]] = await db.query(
      `SELECT SUM(c.status_dokumen = 'menunggu'
                  AND EXISTS (SELECT 1 FROM berkas b WHERE b.calon_siswa_id = c.id)) AS verifikasi,
              SUM(c.status_data = 'belum_lengkap') AS belum_lengkap,
              SUM(c.nilai_tpa IS NOT NULL AND c.status_seleksi = 'menunggu') AS seleksi
       FROM calon_siswa c`
    );
    notif.push(
      { label: "Dokumen menunggu verifikasi", n: Number(n.verifikasi || 0), href: "/admin/verifikasi-dokumen?status=menunggu" },
      { label: "Pendaftar belum lengkap", n: Number(n.belum_lengkap || 0), href: "/admin/calon-siswa?status=belum_lengkap" },
      { label: "Menunggu keputusan seleksi", n: Number(n.seleksi || 0), href: "/admin/seleksi?status=menunggu" }
    );
  } catch {
    /* abaikan */
  }
  try {
    const [[p]] = await db.query("SELECT COUNT(*) AS n FROM pembayaran WHERE status = 'menunggu_konfirmasi'");
    notif.push({ label: "Pembayaran menunggu konfirmasi", n: Number(p.n || 0), href: "/admin/pembayaran?status=menunggu_konfirmasi" });
  } catch {
    /* abaikan */
  }

  return (
    <div className="adm">
      <Sidebar />
      <div className="adm-main">
        <header className="adm-topbar">
          <form action="/admin/calon-siswa" method="get" className="adm-topsearch" role="search">
            <Icon name="search" size={16} />
            <input type="text" name="q" placeholder="Cari nama, no. pendaftaran, atau jurusan..." />
          </form>
          <TopbarMenus nama={session.nama} notif={notif} />
        </header>
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}

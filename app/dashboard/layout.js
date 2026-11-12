import { redirect } from "next/navigation";
import { getSession, dashboardPath } from "@/lib/auth";
import { getMyRecord } from "@/lib/siswa";
import SiswaSidebar from "@/components/siswa/SiswaSidebar";
import "../admin/admin.css";
import "./siswa.css";

// Membungkus semua halaman siswa dan melindunginya:
// belum login -> /login, bukan siswa -> diarahkan ke dashboard rolenya sendiri.
export default async function SiswaLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "siswa") redirect(dashboardPath(session.role));

  const c = await getMyRecord(session);
  const nama = c?.nama || session.nama;

  return (
    <div className="adm sw">
      <SiswaSidebar />
      <div className="adm-main">
        <header className="adm-topbar">
          <span className="adm-hint">{c ? `No. Pendaftaran: ${c.no_pendaftaran}` : ""}</span>
          <div className="adm-user">
            <span className="adm-avatar">{String(nama || "S").charAt(0).toUpperCase()}</span>
            <span>
              <strong>{nama}</strong>
              <small>Calon Siswa</small>
            </span>
          </div>
        </header>
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./Icon";

// Semua menu sejajar (di desain Figma ada yang menjorok jadi sub-menu, kita seragamkan)
const MENU = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/calon-siswa", label: "Data Calon Siswa", icon: "users" },
  { href: "/admin/akun-siswa", label: "Akun Siswa", icon: "key" },
  { href: "/admin/verifikasi-dokumen", label: "Verifikasi Dokumen", icon: "file" },
  { href: "/admin/tes-tpa", label: "Tes TPA", icon: "clipboard" },
  { href: "/admin/seleksi", label: "Seleksi Calon Siswa", icon: "checksquare" },
  { href: "/admin/pembayaran", label: "Pembayaran", icon: "wallet" },
  { href: "/admin/laporan", label: "Laporan", icon: "chart" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="adm-sidebar">
      <div className="adm-brand">
        <span className="adm-logo">S</span>
        <span>
          <strong>SPMB Sekolah</strong>
          <small>SMK Negeri Unggulan</small>
        </span>
      </div>

      <nav className="adm-nav">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className={isActive(m.href) ? "active" : ""}>
            <Icon name={m.icon} />
            {m.label}
          </Link>
        ))}
      </nav>

      <div className="adm-bottom">
        <Link href="/admin/bantuan" className={isActive("/admin/bantuan") ? "active" : ""}>
          <Icon name="help" />
          Bantuan
        </Link>
        <button type="button" className="adm-logout" onClick={logout}>
          <Icon name="logout" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

// Menu siswa disederhanakan: Dokumen dan Pilih Jurusan jadi bagian dari "Pendaftaran" (3 langkah)
const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/pendaftaran", label: "Pendaftaran", icon: "file" },
  { href: "/dashboard/tes-tpa", label: "Tes TPA", icon: "clipboard" },
  { href: "/dashboard/status-seleksi", label: "Status Seleksi", icon: "checksquare" },
  { href: "/dashboard/pembayaran", label: "Pembayaran", icon: "wallet" },
];

export default function SiswaSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(href + "/");

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

      <div className="sw-menulabel">MENU UTAMA</div>
      <nav className="adm-nav">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className={isActive(m.href) ? "active" : ""}>
            <Icon name={m.icon} />
            {m.label}
          </Link>
        ))}
      </nav>

      <div className="adm-bottom">
        <Link href="/dashboard/bantuan" className={isActive("/dashboard/bantuan") ? "active" : ""}>
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

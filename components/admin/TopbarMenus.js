"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

// Lonceng (daftar tugas tertunda) dan menu user (Bantuan, Keluar) di topbar
export default function TopbarMenus({ nama, notif }) {
  const router = useRouter();
  const [open, setOpen] = useState(null); // "bell" | "user" | null
  const ref = useRef(null);
  const aktif = notif.filter((n) => n.n > 0);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const toggle = (name) => setOpen(open === name ? null : name);

  return (
    <div className="adm-topright" ref={ref}>
      <div className="adm-popwrap">
        <button type="button" className="adm-bell" aria-label="Notifikasi" onClick={() => toggle("bell")}>
          <Icon name="bell" />
          {aktif.length > 0 && <span className="adm-dot" />}
        </button>
        {open === "bell" && (
          <div className="adm-pop">
            <strong>Perlu perhatian</strong>
            {aktif.length === 0 && <p className="adm-hint">Tidak ada tugas yang tertunda.</p>}
            {aktif.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(null)}>
                <span>{n.label}</span>
                <span className="adm-badge amber">{n.n}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="adm-popwrap">
        <button type="button" className="adm-user" onClick={() => toggle("user")}>
          <span className="adm-avatar">{String(nama || "A").charAt(0).toUpperCase()}</span>
          <span>
            <strong>{nama}</strong>
            <small>Admin SPMB</small>
          </span>
          <Icon name="chevrondown" size={16} />
        </button>
        {open === "user" && (
          <div className="adm-pop right">
            <Link href="/admin/bantuan" onClick={() => setOpen(null)}>Bantuan</Link>
            <button type="button" onClick={logout}>Keluar</button>
          </div>
        )}
      </div>
    </div>
  );
}

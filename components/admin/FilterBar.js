"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

// Filter umum: cari + jurusan + status. Dipakai Verifikasi Dokumen, Tes TPA, dan Seleksi.
export default function FilterBar({ basePath, jurusan, statusOptions, placeholder, initial }) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q);
  const first = useRef(true);

  function go(next) {
    const merged = { q, jurusan: initial.jurusan, status: initial.status, ...next };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const qs = p.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath);
  }

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => go({ q }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="adm-card adm-filter">
      <label className="adm-search">
        <Icon name="search" size={16} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder || "Cari nama, no. pendaftaran, atau asal sekolah..."}
        />
      </label>

      <select value={initial.jurusan} onChange={(e) => go({ jurusan: e.target.value })}>
        <option value="">Semua Jurusan</option>
        {jurusan.map((j) => (
          <option key={j.id} value={j.id}>{j.kode}</option>
        ))}
      </select>

      <select value={initial.status} onChange={(e) => go({ status: e.target.value })}>
        <option value="">Semua Status</option>
        {statusOptions.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <button
        type="button"
        className="adm-btn adm-btn-outline"
        onClick={() => {
          setQ("");
          router.replace(basePath);
        }}
      >
        <Icon name="reset" size={15} /> Reset
      </button>
    </div>
  );
}

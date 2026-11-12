"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";
import { STATUS_OPTIONS } from "@/lib/calon-siswa";

const BASE = "/admin/calon-siswa";

export default function FilterBar({ jurusan, initial }) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q);
  const first = useRef(true);

  function go(next) {
    const merged = { q, jurusan: initial.jurusan, status: initial.status, ...next };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const qs = p.toString();
    router.replace(qs ? `${BASE}?${qs}` : BASE);
  }

  // Pencarian ditunda 0,4 detik supaya tidak query tiap ketikan
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
          placeholder="Cari nama, no. pendaftaran, atau asal sekolah..."
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
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <button
        type="button"
        className="adm-btn adm-btn-outline"
        onClick={() => {
          setQ("");
          router.replace(BASE);
        }}
      >
        <Icon name="reset" size={15} /> Reset
      </button>
    </div>
  );
}

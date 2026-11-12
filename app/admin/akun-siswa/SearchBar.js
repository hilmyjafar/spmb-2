"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

const BASE = "/admin/akun-siswa";

export default function SearchBar({ initial }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const first = useRef(true);

  // Pencarian ditunda 0,4 detik supaya tidak query tiap ketikan
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      router.replace(q ? `${BASE}?q=${encodeURIComponent(q)}` : BASE);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="adm-card adm-filter simple">
      <label className="adm-search">
        <Icon name="search" size={16} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, NISN, email, atau no. pendaftaran..."
        />
      </label>
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

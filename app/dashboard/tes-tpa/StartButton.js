"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartButton({ durasi }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function mulai() {
    if (!window.confirm(`Mulai tes sekarang? Waktu ${durasi} menit langsung berjalan dan tidak bisa dijeda.`)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/siswa/tpa/mulai", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal memulai tes (kode ${res.status}).`);
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sw-start">
      <button type="button" className="adm-btn adm-btn-primary" disabled={loading} onClick={mulai}>
        {loading ? "Memulai..." : "Mulai Tes Sekarang"}
      </button>
      {error && <div className="adm-error">{error}</div>}
    </div>
  );
}

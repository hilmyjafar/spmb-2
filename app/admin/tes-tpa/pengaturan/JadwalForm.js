"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JadwalForm({ initial }) {
  const router = useRouter();
  const [f, setF] = useState(initial || { mulai: "", selesai: "", durasi_menit: "60" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => {
    setOk(false);
    setF({ ...f, [k]: e.target.value });
  };

  async function simpan(e) {
    e.preventDefault();
    setError("");
    setOk(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tpa/jadwal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}).`);
        return;
      }
      setOk(true);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={simpan} className="adm-card adm-pad">
      <h2>Jadwal Tes</h2>
      <p className="adm-hint">Satu jadwal berlaku untuk semua siswa. Siswa boleh mulai kapan saja di antara waktu dibuka dan ditutup.</p>
      {error && <div className="adm-error">{error}</div>}
      {ok && <div className="adm-success">Jadwal tersimpan.</div>}
      <div className="adm-formrow">
        <label>Dibuka
          <input type="datetime-local" value={f.mulai} onChange={set("mulai")} required />
        </label>
        <label>Ditutup
          <input type="datetime-local" value={f.selesai} onChange={set("selesai")} required />
        </label>
        <label>Durasi mengerjakan (menit)
          <input type="number" min={5} max={240} value={f.durasi_menit} onChange={set("durasi_menit")} required />
        </label>
      </div>
      <div>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Jadwal"}
        </button>
      </div>
    </form>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

export default function JurusanForm({ jurusan, terpilih, locked }) {
  const router = useRouter();
  const [pilih, setPilih] = useState(terpilih);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function simpan() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/siswa/jurusan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jurusan_id: pilih }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}).`);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sw-form">
      {locked && (
        <div className="sw-note">Pendaftaran sudah dikunci karena hasil seleksi sudah keluar, jadi pilihan jurusan tidak bisa diubah lagi.</div>
      )}
      {error && <div className="adm-error">{error}</div>}

      <section className="adm-card sw-card">
        <h2>Pilih Satu Jurusan</h2>
        <p className="adm-hint">Ketuk kartu untuk memilih. Pilihan bisa kamu ubah sampai hasil seleksi diumumkan.</p>

        <div className="sw-jurgrid">
          {jurusan.map((j) => (
            <button
              key={j.id}
              type="button"
              disabled={locked}
              className={`sw-jur${pilih === j.id ? " on" : ""}`}
              onClick={() => setPilih(j.id)}
            >
              <span className="check">{pilih === j.id && <Icon name="check" size={14} />}</span>
              <span className="adm-badge green">{j.kode}</span>
              <strong>{j.nama}</strong>
              {j.deskripsi && <span className="desc">{j.deskripsi}</span>}
              {j.prospek && (
                <span className="prospek"><b>Prospek karier:</b> {j.prospek}</span>
              )}
              <span className="bidang">{j.bidang}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="sw-actions">
        <button type="button" className="adm-btn adm-btn-primary" disabled={!pilih || saving || locked} onClick={simpan}>
          {saving ? "Menyimpan..." : "Simpan & Selesai"}
        </button>
        <button type="button" className="adm-btn adm-btn-outline" onClick={() => router.push("/dashboard/pendaftaran/dokumen")}>
          Kembali
        </button>
        {!pilih && <span className="adm-hint">Pilih satu jurusan dulu.</span>}
      </div>
    </div>
  );
}

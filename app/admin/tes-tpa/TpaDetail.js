"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

export default function TpaDetail({ row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function reset() {
    const ok = window.confirm(
      `Reset hasil tes ${row.nama}?\n\nNilainya dihapus, hasil seleksinya kembali Menunggu, dan siswa bisa mengerjakan tes lagi kalau jadwal masih dibuka.`
    );
    if (!ok) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tpa/reset/${row.id}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal mereset (kode ${res.status}).`);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => setOpen(true)}>
        <Icon name="eye" size={13} /> Lihat
      </button>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h3>Hasil Tes TPA</h3>
              <button type="button" className="adm-iconbtn" onClick={() => setOpen(false)} aria-label="Tutup">
                <Icon name="x" />
              </button>
            </div>
            {error && <div className="adm-error">{error}</div>}

            <div className="adm-sec">
              <div className="adm-kv"><span>Nama Lengkap</span><strong>{row.nama}</strong></div>
              <div className="adm-kv"><span>No. Pendaftaran</span><strong>{row.no_pendaftaran}</strong></div>
              <div className="adm-kv"><span>Jurusan Pilihan</span><strong>{row.jurusan}</strong></div>
              <div className="adm-kv"><span>Asal Sekolah</span><strong>{row.asal_sekolah}</strong></div>
            </div>

            <div className="adm-sec">
              <div className="adm-kv">
                <span>Nilai TPA</span>
                {row.nilai === null ? <strong>Belum mengikuti tes</strong> : <strong className="adm-bignum">{row.nilai}</strong>}
              </div>
              <div className="adm-kv"><span>Tanggal Tes</span><strong>{row.tanggal}</strong></div>
            </div>

            <div className="adm-modal-foot">
              {row.nilai !== null && (
                <button type="button" className="adm-btn adm-btn-danger" disabled={busy} onClick={reset}>
                  Reset Hasil Tes
                </button>
              )}
              <button type="button" className="adm-btn adm-btn-outline" onClick={() => setOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

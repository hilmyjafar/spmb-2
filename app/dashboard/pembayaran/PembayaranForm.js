"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

export default function PembayaranForm({ status, metodeAwal, buktiId, catatan, infoTransfer }) {
  const router = useRouter();
  const [metode, setMetode] = useState(metodeAwal);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (status === "lunas") {
    return (
      <section className="adm-card sw-card">
        <h2>Pembayaran Lunas</h2>
        <div className="sw-note info">Pembayaranmu sudah dikonfirmasi panitia. Terima kasih, sampai jumpa di sekolah!</div>
        {buktiId && (
          <a className="adm-link" href={`/api/file/bukti/${buktiId}`} target="_blank" rel="noopener noreferrer">Lihat bukti pembayaran</a>
        )}
      </section>
    );
  }

  const baris = String(infoTransfer || "").split("\n").map((s) => s.trim()).filter(Boolean);

  async function kirim() {
    setError("");
    setSaving(true);
    const fd = new FormData();
    fd.append("metode", metode);
    if (file) fd.append("file", file);
    try {
      const res = await fetch("/api/siswa/pembayaran", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal mengirim (kode ${res.status}).`);
        return;
      }
      setFile(null);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="adm-card sw-card">
      <h2>Metode Pembayaran</h2>

      {status === "menunggu_konfirmasi" && (
        <div className="sw-note info">Pembayaranmu sudah dikirim dan sedang menunggu konfirmasi panitia.</div>
      )}
      {status === "ditolak" && (
        <div className="adm-error"><strong>Pembayaran ditolak panitia.</strong> {catatan || "Silakan kirim ulang bukti pembayaran."}</div>
      )}
      {error && <div className="adm-error">{error}</div>}

      <label className={`sw-method${metode === "transfer" ? " on" : ""}`}>
        <input type="radio" name="metode" checked={metode === "transfer"} onChange={() => setMetode("transfer")} />
        <span>
          <strong>Transfer Bank / E-Wallet</strong>
          <small>Transfer ke rekening sekolah, lalu unggah bukti pembayaran.</small>
        </span>
      </label>
      <label className={`sw-method${metode === "langsung" ? " on" : ""}`}>
        <input type="radio" name="metode" checked={metode === "langsung"} onChange={() => setMetode("langsung")} />
        <span>
          <strong>Bayar Langsung ke Sekolah</strong>
          <small>Bayar di loket sekolah pada jam kerja, lalu panitia akan mengonfirmasi.</small>
        </span>
      </label>

      {metode === "transfer" && (
        <>
          <div className="sw-rekening">
            <small>Tujuan pembayaran</small>
            {baris.length ? baris.map((b) => <strong key={b}>{b}</strong>) : <span>Rekening tujuan belum diatur panitia.</span>}
          </div>
          <div className="sw-docrow">
            <span className="adm-stat-icon green"><Icon name="upload" size={16} /></span>
            <div className="grow">
              <strong>Unggah Bukti Bayar</strong>
              <small className="adm-sub">
                {file ? file.name : buktiId ? "Bukti sebelumnya sudah ada" : "Format JPG, PNG, atau PDF, maksimal 2 MB"}
              </small>
            </div>
            <label className="adm-btn adm-btn-outline adm-btn-sm">
              Pilih File
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </>
      )}

      <button type="button" className="adm-btn adm-btn-primary" disabled={saving} onClick={kirim}>
        {saving ? "Mengirim..." : status === "menunggu_konfirmasi" ? "Kirim Ulang" : "Konfirmasi Pembayaran"}
      </button>
    </section>
  );
}

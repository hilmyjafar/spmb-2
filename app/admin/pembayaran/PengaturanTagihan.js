"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

export default function PengaturanTagihan({ initial }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function simpan(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}).`);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="adm-btn adm-btn-primary" onClick={() => setOpen(true)}>
        Atur Tagihan
      </button>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <form className="adm-modal wide" onClick={(e) => e.stopPropagation()} onSubmit={simpan}>
            <div className="adm-modal-head">
              <h3>Pengaturan Tagihan</h3>
              <button type="button" className="adm-iconbtn" onClick={() => setOpen(false)} aria-label="Tutup">
                <Icon name="x" />
              </button>
            </div>
            {error && <div className="adm-error">{error}</div>}

            <label>Biaya Daftar Ulang (Rp)
              <input inputMode="numeric" value={f.biaya_daftar_ulang} onChange={set("biaya_daftar_ulang")} required />
            </label>
            <label>Seragam & Atribut (Rp)
              <input inputMode="numeric" value={f.biaya_seragam} onChange={set("biaya_seragam")} required />
            </label>
            <label>Biaya Administrasi (Rp)
              <input inputMode="numeric" value={f.biaya_administrasi} onChange={set("biaya_administrasi")} required />
            </label>
            <label>Batas Waktu Pembayaran
              <input type="date" value={f.batas_bayar} onChange={set("batas_bayar")} />
            </label>
            <label>Tujuan Transfer (satu rekening per baris)
              <textarea
                rows={4}
                value={f.info_transfer}
                onChange={set("info_transfer")}
                placeholder={"BCA 1234567890 a.n. SMK Negeri Unggulan\nDANA 0812xxxxxxxx a.n. Bendahara SPMB"}
              />
            </label>

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn adm-btn-outline" onClick={() => setOpen(false)}>Batal</button>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

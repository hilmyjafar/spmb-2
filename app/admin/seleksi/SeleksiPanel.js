"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

const TONE = { menunggu: "amber", lulus: "green", tidak_lulus: "red" };
const LABEL = { menunggu: "Menunggu", lulus: "Lulus", tidak_lulus: "Tidak Lulus" };

const Ctx = createContext(null);

// Membungkus filter + tabel + panel. Saat ada baris dipilih, panel muncul di kanan.
export function SeleksiProvider({ children }) {
  const [sel, setSel] = useState(null);
  return (
    <Ctx.Provider value={{ sel, setSel }}>
      <div className={`adm-split${sel ? " open" : ""}`}>{children}</div>
    </Ctx.Provider>
  );
}

export function LihatButton({ row }) {
  const { sel, setSel } = useContext(Ctx);
  return (
    <button
      type="button"
      className={`adm-btn adm-btn-outline adm-btn-sm${sel?.id === row.id ? " active" : ""}`}
      onClick={() => setSel(row)}
    >
      <Icon name="eye" size={13} /> Lihat
    </button>
  );
}

export function SeleksiPanel() {
  const router = useRouter();
  const { sel, setSel } = useContext(Ctx);
  const [status, setStatus] = useState("menunggu");
  const [ket, setKet] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sel) {
      setStatus(sel.status_seleksi);
      setKet(sel.keterangan_seleksi || "");
      setError("");
    }
  }, [sel]);

  if (!sel) return null;
  const noTpa = sel.nilai_tpa === null;

  async function save() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/seleksi/${sel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_seleksi: status, keterangan: ket }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}).`);
        return;
      }
      setSel(null);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="adm-card adm-panel">
      <div className="adm-panel-head">
        <h3>Detail Seleksi</h3>
        <button type="button" className="adm-iconbtn" onClick={() => setSel(null)} aria-label="Tutup">
          <Icon name="x" />
        </button>
      </div>

      <div className="adm-person">
        <span className="adm-avatar">{sel.nama.charAt(0).toUpperCase()}</span>
        <div className="grow">
          <strong>{sel.nama}</strong>
          <small className="adm-sub">{sel.no_pendaftaran}</small>
        </div>
        <span className={`adm-badge ${TONE[sel.status_seleksi]}`}>{LABEL[sel.status_seleksi]}</span>
      </div>

      <div className="adm-sec">
        <h4>Data Calon Siswa</h4>
        <div className="adm-kv"><span>Nama Lengkap</span><strong>{sel.nama}</strong></div>
        <div className="adm-kv"><span>No. Pendaftaran</span><strong>{sel.no_pendaftaran}</strong></div>
        <div className="adm-kv"><span>Jurusan Pilihan</span><strong>{sel.jurusan_kode || "-"}</strong></div>
        <div className="adm-kv"><span>Asal Sekolah</span><strong>{sel.asal_sekolah || "-"}</strong></div>
      </div>

      <div className="adm-sec">
        <h4>Nilai Tes TPA</h4>
        <div className="adm-kv">
          <span>Nilai TPA</span>
          {noTpa ? <strong>Belum tes</strong> : <strong className="adm-bignum">{sel.nilai_tpa}</strong>}
        </div>
        <div className="adm-kv"><span>Tanggal Tes</span><strong>{sel.tanggal_tpa}</strong></div>
      </div>

      <div className="adm-sec">
        <h4>Hasil Seleksi</h4>
        {error && <div className="adm-error">{error}</div>}
        <label>Status Seleksi
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="menunggu">Menunggu</option>
            <option value="lulus" disabled={noTpa}>Lulus</option>
            <option value="tidak_lulus" disabled={noTpa}>Tidak Lulus</option>
          </select>
        </label>
        {noTpa && <p className="adm-hint">Keputusan lulus/tidak lulus baru bisa diisi setelah ada nilai TPA.</p>}
        <label>Keterangan
          <textarea rows={3} value={ket} onChange={(e) => setKet(e.target.value)} placeholder="Catatan hasil seleksi..." />
        </label>
      </div>

      <div className="adm-panel-foot">
        <button type="button" className="adm-btn adm-btn-outline" onClick={() => setSel(null)}>Batal</button>
        <button type="button" className="adm-btn adm-btn-primary" disabled={saving} onClick={save}>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </aside>
  );
}

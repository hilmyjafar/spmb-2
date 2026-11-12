"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

const KOSONG = { pertanyaan: "", opsi_a: "", opsi_b: "", opsi_c: "", opsi_d: "", jawaban_benar: "A" };

export default function SoalManager({ soal, terkunci }) {
  const router = useRouter();
  const [modal, setModal] = useState(null); // { id? }
  const [f, setF] = useState(KOSONG);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function buka(s) {
    setError("");
    setF(s ? { pertanyaan: s.pertanyaan, opsi_a: s.opsi_a, opsi_b: s.opsi_b, opsi_c: s.opsi_c, opsi_d: s.opsi_d, jawaban_benar: s.jawaban_benar } : KOSONG);
    setModal({ id: s?.id });
  }

  async function simpan(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(modal.id ? `/api/admin/tpa/soal/${modal.id}` : "/api/admin/tpa/soal", {
        method: modal.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}).`);
        return;
      }
      setModal(null);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function hapus(s) {
    if (!window.confirm("Hapus soal ini?")) return;
    const res = await fetch(`/api/admin/tpa/soal/${s.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.refresh();
    else window.alert(data.error || `Gagal menghapus (kode ${res.status}).`);
  }

  return (
    <div className="adm-card adm-pad">
      <div className="adm-cardhead2">
        <div>
          <h2>Bank Soal ({soal.length})</h2>
          <p className="adm-hint">Soal pilihan ganda A sampai D. Nilai dihitung otomatis: jawaban benar dibagi jumlah soal, dikali 100.</p>
        </div>
        <button type="button" className="adm-btn adm-btn-primary" disabled={terkunci} onClick={() => buka(null)}>
          <Icon name="plus" size={16} /> Tambah Soal
        </button>
      </div>

      {terkunci && (
        <div className="adm-error">
          Soal terkunci karena sudah ada siswa yang mengerjakan tes. Reset hasil tes siswa itu (menu Tes TPA, tombol Lihat) kalau soal perlu diubah.
        </div>
      )}

      <div className="adm-tablewrap" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr><th>No.</th><th>Pertanyaan</th><th>Kunci</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {soal.length === 0 && (
              <tr><td colSpan={4} className="adm-empty">Belum ada soal. Tambahkan soal supaya siswa bisa mengikuti tes.</td></tr>
            )}
            {soal.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.pertanyaan.length > 90 ? `${s.pertanyaan.slice(0, 90)}...` : s.pertanyaan}</td>
                <td><span className="adm-badge green">{s.jawaban_benar}</span></td>
                <td>
                  <div className="adm-actions">
                    <button type="button" className="adm-act edit" title="Edit" disabled={terkunci} onClick={() => buka(s)}><Icon name="edit" size={14} /></button>
                    <button type="button" className="adm-act del" title="Hapus" disabled={terkunci} onClick={() => hapus(s)}><Icon name="trash" size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="adm-overlay" onClick={() => setModal(null)}>
          <form className="adm-modal wide" onClick={(e) => e.stopPropagation()} onSubmit={simpan}>
            <div className="adm-modal-head">
              <h3>{modal.id ? "Edit Soal" : "Tambah Soal"}</h3>
              <button type="button" className="adm-iconbtn" onClick={() => setModal(null)} aria-label="Tutup"><Icon name="x" /></button>
            </div>
            {error && <div className="adm-error">{error}</div>}

            <label>Pertanyaan
              <textarea rows={3} value={f.pertanyaan} onChange={set("pertanyaan")} required />
            </label>
            {["a", "b", "c", "d"].map((h) => (
              <label key={h}>Pilihan {h.toUpperCase()}
                <input value={f[`opsi_${h}`]} onChange={set(`opsi_${h}`)} required />
              </label>
            ))}
            <label>Kunci Jawaban
              <select value={f.jawaban_benar} onChange={set("jawaban_benar")}>
                {["A", "B", "C", "D"].map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn adm-btn-outline" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

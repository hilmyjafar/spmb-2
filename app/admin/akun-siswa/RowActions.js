"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

export default function RowActions({ row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function close() {
    setOpen(false);
    setPassword("");
    setError("");
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/akun-siswa/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}).`);
        return;
      }
      close();
      window.alert(`Kata sandi ${row.nama} berhasil diganti.`);
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const ok = window.confirm(
      `Hapus akun ${row.nama}?\n\nData pendaftarannya tetap ada di Data Calon Siswa, tapi siswa tidak bisa login lagi.`
    );
    if (!ok) return;
    const res = await fetch(`/api/admin/akun-siswa/${row.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else window.alert(`Gagal menghapus akun (kode ${res.status}).`);
  }

  return (
    <>
      <div className="adm-actions">
        <button type="button" className="adm-act edit" title="Reset kata sandi" onClick={() => setOpen(true)}>
          <Icon name="key" size={14} />
        </button>
        <button type="button" className="adm-act del" title="Hapus akun" onClick={remove}>
          <Icon name="trash" size={14} />
        </button>
      </div>

      {open && (
        <div className="adm-overlay" onClick={close}>
          <form className="adm-modal" onClick={(e) => e.stopPropagation()} onSubmit={resetPassword}>
            <div className="adm-modal-head">
              <h3>Reset Kata Sandi</h3>
              <button type="button" className="adm-iconbtn" onClick={close} aria-label="Tutup">
                <Icon name="x" />
              </button>
            </div>

            <div className="adm-modal-no">Akun: <strong>{row.nama}</strong> ({row.email})</div>
            {error && <div className="adm-error">{error}</div>}

            <label>Kata sandi baru
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="off"
                required
              />
              <p className="adm-hint">Sampaikan kata sandi ini ke siswa yang bersangkutan.</p>
            </label>

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn adm-btn-outline" onClick={close}>Batal</button>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

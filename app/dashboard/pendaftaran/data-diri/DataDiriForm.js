"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGAMA } from "@/lib/konstanta";

export default function DataDiriForm({ initial, nisn, email, locked }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // Helper (bukan komponen) supaya kolom tidak ter-reset saat mengetik
  const input = (label, k, o = {}) => (
    <label className={o.full ? "full" : undefined}>
      <span>{label}{!o.opt && <b className="req"> *</b>}</span>
      <input
        type={o.type || "text"}
        value={f[k]}
        onChange={set(k)}
        placeholder={o.ph}
        inputMode={o.mode}
        maxLength={o.max}
      />
    </label>
  );

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/siswa/data-diri", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}).`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/dashboard/pendaftaran/dokumen");
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="sw-form">
      {locked && (
        <div className="sw-note">Pendaftaran sudah dikunci karena hasil seleksi sudah keluar, jadi data tidak bisa diubah lagi.</div>
      )}
      {error && <div className="adm-error">{error}</div>}

      <fieldset disabled={locked}>
        <section className="adm-card sw-card">
          <h2>Identitas Calon Murid</h2>
          <p className="adm-hint">* wajib diisi</p>
          <div className="sw-grid">
            {input("Nama Lengkap", "nama", { full: true, ph: "Nama sesuai ijazah / akta" })}
            <label>
              <span>NISN</span>
              <input value={nisn || ""} readOnly />
            </label>
            {input("NIK", "nik", { ph: "16 digit NIK", mode: "numeric", max: 16 })}
            <div className="full sw-radio">
              <span>Jenis Kelamin <b className="req">*</b></span>
              <div>
                <label><input type="radio" name="jk" checked={f.jenis_kelamin === "L"} onChange={() => setF({ ...f, jenis_kelamin: "L" })} /> Laki-laki</label>
                <label><input type="radio" name="jk" checked={f.jenis_kelamin === "P"} onChange={() => setF({ ...f, jenis_kelamin: "P" })} /> Perempuan</label>
              </div>
            </div>
            {input("Tempat Lahir", "tempat_lahir", { ph: "Masukkan tempat lahir" })}
            {input("Tanggal Lahir", "tanggal_lahir", { type: "date" })}
            {input("Anak ke-", "anak_ke", { type: "number", ph: "Contoh: 1" })}
            <label>
              <span>Agama <b className="req">*</b></span>
              <select value={f.agama} onChange={set("agama")}>
                <option value="">Pilih agama</option>
                {AGAMA.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="adm-card sw-card">
          <h2>Kontak & Alamat</h2>
          <div className="sw-grid">
            {input("No. WhatsApp", "no_whatsapp", { type: "tel", ph: "08xxxxxxxxxx" })}
            <label>
              <span>Email</span>
              <input value={email || ""} readOnly />
            </label>
            <label className="full">
              <span>Alamat Lengkap <b className="req">*</b></span>
              <textarea rows={3} value={f.alamat} onChange={set("alamat")} placeholder="Nama jalan, nomor rumah, dan patokan" />
            </label>
            {input("RT", "rt", { mode: "numeric", max: 3, ph: "Nomor RT" })}
            {input("RW", "rw", { mode: "numeric", max: 3, ph: "Nomor RW" })}
            {input("Kelurahan/Desa", "kelurahan", { ph: "Masukkan kelurahan/desa" })}
            {input("Kecamatan", "kecamatan", { ph: "Masukkan kecamatan" })}
            {input("Kabupaten/Kota", "kota", { full: true, ph: "Masukkan kabupaten/kota" })}
          </div>
        </section>

        <section className="adm-card sw-card">
          <h2>Riwayat Pendidikan</h2>
          <div className="sw-grid">
            {input("Asal Sekolah (SMP/MTs)", "asal_sekolah", { ph: "Nama SMP/MTs asal" })}
            {input("Tahun Lulus", "tahun_lulus", { mode: "numeric", max: 4, ph: "Contoh: 2026" })}
          </div>
        </section>

        <section className="adm-card sw-card">
          <h2>Identitas Orang Tua</h2>
          <p className="adm-hint">Isi minimal satu nomor telepon orang tua.</p>
          <h3>Data Ayah</h3>
          <div className="sw-grid">
            {input("Nama Ayah", "nama_ayah", { full: true, ph: "Masukkan nama ayah" })}
            {input("Pekerjaan", "pekerjaan_ayah", { opt: true, ph: "Masukkan pekerjaan ayah" })}
            {input("No. Telepon", "telp_ayah", { opt: true, type: "tel", ph: "08xxxxxxxxxx" })}
          </div>
          <h3>Data Ibu</h3>
          <div className="sw-grid">
            {input("Nama Ibu", "nama_ibu", { full: true, ph: "Masukkan nama ibu" })}
            {input("Pekerjaan", "pekerjaan_ibu", { opt: true, ph: "Masukkan pekerjaan ibu" })}
            {input("No. Telepon", "telp_ibu", { opt: true, type: "tel", ph: "08xxxxxxxxxx" })}
          </div>
        </section>
      </fieldset>

      <div className="sw-actions">
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving || locked}>
          {saving ? "Menyimpan..." : "Simpan & Lanjut"}
        </button>
        <button type="button" className="adm-btn adm-btn-outline" onClick={() => router.push("/dashboard")}>
          Batal
        </button>
      </div>
    </form>
  );
}

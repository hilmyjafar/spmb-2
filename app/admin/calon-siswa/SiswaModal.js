"use client";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

const EMPTY = { nama: "", asal_sekolah: "", jurusan_id: "", status_data: "belum_lengkap" };
const TITLES = { add: "Tambah Calon Siswa", edit: "Edit Calon Siswa", view: "Detail Calon Siswa" };

const BIO = [
  ["nik", "NIK"], ["jenis_kelamin", "Jenis Kelamin"], ["tempat_lahir", "Tempat Lahir"], ["tgl_lahir", "Tanggal Lahir"],
  ["anak_ke", "Anak ke-"], ["agama", "Agama"], ["no_whatsapp", "WhatsApp"], ["alamat", "Alamat"], ["rt_rw", "RT/RW"],
  ["kelurahan", "Kelurahan/Desa"], ["kecamatan", "Kecamatan"], ["kota", "Kabupaten/Kota"], ["tahun_lulus", "Tahun Lulus"],
  ["nama_ayah", "Nama Ayah"], ["pekerjaan_ayah", "Pekerjaan Ayah"], ["telp_ayah", "Telp. Ayah"],
  ["nama_ibu", "Nama Ibu"], ["pekerjaan_ibu", "Pekerjaan Ibu"], ["telp_ibu", "Telp. Ibu"],
];

function tampil(b, k) {
  if (k === "rt_rw") return `${b.rt}/${b.rw}`;
  if (k === "jenis_kelamin") return b.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan";
  return b[k] === null || b[k] === undefined || b[k] === "" ? "-" : String(b[k]);
}

const Ctx = createContext(null);
const useModal = () => useContext(Ctx);

// Membungkus halaman: menyimpan state modal + mengurus simpan/hapus.
// Tombol "Tambah Data" dan tombol aksi tiap baris tinggal memanggil hook-nya.
export function SiswaModalProvider({ jurusan, children }) {
  const router = useRouter();
  const [modal, setModal] = useState(null); // { mode, row }
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState(null); // null = memuat, false = belum diisi siswa

  function open(mode, row) {
    setError("");
    setBio(null);
    if (mode === "view" && row) {
      fetch(`/api/admin/calon-siswa/${row.id}`)
        .then((r) => r.json())
        .then((d) => setBio(d.biodata || false))
        .catch(() => setBio(false));
    }
    setForm(
      row
        ? {
            nama: row.nama,
            asal_sekolah: row.asal_sekolah,
            jurusan_id: row.jurusan_id ? String(row.jurusan_id) : "",
            status_data: row.status_data,
          }
        : EMPTY
    );
    setModal({ mode, row });
  }
  const close = () => setModal(null);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const isEdit = modal.mode === "edit";
    try {
      const res = await fetch(
        isEdit ? `/api/admin/calon-siswa/${modal.row.id}` : "/api/admin/calon-siswa",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Gagal menyimpan (kode ${res.status}). Cek terminal tempat npm run dev jalan.`);
        return;
      }
      close();
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    if (!window.confirm(`Hapus data ${row.nama}? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/admin/calon-siswa/${row.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else window.alert(`Gagal menghapus data (kode ${res.status}).`);
  }

  const readOnly = modal?.mode === "view";

  return (
    <Ctx.Provider value={{ open, remove }}>
      {children}

      {modal && (
        <div className="adm-overlay" onClick={close}>
          <form className="adm-modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="adm-modal-head">
              <h3>{TITLES[modal.mode]}</h3>
              <button type="button" className="adm-iconbtn" onClick={close} aria-label="Tutup">
                <Icon name="x" />
              </button>
            </div>

            {error && <div className="adm-error">{error}</div>}

            {modal.row && (
              <div className="adm-modal-no">No. Pendaftaran: <strong>{modal.row.no_pendaftaran}</strong></div>
            )}

            <label>Nama Lengkap
              <input value={form.nama} onChange={set("nama")} disabled={readOnly} required />
            </label>
            <label>Asal Sekolah
              <input value={form.asal_sekolah} onChange={set("asal_sekolah")} disabled={readOnly} />
            </label>
            <label>Jurusan Pilihan
              <select value={form.jurusan_id} onChange={set("jurusan_id")} disabled={readOnly}>
                <option value="">Belum memilih</option>
                {jurusan.map((j) => (
                  <option key={j.id} value={j.id}>{j.kode} - {j.nama}</option>
                ))}
              </select>
            </label>
            <label>Kelengkapan Data
              <select value={form.status_data} onChange={set("status_data")} disabled={readOnly}>
                <option value="belum_lengkap">Belum Lengkap</option>
                <option value="lengkap">Lengkap</option>
              </select>
            </label>

            {readOnly && (
              <div className="adm-bio">
                <h4>Data Diri Siswa</h4>
                {bio === null && <p className="adm-hint">Memuat data diri...</p>}
                {bio === false && <p className="adm-hint">Siswa belum mengisi data diri.</p>}
                {bio &&
                  BIO.map(([k, label]) => (
                    <div key={k} className="adm-kv"><span>{label}</span><strong>{tampil(bio, k)}</strong></div>
                  ))}
              </div>
            )}

            <div className="adm-modal-foot">
              {readOnly ? (
                <>
                  <button key="tutup" type="button" className="adm-btn adm-btn-outline" onClick={close}>Tutup</button>
                  <button key="edit" type="button" className="adm-btn adm-btn-primary" onClick={() => open("edit", modal.row)}>Edit</button>
                </>
              ) : (
                <>
                  <button key="batal" type="button" className="adm-btn adm-btn-outline" onClick={close}>Batal</button>
                  <button key="simpan" type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function AddButton() {
  const { open } = useModal();
  return (
    <button type="button" className="adm-btn adm-btn-primary" onClick={() => open("add")}>
      <Icon name="plus" size={16} /> Tambah Data
    </button>
  );
}

export function RowActions({ row }) {
  const { open, remove } = useModal();
  return (
    <div className="adm-actions">
      <button type="button" className="adm-act view" title="Lihat" onClick={() => open("view", row)}>
        <Icon name="eye" size={14} />
      </button>
      <button type="button" className="adm-act edit" title="Edit" onClick={() => open("edit", row)}>
        <Icon name="edit" size={14} />
      </button>
      <button type="button" className="adm-act del" title="Hapus" onClick={() => remove(row)}>
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

const STATUS = {
  menunggu: ["Menunggu pemeriksaan panitia", "amber"],
  terverifikasi: ["Terverifikasi", "green"],
  ditolak: ["Ditolak", "red"],
};

export default function DokumenForm({ items, locked, status, catatan }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const lengkap = items.filter((d) => d.wajib).every((d) => d.berkas);
  const adaFile = items.some((d) => d.berkas);
  const [labelStatus, tone] = STATUS[status] || STATUS.menunggu;

  async function upload(jenis, file) {
    if (!file) return;
    setBusy(jenis);
    setError("");
    const fd = new FormData();
    fd.append("jenis", jenis);
    fd.append("file", file);
    try {
      const res = await fetch("/api/siswa/dokumen", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || `Gagal mengunggah (kode ${res.status}).`);
      else router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="sw-form">
      {locked && (
        <div className="sw-note">Pendaftaran sudah dikunci karena hasil seleksi sudah keluar, jadi dokumen tidak bisa diubah lagi.</div>
      )}
      {status === "ditolak" && (
        <div className="adm-error">
          <strong>Dokumenmu ditolak panitia.</strong> {catatan || "Silakan periksa kembali dan unggah ulang dokumen yang bermasalah."}
        </div>
      )}
      {error && <div className="adm-error">{error}</div>}

      <section className="adm-card sw-card">
        <div className="sw-cardhead">
          <div>
            <h2>Upload Dokumen</h2>
            <p className="adm-hint">Dokumen bertanda * wajib diunggah.</p>
          </div>
          {adaFile && <span className={`adm-badge ${tone}`}>{labelStatus}</span>}
        </div>

        <div className="sw-doclist">
          {items.map((d) => (
            <div key={d.jenis} className="sw-docrow">
              <span className={`adm-stat-icon ${d.berkas ? "green" : "amber"}`}>
                <Icon name={d.berkas ? "check" : "file"} size={16} />
              </span>
              <div className="grow">
                <strong>{d.jenis}{d.wajib && <b className="req"> *</b>}</strong>
                <small className="adm-sub">
                  {d.berkas ? (
                    <>
                      Terunggah {d.berkas.tanggal} ·{" "}
                      <a className="adm-link" href={`/api/file/dokumen/${d.berkas.id}`} target="_blank" rel="noopener noreferrer">Lihat file</a>
                    </>
                  ) : (
                    d.ket
                  )}
                </small>
              </div>
              <label className={`adm-btn adm-btn-outline adm-btn-sm${locked || busy ? " is-disabled" : ""}`}>
                <Icon name="upload" size={13} />
                {busy === d.jenis ? "Mengunggah..." : d.berkas ? "Ganti" : "Upload"}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={locked || Boolean(busy)}
                  onChange={(e) => {
                    upload(d.jenis, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="sw-note info">
          Dokumen yang diunggah akan diperiksa panitia. Kalau kamu mengganti dokumen, pemeriksaannya diulang dari awal.
        </div>
      </section>

      <div className="sw-actions">
        <button
          type="button"
          className="adm-btn adm-btn-primary"
          disabled={!lengkap}
          onClick={() => router.push("/dashboard/pendaftaran/jurusan")}
        >
          Simpan & Lanjut
        </button>
        <button type="button" className="adm-btn adm-btn-outline" onClick={() => router.push("/dashboard/pendaftaran/data-diri")}>
          Kembali
        </button>
        {!lengkap && <span className="adm-hint">Unggah semua dokumen wajib untuk melanjutkan.</span>}
      </div>
    </div>
  );
}

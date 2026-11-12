"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

const TONE = { menunggu: "amber", terverifikasi: "green", ditolak: "red" };
const LABEL = { menunggu: "Menunggu", terverifikasi: "Terverifikasi", ditolak: "Ditolak" };

const fmt = (d) =>
  new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function DocActions({ row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canVerify = row.status === "menunggu" && row.jumlah_file > 0;

  // Mengembalikan pesan error, atau "" kalau sukses
  async function send(aksi, extra = {}) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/verifikasi-dokumen/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aksi, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return data.error || `Gagal menyimpan (kode ${res.status}).`;
      router.refresh();
      return "";
    } catch {
      return "Tidak bisa terhubung ke server.";
    } finally {
      setBusy(false);
    }
  }

  async function quickVerify() {
    const err = await send("verifikasi");
    if (err) window.alert(err);
  }

  async function openModal() {
    setOpen(true);
    setDetail(null);
    setError("");
    setCatatan("");
    try {
      const res = await fetch(`/api/admin/verifikasi-dokumen/${row.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetail(data);
      setCatatan(data.catatan || "");
    } catch (e) {
      setError(e.message || "Gagal memuat dokumen.");
    }
  }

  async function act(aksi) {
    setError("");
    const err = await send(aksi, { catatan });
    if (err) setError(err);
    else setOpen(false);
  }

  return (
    <>
      <div className="adm-actions">
        <button type="button" className="adm-btn adm-btn-outline adm-btn-sm" onClick={openModal}>
          <Icon name="eye" size={13} /> Lihat
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-primary adm-btn-sm"
          disabled={!canVerify || busy}
          onClick={quickVerify}
        >
          <Icon name="check" size={13} /> Verifikasi
        </button>
      </div>

      {open && (
        <div className="adm-overlay" onClick={() => setOpen(false)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h3>Dokumen {row.nama}</h3>
              <button type="button" className="adm-iconbtn" onClick={() => setOpen(false)} aria-label="Tutup">
                <Icon name="x" />
              </button>
            </div>

            <div className="adm-modal-no">
              No. Pendaftaran: <strong>{row.no_pendaftaran}</strong>{" "}
              <span className={`adm-badge ${TONE[detail?.status || row.status]}`}>
                {LABEL[detail?.status || row.status]}
              </span>
            </div>

            {error && <div className="adm-error">{error}</div>}

            <div className="adm-doclist">
              {!detail && !error && <div className="adm-hint">Memuat dokumen...</div>}
              {detail && detail.berkas.length === 0 && (
                <div className="adm-hint">Belum ada dokumen yang diunggah.</div>
              )}
              {detail?.berkas.map((b) => (
                <div key={b.id} className="adm-doc">
                  <Icon name="file" />
                  <div className="grow">
                    <strong>{b.jenis}</strong>
                    <small>{b.nama_file} · {fmt(b.uploaded_at)}</small>
                  </div>
                  <a className="adm-link" href={`/api/file/dokumen/${b.id}`} target="_blank" rel="noopener noreferrer">Buka</a>
                </div>
              ))}
            </div>

            <label>Catatan (wajib diisi kalau dokumen ditolak)
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Foto KK buram, mohon unggah ulang."
              />
            </label>

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn adm-btn-outline" onClick={() => setOpen(false)}>Tutup</button>
              {detail && detail.status !== "menunggu" && (
                <button type="button" className="adm-btn adm-btn-outline" disabled={busy} onClick={() => act("reset")}>
                  Kembalikan ke Menunggu
                </button>
              )}
              <button type="button" className="adm-btn adm-btn-danger" disabled={busy || !detail} onClick={() => act("tolak")}>
                Tolak
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                disabled={busy || !detail || detail.berkas.length === 0}
                onClick={() => act("verifikasi")}
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

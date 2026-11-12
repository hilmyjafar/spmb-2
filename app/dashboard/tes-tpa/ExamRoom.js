"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const HURUF = ["A", "B", "C", "D"];

export default function ExamRoom({ soal, jawabanAwal, sisaDetik }) {
  const router = useRouter();
  const [jawab, setJawab] = useState(jawabanAwal);
  const [idx, setIdx] = useState(0);
  const [sisa, setSisa] = useState(sisaDetik);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState("");

  const endAt = useRef(Date.now() + sisaDetik * 1000);
  const jawabRef = useRef(jawabanAwal);
  const sudahKirim = useRef(false);
  const selesaiRef = useRef(null);

  async function selesai(otomatis) {
    if (sudahKirim.current) return;
    if (!otomatis) {
      const kosong = soal.length - Object.keys(jawabRef.current).length;
      const ok = window.confirm(
        kosong > 0
          ? `Masih ada ${kosong} soal yang belum dijawab. Kumpulkan sekarang?`
          : "Kumpulkan jawaban sekarang? Jawaban tidak bisa diubah lagi."
      );
      if (!ok) return;
    }
    sudahKirim.current = true;
    setKirim(true);
    try {
      const res = await fetch("/api/siswa/tpa/selesai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jawaban: jawabRef.current }),
      });
      if (!res.ok) throw new Error("gagal");
      router.refresh();
    } catch {
      sudahKirim.current = false;
      setKirim(false);
      setError("Gagal mengumpulkan jawaban. Periksa koneksimu lalu coba lagi.");
    }
  }
  selesaiRef.current = selesai;

  // Timer: berhenti dan kumpulkan otomatis saat waktu habis
  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setSisa(s);
      if (s === 0) {
        clearInterval(t);
        selesaiRef.current(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function pilih(soalId, huruf) {
    if (kirim) return;
    const next = { ...jawabRef.current, [soalId]: huruf };
    jawabRef.current = next;
    setJawab(next);
    // simpan otomatis supaya jawaban aman kalau halaman tertutup
    fetch("/api/siswa/tpa/jawab", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jawaban: next }),
    })
      .then((r) => setError(r.ok ? "" : "Jawaban belum tersimpan di server."))
      .catch(() => setError("Jawaban belum tersimpan, periksa koneksimu."));
  }

  const q = soal[idx];
  const mm = String(Math.floor(sisa / 60)).padStart(2, "0");
  const ss = String(sisa % 60).padStart(2, "0");
  const dijawab = Object.keys(jawab).length;

  return (
    <div className="sw-exam">
      <div className="adm-card sw-qcard">
        <div className="sw-qhead">
          <span>Soal {idx + 1} dari {soal.length}</span>
          <span className={`sw-timer${sisa <= 60 ? " warn" : ""}`}>{mm}:{ss}</span>
        </div>

        <p className="sw-q">{q.pertanyaan}</p>

        <div className="sw-opts">
          {q.opsi.map((teks, i) => (
            <button
              key={HURUF[i]}
              type="button"
              disabled={kirim}
              className={`sw-opt${jawab[q.id] === HURUF[i] ? " on" : ""}`}
              onClick={() => pilih(q.id, HURUF[i])}
            >
              <b>{HURUF[i]}</b>
              <span>{teks}</span>
            </button>
          ))}
        </div>

        {error && <div className="adm-error">{error}</div>}

        <div className="sw-qnav">
          <button type="button" className="adm-btn adm-btn-outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
            Sebelumnya
          </button>
          {idx < soal.length - 1 ? (
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => setIdx(idx + 1)}>
              Berikutnya
            </button>
          ) : (
            <button type="button" className="adm-btn adm-btn-primary" disabled={kirim} onClick={() => selesai(false)}>
              {kirim ? "Mengumpulkan..." : "Kumpulkan Jawaban"}
            </button>
          )}
        </div>
      </div>

      <aside className="adm-card sw-qside">
        <strong>Daftar Soal</strong>
        <small className="adm-sub">{dijawab} dari {soal.length} soal terjawab</small>
        <div className="sw-grid5">
          {soal.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${jawab[s.id] ? "done" : ""}${i === idx ? " cur" : ""}`}
              onClick={() => setIdx(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button type="button" className="adm-btn adm-btn-outline" disabled={kirim} onClick={() => selesai(false)}>
          Kumpulkan Jawaban
        </button>
        <small className="adm-hint">Jawaban tersimpan otomatis. Tes dikumpulkan sendiri saat waktu habis.</small>
      </aside>
    </div>
  );
}

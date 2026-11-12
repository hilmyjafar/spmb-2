import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import { getContext } from "@/lib/siswa";

const DOK = {
  menunggu: ["Menunggu pemeriksaan panitia", "amber"],
  terverifikasi: ["Terverifikasi", "green"],
  ditolak: ["Ditolak", "red"],
};

export default async function StatusSeleksiPage() {
  const { c } = await getContext();
  const [dokLabel, dokTone] = DOK[c.status_dokumen] || DOK.menunggu;
  const sudahTes = c.nilai_tpa !== null && c.nilai_tpa !== undefined;

  let hasil;
  if (c.status_seleksi === "lulus") {
    hasil = (
      <div className="sw-result ok">
        <strong>Selamat! Kamu dinyatakan LULUS seleksi.</strong>
        <span>{c.keterangan_seleksi || "Silakan lanjutkan ke pembayaran daftar ulang."}</span>
        <Link href="/dashboard/pembayaran" className="adm-btn adm-btn-primary">Lanjut ke Pembayaran</Link>
      </div>
    );
  } else if (c.status_seleksi === "tidak_lulus") {
    hasil = (
      <div className="sw-result no">
        <strong>Mohon maaf, kamu belum lulus seleksi.</strong>
        <span>{c.keterangan_seleksi || "Terima kasih sudah mengikuti proses pendaftaran."}</span>
      </div>
    );
  } else {
    hasil = (
      <div className="sw-result wait">
        <strong>Hasil seleksi belum tersedia.</strong>
        <span>Hasil diumumkan setelah dokumenmu diverifikasi dan kamu mengikuti Tes TPA.</span>
      </div>
    );
  }

  const baris = [
    {
      icon: "file",
      judul: "Verifikasi Dokumen",
      badge: <span className={`adm-badge ${dokTone}`}>{dokLabel}</span>,
      ket:
        c.status_dokumen === "ditolak"
          ? <>Alasan: {c.catatan_dokumen || "-"} <Link href="/dashboard/pendaftaran/dokumen" className="adm-link">Perbaiki dokumen</Link></>
          : null,
    },
    {
      icon: "clipboard",
      judul: "Tes TPA",
      badge: sudahTes
        ? <span className="adm-badge green">Nilai {c.nilai_tpa}</span>
        : <span className="adm-badge amber">Belum mengikuti</span>,
      ket: sudahTes ? null : <Link href="/dashboard/tes-tpa" className="adm-link">Lihat jadwal tes</Link>,
    },
    {
      icon: "checksquare",
      judul: "Hasil Seleksi",
      badge: (
        <span className={`adm-badge ${c.status_seleksi === "lulus" ? "green" : c.status_seleksi === "tidak_lulus" ? "red" : "amber"}`}>
          {c.status_seleksi === "lulus" ? "Lulus" : c.status_seleksi === "tidak_lulus" ? "Tidak Lulus" : "Menunggu"}
        </span>
      ),
      ket: null,
    },
  ];

  return (
    <>
      <PageHeader
        crumb="Dashboard / Status Seleksi"
        title="Status Seleksi"
        desc="Pantau hasil verifikasi dokumen, Tes TPA, dan keputusan seleksi."
      />

      {hasil}

      <div className="adm-card sw-card">
        <h2>Ringkasan Pendaftaran</h2>
        <div className="sw-kv"><span>Nama</span><strong>{c.nama}</strong></div>
        <div className="sw-kv"><span>No. Pendaftaran</span><strong>{c.no_pendaftaran}</strong></div>
        <div className="sw-kv"><span>Jurusan Pilihan</span><strong>{c.jurusan_nama ? `${c.jurusan_nama} (${c.jurusan_kode})` : "Belum memilih"}</strong></div>
      </div>

      <div className="adm-card sw-card">
        <h2>Tahapan Seleksi</h2>
        {baris.map((b) => (
          <div key={b.judul} className="sw-docrow">
            <span className="adm-stat-icon green"><Icon name={b.icon} size={16} /></span>
            <div className="grow">
              <strong>{b.judul}</strong>
              {b.ket && <small className="adm-sub">{b.ket}</small>}
            </div>
            {b.badge}
          </div>
        ))}
      </div>
    </>
  );
}

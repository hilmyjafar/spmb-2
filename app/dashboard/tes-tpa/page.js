import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import { getContext } from "@/lib/siswa";
import { getJadwal, ambilSesi } from "@/lib/tpa";
import { fmtHariTanggal, fmtJamStr } from "@/lib/format";
import Countdown from "./Countdown";
import StartButton from "./StartButton";
import ExamRoom from "./ExamRoom";

const TATA_TERTIB = [
  "Gunakan perangkat dengan koneksi internet yang stabil.",
  "Waktu mulai berjalan saat tombol Mulai Tes ditekan dan tidak bisa dijeda.",
  "Jawaban tersimpan otomatis setiap kamu memilih.",
  "Tes dikumpulkan otomatis saat waktu habis.",
  "Tes hanya bisa dikerjakan satu kali. Kerjakan sendiri dengan jujur.",
];

function Pesan({ judul, children, aksi }) {
  return (
    <div className="adm-card sw-empty">
      <strong>{judul}</strong>
      <span>{children}</span>
      {aksi}
    </div>
  );
}

export default async function TesTpaPage() {
  const { c } = await getContext();
  const header = (
    <PageHeader
      crumb="Dashboard / Tes TPA"
      title="Tes Potensi Akademik (TPA)"
      desc="Lihat jadwal, baca tata tertib, lalu kerjakan tes secara online."
    />
  );

  if (c.status_dokumen !== "terverifikasi") {
    return (
      <>
        {header}
        <Pesan
          judul="Dokumenmu belum diverifikasi"
          aksi={<Link href="/dashboard/pendaftaran" className="adm-btn adm-btn-outline">Cek Pendaftaran</Link>}
        >
          Tes TPA bisa diikuti setelah pendaftaran lengkap dan dokumenmu diverifikasi panitia.
        </Pesan>
      </>
    );
  }

  const j = await getJadwal();
  const [[{ n: jumlahSoal }]] = await db.query("SELECT COUNT(*) AS n FROM soal_tpa");
  if (!j || !Number(jumlahSoal)) {
    return (
      <>
        {header}
        <Pesan judul="Jadwal tes belum tersedia">Panitia belum menentukan jadwal atau menyiapkan soal. Cek lagi nanti.</Pesan>
      </>
    );
  }

  const sesi = await ambilSesi(c.id, j.durasi_menit);

  // Sudah selesai mengerjakan
  if (sesi?.selesai) {
    return (
      <>
        {header}
        <div className="adm-card sw-empty ok">
          <strong>Tes sudah selesai dikerjakan</strong>
          <span className="sw-score">{sesi.nilai}</span>
          <span>Nilai TPA kamu. Hasil seleksi akan diumumkan di menu Status Seleksi.</span>
          <Link href="/dashboard/status-seleksi" className="adm-btn adm-btn-outline">Lihat Status Seleksi</Link>
        </div>
      </>
    );
  }

  // Sedang mengerjakan
  if (sesi) {
    const [rows] = await db.query("SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d FROM soal_tpa ORDER BY id");
    const soal = rows.map((r) => ({ id: r.id, pertanyaan: r.pertanyaan, opsi: [r.opsi_a, r.opsi_b, r.opsi_c, r.opsi_d] }));
    return (
      <>
        {header}
        <ExamRoom soal={soal} jawabanAwal={sesi.jawaban} sisaDetik={Math.max(1, sesi.sisa)} />
      </>
    );
  }

  const belumMulai = Number(j.detik_ke_mulai) > 0;
  const masihBuka = Number(j.detik_ke_selesai) >= 0;

  const detail = (
    <div className="sw-two">
      <section className="adm-card sw-card">
        <h2>Detail Pelaksanaan</h2>
        <div className="sw-kv"><span>Dibuka</span><strong>{fmtHariTanggal(j.mulai)}, {fmtJamStr(j.mulai)}</strong></div>
        <div className="sw-kv"><span>Ditutup</span><strong>{fmtHariTanggal(j.selesai)}, {fmtJamStr(j.selesai)}</strong></div>
        <div className="sw-kv"><span>Durasi mengerjakan</span><strong>{j.durasi_menit} menit</strong></div>
        <div className="sw-kv"><span>Jumlah soal</span><strong>{jumlahSoal} soal pilihan ganda</strong></div>
        <div className="sw-kv"><span>Metode</span><strong>Online, dikerjakan di halaman ini</strong></div>
      </section>
      <section className="adm-card sw-card">
        <h2>Tata Tertib</h2>
        <ul className="sw-rules">
          {TATA_TERTIB.map((t) => (
            <li key={t}><Icon name="check" size={14} />{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );

  if (belumMulai) {
    return (
      <>
        {header}
        <div className="sw-hero">
          <div>
            <strong>Tes TPA kamu akan dimulai dalam</strong>
            <small>Pastikan perangkat dan koneksimu siap sebelum tes dibuka.</small>
          </div>
          <Countdown detik={Number(j.detik_ke_mulai)} />
        </div>
        {detail}
      </>
    );
  }

  if (masihBuka) {
    return (
      <>
        {header}
        <div className="sw-hero">
          <div>
            <strong>Tes TPA sudah dibuka</strong>
            <small>Kamu punya {j.durasi_menit} menit setelah menekan tombol mulai.</small>
          </div>
          <StartButton durasi={j.durasi_menit} />
        </div>
        {detail}
      </>
    );
  }

  return (
    <>
      {header}
      <Pesan judul="Kamu tidak mengikuti tes pada waktunya">
        Jadwal tes sudah berakhir. Silakan hubungi panitia SPMB untuk jadwal susulan.
      </Pesan>
    </>
  );
}

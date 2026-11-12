import PageHeader from "@/components/admin/PageHeader";

const ALUR = [
  ["Pendaftaran", "Isi Data Diri, unggah dokumen persyaratan, lalu pilih satu jurusan. Semua bisa kamu ubah sampai hasil seleksi diumumkan."],
  ["Verifikasi Dokumen", "Panitia memeriksa dokumenmu. Kalau ditolak, alasannya tampil di halaman Dokumen. Perbaiki lalu unggah ulang."],
  ["Tes TPA", "Setelah dokumen terverifikasi, kerjakan Tes TPA online pada jadwal yang ditentukan panitia."],
  ["Status Seleksi", "Pantau hasil seleksi di menu ini. Hasil keluar setelah panitia menilai."],
  ["Pembayaran", "Kalau lulus, selesaikan pembayaran daftar ulang dan unggah bukti pembayarannya."],
];

const TANYA = [
  ["Tombol Tes TPA belum bisa ditekan.", "Pastikan dokumenmu sudah terverifikasi dan waktu tes sudah dibuka. Cek jadwalnya di halaman Tes TPA."],
  ["Internet terputus saat mengerjakan tes.", "Buka lagi halaman Tes TPA. Jawaban yang sudah kamu pilih tersimpan otomatis dan waktu tetap berjalan."],
  ["Kenapa data tidak bisa diubah?", "Setelah hasil seleksi keluar, data pendaftaran dikunci. Hubungi panitia kalau ada kesalahan data."],
  ["Lupa kata sandi.", "Hubungi panitia SPMB. Admin dapat mengganti kata sandi akunmu."],
];

export default function BantuanSiswa() {
  return (
    <>
      <PageHeader crumb="Dashboard / Bantuan" title="Bantuan" desc="Panduan singkat mengikuti proses SPMB." />

      <div className="adm-card adm-help">
        <h2>Alur pendaftaran</h2>
        <ol>
          {ALUR.map(([judul, isi]) => (
            <li key={judul}><strong>{judul}</strong><span>{isi}</span></li>
          ))}
        </ol>
      </div>

      <div className="adm-card adm-help">
        <h2>Pertanyaan umum</h2>
        <ul>
          {TANYA.map(([tanya, jawab]) => (
            <li key={tanya}><strong>{tanya}</strong><span>{jawab}</span></li>
          ))}
        </ul>
      </div>
    </>
  );
}

import PageHeader from "@/components/admin/PageHeader";

const ALUR = [
  ["Data Calon Siswa", "Lihat, tambah, ubah, atau hapus data pendaftar. Pendaftar yang datang langsung ke sekolah bisa diinput manual lewat tombol Tambah Data."],
  ["Verifikasi Dokumen", "Periksa berkas yang diunggah siswa, lalu Verifikasi atau Tolak. Kalau ditolak, isi alasannya supaya jelas."],
  ["Tes TPA", "Pantau siapa saja yang sudah mengikuti Tes Potensi Akademik beserta nilainya."],
  ["Seleksi Calon Siswa", "Tentukan Lulus atau Tidak Lulus berdasarkan nilai TPA. Keputusan baru bisa diisi kalau nilai TPA sudah ada."],
  ["Laporan", "Rekap hasil seleksi dan pembayaran. Tombol Cetak Laporan membuka halaman cetak yang bisa disimpan sebagai PDF."],
];

const TANYA = [
  ["Siswa lupa kata sandi, bagaimana?", "Buka menu Akun Siswa, cari namanya, lalu klik ikon kunci untuk mengganti kata sandi. Sampaikan kata sandi barunya ke siswa."],
  ["Tombol Verifikasi tidak bisa ditekan.", "Tombol aktif hanya kalau siswa sudah mengunggah dokumen dan statusnya masih Menunggu. Keputusan yang sudah diambil bisa dikembalikan lewat tombol Lihat."],
  ["Kenapa saya tidak bisa meluluskan calon siswa?", "Siswa tersebut belum punya nilai Tes TPA. Status Lulus dan Tidak Lulus baru bisa dipilih setelah nilainya ada."],
];

export default function BantuanPage() {
  return (
    <>
      <PageHeader title="Bantuan" desc="Panduan singkat menggunakan panel admin SPMB." />

      <div className="adm-card adm-help">
        <h2>Alur kerja admin</h2>
        <ol>
          {ALUR.map(([judul, isi]) => (
            <li key={judul}>
              <strong>{judul}</strong>
              <span>{isi}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="adm-card adm-help">
        <h2>Pertanyaan umum</h2>
        <ul>
          {TANYA.map(([tanya, jawab]) => (
            <li key={tanya}>
              <strong>{tanya}</strong>
              <span>{jawab}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

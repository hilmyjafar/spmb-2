// Logika bersama untuk data calon siswa (dipakai halaman & API)

export const STATUS_OPTIONS = [
  { value: "belum_lengkap", label: "Belum Lengkap" },
  { value: "lengkap", label: "Lengkap" },
  { value: "lulus", label: "Lulus Seleksi" },
  { value: "ditolak", label: "Ditolak" },
];

// Status yang tampil = status "paling akhir" dari alur pendaftaran:
// Ditolak > Lulus Seleksi > Lengkap > Belum Lengkap
const DITOLAK = "(c.status_dokumen = 'ditolak' OR c.status_seleksi = 'tidak_lulus')";
export const STATUS_SQL = {
  ditolak: DITOLAK,
  lulus: `(NOT ${DITOLAK} AND c.status_seleksi = 'lulus')`,
  lengkap: `(NOT ${DITOLAK} AND c.status_seleksi <> 'lulus' AND c.status_data = 'lengkap')`,
  belum_lengkap: `(NOT ${DITOLAK} AND c.status_seleksi <> 'lulus' AND c.status_data = 'belum_lengkap')`,
};

export function statusUtama(r) {
  if (r.status_dokumen === "ditolak" || r.status_seleksi === "tidak_lulus")
    return { label: "Ditolak", tone: "red" };
  if (r.status_seleksi === "lulus") return { label: "Lulus Seleksi", tone: "teal" };
  if (r.status_data === "lengkap") return { label: "Lengkap", tone: "green" };
  return { label: "Belum Lengkap", tone: "amber" };
}

// Validasi input tambah/edit
export function parseSiswa(body) {
  const nama = String(body?.nama || "").trim();
  const asal_sekolah = String(body?.asal_sekolah || "").trim();
  // Siswa yang baru register belum memilih jurusan / mengisi asal sekolah, jadi boleh kosong
  const raw = body?.jurusan_id;
  const jurusan_id = raw === "" || raw === null || raw === undefined ? null : Number(raw);
  const status_data = body?.status_data === "lengkap" ? "lengkap" : "belum_lengkap";

  if (!nama) return { error: "Nama lengkap wajib diisi." };
  if (jurusan_id !== null && (!Number.isInteger(jurusan_id) || jurusan_id <= 0)) {
    return { error: "Jurusan tidak valid." };
  }
  return { data: { nama, asal_sekolah, jurusan_id, status_data } };
}

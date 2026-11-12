// Daftar dokumen yang harus diunggah siswa (aman dipakai di server maupun client)
export const DOKUMEN = [
  { jenis: "Kartu Keluarga", ket: "Unggah foto atau PDF kartu keluarga.", wajib: true },
  { jenis: "Akta Kelahiran", ket: "Unggah foto atau PDF akta kelahiran.", wajib: true },
  { jenis: "Ijazah / SKL", ket: "Unggah ijazah atau Surat Keterangan Lulus (SKL).", wajib: true },
  { jenis: "Pas Foto", ket: "Foto formal berlatar polos, format JPG atau PNG.", wajib: true },
  { jenis: "Rapor", ket: "Unggah rapor semester terakhir (opsional).", wajib: false },
];
export const DOKUMEN_WAJIB = DOKUMEN.filter((d) => d.wajib).map((d) => d.jenis);

export const MAX_UPLOAD = 2 * 1024 * 1024; // 2 MB
export const EKSTENSI = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

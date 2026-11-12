import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AGAMA } from "@/lib/konstanta";
import { db } from "@/lib/db";
import { DOKUMEN_WAJIB } from "@/lib/dokumen";

// Dipakai halaman siswa: pastikan yang login memang siswa, lalu ambil data pendaftarannya
export async function getContext() {
  const session = await getSession();
  if (!session || session.role !== "siswa") redirect("/login");
  const c = await getMyRecord(session);
  return { session, c };
}

export async function requireSiswa() {
  const s = await getSession();
  return s && s.role === "siswa" ? s : null;
}

async function ambil(userId) {
  const [[c]] = await db.query(
    `SELECT c.*, j.kode AS jurusan_kode, j.nama AS jurusan_nama, u.nisn, u.email,
            CONCAT('SPMB', LPAD(c.id, 3, '0')) AS no_pendaftaran
     FROM calon_siswa c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN jurusan j ON j.id = c.jurusan_id
     WHERE c.user_id = ?`,
    [userId]
  );
  return c || null;
}

// Data pendaftaran milik siswa yang login. Kalau belum ada (akun lama), dibuatkan.
export async function getMyRecord(session) {
  let c = await ambil(session.id);
  if (!c) {
    await db.query(
      "INSERT IGNORE INTO calon_siswa (user_id, nama, asal_sekolah) SELECT id, nama, '' FROM users WHERE id = ? AND role = 'siswa'",
      [session.id]
    );
    c = await ambil(session.id);
  }
  return c;
}

// Setelah hasil seleksi keluar, data pendaftaran tidak boleh diubah lagi
export const terkunci = (c) => c.status_seleksi !== "menunggu";

// Kelengkapan data = data diri + dokumen wajib + jurusan sudah terisi
export async function syncStatusData(id) {
  const [[b]] = await db.query("SELECT COUNT(*) AS n FROM biodata WHERE calon_siswa_id = ?", [id]);
  const [dok] = await db.query("SELECT jenis FROM berkas WHERE calon_siswa_id = ?", [id]);
  const [[c]] = await db.query("SELECT jurusan_id FROM calon_siswa WHERE id = ?", [id]);
  const ada = new Set(dok.map((d) => d.jenis));
  const lengkap = Number(b.n) > 0 && DOKUMEN_WAJIB.every((j) => ada.has(j)) && c.jurusan_id !== null;
  await db.query("UPDATE calon_siswa SET status_data = ? WHERE id = ?", [lengkap ? "lengkap" : "belum_lengkap", id]);
}

// Daftar langkah pendaftaran + persentase + langkah berikutnya (dipakai dashboard & stepper)
export async function getProgress(c) {
  const [[b]] = await db.query("SELECT COUNT(*) AS n FROM biodata WHERE calon_siswa_id = ?", [c.id]);
  const [dok] = await db.query("SELECT jenis FROM berkas WHERE calon_siswa_id = ?", [c.id]);
  const ada = new Set(dok.map((d) => d.jenis));
  const base = "/dashboard";

  const langkah = [
    { key: "data-diri", label: "Isi Data Diri", done: Number(b.n) > 0, href: `${base}/pendaftaran/data-diri` },
    { key: "dokumen", label: "Upload Dokumen", done: DOKUMEN_WAJIB.every((j) => ada.has(j)), href: `${base}/pendaftaran/dokumen` },
    { key: "jurusan", label: "Pilih Jurusan", done: c.jurusan_id !== null && c.jurusan_id !== undefined, href: `${base}/pendaftaran/jurusan` },
    { key: "verifikasi", label: "Dokumen Diverifikasi Panitia", done: c.status_dokumen === "terverifikasi", href: `${base}/pendaftaran/dokumen`, info: "Menunggu panitia memeriksa dokumenmu." },
    { key: "tpa", label: "Mengikuti Tes TPA", done: c.nilai_tpa !== null && c.nilai_tpa !== undefined, href: `${base}/tes-tpa` },
    { key: "seleksi", label: "Hasil Seleksi Diumumkan", done: c.status_seleksi !== "menunggu", href: `${base}/status-seleksi`, info: "Menunggu panitia menentukan hasil seleksi." },
  ];
  if (c.status_seleksi !== "tidak_lulus") {
    langkah.push({ key: "bayar", label: "Pembayaran Daftar Ulang", done: c.status_pembayaran === "sudah_bayar", href: `${base}/pembayaran` });
  }
  const selesai = langkah.filter((l) => l.done).length;
  return {
    langkah,
    persen: Math.round((selesai / langkah.length) * 100),
    berikut: langkah.find((l) => !l.done) || null,
  };
}

// Validasi form Data Diri
export function parseBiodata(body) {
  const t = (k, max = 100) => String(body?.[k] ?? "").trim().slice(0, max);
  const tel = (k) => t(k, 20).replace(/[\s-]/g, "");
  const err = (m) => ({ error: m });

  const nama = t("nama");
  const asal_sekolah = t("asal_sekolah");
  const d = {
    nik: t("nik", 16).replace(/\s/g, ""),
    jenis_kelamin: t("jenis_kelamin", 1),
    tempat_lahir: t("tempat_lahir", 60),
    tanggal_lahir: t("tanggal_lahir", 10),
    anak_ke: Number(t("anak_ke", 3)),
    agama: t("agama", 20),
    no_whatsapp: tel("no_whatsapp"),
    alamat: t("alamat", 255),
    rt: t("rt", 3),
    rw: t("rw", 3),
    kelurahan: t("kelurahan", 60),
    kecamatan: t("kecamatan", 60),
    kota: t("kota", 60),
    tahun_lulus: Number(t("tahun_lulus", 4)),
    nama_ayah: t("nama_ayah"),
    pekerjaan_ayah: t("pekerjaan_ayah", 60),
    telp_ayah: tel("telp_ayah"),
    nama_ibu: t("nama_ibu"),
    pekerjaan_ibu: t("pekerjaan_ibu", 60),
    telp_ibu: tel("telp_ibu"),
  };

  if (!nama) return err("Nama lengkap wajib diisi.");
  if (!/^\d{16}$/.test(d.nik)) return err("NIK harus 16 digit angka.");
  if (!["L", "P"].includes(d.jenis_kelamin)) return err("Pilih jenis kelamin.");
  if (!d.tempat_lahir) return err("Tempat lahir wajib diisi.");
  const tgl = new Date(`${d.tanggal_lahir}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.tanggal_lahir) || Number.isNaN(tgl.getTime()) || tgl > new Date() || tgl.getFullYear() < 1995) {
    return err("Tanggal lahir tidak valid.");
  }
  if (!Number.isInteger(d.anak_ke) || d.anak_ke < 1 || d.anak_ke > 20) return err("Anak ke- harus angka 1 sampai 20.");
  if (!AGAMA.includes(d.agama)) return err("Pilih agama.");
  if (!/^\+?\d{9,15}$/.test(d.no_whatsapp)) return err("Nomor WhatsApp tidak valid.");
  if (!d.alamat) return err("Alamat lengkap wajib diisi.");
  if (!/^\d{1,3}$/.test(d.rt) || !/^\d{1,3}$/.test(d.rw)) return err("RT dan RW harus berupa angka.");
  if (!d.kelurahan || !d.kecamatan || !d.kota) return err("Kelurahan, kecamatan, dan kabupaten/kota wajib diisi.");
  if (!asal_sekolah) return err("Asal sekolah wajib diisi.");
  if (!Number.isInteger(d.tahun_lulus) || d.tahun_lulus < 2000 || d.tahun_lulus > new Date().getFullYear() + 1) {
    return err("Tahun lulus tidak valid.");
  }
  if (!d.nama_ayah || !d.nama_ibu) return err("Nama ayah dan nama ibu wajib diisi.");
  for (const k of ["telp_ayah", "telp_ibu"]) {
    if (d[k] && !/^\+?\d{9,15}$/.test(d[k])) return err("Nomor telepon orang tua tidak valid.");
  }
  if (!d.telp_ayah && !d.telp_ibu) return err("Isi minimal satu nomor telepon orang tua.");

  for (const k of ["pekerjaan_ayah", "telp_ayah", "pekerjaan_ibu", "telp_ibu"]) d[k] = d[k] || null;
  return { nama, asal_sekolah, data: d };
}

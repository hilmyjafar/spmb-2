import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Stepper from "@/components/siswa/Stepper";
import { getContext, getProgress, terkunci } from "@/lib/siswa";
import DataDiriForm from "./DataDiriForm";

export default async function DataDiriPage() {
  const { c } = await getContext();
  const p = await getProgress(c);
  const [[b]] = await db.query(
    "SELECT *, DATE_FORMAT(tanggal_lahir, '%Y-%m-%d') AS tgl_lahir FROM biodata WHERE calon_siswa_id = ?",
    [c.id]
  );
  const v = (x) => (x === null || x === undefined ? "" : String(x));

  const initial = {
    nama: v(c.nama),
    nik: v(b?.nik),
    jenis_kelamin: v(b?.jenis_kelamin),
    tempat_lahir: v(b?.tempat_lahir),
    tanggal_lahir: v(b?.tgl_lahir),
    anak_ke: v(b?.anak_ke),
    agama: v(b?.agama),
    no_whatsapp: v(b?.no_whatsapp),
    alamat: v(b?.alamat),
    rt: v(b?.rt),
    rw: v(b?.rw),
    kelurahan: v(b?.kelurahan),
    kecamatan: v(b?.kecamatan),
    kota: v(b?.kota),
    asal_sekolah: v(c.asal_sekolah),
    tahun_lulus: v(b?.tahun_lulus),
    nama_ayah: v(b?.nama_ayah),
    pekerjaan_ayah: v(b?.pekerjaan_ayah),
    telp_ayah: v(b?.telp_ayah),
    nama_ibu: v(b?.nama_ibu),
    pekerjaan_ibu: v(b?.pekerjaan_ibu),
    telp_ibu: v(b?.telp_ibu),
  };

  return (
    <>
      <PageHeader
        crumb="Dashboard / Pendaftaran"
        title="Data Diri"
        desc="Lengkapi data diri kamu sesuai dengan dokumen yang akan diunggah."
      />
      <Stepper aktif="data-diri" selesai={p.langkah.slice(0, 3).map((l) => l.done)} />
      <DataDiriForm initial={initial} nisn={c.nisn} email={c.email} locked={terkunci(c)} />
    </>
  );
}

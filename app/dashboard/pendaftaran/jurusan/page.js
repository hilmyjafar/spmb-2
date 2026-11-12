import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Stepper from "@/components/siswa/Stepper";
import { getContext, getProgress, terkunci } from "@/lib/siswa";
import { JURUSAN_INFO } from "@/lib/jurusan-info";
import JurusanForm from "./JurusanForm";

export default async function JurusanPage() {
  const { c } = await getContext();
  const p = await getProgress(c);
  const [rows] = await db.query("SELECT id, kode, nama FROM jurusan ORDER BY id");
  const jurusan = rows.map((j) => ({
    id: j.id,
    kode: j.kode,
    nama: j.nama,
    bidang: JURUSAN_INFO[j.kode]?.bidang || "Program Keahlian",
    deskripsi: JURUSAN_INFO[j.kode]?.deskripsi || "",
    prospek: JURUSAN_INFO[j.kode]?.prospek || "",
  }));

  return (
    <>
      <PageHeader
        crumb="Dashboard / Pendaftaran"
        title="Pilih Jurusan"
        desc="Pilih satu jurusan yang sesuai dengan minat dan bakatmu."
      />
      <Stepper aktif="jurusan" selesai={p.langkah.slice(0, 3).map((l) => l.done)} />
      <JurusanForm jurusan={jurusan} terpilih={c.jurusan_id ?? null} locked={terkunci(c)} />
    </>
  );
}

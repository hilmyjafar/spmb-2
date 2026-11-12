import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import { getJadwal, soalTerkunci } from "@/lib/tpa";
import JadwalForm from "./JadwalForm";
import SoalManager from "./SoalManager";

export default async function PengaturanTesPage() {
  const jadwal = await getJadwal();
  const [soal] = await db.query(
    "SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar FROM soal_tpa ORDER BY id"
  );
  const terkunci = await soalTerkunci();

  return (
    <>
      <PageHeader
        crumb="Admin / Tes TPA / Pengaturan"
        title="Jadwal & Soal Tes TPA"
        desc="Atur kapan tes online dibuka dan siapkan bank soalnya."
        action={<Link href="/admin/tes-tpa" className="adm-btn adm-btn-outline">Kembali ke Hasil Tes</Link>}
      />
      <JadwalForm
        initial={
          jadwal
            ? { mulai: jadwal.mulai_input, selesai: jadwal.selesai_input, durasi_menit: String(jadwal.durasi_menit) }
            : null
        }
      />
      <SoalManager soal={soal} terkunci={terkunci} />
    </>
  );
}

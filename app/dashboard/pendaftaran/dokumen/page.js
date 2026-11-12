import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Stepper from "@/components/siswa/Stepper";
import { getContext, getProgress, terkunci } from "@/lib/siswa";
import { DOKUMEN } from "@/lib/dokumen";
import { fmtTanggal } from "@/lib/admin-list";
import DokumenForm from "./DokumenForm";

export default async function DokumenPage() {
  const { c } = await getContext();
  const p = await getProgress(c);
  const [berkas] = await db.query(
    "SELECT id, jenis, nama_file, uploaded_at FROM berkas WHERE calon_siswa_id = ?",
    [c.id]
  );
  const items = DOKUMEN.map((d) => {
    const b = berkas.find((x) => x.jenis === d.jenis);
    return { ...d, berkas: b ? { id: b.id, nama: b.nama_file, tanggal: fmtTanggal(b.uploaded_at) } : null };
  });

  return (
    <>
      <PageHeader
        crumb="Dashboard / Pendaftaran"
        title="Dokumen"
        desc="Unggah dokumen persyaratan. Format PDF, JPG, atau PNG dengan ukuran maksimal 2 MB."
      />
      <Stepper aktif="dokumen" selesai={p.langkah.slice(0, 3).map((l) => l.done)} />
      <DokumenForm
        items={items}
        locked={terkunci(c)}
        status={c.status_dokumen}
        catatan={c.catatan_dokumen || ""}
      />
    </>
  );
}

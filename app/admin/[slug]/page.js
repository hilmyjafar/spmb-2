import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";

// Halaman sementara. Kalau nanti dibuat folder sendiri (mis. app/admin/tes-tpa/page.js),
// folder itu otomatis menggantikan halaman sementara ini.
const PAGES = {
  "verifikasi-dokumen": ["Verifikasi Dokumen", "Periksa kelengkapan dan keabsahan dokumen calon siswa yang telah diunggah."],
  "tes-tpa": ["Tes TPA", "Lihat hasil Tes Potensi Akademik calon siswa."],
  seleksi: ["Seleksi Calon Siswa", "Lakukan proses seleksi calon siswa berdasarkan nilai TPA dan data lainnya."],
  laporan: ["Laporan", "Lihat rekap data dan hasil proses SPMB."],
};

export default async function PlaceholderPage({ params }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <>
      <PageHeader title={page[0]} desc={page[1]} />
      <div className="adm-card adm-empty">Halaman ini belum dikerjakan.</div>
    </>
  );
}

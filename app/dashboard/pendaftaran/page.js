import { redirect } from "next/navigation";
import { getContext, getProgress } from "@/lib/siswa";

// Langsung ke langkah pendaftaran pertama yang belum selesai
export default async function PendaftaranPage() {
  const { c } = await getContext();
  const p = await getProgress(c);
  const belum = p.langkah.slice(0, 3).find((l) => !l.done);
  redirect(belum ? belum.href : "/dashboard/pendaftaran/data-diri");
}
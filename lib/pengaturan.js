import { db } from "@/lib/db";

export const DEFAULT_PENGATURAN = {
  biaya_daftar_ulang: "750000",
  biaya_seragam: "450000",
  biaya_administrasi: "50000",
  batas_bayar: "",
  info_transfer: "",
};

export async function getPengaturan() {
  const [rows] = await db.query("SELECT kunci, nilai FROM pengaturan");
  const o = { ...DEFAULT_PENGATURAN };
  for (const r of rows) if (r.kunci in o) o[r.kunci] = r.nilai ?? "";
  return o;
}

export const totalTagihan = (p) =>
  Number(p.biaya_daftar_ulang) + Number(p.biaya_seragam) + Number(p.biaya_administrasi);

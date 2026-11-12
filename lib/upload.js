import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import { EKSTENSI, MAX_UPLOAD } from "@/lib/dokumen";

// File disimpan di folder `uploads/` pada root project (BUKAN di public/),
// dan hanya bisa dibuka lewat /api/file/... setelah dicek siapa yang meminta.
const ROOT = path.join(process.cwd(), "uploads");
const aman = (s) => path.basename(String(s));
const lokasi = (folder) => path.join(ROOT, ...String(folder).split("/").map(aman));

export function mimeDari(nama) {
  return EKSTENSI[path.extname(nama).slice(1).toLowerCase()] || "application/octet-stream";
}

function isiCocok(ext, buf) {
  if (ext === "pdf") return buf.subarray(0, 4).toString() === "%PDF";
  if (ext === "png") return buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  return buf[0] === 0xff && buf[1] === 0xd8; // jpg / jpeg
}

// Cek file kiriman form: ada, ukuran, format, dan isinya cocok dengan formatnya
export async function periksaUpload(file) {
  if (!file || typeof file === "string" || !file.size) return { error: "Pilih file dulu." };
  if (file.size > MAX_UPLOAD) return { error: "Ukuran file maksimal 2 MB." };
  const ext = path.extname(file.name || "").slice(1).toLowerCase();
  if (!EKSTENSI[ext]) return { error: "Format file harus PDF, JPG, atau PNG." };
  const buf = Buffer.from(await file.arrayBuffer());
  if (!isiCocok(ext, buf)) return { error: "Isi file tidak sesuai dengan formatnya." };
  return { ext, buf };
}

export async function simpanFile(folder, nama, buf) {
  await mkdir(lokasi(folder), { recursive: true });
  await writeFile(path.join(lokasi(folder), aman(nama)), buf);
}

export async function hapusFile(folder, nama) {
  try {
    await unlink(path.join(lokasi(folder), aman(nama)));
  } catch {
    /* file sudah tidak ada, abaikan */
  }
}

export const bacaFile = (folder, nama) => readFile(path.join(lokasi(folder), aman(nama)));

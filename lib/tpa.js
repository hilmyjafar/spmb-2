import { db } from "@/lib/db";

// Jadwal tes (satu untuk semua siswa). Waktu dihitung oleh MySQL supaya tidak bergantung jam komputer siswa.
export async function getJadwal() {
  const [[j]] = await db.query(
    `SELECT DATE_FORMAT(mulai, '%Y-%m-%d %H:%i') AS mulai,
            DATE_FORMAT(selesai, '%Y-%m-%d %H:%i') AS selesai,
            DATE_FORMAT(mulai, '%Y-%m-%dT%H:%i') AS mulai_input,
            DATE_FORMAT(selesai, '%Y-%m-%dT%H:%i') AS selesai_input,
            durasi_menit,
            TIMESTAMPDIFF(SECOND, NOW(), mulai) AS detik_ke_mulai,
            TIMESTAMPDIFF(SECOND, NOW(), selesai) AS detik_ke_selesai
     FROM jadwal_tpa WHERE id = 1`
  );
  return j || null;
}

// Jawaban dikirim sebagai { "idSoal": "A" }. Buang apa pun yang bentuknya aneh.
export function bersihkanJawaban(m) {
  const out = {};
  if (m && typeof m === "object") {
    for (const [k, v] of Object.entries(m)) {
      if (/^\d+$/.test(k) && ["A", "B", "C", "D"].includes(v)) out[k] = v;
    }
  }
  return out;
}

// Hitung nilai dari jawaban yang tersimpan, lalu isi nilai_tpa siswa
export async function selesaikanSesi(calonId, sesiId) {
  const [[s]] = await db.query("SELECT jawaban FROM sesi_tpa WHERE id = ? AND selesai_at IS NULL", [sesiId]);
  if (!s) return;
  let jawab = {};
  try {
    jawab = bersihkanJawaban(JSON.parse(s.jawaban || "{}"));
  } catch {
    jawab = {};
  }
  const [soal] = await db.query("SELECT id, jawaban_benar FROM soal_tpa");
  const benar = soal.filter((x) => jawab[x.id] === x.jawaban_benar).length;
  const nilai = soal.length ? Math.round((benar / soal.length) * 100) : 0;

  await db.query("UPDATE sesi_tpa SET selesai_at = NOW(), nilai = ? WHERE id = ? AND selesai_at IS NULL", [nilai, sesiId]);
  await db.query("UPDATE calon_siswa SET nilai_tpa = ?, tanggal_tpa = CURDATE() WHERE id = ?", [nilai, calonId]);
}

// Sesi milik siswa. Kalau waktunya sudah habis tapi belum dikumpulkan, otomatis dinilai.
export async function ambilSesi(calonId, durasi) {
  const q = () =>
    db.query(
      `SELECT id, selesai_at IS NOT NULL AS selesai, nilai, jawaban,
              TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(mulai_at, INTERVAL ? MINUTE)) AS sisa
       FROM sesi_tpa WHERE calon_siswa_id = ?`,
      [durasi, calonId]
    );
  let [[s]] = await q();
  if (s && !s.selesai && Number(s.sisa) <= 0) {
    await selesaikanSesi(calonId, s.id);
    [[s]] = await q();
  }
  if (!s) return null;
  let jawaban = {};
  try {
    jawaban = bersihkanJawaban(JSON.parse(s.jawaban || "{}"));
  } catch {
    jawaban = {};
  }
  return { id: s.id, selesai: Boolean(s.selesai), nilai: s.nilai, sisa: Number(s.sisa), jawaban };
}

export function parseSoal(body) {
  const t = (k, max) => String(body?.[k] ?? "").trim().slice(0, max);
  const d = {
    pertanyaan: t("pertanyaan", 1000),
    opsi_a: t("opsi_a", 255),
    opsi_b: t("opsi_b", 255),
    opsi_c: t("opsi_c", 255),
    opsi_d: t("opsi_d", 255),
    jawaban_benar: t("jawaban_benar", 1),
  };
  if (d.pertanyaan.length < 5) return { error: "Pertanyaan terlalu pendek." };
  if (!d.opsi_a || !d.opsi_b || !d.opsi_c || !d.opsi_d) return { error: "Keempat pilihan jawaban wajib diisi." };
  if (!["A", "B", "C", "D"].includes(d.jawaban_benar)) return { error: "Pilih kunci jawaban." };
  return { data: d };
}

// Soal dikunci begitu ada siswa yang sudah mengerjakan, supaya nilai yang sudah keluar tidak berubah
export async function soalTerkunci() {
  const [[r]] = await db.query("SELECT COUNT(*) AS n FROM sesi_tpa");
  return Number(r.n) > 0;
}

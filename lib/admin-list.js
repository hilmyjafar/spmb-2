// Pembantu untuk halaman daftar admin (pencarian, filter, pagination, format tanggal)

export const PER_PAGE = 10;
export const NO_PENDAFTARAN = "CONCAT('SPMB', LPAD(c.id, 3, '0'))";
export const FROM = "FROM calon_siswa c LEFT JOIN jurusan j ON j.id = c.jurusan_id";

export function readParams(sp) {
  return {
    q: String(sp.q || "").trim(),
    jurusan: String(sp.jurusan || ""),
    status: String(sp.status || ""),
    page: Math.max(1, parseInt(sp.page, 10) || 1),
  };
}

// Filter umum: kata kunci + jurusan
export function commonWhere({ q, jurusan }) {
  const where = [];
  const params = [];
  if (q) {
    const like = `%${q}%`;
    where.push(
      `(c.nama LIKE ? OR c.asal_sekolah LIKE ? OR j.kode LIKE ? OR ${NO_PENDAFTARAN} LIKE ?)`
    );
    params.push(like, like, like, like);
  }
  if (jurusan) {
    where.push("c.jurusan_id = ?");
    params.push(jurusan);
  }
  return { where, params };
}

export async function runList(db, { where, params, select, orderBy = "c.id ASC", page, from = FROM }) {
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total ${from} ${whereSql}`, params);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, totalPages);
  const [rows] = await db.query(
    `SELECT ${select} ${from} ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, PER_PAGE, (current - 1) * PER_PAGE]
  );
  return { rows, total, totalPages, current };
}

export const fmtTanggal = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

export const fmtJam = (d) =>
  d ? new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":") : "";

// Filter halaman Laporan: periode (tahun daftar) + jurusan. Dipakai Laporan dan halaman cetak.
export function laporanFilter(sp) {
  const periode = /^\d{4}$/.test(String(sp.periode || "")) ? String(sp.periode) : "";
  const jurusan = String(sp.jurusan || "").replace(/\D/g, "");
  const where = [];
  const params = [];
  if (periode) {
    where.push("YEAR(c.created_at) = ?");
    params.push(periode);
  }
  if (jurusan) {
    where.push("c.jurusan_id = ?");
    params.push(jurusan);
  }
  return { periode, jurusan, where, params };
}

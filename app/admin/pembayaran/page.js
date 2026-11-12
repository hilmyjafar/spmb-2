import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import FilterBar from "@/components/admin/FilterBar";
import Pager from "@/components/admin/Pager";
import PembayaranActions from "./PembayaranActions";
import PengaturanTagihan from "./PengaturanTagihan";
import { NO_PENDAFTARAN, readParams, commonWhere, runList } from "@/lib/admin-list";
import { getPengaturan, totalTagihan } from "@/lib/pengaturan";
import { rupiah } from "@/lib/format";

const BASE = "/admin/pembayaran";
const FROM_BAYAR =
  "FROM calon_siswa c LEFT JOIN jurusan j ON j.id = c.jurusan_id LEFT JOIN pembayaran p ON p.calon_siswa_id = c.id";
const STATUS = [
  { value: "belum", label: "Belum Bayar" },
  { value: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "lunas", label: "Lunas" },
  { value: "ditolak", label: "Ditolak" },
];
const TAMPIL = {
  belum: ["Belum Bayar", "gray"],
  menunggu_konfirmasi: ["Menunggu Konfirmasi", "amber"],
  lunas: ["Lunas", "green"],
  ditolak: ["Ditolak", "red"],
};

export default async function PembayaranAdminPage({ searchParams }) {
  const { q, jurusan, status, page } = readParams(await searchParams);
  const { where, params } = commonWhere({ q, jurusan });
  where.unshift("c.status_seleksi = 'lulus'");
  if (status === "belum") where.push("p.id IS NULL");
  else if (TAMPIL[status]) {
    where.push("p.status = ?");
    params.push(status);
  }

  const peng = await getPengaturan();
  const { rows, total, totalPages, current } = await runList(db, {
    where,
    params,
    page,
    from: FROM_BAYAR,
    select: `c.id, c.nama, j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran,
             p.id AS bayar_id, p.metode, p.status AS bayar_status, p.bukti_file, p.jumlah`,
  });
  const [jurusanList] = await db.query("SELECT id, kode, nama FROM jurusan ORDER BY id");

  const [[s]] = await db.query(
    `SELECT COUNT(*) AS lulus, SUM(p.id IS NULL) AS belum,
            SUM(p.status = 'menunggu_konfirmasi') AS menunggu, SUM(p.status = 'lunas') AS lunas
     ${FROM_BAYAR} WHERE c.status_seleksi = 'lulus'`
  );
  const cards = [
    { label: "Lulus Seleksi", value: s.lulus, icon: "award", tone: "green", note: "Punya tagihan" },
    { label: "Belum Bayar", value: s.belum, icon: "alert", tone: "amber", note: "Belum mengirim pembayaran" },
    { label: "Menunggu Konfirmasi", value: s.menunggu, icon: "clock", tone: "blue", note: "Perlu diperiksa admin" },
    { label: "Lunas", value: s.lunas, icon: "check", tone: "purple", note: "Sudah dikonfirmasi", up: true },
  ];

  return (
    <>
      <PageHeader
        title="Pembayaran"
        desc="Pantau dan konfirmasi pembayaran daftar ulang calon siswa yang lulus seleksi."
        action={
          <PengaturanTagihan
            initial={{
              biaya_daftar_ulang: peng.biaya_daftar_ulang,
              biaya_seragam: peng.biaya_seragam,
              biaya_administrasi: peng.biaya_administrasi,
              batas_bayar: peng.batas_bayar,
              info_transfer: peng.info_transfer,
            }}
          />
        }
      />
      <FilterBar basePath={BASE} jurusan={jurusanList} statusOptions={STATUS} initial={{ q, jurusan, status }} />

      <div className="adm-stats">
        {cards.map((c) => (
          <div key={c.label} className="adm-card adm-stat">
            <span className={`adm-stat-icon ${c.tone}`}><Icon name={c.icon} /></span>
            <div>
              <small>{c.label}</small>
              <strong>{Number(c.value || 0)}</strong>
              <span className={`adm-trend ${c.up ? "up" : "warn"}`}>{c.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-tablewrap" style={{ paddingTop: 16 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Lengkap</th>
                <th>No. Pendaftaran</th>
                <th>Jurusan</th>
                <th>Tagihan</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={8} className="adm-empty">Belum ada calon siswa lulus yang cocok.</td></tr>
              )}
              {rows.map((r, i) => {
                const st = r.bayar_status || "belum";
                const [label, tone] = TAMPIL[st];
                return (
                  <tr key={r.id}>
                    <td>{(current - 1) * 10 + i + 1}</td>
                    <td>{r.nama}</td>
                    <td>{r.no_pendaftaran}</td>
                    <td>{r.jurusan_kode || "-"}</td>
                    <td>{rupiah(r.jumlah ?? totalTagihan(peng))}</td>
                    <td>{r.metode === "transfer" ? "Transfer" : r.metode === "langsung" ? "Langsung" : "-"}</td>
                    <td><span className={`adm-badge ${tone}`}>{label}</span></td>
                    <td>
                      <PembayaranActions
                        row={{ id: r.id, nama: r.nama, status: st, buktiId: r.bukti_file ? r.bayar_id : null }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="adm-card-foot">
          <span className="adm-meta">Menampilkan {rows.length} dari {total} data</span>
          <Pager basePath={BASE} params={{ q, jurusan, status }} current={current} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}

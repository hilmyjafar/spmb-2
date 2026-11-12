import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import FilterBar from "@/components/admin/FilterBar";
import Pager from "@/components/admin/Pager";
import { SeleksiProvider, LihatButton, SeleksiPanel } from "./SeleksiPanel";
import { NO_PENDAFTARAN, readParams, commonWhere, runList, fmtTanggal } from "@/lib/admin-list";

const BASE = "/admin/seleksi";
const STATUS = [
  { value: "menunggu", label: "Menunggu" },
  { value: "lulus", label: "Lulus" },
  { value: "tidak_lulus", label: "Tidak Lulus" },
];
const TONE = { menunggu: "amber", lulus: "green", tidak_lulus: "red" };
const LABEL = Object.fromEntries(STATUS.map((s) => [s.value, s.label]));

export default async function SeleksiPage({ searchParams }) {
  const { q, jurusan, status, page } = readParams(await searchParams);
  const { where, params } = commonWhere({ q, jurusan });
  if (LABEL[status]) {
    where.push("c.status_seleksi = ?");
    params.push(status);
  }

  const { rows, total, totalPages, current } = await runList(db, {
    where,
    params,
    page,
    select: `c.id, c.nama, c.asal_sekolah, c.nilai_tpa, c.tanggal_tpa, c.status_seleksi, c.keterangan_seleksi,
             j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran`,
  });
  const [jurusanList] = await db.query("SELECT id, kode, nama FROM jurusan ORDER BY id");

  return (
    <>
      <PageHeader
        title="Seleksi Calon Siswa"
        desc="Lakukan proses seleksi calon siswa berdasarkan nilai TPA dan data lainnya."
      />

      <SeleksiProvider>
        <div className="adm-split-main">
          <FilterBar basePath={BASE} jurusan={jurusanList} statusOptions={STATUS} initial={{ q, jurusan, status }} />

          <div className="adm-card">
            <div className="adm-tablewrap" style={{ paddingTop: 16 }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nama Lengkap</th>
                    <th>No. Pendaftaran</th>
                    <th>Jurusan</th>
                    <th>Nilai TPA</th>
                    <th>Status Seleksi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="adm-empty">Tidak ada data yang cocok.</td></tr>
                  )}
                  {rows.map((r, i) => (
                    <tr key={r.id}>
                      <td>{(current - 1) * 10 + i + 1}</td>
                      <td>{r.nama}</td>
                      <td>{r.no_pendaftaran}</td>
                      <td>{r.jurusan_kode || "-"}</td>
                      <td>{r.nilai_tpa !== null ? <span className="adm-score">{r.nilai_tpa}</span> : "-"}</td>
                      <td><span className={`adm-badge ${TONE[r.status_seleksi]}`}>{LABEL[r.status_seleksi]}</span></td>
                      <td>
                        <LihatButton
                          row={{
                            id: r.id,
                            nama: r.nama,
                            no_pendaftaran: r.no_pendaftaran,
                            jurusan_kode: r.jurusan_kode,
                            asal_sekolah: r.asal_sekolah,
                            nilai_tpa: r.nilai_tpa,
                            tanggal_tpa: fmtTanggal(r.tanggal_tpa),
                            status_seleksi: r.status_seleksi,
                            keterangan_seleksi: r.keterangan_seleksi,
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="adm-card-foot">
              <span className="adm-meta">Menampilkan {rows.length} dari {total} data</span>
              <Pager basePath={BASE} params={{ q, jurusan, status }} current={current} totalPages={totalPages} />
            </div>
          </div>
        </div>

        <SeleksiPanel />
      </SeleksiProvider>
    </>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import FilterBar from "@/components/admin/FilterBar";
import Pager from "@/components/admin/Pager";
import TpaDetail from "./TpaDetail";
import { NO_PENDAFTARAN, readParams, commonWhere, runList, fmtTanggal } from "@/lib/admin-list";

const BASE = "/admin/tes-tpa";
const STATUS = [
  { value: "selesai", label: "Selesai" },
  { value: "belum", label: "Belum Tes" },
];

export default async function TesTpaPage({ searchParams }) {
  const { q, jurusan, status, page } = readParams(await searchParams);
  const { where, params } = commonWhere({ q, jurusan });
  if (status === "selesai") where.push("c.nilai_tpa IS NOT NULL");
  if (status === "belum") where.push("c.nilai_tpa IS NULL");

  const { rows, total, totalPages, current } = await runList(db, {
    where,
    params,
    page,
    select: `c.id, c.nama, c.asal_sekolah, c.nilai_tpa, c.tanggal_tpa,
             j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran`,
  });
  const [jurusanList] = await db.query("SELECT id, kode, nama FROM jurusan ORDER BY id");

  return (
    <>
      <PageHeader
        title="Tes TPA"
        desc="Lihat hasil Tes Potensi Akademik calon siswa. Tes dikerjakan siswa secara online."
        action={<Link href="/admin/tes-tpa/pengaturan" className="adm-btn adm-btn-primary">Atur Jadwal & Soal</Link>}
      />
      <FilterBar
        basePath={BASE}
        jurusan={jurusanList}
        statusOptions={STATUS}
        placeholder="Cari nama atau no. pendaftaran..."
        initial={{ q, jurusan, status }}
      />

      <div className="adm-card">
        <div className="adm-tablewrap" style={{ paddingTop: 16 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Lengkap</th>
                <th>No. Pendaftaran</th>
                <th>Nilai TPA</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="adm-empty">Tidak ada data yang cocok.</td></tr>
              )}
              {rows.map((r, i) => {
                const selesai = r.nilai_tpa !== null;
                return (
                  <tr key={r.id}>
                    <td>{(current - 1) * 10 + i + 1}</td>
                    <td>{r.nama}</td>
                    <td>{r.no_pendaftaran}</td>
                    <td>{selesai ? <span className="adm-score">{r.nilai_tpa}</span> : "-"}</td>
                    <td>
                      <span className={`adm-badge ${selesai ? "green" : "amber"}`}>
                        {selesai ? "Selesai" : "Belum Tes"}
                      </span>
                    </td>
                    <td>
                      <TpaDetail
                        row={{
                          id: r.id,
                          nama: r.nama,
                          no_pendaftaran: r.no_pendaftaran,
                          jurusan: r.jurusan_kode || "-",
                          asal_sekolah: r.asal_sekolah || "-",
                          nilai: r.nilai_tpa,
                          tanggal: fmtTanggal(r.tanggal_tpa),
                        }}
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

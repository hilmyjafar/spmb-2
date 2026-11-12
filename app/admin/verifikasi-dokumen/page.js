import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import Icon from "@/components/admin/Icon";
import FilterBar from "@/components/admin/FilterBar";
import Pager from "@/components/admin/Pager";
import DocActions from "./DocActions";
import { NO_PENDAFTARAN, readParams, commonWhere, runList, fmtTanggal, fmtJam } from "@/lib/admin-list";

const BASE = "/admin/verifikasi-dokumen";
const STATUS = [
  { value: "menunggu", label: "Menunggu" },
  { value: "terverifikasi", label: "Terverifikasi" },
  { value: "ditolak", label: "Ditolak" },
];
const TONE = { menunggu: "amber", terverifikasi: "green", ditolak: "red" };
const LABEL = Object.fromEntries(STATUS.map((s) => [s.value, s.label]));

export default async function VerifikasiDokumenPage({ searchParams }) {
  const { q, jurusan, status, page } = readParams(await searchParams);
  const { where, params } = commonWhere({ q, jurusan });
  if (LABEL[status]) {
    where.push("c.status_dokumen = ?");
    params.push(status);
  }

  const { rows, total, totalPages, current } = await runList(db, {
    where,
    params,
    page,
    select: `c.id, c.nama, c.status_dokumen, j.kode AS jurusan_kode, ${NO_PENDAFTARAN} AS no_pendaftaran,
      (SELECT COUNT(*) FROM berkas b WHERE b.calon_siswa_id = c.id) AS jumlah_file,
      (SELECT MAX(b.uploaded_at) FROM berkas b WHERE b.calon_siswa_id = c.id) AS terakhir_upload`,
    orderBy: "terakhir_upload IS NULL, terakhir_upload DESC, c.id ASC",
  });
  const [jurusanList] = await db.query("SELECT id, kode, nama FROM jurusan ORDER BY id");
  const pagerParams = { q, jurusan, status };

  return (
    <>
      <PageHeader
        title="Verifikasi Dokumen"
        desc="Periksa kelengkapan dan keabsahan dokumen calon siswa yang telah diunggah."
      />
      <FilterBar basePath={BASE} jurusan={jurusanList} statusOptions={STATUS} initial={{ q, jurusan, status }} />

      <div className="adm-card">
        <div className="adm-tablewrap" style={{ paddingTop: 16 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Lengkap</th>
                <th>No. Pendaftaran</th>
                <th>Dokumen</th>
                <th>Tanggal Upload</th>
                <th>Status</th>
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
                  <td><span className="adm-docs"><Icon name="file" size={14} /> {r.jumlah_file} file</span></td>
                  <td>
                    {r.terakhir_upload ? (
                      <>
                        {fmtTanggal(r.terakhir_upload)}
                        <small className="adm-sub">{fmtJam(r.terakhir_upload)}</small>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td><span className={`adm-badge ${TONE[r.status_dokumen]}`}>{LABEL[r.status_dokumen]}</span></td>
                  <td>
                    <DocActions
                      row={{
                        id: r.id,
                        nama: r.nama,
                        no_pendaftaran: r.no_pendaftaran,
                        status: r.status_dokumen,
                        jumlah_file: Number(r.jumlah_file),
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
          <Pager basePath={BASE} params={pagerParams} current={current} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}

import { db } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import { getContext } from "@/lib/siswa";
import { getPengaturan, totalTagihan } from "@/lib/pengaturan";
import { rupiah, fmtTglStr } from "@/lib/format";
import PembayaranForm from "./PembayaranForm";

const STATUS = {
  lunas: ["Lunas", "green"],
  menunggu_konfirmasi: ["Menunggu Konfirmasi", "amber"],
  ditolak: ["Ditolak", "red"],
};

export default async function PembayaranPage() {
  const { c } = await getContext();
  const header = (
    <PageHeader
      crumb="Dashboard / Pembayaran"
      title="Pembayaran Daftar Ulang"
      desc="Selesaikan pembayaran untuk mengamankan kursimu sebagai siswa baru."
    />
  );

  if (c.status_seleksi !== "lulus") {
    return (
      <>
        {header}
        <div className="adm-card sw-empty">
          Pembayaran daftar ulang hanya tersedia untuk calon siswa yang sudah dinyatakan lulus seleksi.
        </div>
      </>
    );
  }

  const p = await getPengaturan();
  const [[bayar]] = await db.query(
    "SELECT id, metode, bukti_file, status, catatan FROM pembayaran WHERE calon_siswa_id = ?",
    [c.id]
  );
  const [label, tone] = bayar ? STATUS[bayar.status] : ["Menunggu Pembayaran", "amber"];
  const baris = [
    ["Biaya Daftar Ulang", p.biaya_daftar_ulang],
    ["Seragam & Atribut", p.biaya_seragam],
    ["Biaya Administrasi", p.biaya_administrasi],
  ];

  return (
    <>
      {header}
      <div className="sw-pay">
        <section className="adm-card sw-card">
          <h2>Ringkasan Tagihan</h2>
          {baris.map(([nama, nilai]) => (
            <div key={nama} className="sw-kv"><span>{nama}</span><strong>{rupiah(nilai)}</strong></div>
          ))}
          <div className="sw-kv total"><span>Total Tagihan</span><strong>{rupiah(totalTagihan(p))}</strong></div>
          <span className={`adm-badge ${tone}`}>{label}</span>
          {p.batas_bayar && (
            <div className="sw-note">Batas waktu pembayaran: <strong>{fmtTglStr(p.batas_bayar)}</strong></div>
          )}
        </section>

        <PembayaranForm
          status={bayar?.status || "belum"}
          metodeAwal={bayar?.metode || "transfer"}
          buktiId={bayar?.bukti_file ? bayar.id : null}
          catatan={bayar?.catatan || ""}
          infoTransfer={p.info_transfer}
        />
      </div>
    </>
  );
}

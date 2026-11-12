import Link from "next/link";
import Icon from "@/components/admin/Icon";
import { getContext, getProgress } from "@/lib/siswa";

const MENU = [
  { href: "/dashboard/pendaftaran", icon: "file", judul: "Pendaftaran", ket: "Isi data diri, unggah dokumen, dan pilih jurusan." },
  { href: "/dashboard/tes-tpa", icon: "clipboard", judul: "Tes TPA", ket: "Lihat jadwal dan kerjakan tes secara online." },
  { href: "/dashboard/status-seleksi", icon: "checksquare", judul: "Status Seleksi", ket: "Pantau hasil verifikasi dan seleksi." },
  { href: "/dashboard/pembayaran", icon: "wallet", judul: "Pembayaran", ket: "Pembayaran daftar ulang bagi yang lulus." },
];

export default async function DashboardSiswa() {
  const { c } = await getContext();
  const p = await getProgress(c);
  const panggilan = c.nama.split(" ")[0];

  let berikut;
  if (p.berikut) {
    berikut = p.berikut.info ? (
      <p className="sw-next">{p.berikut.info}</p>
    ) : (
      <Link href={p.berikut.href} className="adm-btn adm-btn-primary">
        Lanjutkan: {p.berikut.label}
      </Link>
    );
  } else if (c.status_seleksi === "tidak_lulus") {
    berikut = <p className="sw-next">Hasil seleksi sudah keluar. Lihat detailnya di menu Status Seleksi.</p>;
  } else {
    berikut = <p className="sw-next">Semua tahapan sudah selesai. Selamat bergabung!</p>;
  }

  return (
    <>
      <div className="sw-hello">
        <small>Selamat datang,</small>
        <h1>{panggilan}</h1>
        <p>Selamat datang di portal pendaftaran SPMB. Lengkapi seluruh tahapan pendaftaran untuk melanjutkan proses berikutnya.</p>
      </div>

      <div className="adm-card sw-status">
        <div className="sw-ring" style={{ "--p": p.persen }}>
          <span>{p.persen}%</span>
        </div>
        <div>
          <h2>Status Pendaftaran</h2>
          <ul className="sw-checklist">
            {p.langkah.map((l) => (
              <li key={l.key} className={l.done ? "done" : ""}>
                <span className="mark">{l.done ? <Icon name="check" size={12} /> : null}</span>
                {l.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="sw-nextbox">
          <strong>Langkah berikutnya</strong>
          {berikut}
        </div>
      </div>

      <h2 className="sw-title">Menu Utama</h2>
      <div className="sw-menu">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className="adm-card sw-menucard">
            <span className="adm-stat-icon green"><Icon name={m.icon} /></span>
            <strong>{m.judul}</strong>
            <span>{m.ket}</span>
            <span className="arrow"><Icon name="chevron" size={14} /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
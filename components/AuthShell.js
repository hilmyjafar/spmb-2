import Link from "next/link";

// Panel kiri (hijau) + kolom kanan untuk form. Dipakai halaman login & register.
export default function AuthShell({ children }) {
  return (
    <main className="auth">
      <section className="auth-left">
        <Link href="/" className="auth-brand">
          <span className="auth-logo">S</span>
          <span>
            <strong>SPMB Sekolah</strong>
            <small>SMK Negeri Unggulan</small>
          </span>
        </Link>

        <div className="auth-hero">
          <span className="auth-tag">PENDAFTARAN SISWA BARU</span>
          <h1>
            Mulai langkahmu,
            <br />
            raih masa
            <br />
            depanmu.
          </h1>
          <p>
            Buat akun untuk mengikuti proses penerimaan siswa baru dan menjadi
            bagian dari keluarga besar sekolah kami.
          </p>
          <ol className="auth-steps">
            <li><span className="num">1</span>Buat akun dengan data diri kamu</li>
            <li><span className="num">2</span>Lengkapi data pendaftaran</li>
            <li><span className="num">3</span>Pantau proses seleksi secara online</li>
          </ol>
        </div>

        <div className="auth-stats">
          <div><strong>06+</strong><span>Program Keahlian</span></div>
          <div><strong>1.200+</strong><span>Siswa Aktif</span></div>
          <div><strong>95%</strong><span>Lulusan Kerja</span></div>
        </div>
      </section>

      <section className="auth-right">
        <Link href="/" className="auth-back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali
        </Link>
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}

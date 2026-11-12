import Link from "next/link";
import "./globals.css";

export default function Home() {
  return (
    <main>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-box">S</div>
            <div>
              <strong>SPMB SEKOLAH</strong>
              <span>SMK Negeri Unggulan</span>
            </div>
          </div>

          <nav>
            <a href="#beranda">Beranda</a>
            <a href="#program">Program Keahlian</a>
            <a href="#alur">Alur Pendaftaran</a>
            <a href="#fasilitas">Fasilitas</a>
            <Link href="/login" className="login-link">
              Masuk
            </Link>
            <Link href="/register" className="register-btn">
              Daftar Sekarang
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="beranda">
        <div className="hero-container">
          <div className="hero-text">
            <div className="badge">PENDAFTARAN SISWA BARU</div>

            <h1>
              Wujudkan impianmu
              <br />
              <span>bersama kami!</span>
            </h1>

            <p>
              Daftar sebagai calon siswa SMK Negeri Unggulan
              dan mulai perjalanan pendidikanmu bersama kami.
            </p>

            <div className="hero-buttons">
              <Link href="/register" className="primary-btn">
                Mulai Pendaftaran
              </Link>

              <a href="#alur" className="secondary-btn">
                Lihat Alur
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img src="/asset/hero.jpg" alt="Sekolah" />
          </div>
        </div>

        <div className="stats">
          <div>
            <strong>06+</strong>
            <span>Program Keahlian</span>
          </div>

          <div>
            <strong>20+</strong>
            <span>Ekstrakurikuler</span>
          </div>

          <div>
            <strong>95%</strong>
            <span>Lulusan Kerja</span>
          </div>

          <div>
            <strong>1.200+</strong>
            <span>Siswa Aktif</span>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section">
        <div className="section-title">
          <h2>Mengapa Memilih Kami?</h2>
          <p>Lingkungan belajar yang mendukung perkembangan siswa.</p>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">✓</div>
            <h3>Fasilitas Berkualitas</h3>
            <p>Fasilitas sekolah yang mendukung kegiatan belajar.</p>
          </div>

          <div className="feature">
            <div className="feature-icon">★</div>
            <h3>Guru Berpengalaman</h3>
            <p>Didampingi tenaga pendidik yang berpengalaman.</p>
          </div>

          <div className="feature">
            <div className="feature-icon">◆</div>
            <h3>Lingkungan Nyaman</h3>
            <p>Lingkungan sekolah yang aman dan nyaman.</p>
          </div>

          <div className="feature">
            <div className="feature-icon">↗</div>
            <h3>Pengembangan Siswa</h3>
            <p>Mendukung siswa mengembangkan potensi dan keterampilan.</p>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="section green-section" id="program">
        <div className="section-title">
          <h2>Program Keahlian Unggulan</h2>
          <p>Pilih jurusan sesuai minat dan kemampuanmu.</p>
        </div>

        <div className="program-grid">
          <div className="program-card">
            <div className="program-icon">💻</div>
            <h3>PPLG</h3>
            <p>Pengembangan Perangkat Lunak dan Gim</p>
          </div>

          <div className="program-card">
            <div className="program-icon">🌐</div>
            <h3>TKJ</h3>
            <p>Teknik Komputer dan Jaringan</p>
          </div>

          <div className="program-card">
            <div className="program-icon">🎨</div>
            <h3>DKV</h3>
            <p>Desain Komunikasi Visual</p>
          </div>

          <div className="program-card">
            <div className="program-icon">📊</div>
            <h3>MPLB</h3>
            <p>Manajemen Perkantoran dan Layanan Bisnis</p>
          </div>

          <div className="program-card">
            <div className="program-icon">🛍️</div>
            <h3>PM</h3>
            <p>Pemasaran</p>
          </div>

          <div className="program-card">
            <div className="program-icon">🏨</div>
            <h3>PH</h3>
            <p>Perhotelan</p>
          </div>
        </div>
      </section>

      {/* ALUR */}
      <section className="section" id="alur">
        <div className="section-title">
          <h2>Alur Pendaftaran SPMB</h2>
          <p>Ikuti beberapa langkah sederhana berikut.</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Daftar Akun</h3>
            <p>Buat akun calon siswa.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Lengkapi Data</h3>
            <p>Isi biodata dan pilih jurusan.</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Upload Dokumen</h3>
            <p>Upload dokumen yang diperlukan.</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Tes TPA</h3>
            <p>Ikuti tes sesuai jadwal.</p>
          </div>

          <div className="step">
            <div className="step-number">5</div>
            <h3>Hasil Seleksi</h3>
            <p>Lihat hasil seleksi calon siswa.</p>
          </div>
        </div>
      </section>

      {/* FASILITAS */}
      <section className="section green-section" id="fasilitas">
        <div className="section-title">
          <h2>Fasilitas Sekolah</h2>
          <p>Lingkungan belajar yang mendukung kegiatan siswa.</p>
        </div>

        <div className="facility-grid">
          <img src="/asset/fasilitas-1.jpg" alt="Fasilitas sekolah" />
          <img src="/asset/fasilitas-2.jpg" alt="Fasilitas sekolah" />
          <img src="/asset/fasilitas-3.jpg" alt="Fasilitas sekolah" />
        </div>
      </section>

      {/* INFO */}
      <section className="section info-section">
        <div className="section-title">
          <h2>Informasi Terbaru & Jadwal</h2>
          <p>Informasi penting mengenai pendaftaran.</p>
        </div>

        <div className="info-grid">
          <div>
            <h3>Berita Terbaru</h3>
            <p>Pendaftaran SPMB telah dibuka.</p>
            <p>Jadwal tes TPA calon siswa.</p>
            <p>Pengumuman hasil seleksi.</p>
          </div>

          <div>
            <h3>Jadwal Penting</h3>
            <p>Pendaftaran: 1 - 20 April</p>
            <p>Tes TPA: 22 April</p>
            <p>Pengumuman: 30 April</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Siap bergabung?</h2>
        <p>Mulai proses pendaftaranmu sekarang.</p>
        <Link href="/register">Daftar Sekarang</Link>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-container">
          <div>
            <strong>SPMB SEKOLAH</strong>
            <p>SMK Negeri Unggulan</p>
          </div>

          <div>
            <strong>Menu</strong>
            <p>Beranda</p>
            <p>Program Keahlian</p>
          </div>

          <div>
            <strong>Informasi</strong>
            <p>Alur Pendaftaran</p>
            <p>Jadwal</p>
          </div>

          <div>
            <strong>Kontak</strong>
            <p>info@smksekolah.sch.id</p>
          </div>
        </div>

        <div className="copyright">
          © 2026 SPMB Sekolah. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
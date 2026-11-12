"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import "../auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    nisn: "",
    email: "",
    password: "",
    konfirmasi: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agree) {
      setError("Kamu harus menyetujui Syarat & Ketentuan.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mendaftar.");
        return;
      }
      setSuccess("Akun berhasil dibuat! Mengarahkan ke halaman masuk...");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <small className="auth-eyebrow">Penerimaan Siswa Baru 2026/2027</small>
      <h2>Buat akun pendaftaran</h2>
      <p className="auth-sub">
        Sudah punya akun? <Link href="/login">Masuk di sini</Link>
      </p>

      <form onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="nama">Nama Lengkap</label>
            <input
              id="nama"
              type="text"
              value={form.nama}
              onChange={set("nama")}
              placeholder="Nama sesuai rapor"
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="nisn">NISN</label>
            <input
              id="nisn"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={form.nisn}
              onChange={set("nisn")}
              placeholder="10 digit NISN"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Buat Kata Sandi</label>
          <PasswordField
            id="password"
            value={form.password}
            onChange={set("password")}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label htmlFor="konfirmasi">Konfirmasi Kata Sandi</label>
          <PasswordField
            id="konfirmasi"
            value={form.konfirmasi}
            onChange={set("konfirmasi")}
            placeholder="Ulangi kata sandi"
            autoComplete="new-password"
          />
        </div>

        <label className="check agree">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            Saya menyetujui <a href="#">Syarat &amp; Ketentuan</a> dan{" "}
            <a href="#">Kebijakan Privasi</a> SPMB Sekolah
          </span>
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>

        <div className="divider">atau</div>

        <button type="button" className="btn-google" disabled title="Belum tersedia">
          <span className="g-logo">G</span> Daftar dengan Google
        </button>

        <p className="auth-foot">
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </p>
      </form>
    </AuthShell>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import "../auth.css";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk.");
        return;
      }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <small className="auth-eyebrow">Selamat datang kembali</small>
      <h2>Masuk ke akun kamu</h2>
      <p className="auth-sub">
        Belum punya akun? <Link href="/register">Daftar disini</Link>
      </p>

      <form onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label htmlFor="identifier">Email/NISN</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="nama@gmail.com"
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Kata Sandi</label>
          <PasswordField
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan kata sandi"
            autoComplete="current-password"
          />
        </div>

        <div className="row-between">
          <label className="check">
            <input type="checkbox" /> Ingat saya
          </label>
          <a href="#">Lupa sandi?</a>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <div className="divider">atau</div>

        <button type="button" className="btn-google" disabled title="Belum tersedia">
          <span className="g-logo">G</span> Masuk dengan Google
        </button>

        <p className="auth-foot">
          Dengan masuk kamu menyetujui <a href="#">Syarat &amp; Ketentuan</a> kami.
        </p>
      </form>
    </AuthShell>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

export default function PembayaranActions({ row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function kirim(aksi, catatan = "") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/pembayaran/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aksi, catatan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(data.error || `Gagal menyimpan (kode ${res.status}).`);
        return;
      }
      router.refresh();
    } catch {
      window.alert("Tidak bisa terhubung ke server.");
    } finally {
      setBusy(false);
    }
  }

  const konfirmasi = () => {
    if (window.confirm(`Konfirmasi pembayaran ${row.nama} sebagai LUNAS?`)) kirim("konfirmasi");
  };
  const tolak = () => {
    const alasan = window.prompt("Alasan penolakan (akan dibaca siswa):");
    if (alasan && alasan.trim()) kirim("tolak", alasan.trim());
  };
  const batalkan = () => {
    if (window.confirm(`Batalkan status lunas ${row.nama}?`)) kirim("batalkan");
  };

  return (
    <div className="adm-actions">
      {row.buktiId && (
        <a className="adm-btn adm-btn-outline adm-btn-sm" href={`/api/file/bukti/${row.buktiId}`} target="_blank" rel="noopener noreferrer">
          <Icon name="eye" size={13} /> Bukti
        </a>
      )}
      {row.status !== "lunas" && (
        <button type="button" className="adm-btn adm-btn-primary adm-btn-sm" disabled={busy} onClick={konfirmasi}>
          <Icon name="check" size={13} /> Konfirmasi
        </button>
      )}
      {row.status === "menunggu_konfirmasi" && (
        <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" disabled={busy} onClick={tolak}>Tolak</button>
      )}
      {row.status === "lunas" && (
        <button type="button" className="adm-btn adm-btn-outline adm-btn-sm" disabled={busy} onClick={batalkan}>Batalkan</button>
      )}
    </div>
  );
}

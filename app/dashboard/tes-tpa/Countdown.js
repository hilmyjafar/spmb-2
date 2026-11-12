"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Hitung mundur ke waktu mulai tes. Detik awal dihitung server, jadi tidak bergantung jam perangkat.
export default function Countdown({ detik }) {
  const router = useRouter();
  const end = useRef(Date.now() + detik * 1000);
  const [s, setS] = useState(detik);

  useEffect(() => {
    const t = setInterval(() => {
      const sisa = Math.max(0, Math.round((end.current - Date.now()) / 1000));
      setS(sisa);
      if (sisa === 0) {
        clearInterval(t);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  const kotak = [
    [Math.floor(s / 86400), "Hari"],
    [Math.floor((s % 86400) / 3600), "Jam"],
    [Math.floor((s % 3600) / 60), "Menit"],
    [s % 60, "Detik"],
  ];
  return (
    <div className="sw-cd">
      {kotak.map(([n, label]) => (
        <div key={label}>
          <strong>{String(n).padStart(2, "0")}</strong>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

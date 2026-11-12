import Link from "next/link";

// Pagination: kirim filter aktif lewat `params` supaya tidak hilang saat pindah halaman
export default function Pager({ basePath, params = {}, current, totalPages }) {
  if (totalPages <= 1) return null;

  const href = (p) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) u.set(k, v);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const start = Math.max(1, Math.min(current - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  return (
    <div className="adm-pager">
      {current > 1 ? <Link href={href(current - 1)}>‹</Link> : <span className="off">‹</span>}
      {pages.map((p) => (
        <Link key={p} href={href(p)} className={p === current ? "on" : ""}>{p}</Link>
      ))}
      {current < totalPages ? <Link href={href(current + 1)}>›</Link> : <span className="off">›</span>}
    </div>
  );
}

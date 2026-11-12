// Judul halaman admin: breadcrumb, judul, deskripsi, dan (opsional) tombol aksi di kanan
export default function PageHeader({ title, desc, action, crumb }) {
  return (
    <div className="adm-pagehead">
      <div>
        <div className="adm-crumb">{crumb || `Admin / ${title}`}</div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

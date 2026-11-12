import Link from "next/link";
import Icon from "@/components/admin/Icon";

const STEPS = [
  ["data-diri", "Data Diri"],
  ["dokumen", "Dokumen"],
  ["jurusan", "Jurusan"],
];

// Tiga langkah pendaftaran. `selesai` = [bool, bool, bool] dari getProgress().
export default function Stepper({ aktif, selesai }) {
  return (
    <ol className="sw-stepper">
      {STEPS.map(([key, label], i) => (
        <li key={key} className={`${aktif === key ? "on" : ""} ${selesai[i] ? "done" : ""}`}>
          <Link href={`/dashboard/pendaftaran/${key}`}>
            <span className="dot">{selesai[i] ? <Icon name="check" size={14} /> : i + 1}</span>
            {label}
          </Link>
        </li>
      ))}
    </ol>
  );
}

"use client";
import Icon from "@/components/admin/Icon";

export default function PrintButton() {
  return (
    <button type="button" className="adm-btn adm-btn-primary no-print" onClick={() => window.print()}>
      <Icon name="printer" size={16} /> Cetak
    </button>
  );
}

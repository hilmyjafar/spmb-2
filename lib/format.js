// Format tanggal/uang yang aman dipakai di server maupun client
const parse = (s) => new Date(String(s).replace(" ", "T"));

export const fmtHariTanggal = (s) =>
  s ? parse(s).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-";

export const fmtJamStr = (s) =>
  s
    ? parse(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":") + " WIB"
    : "";

export const fmtTglStr = (s) =>
  s ? new Date(`${String(s).slice(0, 10)}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

export const rupiah = (n) => "Rp" + new Intl.NumberFormat("id-ID").format(Number(n) || 0);

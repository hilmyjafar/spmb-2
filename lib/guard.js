import { getSession } from "@/lib/auth";

// Untuk API route admin: kembalikan session kalau role admin, selain itu null
export async function requireAdmin() {
  const s = await getSession();
  return s && s.role === "admin" ? s : null;
}

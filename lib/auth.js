import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export async function createSession(user) {
  const token = await new SignJWT({ id: user.id, nama: user.nama, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload; // { id, nama, role }
  } catch {
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

// Sesuaikan path ini dengan folder dashboard lo
export function dashboardPath(role) {
  if (role === "admin") return "/admin";
  if (role === "kepsek") return "/kepsek";
  return "/dashboard";
}

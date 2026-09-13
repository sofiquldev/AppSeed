import { cookies } from "next/headers";
import { findUserByEmail } from "./users-store";

const COOKIE = "appseed_user";

export async function getSession() {
  const jar = await cookies();
  const email = jar.get(COOKIE)?.value;
  if (!email) return null;
  const user = findUserByEmail(email);
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export async function setSession(email) {
  const jar = await cookies();
  jar.set(COOKIE, email, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function verifyUser(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  const { password: _pw, ...safe } = user;
  return safe;
}

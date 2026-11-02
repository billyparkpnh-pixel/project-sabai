import {
  createHmac,
  timingSafeEqual,
  scryptSync,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
const secret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
export function checkPassword(input: string) {
  if (process.env.NODE_ENV === "production" || !process.env.ADMIN_PASSWORD)
    return false;
  const salt = "sabai-local-dev";
  return timingSafeEqual(
    scryptSync(input, salt, 64),
    scryptSync(process.env.ADMIN_PASSWORD, salt, 64),
  );
}
export function signSession() {
  const payload = String(Date.now() + 8 * 60 * 60 * 1000);
  return (
    payload + "." + createHmac("sha256", secret).update(payload).digest("hex")
  );
}
export function validSession(value: string) {
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", secret).update(exp).digest("hex");
  return (
    sig.length === expected.length &&
    timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}
export async function isAdmin() {
  const jar = await cookies();
  const token = jar.get("sabai_admin")?.value;
  if (!token) return false;
  if (token.startsWith("sb:")) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)
      return false;
    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
    const { data, error } = await sb.auth.getUser(token.slice(3));
    return !error && data.user?.app_metadata?.role === "admin";
  }
  return process.env.NODE_ENV !== "production" && validSession(token);
}

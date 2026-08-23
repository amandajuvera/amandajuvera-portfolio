import { createHash } from "crypto";
import { db } from "./db";

/**
 * Hash the visitor's IP before it touches the database. We only ever need to
 * ask "how many submissions came from this source recently", never "who was
 * this" — so there's no reason to keep the raw address.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${ip}${salt}`).digest("hex");
}

/**
 * Best-effort client IP. Behind Vercel/most proxies the left-most entry of
 * x-forwarded-for is the original client; the header is spoofable in general,
 * which is why this is a spam speed bump and not an auth control.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/**
 * Fixed-window limit on stored messages per IP hash. Deliberately counts
 * successful submissions only — a caller that gets rejected for a validation
 * error shouldn't be able to burn someone else's quota.
 */
export async function checkRateLimit(
  ipHash: string,
  { max = 3, windowMinutes = 60 } = {},
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMinutes * 60_000);

  const recent = await db.message.findMany({
    where: { ipHash, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
    take: max,
  });

  if (recent.length < max) return { ok: true };

  const oldest = recent[0]!.createdAt.getTime();
  const freesUpAt = oldest + windowMinutes * 60_000;
  const retryAfterSeconds = Math.max(1, Math.ceil((freesUpAt - Date.now()) / 1000));

  return { ok: false, retryAfterSeconds };
}

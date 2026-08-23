import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp, hashIp } from "@/lib/rate-limit";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  // Honeypot: a field hidden from humans via CSS. Most naive bots fill every
  // input they find, so anything non-empty here is almost certainly automated.
  // It must *pass* validation — rejecting it here would both skip the silent
  // drop below and tell the bot exactly which field gave it away.
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Please check the form.", fieldErrors },
      { status: 422 },
    );
  }

  const { name, email, subject, body, website } = parsed.data;

  // Silently accept honeypot hits: telling a bot it failed just teaches it.
  if (website) return NextResponse.json({ ok: true });

  const ipHash = hashIp(clientIp(request.headers));

  const limit = await checkRateLimit(ipHash);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  await db.message.create({
    data: {
      name,
      email,
      subject: subject || null,
      body,
      ipHash,
      userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}

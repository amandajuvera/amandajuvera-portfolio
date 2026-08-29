"use client";

import { useEffect, useState } from "react";

/**
 * Contact form dressed as a connection being opened.
 *
 * Each step leads with plain language and keeps the protocol name as a quiet
 * aside — legible to someone who has never heard of a handshake, with a second
 * reading for someone who has. The steps are narration over a request that has
 * already succeeded, not a real socket.
 */
const STEPS = [
  { code: "SYN", plain: "knocking on the door" },
  { code: "SYN-ACK", plain: "she's listening" },
  { code: "ACK", plain: "connection open" },
  { code: "PSH", plain: "handing over your note" },
  { code: "200 OK", plain: "delivered" },
];

type FieldErrors = Partial<Record<"name" | "email" | "body", string[]>>;

export function PacketCompose() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState(-1);

  // Walk the handshake once the message is safely stored.
  useEffect(() => {
    if (status !== "sent") return;
    if (step >= STEPS.length - 1) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step < 0 ? 120 : 520);
    return () => window.clearTimeout(t);
  }, [status, step]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFieldErrors({});
    setNote("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as {
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!res.ok) {
        setStatus("error");
        setFieldErrors(json.fieldErrors ?? {});
        setNote(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setNote("Could not reach the server. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="wire" role="status">
        <ol className="wire__steps">
          {STEPS.map((s, i) => (
            <li key={s.code} className={i <= step ? "wire__step is-on" : "wire__step"}>
              <span className="wire__dot" aria-hidden="true" />
              <span className="wire__plain">{s.plain}</span>
              <span className="wire__code">{s.code}</span>
            </li>
          ))}
        </ol>
        {step >= STEPS.length - 1 ? (
          <p className="wire__done">Your message is with me. Thank you.</p>
        ) : null}
      </div>
    );
  }

  return (
    <form className="compose" onSubmit={handleSubmit} noValidate>
      <p className="compose__lead">
        Write a note and it goes straight to my inbox.
      </p>

      <label className="compose__field">
        <span>from</span>
        <input name="name" type="text" required maxLength={100} placeholder="your name" />
      </label>
      {fieldErrors.name ? <span className="compose__err">{fieldErrors.name[0]}</span> : null}

      <label className="compose__field">
        <span>reply-to</span>
        <input name="email" type="email" required maxLength={200} placeholder="you@example.com" />
      </label>
      {fieldErrors.email ? <span className="compose__err">{fieldErrors.email[0]}</span> : null}

      <label className="compose__field compose__field--stacked">
        <span>message</span>
        <textarea name="body" rows={6} required minLength={10} maxLength={5000} />
      </label>
      {fieldErrors.body ? <span className="compose__err">{fieldErrors.body[0]}</span> : null}

      {/* Hidden from people, irresistible to naive bots. */}
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button className="compose__send" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "connecting…" : "send it"}
      </button>

      {status === "error" && note ? (
        <p className="compose__err" role="alert">
          {note}
        </p>
      ) : null}
    </form>
  );
}

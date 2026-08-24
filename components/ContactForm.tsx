"use client";

import { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "body", string[]>>;
type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFieldErrors({});
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!res.ok) {
        setStatus("error");
        setFieldErrors(json.fieldErrors ?? {});
        setMessage(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
      setMessage("Sent — thank you.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <p className="letter__sent" role="status">
        {message}
      </p>
    );
  }

  return (
    <form className="letter" onSubmit={handleSubmit} noValidate>
      <label className="letter__line">
        <span className="letter__label">name:</span>
        <input name="name" type="text" required maxLength={100} />
      </label>
      {fieldErrors.name ? (
        <span className="letter__error">{fieldErrors.name[0]}</span>
      ) : null}

      <label className="letter__line">
        <span className="letter__label">email:</span>
        <input name="email" type="email" required maxLength={200} />
      </label>
      {fieldErrors.email ? (
        <span className="letter__error">{fieldErrors.email[0]}</span>
      ) : null}

      <label className="letter__line letter__line--gap">
        <span className="letter__label">subject:</span>
        <input name="subject" type="text" maxLength={150} />
      </label>

      <label className="letter__line letter__line--stacked">
        <span className="letter__label">message:</span>
        <textarea name="body" rows={8} required minLength={10} maxLength={5000} />
      </label>
      {fieldErrors.body ? (
        <span className="letter__error">{fieldErrors.body[0]}</span>
      ) : null}

      {/* Honeypot: hidden from people, irresistible to naive bots. */}
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button className="letter__send" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "sending…" : "send"}
      </button>

      {status === "error" && message ? (
        <p className="letter__error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}

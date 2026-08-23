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
      setMessage("Thank you — your message has been sent.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <p className="form-note form-note--ok" role="status">
        {message}
      </p>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label utility">Name</span>
        <input name="name" type="text" required maxLength={100} />
        {fieldErrors.name ? (
          <span className="field__error">{fieldErrors.name[0]}</span>
        ) : null}
      </label>

      <label className="field">
        <span className="field__label utility">Email</span>
        <input name="email" type="email" required maxLength={200} />
        {fieldErrors.email ? (
          <span className="field__error">{fieldErrors.email[0]}</span>
        ) : null}
      </label>

      <label className="field">
        <span className="field__label utility">Subject</span>
        <input name="subject" type="text" maxLength={150} />
      </label>

      <label className="field">
        <span className="field__label utility">Message</span>
        <textarea name="body" rows={7} required minLength={10} maxLength={5000} />
        {fieldErrors.body ? (
          <span className="field__error">{fieldErrors.body[0]}</span>
        ) : null}
      </label>

      {/* Honeypot: hidden from people, irresistible to naive bots. */}
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>

      {status === "error" && message ? (
        <p className="form-note form-note--error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}

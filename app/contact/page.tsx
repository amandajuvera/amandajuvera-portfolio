import type { Metadata } from "next";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Envelope } from "@/components/Envelope";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact — Amanda Juvera" };

export default function ContactPage() {
  return (
    <main className="contact-page">
      <Envelope>
        <ContactForm />
      </Envelope>

      <BottomNav current="/contact" tone="dark" />

      <Link className="contact-page__signature" href="/">
        Amanda Juvera
      </Link>
    </main>
  );
}

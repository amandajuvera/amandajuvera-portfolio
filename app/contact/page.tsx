import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact — Amanda Juvera" };

export default function ContactPage() {
  return (
    <>
      <Masthead current="/contact" label="Contact" />

      <main className="page">
        <p className="page__eyebrow utility">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="1.5" />
            <path d="M2 7l10 6 10-6" />
          </svg>
          Say hello
        </p>
        <h1 className="page__title">Contact</h1>

        <div className="contact-layout">
          <div className="prose">
            <p>
              Have a question, an opportunity, or just want to say hi? Send a
              note and it will reach me directly.
            </p>
            <p>
              You can also email me at{" "}
              <a href="mailto:ajuvera@umich.edu">ajuvera@umich.edu</a>.
            </p>
          </div>

          <ContactForm />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

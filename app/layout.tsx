import type { Metadata } from "next";
import { Ballet, Bodoni_Moda } from "next/font/google";
import "./site.css";

// next/font self-hosts these at build time, so there's no render-blocking
// request to Google and no flash of fallback text.
// No `weight` here on purpose: declaring axes requires the variable cut, and
// site.css pins `font-variation-settings: "opsz" 16` for the thin instance.
const ballet = Ballet({
  variable: "--font-ballet",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Amanda Juvera",
  description:
    "Amanda Juvera — computer science student at the University of Michigan, working on systems, security tooling, and computer vision.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ballet.variable} ${bodoni.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

/**
 * Bottom-left navigation used by the two full-bleed pages.
 * `tone` picks the text colour for the ground it sits on.
 */
export function BottomNav({
  current,
  tone = "light",
}: {
  current: string;
  tone?: "light" | "dark";
}) {
  return (
    <nav className={`bottom-nav bottom-nav--${tone}`} aria-label="Main">
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === current ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

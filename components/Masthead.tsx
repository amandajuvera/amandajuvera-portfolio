import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function Masthead({
  current,
  label,
}: {
  current: string;
  /** Small uppercase page name at the top right. Omitted on the home page. */
  label?: string;
}) {
  return (
    <header className="masthead">
      {label ? (
        <div className="masthead__meta utility">
          <span>{label}</span>
        </div>
      ) : null}

      {label ? (
        <Link className="masthead__nameplate" href="/">
          Amanda Juvera
        </Link>
      ) : null}

      <nav className="nav" aria-label="Main">
        {NAV.map(({ href, label: text }) => (
          <Link
            key={href}
            href={href}
            aria-current={href === current ? "page" : undefined}
          >
            {text}
          </Link>
        ))}
      </nav>
    </header>
  );
}

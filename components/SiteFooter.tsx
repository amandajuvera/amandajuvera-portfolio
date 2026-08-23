export function SiteFooter({ flush = false }: { flush?: boolean }) {
  return (
    <footer className={`foot utility${flush ? " foot--flush" : ""}`}>
      <div className="foot__left">
        <span>&copy; 2026 Amanda Juvera</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ribbon-mark" src="/images/ribbon.png" alt="" />
      </div>
      <span className="foot__social">
        <a href="mailto:ajuvera@umich.edu" aria-label="Email">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M1.5 3h13a1 1 0 011 1v8a1 1 0 01-1 1h-13a1 1 0 01-1-1V4a1 1 0 011-1zm.4 1.2L8 8.6l6.1-4.4H1.9zM1 5.4V12h14V5.4l-6.62 4.77a.6.6 0 01-.76 0L1 5.4z" />
          </svg>
        </a>
        <a
          href="https://linkedin.com/in/amandajuvera"
          aria-label="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M14.82 0H1.18C.53 0 0 .52 0 1.16v13.68C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.16V1.16C16 .52 15.47 0 14.82 0zM4.75 13.6H2.4V6h2.35v7.6zM3.58 4.98c-.76 0-1.37-.62-1.37-1.38 0-.76.61-1.38 1.37-1.38.76 0 1.38.62 1.38 1.38 0 .76-.62 1.38-1.38 1.38zM13.6 13.6h-2.35V9.9c0-.88-.02-2.02-1.23-2.02-1.23 0-1.42.96-1.42 1.95v3.77H6.25V6h2.26v1.04h.03c.31-.59 1.08-1.23 2.23-1.23 2.39 0 2.83 1.57 2.83 3.61v4.18z" />
          </svg>
        </a>
        <a
          href="https://github.com/amandajuvera"
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </span>
    </footer>
  );
}

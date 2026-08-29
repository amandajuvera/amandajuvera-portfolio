/**
 * Dotted vine with little leaves, in the spirit of the ASCII-filigree
 * reference. The stems are ordinary beziers; the dots come from a round-capped
 * zero-length dash pattern, so the ornament follows each curve at any scale
 * rather than being a fixed grid of plotted points.
 */
export function Filigree({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`filigree ${className}`}
      viewBox="0 0 200 150"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="0 6"
      >
        {/* main stem, a long lazy S */}
        <path d="M6 138 C34 128 52 106 60 78 C68 50 88 28 122 20 C150 13 176 20 192 38" />

        {/* leaves alternating along the stem */}
        <path d="M60 78 C48 66 46 50 58 42 C66 52 66 68 60 78 Z" />
        <path d="M78 50 C82 34 96 26 106 32 C100 46 88 54 78 50 Z" />
        <path d="M122 20 C120 6 132 -2 142 2 C140 14 130 22 122 20 Z" />
        <path d="M38 108 C24 106 16 94 22 84 C34 88 42 98 38 108 Z" />

        {/* curl finishing the tip */}
        <path d="M192 38 C200 50 194 62 182 62 C173 62 168 52 176 46 C181 42 188 45 188 51" />

        {/* small berry cluster */}
        <circle cx="96" cy="66" r="1.6" strokeDasharray="0 0" />
        <circle cx="104" cy="72" r="1.6" strokeDasharray="0 0" />
        <circle cx="90" cy="76" r="1.6" strokeDasharray="0 0" />
      </g>
    </svg>
  );
}

/**
 * Dotted scrollwork, in the spirit of the ASCII-filigree reference.
 *
 * The curls are ordinary bezier paths; the dots come from a round-capped
 * zero-length dash pattern, so the ornament follows the curve at any scale
 * instead of being a fixed grid of plotted points.
 */
export function Filigree({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`filigree ${className}`}
      viewBox="0 0 300 320"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="0 7"
      >
        {/* main stem sweeping down the edge */}
        <path d="M148 6 C150 60 132 96 108 128 C86 158 74 196 82 246 C88 284 72 302 44 312" />
        {/* upper scroll */}
        <path d="M148 10 C186 14 224 30 246 58 C264 82 258 112 232 118 C210 123 196 104 206 88 C214 75 234 76 240 90" />
        {/* left curl off the stem */}
        <path d="M120 112 C92 100 62 104 46 126 C32 145 42 168 64 166 C82 164 88 146 76 138" />
        {/* small tendril */}
        <path d="M96 178 C74 186 60 206 66 226 C71 242 90 246 98 234" />
        {/* lower rosette */}
        <path d="M78 262 C56 258 36 272 34 292 C32 308 48 318 60 310 C70 303 68 288 58 288" />
        {/* opposing flick, keeps it from reading one-sided */}
        <path d="M152 30 C176 44 190 68 186 92" />
      </g>
    </svg>
  );
}

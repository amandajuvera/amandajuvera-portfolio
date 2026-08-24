/**
 * Unfolded envelope, drawn rather than shipped as an image so it stays crisp at
 * any size and its paper tone follows --kraft.
 *
 * Traced clockwise from the left tip of the top flap: up the flap's diagonal,
 * across its flat top, down the far diagonal, straight down the right side
 * flap, in along the bottom flap's shoulder, round its two corners, then back
 * up the mirrored left side. The face — the panel the writing sits on — is the
 * rectangle x 72..548, y 180..545, which is what the fold lines trace.
 */
const OUTLINE = [
  "M 5,180",
  "L 198,22",
  "L 422,22",
  "L 615,180",
  "L 615,512",
  "L 548,545",
  "L 548,780",
  "Q 548,810 518,810",
  "L 102,810",
  "Q 72,810 72,780",
  "L 72,545",
  "L 5,512",
  "Z",
].join(" ");

export function Envelope({ children }: { children: React.ReactNode }) {
  return (
    <div className="envelope">
      <svg
        className="envelope__sheet"
        viewBox="0 0 620 820"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="envelope-clip">
            <path d={OUTLINE} />
          </clipPath>
          {/* Mottled paper grain — desaturated fractal noise over the fill. */}
          <filter id="envelope-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              seed="7"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <path d={OUTLINE} fill="var(--kraft)" stroke="#4a4a4a" strokeWidth="2" />

        <rect
          x="0"
          y="0"
          width="620"
          height="820"
          clipPath="url(#envelope-clip)"
          filter="url(#envelope-grain)"
          opacity="0.16"
        />

        {/* Fold lines around the face. */}
        <g stroke="#4a4a4a" strokeWidth="1" opacity="0.3" fill="none">
          <path d="M 5,180 H 615" />
          <path d="M 72,545 H 548" />
          <path d="M 72,180 V 545" />
          <path d="M 548,180 V 545" />
        </g>
      </svg>

      <div className="envelope__contents">{children}</div>
    </div>
  );
}

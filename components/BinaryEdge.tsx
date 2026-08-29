"use client";

import { useMemo } from "react";

/**
 * Faint binary columns down the page edges — the intro's field left behind as
 * ambient texture. Deliberately static: a second animation competing with the
 * interface would be noise, and this only needs to suggest the ground the name
 * came out of.
 */
export function BinaryEdge({
  side,
  rows = 46,
  cols = 3,
  seed = 1,
}: {
  side: "left" | "right";
  rows?: number;
  cols?: number;
  seed?: number;
}) {
  const lines = useMemo(() => {
    // Deterministic so server and client markup agree — Math.random here
    // would trip a hydration mismatch.
    let s = seed * 9301 + 49297;
    const next = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (next() > 0.5 ? "1" : "0")).join(" "),
    );
  }, [rows, cols, seed]);

  return (
    <div className={`bin bin--${side}`} aria-hidden="true">
      {lines.map((line, i) => (
        <span key={i} style={{ opacity: 0.16 + ((i * 37) % 100) / 420 }}>
          {line}
        </span>
      ))}
    </div>
  );
}

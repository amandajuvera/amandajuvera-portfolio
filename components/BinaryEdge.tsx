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
    /*
     * A pure hash of the coordinates rather than a running generator: the bits
     * must be identical on the server and the client or hydration mismatches,
     * and a stateful sequence would also mean mutating a closure across
     * renders.
     */
    const bit = (i: number, j: number) => {
      const x = Math.sin((i + 1) * 127.1 + (j + 1) * 311.7 + seed * 74.7) * 43758.5453;
      return x - Math.floor(x) > 0.5 ? "1" : "0";
    };
    return Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => bit(i, j)).join(" "),
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

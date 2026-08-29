"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vy: number;
  ch: string;
  lit: number;
};

const GLYPHS = "01";

/**
 * Glyphs rain down and settle into "AMANDA JUVERA".
 *
 * The target positions are derived by rasterising the text to an offscreen
 * canvas and sampling its alpha channel on a grid — so the letterforms come
 * from the actual font rather than hand-plotted coordinates, and the effect
 * survives a font change.
 */
export function PixelIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  // Keep the callback fresh without re-running the animation effect. Assigning
  // during render would be a render-phase side effect; this does it after.
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let finished = false;

    const CELL = 7;

    function buildTargets() {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.floor(width / CELL));
      off.height = Math.max(1, Math.floor(height / CELL));
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return [];

      // Scale the type to the viewport, leaving a margin either side.
      const target = width * 0.86;
      let size = 10;
      octx.font = `700 ${size}px "Courier New", monospace`;
      const unit = octx.measureText("AMANDA JUVERA").width / size;
      size = target / unit / CELL;

      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = `700 ${size}px "Courier New", monospace`;
      octx.fillText("AMANDA JUVERA", off.width / 2, off.height / 2);

      const { data } = octx.getImageData(0, 0, off.width, off.height);
      const out: { x: number; y: number }[] = [];
      for (let gy = 0; gy < off.height; gy++) {
        for (let gx = 0; gx < off.width; gx++) {
          if (data[(gy * off.width + gx) * 4 + 3] > 128) {
            out.push({ x: gx * CELL, y: gy * CELL });
          }
        }
      }
      return out;
    }

    function seed() {
      const targets = buildTargets();
      particles = targets.map((t) => ({
        x: t.x,
        y: reduced ? t.y : -Math.random() * height * 0.55,
        tx: t.x,
        ty: t.y,
        vy: 7 + Math.random() * 11,
        ch: GLYPHS[(Math.random() * GLYPHS.length) | 0]!,
        lit: Math.random(),
      }));
    }

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function frame() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.font = `700 ${CELL}px "Courier New", monospace`;
      ctx!.textBaseline = "top";

      let settled = 0;
      for (const p of particles) {
        if (p.y < p.ty) {
          p.y = Math.min(p.ty, p.y + p.vy);
          p.vy *= 1.02;
          if (Math.random() < 0.25) {
            p.ch = GLYPHS[(Math.random() * GLYPHS.length) | 0]!;
          }
        } else {
          settled++;
        }

        const done = p.y >= p.ty;
        // Falling glyphs flicker; settled ones hold steady white.
        ctx!.fillStyle = done
          ? "#f2f2f2"
          : `rgba(200,200,200,${0.25 + p.lit * 0.5})`;
        ctx!.fillText(p.ch, p.x, p.y);
      }

      if (settled === particles.length && !finished) {
        finished = true;
        // Let the assembled name hold for a beat before handing off.
        window.setTimeout(() => doneRef.current(), 550);
        return;
      }

      raf = requestAnimationFrame(frame);
    }

    resize();

    if (reduced) {
      // Draw the resolved name once and move on.
      ctx.font = `700 ${CELL}px "Courier New", monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#f2f2f2";
      for (const p of particles) ctx.fillText(p.ch, p.tx, p.ty);
      const t = window.setTimeout(() => doneRef.current(), 900);
      return () => window.clearTimeout(t);
    }

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    /*
     * Hard cap on a plain timer rather than inside the rAF loop. Browsers stop
     * firing rAF entirely in a hidden or heavily throttled tab, so a valve that
     * lives in the loop can never fire in exactly the case it exists for —
     * the visitor would be left staring at an unfinished intro.
     */
    const bail = window.setTimeout(() => {
      if (!finished) {
        finished = true;
        doneRef.current();
      }
    }, 9000);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(bail);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="intro">
      <canvas ref={canvasRef} className="intro__canvas" />
      <button className="intro__skip" onClick={() => doneRef.current()}>
        skip
      </button>
    </div>
  );
}

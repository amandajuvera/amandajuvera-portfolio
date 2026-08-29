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
  /** Frames since landing — drives the settle flash. */
  age: number;
};

const GLYPHS = "01";
const NAME = "Amanda Juvera";
const CELL = 5;
/** The settled wordmark's width relative to the full-bleed intro. */
const SHRINK_SCALE = 0.58;

/**
 * Terminal glyphs rain down and settle into the name.
 *
 * The letterforms are rasterised from Ballet to an offscreen canvas and sampled
 * on a grid, so the shape is flowing script while the pixels filling it stay
 * binary — that tension is the whole point of the effect. Because the target
 * comes from the real font, changing --font-ballet changes the artwork.
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
    let cancelled = false;

    // "falling" -> "shimmer" -> "shrink"
    let phase: "falling" | "shimmer" | "shrink" = "falling";
    let phaseStart = 0;

    /** next/font emits a hashed family name; read it back off the CSS variable. */
    function displayFont(): string {
      const probe = document.createElement("span");
      probe.style.fontFamily = "var(--font-ballet)";
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).fontFamily;
      probe.remove();
      return resolved && !resolved.includes("var(") ? resolved : "cursive";
    }

    function buildTargets() {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.floor(width / CELL));
      off.height = Math.max(1, Math.floor(height / CELL));
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return [];

      const family = displayFont();
      const target = width * 0.92;

      // Measure at a reference size, then scale to the target width.
      let size = 100;
      octx.font = `${size}px ${family}`;
      const unit = octx.measureText(NAME).width / size;
      size = target / unit / CELL;

      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = `${size}px ${family}`;
      octx.fillText(NAME, off.width / 2, off.height / 2);

      const { data } = octx.getImageData(0, 0, off.width, off.height);
      const out: { x: number; y: number }[] = [];
      for (let gy = 0; gy < off.height; gy++) {
        for (let gx = 0; gx < off.width; gx++) {
          // Low threshold: script hairlines and the tapered ends of Ballet's
          // strokes are only partially opaque, and dropping them breaks the
          // letterforms apart.
          if (data[(gy * off.width + gx) * 4 + 3] > 60) {
            out.push({ x: gx * CELL, y: gy * CELL });
          }
        }
      }
      return out;
    }

    function seed() {
      particles = buildTargets().map((t) => ({
        x: t.x,
        y: reduced ? t.y : -Math.random() * height * 0.5,
        tx: t.x,
        ty: t.y,
        vy: 6 + Math.random() * 10,
        ch: GLYPHS[(Math.random() * GLYPHS.length) | 0]!,
        lit: Math.random(),
        age: 0,
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

    function frame(now: number) {
      if (cancelled) return;
      if (!phaseStart) phaseStart = now;
      const t = now - phaseStart;

      // Translucent wash instead of a hard clear, so falling glyphs smear.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.fillStyle = "rgba(11,11,12,0.32)";
      ctx!.fillRect(0, 0, width, height);

      /*
       * On the way out the field contracts in place — no drift. The name stays
       * dead centre and simply settles to the size the workspace wordmark
       * holds, so the binary letters become the name rather than sliding off
       * to a corner.
       */
      if (phase === "shrink") {
        const k = Math.min(1, t / 760);
        const ease = 1 - Math.pow(1 - k, 3);
        const s = 1 + (SHRINK_SCALE - 1) * ease;
        const cx = width / 2;
        const cy = height / 2;
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx!.translate(cx, cy);
        ctx!.scale(s, s);
        ctx!.translate(-cx, -cy);
      }

      ctx!.font = `${CELL + 1}px "SF Mono", Menlo, Consolas, monospace`;
      ctx!.textBaseline = "top";

      let settled = 0;
      const sweep =
        phase === "shimmer" ? (t / 900) * (width * 1.3) - width * 0.15 : -1e9;

      for (const p of particles) {
        if (p.y < p.ty) {
          p.y = Math.min(p.ty, p.y + p.vy);
          p.vy *= 1.02;
          if (Math.random() < 0.2) {
            p.ch = GLYPHS[(Math.random() * GLYPHS.length) | 0]!;
          }
        } else {
          settled++;
          p.age++;
        }

        const landed = p.y >= p.ty;
        let alpha: number;

        if (!landed) {
          alpha = 0.18 + p.lit * 0.34;
        } else {
          // Brief flash on landing, easing down to a soft resting glow.
          const flash = Math.max(0, 1 - p.age / 22);
          alpha = 0.55 + flash * 0.45;
          if (phase === "shimmer") {
            const d = Math.abs(p.x - sweep);
            if (d < 130) alpha = Math.min(1, alpha + (1 - d / 130) * 0.85);
          }
          // Hold full strength through the shrink; the handoff is the fade.
          if (phase === "shrink") alpha *= Math.max(0, 1 - (t - 700) / 180);
        }

        ctx!.fillStyle = `rgba(245,245,245,${alpha})`;
        ctx!.fillText(p.ch, p.x, p.y);
      }

      if (phase === "falling" && particles.length > 0 && settled === particles.length) {
        phase = "shimmer";
        phaseStart = now;
      } else if (phase === "shimmer" && t > 1000) {
        phase = "shrink";
        phaseStart = now;
      } else if (phase === "shrink" && t > 880 && !finished) {
        finished = true;
        doneRef.current();
        return;
      }

      raf = requestAnimationFrame(frame);
    }

    resize();

    if (reduced) {
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${CELL + 1}px "SF Mono", Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(245,245,245,0.9)";
      for (const p of particles) ctx.fillText(p.ch, p.tx, p.ty);
      const timer = window.setTimeout(() => doneRef.current(), 1100);
      return () => window.clearTimeout(timer);
    }

    // Wait for Ballet before rasterising, otherwise the target is measured
    // against a fallback and the letterforms jump when the real face arrives.
    let started = false;
    const begin = () => {
      if (started || cancelled) return;
      started = true;
      resize();
      raf = requestAnimationFrame(frame);
    };
    document.fonts.ready.then(begin);
    const fontBail = window.setTimeout(begin, 1200);

    window.addEventListener("resize", resize);

    /*
     * Hard cap on a plain timer rather than inside the rAF loop: browsers stop
     * firing rAF entirely in a hidden or throttled tab, so a valve living in
     * the loop could never fire in the one case it exists for.
     */
    const bail = window.setTimeout(() => {
      if (!finished) {
        finished = true;
        doneRef.current();
      }
    }, 11000);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(bail);
      window.clearTimeout(fontBail);
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

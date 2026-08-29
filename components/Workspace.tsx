"use client";

import { useEffect, useRef, useState } from "react";
import type { Node } from "@/lib/tree";
import { PacketCompose } from "./PacketCompose";

type Payload = { root: string; generated: string; tree: Node[] };
type Pos = { x: number; y: number };

const CARD_W = 232;
const CARD_H = 150;
/** Below this much pointer travel a press counts as a click, not a drag. */
const DRAG_SLOP = 5;

const humanSize = (n: Node) =>
  n.action === "compose"
    ? "open"
    : n.kind === "dir"
      ? `${n.size} item${n.size === 1 ? "" : "s"}`
      : `${n.size} B`;

export function Workspace() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trail, setTrail] = useState<string[]>([]);
  const [open, setOpen] = useState<Node | null>(null);
  const [pos, setPos] = useState<Record<string, Pos>>({});
  const [lifted, setLifted] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    name: string;
    startX: number;
    startY: number;
    origin: Pos;
    moved: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/fs")
      .then((r) => {
        if (!r.ok) throw new Error(`api returned ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "request failed"));
  }, []);

  let level: Node[] = data?.tree ?? [];
  for (const name of trail) {
    const next = level.find((n) => n.name === name && n.kind === "dir");
    if (!next?.children) break;
    level = next.children;
  }

  // Re-scatter whenever the level changes. Keyed on the contents so entering a
  // directory lays its children out fresh rather than reusing stale positions.
  const levelKey = `${trail.join("/")}|${level.map((n) => n.name).join(",")}`;
  /** The name only holds the centre at the root; inside a directory it goes. */
  const atRoot = trail.length === 0;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || level.length === 0) return;
    let cancelled = false;

    function layout() {
      if (cancelled || !el) return;

      const w = el.clientWidth;
      const h = el.clientHeight;
      const n = level.length;
      const next: Record<string, Pos> = {};

      // How far out the ring has to sit before it stops running into the
      // wordmark. Measured rather than guessed: Ballet's swashes make the
      // name far wider than its font-size suggests, and it rescales with the
      // viewport. Capped so the cards stay inside the box on narrow screens.
      const nameW =
        el.querySelector(".ws__name")?.getBoundingClientRect().width ?? 0;
      const rxMax = w / 2 - CARD_W / 2 - 16;
      const clear = nameW / 2 + CARD_W / 2 + 28;
      const rx = Math.min(rxMax, Math.max(w * 0.32, clear));
      const ry = Math.min(h * 0.34, h / 2 - CARD_H / 2 - 16);

      level.forEach((node, i) => {
        const angle = -Math.PI / 2 + (i / Math.max(n, 2)) * Math.PI * 2;
        /*
         * At the root the ring stays wide to clear the wordmark. Once the name
         * is gone there's nothing to clear, so alternate the radius and let the
         * cards fill the middle instead of orbiting a hole.
         */
        const k = trail.length === 0 ? 1 : i % 2 === 0 ? 0.95 : 0.48;
        next[node.name] = {
          x: w / 2 + Math.cos(angle) * rx * k - CARD_W / 2,
          y: h / 2 + Math.sin(angle) * ry * k - CARD_H / 2,
        };
      });

      setPos(next);
    }

    // Measuring before Ballet arrives reads the fallback face and lays the
    // ring out against the wrong width, so wait for the real font.
    layout();
    document.fonts?.ready.then(layout);

    window.addEventListener("resize", layout);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", layout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelKey]);

  function activate(node: Node) {
    if (node.kind === "dir") {
      setOpen(null);
      setTrail((t) => [...t, node.name]);
    } else {
      setOpen((o) => (o?.name === node.name ? null : node));
    }
  }

  if (error) return <p className="ws__msg">cannot read directory: {error}</p>;
  if (!data) return <p className="ws__msg">reading directory…</p>;

  return (
    <>
      <div className="ws__path">
        <button
          className="ws__crumb"
          onClick={() => {
            setTrail([]);
            setOpen(null);
          }}
        >
          {data.root}
        </button>
        {trail.map((c, i) => (
          <span key={`${c}-${i}`}>
            <span className="ws__slash">/</span>
            <button
              className="ws__crumb"
              onClick={() => {
                setTrail((t) => t.slice(0, i + 1));
                setOpen(null);
              }}
            >
              {c}
            </button>
          </span>
        ))}
        {trail.length > 0 ? (
          <button
            className="ws__up"
            onClick={() => {
              setTrail((t) => t.slice(0, -1));
              setOpen(null);
            }}
          >
            ← back
          </button>
        ) : null}
      </div>

      <div className="ws" ref={wrapRef}>
        {atRoot ? <h1 className="ws__name">Amanda Juvera</h1> : null}

        {level.map((node, i) => {
          const p = pos[node.name];
          return (
            <div
              key={`${levelKey}:${node.name}`}
              role="button"
              tabIndex={0}
              className={`card card--${node.kind}${
                open?.name === node.name ? " is-open" : ""
              }${lifted === node.name ? " is-lifted" : ""}`}
              style={{
                left: p?.x ?? 0,
                top: p?.y ?? 0,
                // Hidden until laid out, so nothing flashes at 0,0 first paint.
                visibility: p ? "visible" : "hidden",
                // Staggered so they arrive one after another once the name has
                // settled, rather than all appearing at once.
                animationDelay: `${i * 90}ms`,
              }}
              onPointerDown={(e) => {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                drag.current = {
                  name: node.name,
                  startX: e.clientX,
                  startY: e.clientY,
                  origin: pos[node.name] ?? { x: 0, y: 0 },
                  moved: 0,
                };
                setLifted(node.name);
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d || d.name !== node.name) return;
                const dx = e.clientX - d.startX;
                const dy = e.clientY - d.startY;
                d.moved = Math.max(d.moved, Math.hypot(dx, dy));
                setPos((prev) => ({
                  ...prev,
                  [node.name]: { x: d.origin.x + dx, y: d.origin.y + dy },
                }));
              }}
              onPointerUp={() => {
                const d = drag.current;
                drag.current = null;
                setLifted(null);
                // A press that barely moved is a click; a real drag isn't.
                if (d && d.moved < DRAG_SLOP) activate(node);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activate(node);
                }
              }}
            >
              <span className="card__stamp">{node.modified}</span>
              <span className="card__name">{node.name}</span>
              <span className="card__meta">{humanSize(node)}</span>
            </div>
          );
        })}
      </div>

      {open ? (
        <div className="reader">
          <div className="reader__bar">
            <span className="reader__name">{open.name}</span>
            <button
              className="reader__close"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {open.action === "compose" ? (
            <div className="reader__body">
              <PacketCompose />
            </div>
          ) : (
            <pre className="reader__body">{open.body}</pre>
          )}
        </div>
      ) : null}
    </>
  );
}

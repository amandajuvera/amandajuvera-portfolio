"use client";

import { useEffect, useState } from "react";
import type { Node } from "@/lib/tree";

type Payload = { root: string; generated: string; tree: Node[] };

const tag = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return String((Math.abs(h) % 900) + 100);
};

const humanSize = (n: Node) =>
  n.kind === "dir" ? `${n.size} item${n.size === 1 ? "" : "s"}` : `${n.size} B`;

function FolderGlyph() {
  return (
    <svg className="glyph" viewBox="0 0 20 16" aria-hidden="true">
      <path d="M1 3.2A1.6 1.6 0 0 1 2.6 1.6h5.1l1.9 2.2h8A1.6 1.6 0 0 1 19 5.4v7.6a1.6 1.6 0 0 1-1.6 1.6H2.6A1.6 1.6 0 0 1 1 13Z" />
    </svg>
  );
}

function FileGlyph() {
  return (
    <svg className="glyph" viewBox="0 0 14 17" aria-hidden="true">
      <path d="M1 1.8A.8.8 0 0 1 1.8 1H8l5 5v9.2a.8.8 0 0 1-.8.8H1.8a.8.8 0 0 1-.8-.8Z" />
      <path d="M8 1v5h5" />
    </svg>
  );
}

export function FileBrowser() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);
  const [open, setOpen] = useState<Node | null>(null);

  useEffect(() => {
    fetch("/api/fs")
      .then((r) => {
        if (!r.ok) throw new Error(`api returned ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "request failed"));
  }, []);

  if (error) return <p className="fs__error">cannot read directory: {error}</p>;
  if (!data) return <p className="fs__loading">reading directory…</p>;

  const sections = data.tree;
  const section = sections[active]!;

  let level: Node[] = section.children ?? [];
  for (const name of trail) {
    const next = level.find((n) => n.name === name && n.kind === "dir");
    if (!next?.children) break;
    level = next.children;
  }

  return (
    <div className="stack">
      {/* Frames only. The open one lifts to the front; the rest read as a pile. */}
      {sections.map((s, i) => (
        <div
          key={s.name}
          className={`panel${i === active ? " is-active" : ""}`}
          style={{ ["--i" as string]: i }}
          aria-hidden={i !== active}
        >
          {i === active ? (
            <div className="panel__body">
              <h2 className="panel__title">
                <FolderGlyph />
                {section.name}
              </h2>

              {trail.length > 0 ? (
                <button
                  className="panel__back"
                  onClick={() => {
                    setOpen(null);
                    setTrail((t) => t.slice(0, -1));
                  }}
                >
                  ← {[section.name, ...trail.slice(0, -1)].join("/")}
                </button>
              ) : null}

              <ul className="entries">
                {level.map((node) => (
                  <li key={node.name}>
                    <button
                      className={`entry entry--${node.kind}${
                        open?.name === node.name ? " is-open" : ""
                      }`}
                      onClick={() => {
                        if (node.kind === "dir") {
                          setOpen(null);
                          setTrail((t) => [...t, node.name]);
                        } else {
                          setOpen((o) => (o?.name === node.name ? null : node));
                        }
                      }}
                    >
                      <span className="entry__name">
                        {node.kind === "dir" ? <FolderGlyph /> : <FileGlyph />}
                        {node.name}
                        {node.kind === "dir" ? "/" : ""}
                      </span>
                      <span className="entry__meta">
                        {humanSize(node)} · {node.modified}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {open ? <pre className="reader">{open.body}</pre> : null}
            </div>
          ) : null}

          <span className="panel__marks" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      ))}

      {/*
       * Tabs live in their own layer above every panel. Nested inside the
       * panels they inherited that panel's stacking context, so the open
       * panel painted over the tabs behind it and they became unclickable —
       * only the first directory could be reached.
       */}
      <div className="tabs">
        {sections.map((s, i) => (
          <button
            key={s.name}
            className={`tab${i === active ? " is-active" : ""}`}
            style={{ ["--i" as string]: i }}
            aria-expanded={i === active}
            onClick={() => {
              setActive(i);
              setTrail([]);
              setOpen(null);
            }}
          >
            {s.name.toUpperCase()} {tag(s.name)}
          </button>
        ))}
      </div>
    </div>
  );
}

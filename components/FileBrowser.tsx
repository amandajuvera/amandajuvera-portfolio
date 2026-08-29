"use client";

import { useEffect, useState } from "react";
import type { Node } from "@/lib/tree";

type Payload = { root: string; generated: string; tree: Node[] };

function FolderIcon() {
  return (
    <svg className="panel__icon" viewBox="0 0 64 52" aria-hidden="true">
      <path d="M2 12 A4 4 0 0 1 6 8 H24 l6 7 h28 a4 4 0 0 1 4 4 V46 a4 4 0 0 1-4 4 H6 a4 4 0 0 1-4-4 Z" />
      <path className="panel__icon-soft" d="M2 22 h60" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="panel__icon" viewBox="0 0 44 56" aria-hidden="true">
      <path d="M4 4 A2 2 0 0 1 6 2 H27 l13 13 V50 a2 2 0 0 1-2 2 H6 a2 2 0 0 1-2-2 Z" />
      <path d="M27 2 V15 h13" />
      <path className="panel__icon-soft" d="M12 28 h20 M12 35 h20 M12 42 h13" />
    </svg>
  );
}

const humanSize = (n: Node) =>
  n.kind === "dir" ? `${n.size} item${n.size === 1 ? "" : "s"}` : `${n.size} B`;

/** Stable pseudo-index so each panel's tab reads like hardware, not a counter. */
const tag = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return String(Math.abs(h) % 900 + 100);
};

export function FileBrowser() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crumbs, setCrumbs] = useState<string[]>([]);
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

  let level: Node[] = data.tree;
  for (const c of crumbs) {
    const next = level.find((n) => n.name === c && n.kind === "dir");
    if (!next?.children) break;
    level = next.children;
  }

  return (
    <div className="fs">
      <nav className="crumbs" aria-label="Breadcrumb">
        <button className="crumbs__link" onClick={() => { setOpen(null); setCrumbs([]); }}>
          {data.root}
        </button>
        {crumbs.map((c, i) => (
          <span key={`${c}-${i}`}>
            <span className="crumbs__sep">/</span>
            <button
              className="crumbs__link"
              onClick={() => {
                setOpen(null);
                setCrumbs((prev) => prev.slice(0, i + 1));
              }}
            >
              {c}
            </button>
          </span>
        ))}
      </nav>

      <div className="grid">
        {crumbs.length > 0 ? (
          <button
            className="panel panel--up"
            onClick={() => {
              setOpen(null);
              setCrumbs((c) => c.slice(0, -1));
            }}
          >
            <span className="panel__tab">← BACK</span>
            <span className="panel__inner">
              <FolderIcon />
              <span className="panel__name">up one level</span>
            </span>
          </button>
        ) : null}

        {level.map((node) => (
          <button
            key={node.name}
            className={`panel panel--${node.kind}${
              open?.name === node.name ? " is-open" : ""
            }`}
            onClick={() => {
              if (node.kind === "dir") {
                setOpen(null);
                setCrumbs((c) => [...c, node.name]);
              } else {
                setOpen((o) => (o?.name === node.name ? null : node));
              }
            }}
          >
            <span className="panel__tab">
              {node.kind === "dir" ? "DIR" : "FILE"} {tag(node.name)}
            </span>

            <span className="panel__inner">
              {node.kind === "dir" ? <FolderIcon /> : <FileIcon />}
              <span className="panel__name">{node.name}</span>
              <span className="panel__meta">{humanSize(node)}</span>
              <span className="panel__stamp">{node.modified}</span>
            </span>

            {/* Corner registration marks, as on the reference HUD panels. */}
            <span className="panel__marks" aria-hidden="true">
              <i /><i /><i /><i />
            </span>
          </button>
        ))}
      </div>

      {open ? (
        <div className="viewer">
          <div className="viewer__tab">FILE {tag(open.name)}</div>
          <div className="viewer__bar">
            <span className="viewer__name">{open.name}</span>
            <button
              className="viewer__close"
              onClick={() => setOpen(null)}
              aria-label="Close file"
            >
              ×
            </button>
          </div>
          <pre className="viewer__body">{open.body}</pre>
        </div>
      ) : null}
    </div>
  );
}

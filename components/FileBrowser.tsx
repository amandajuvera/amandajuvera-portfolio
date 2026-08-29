"use client";

import { useEffect, useState } from "react";
import type { Node } from "@/lib/tree";

type Payload = { root: string; generated: string; tree: Node[] };

function FolderIcon() {
  return (
    <svg className="tile__icon" viewBox="0 0 64 52" aria-hidden="true">
      <path d="M2 12 A4 4 0 0 1 6 8 H24 l6 7 h28 a4 4 0 0 1 4 4 V46 a4 4 0 0 1-4 4 H6 a4 4 0 0 1-4-4 Z" />
      <path className="tile__icon-flap" d="M2 22 h60" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="tile__icon" viewBox="0 0 44 56" aria-hidden="true">
      <path d="M4 4 A2 2 0 0 1 6 2 H27 l13 13 V50 a2 2 0 0 1-2 2 H6 a2 2 0 0 1-2-2 Z" />
      <path d="M27 2 V15 h13" />
      <path className="tile__icon-rule" d="M12 26 h20 M12 33 h20 M12 40 h13" />
    </svg>
  );
}

const humanSize = (n: Node) =>
  n.kind === "dir" ? `${n.size} item${n.size === 1 ? "" : "s"}` : `${n.size} B`;

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
            className="tile tile--up"
            onClick={() => {
              setOpen(null);
              setCrumbs((c) => c.slice(0, -1));
            }}
          >
            <FolderIcon />
            <span className="tile__name">..</span>
            <span className="tile__meta">back</span>
          </button>
        ) : null}

        {level.map((node) => (
          <button
            key={node.name}
            className={`tile tile--${node.kind}${
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
            {node.kind === "dir" ? <FolderIcon /> : <FileIcon />}
            <span className="tile__name">{node.name}</span>
            <span className="tile__meta">
              {humanSize(node)} · {node.modified}
            </span>
          </button>
        ))}
      </div>

      {open ? (
        <div className="viewer">
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

"use client";

import { useEffect, useState } from "react";
import type { Node } from "@/lib/tree";
import { PacketCompose } from "./PacketCompose";

type Payload = { root: string; generated: string; tree: Node[] };

const humanSize = (n: Node) =>
  n.action === "compose"
    ? "open"
    : n.kind === "dir"
      ? `${n.size} item${n.size === 1 ? "" : "s"}`
      : `${n.size} B`;

export function FileBrowser() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Directory names from the root down to the level being shown. */
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

  let level: Node[] = data.tree;
  for (const name of trail) {
    const next = level.find((n) => n.name === name && n.kind === "dir");
    if (!next?.children) break;
    level = next.children;
  }

  return (
    <div className="fs">
      <div className="fs__path">
        <button
          className="fs__crumb"
          onClick={() => {
            setTrail([]);
            setOpen(null);
          }}
        >
          {data.root}
        </button>
        {trail.map((c, i) => (
          <span key={`${c}-${i}`}>
            <span className="fs__slash">/</span>
            <button
              className="fs__crumb"
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
            className="fs__up"
            onClick={() => {
              setTrail((t) => t.slice(0, -1));
              setOpen(null);
            }}
          >
            ← back
          </button>
        ) : null}
      </div>

      <div className="shelf">
        {level.map((node) => (
          <button
            key={node.name}
            className={`item item--${node.kind}${
              node.action === "compose" ? " item--compose" : ""
            }${open?.name === node.name ? " is-open" : ""}`}
            onClick={() => {
              if (node.kind === "dir") {
                setOpen(null);
                setTrail((t) => [...t, node.name]);
              } else {
                setOpen((o) => (o?.name === node.name ? null : node));
              }
            }}
          >
            <span className="item__label">
              <span className="item__name">{node.name}</span>
              <span className="item__meta">{humanSize(node)}</span>
            </span>
            <span className="item__stamp">{node.modified}</span>
          </button>
        ))}
      </div>

      {open ? (
        <div className="reader">
          <div className="reader__bar">
            <span className="reader__name">{open.name}</span>
            <button
              className="reader__close"
              onClick={() => setOpen(null)}
              aria-label="Close file"
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
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { Node } from "@/lib/tree";

type Payload = { root: string; generated: string; tree: Node[] };

const pad = (n: number, w: number) => String(n).padStart(w, " ");

export function FileBrowser() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Directory names from the root down to where we are. */
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

  if (error) {
    return (
      <p className="fs__error">
        ls: cannot access listing: {error}
      </p>
    );
  }

  if (!data) return <p className="fs__loading">reading directory…</p>;

  // Walk the crumb trail to whatever level we're viewing.
  let level: Node[] = data.tree;
  for (const c of crumbs) {
    const next = level.find((n) => n.name === c && n.kind === "dir");
    if (!next?.children) break;
    level = next.children;
  }

  const cwd = [data.root, ...crumbs].join("/");

  return (
    <div className="fs">
      <div className="fs__bar">
        <span className="fs__prompt">$</span> ls -la {cwd}
      </div>

      <div className="fs__listing">
        {crumbs.length > 0 ? (
          <button
            className="fs__row fs__row--up"
            onClick={() => {
              setOpen(null);
              setCrumbs((c) => c.slice(0, -1));
            }}
          >
            <span className="fs__mode">drwxr-xr-x</span>
            <span className="fs__size">-</span>
            <span className="fs__date">—</span>
            <span className="fs__name">../</span>
          </button>
        ) : null}

        {level.map((node) => (
          <button
            key={node.name}
            className={`fs__row fs__row--${node.kind}${
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
            <span className="fs__mode">
              {node.kind === "dir" ? "drwxr-xr-x" : "-rw-r--r--"}
            </span>
            <span className="fs__size">{pad(node.size, 6)}</span>
            <span className="fs__date">{node.modified}</span>
            <span className="fs__name">
              {node.name}
              {node.kind === "dir" ? "/" : ""}
            </span>
          </button>
        ))}
      </div>

      {open ? (
        <div className="fs__view">
          <div className="fs__bar">
            <span className="fs__prompt">$</span> cat {cwd}/{open.name}
          </div>
          <pre className="fs__body">{open.body}</pre>
        </div>
      ) : null}
    </div>
  );
}

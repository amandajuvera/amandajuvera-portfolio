"use client";

import { useEffect, useState } from "react";
import type { Node } from "@/lib/tree";

type Payload = { root: string; generated: string; tree: Node[] };

/** Stable pseudo-index so each tab reads like hardware, not a counter. */
const tag = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return String((Math.abs(h) % 900) + 100);
};

const humanSize = (n: Node) =>
  n.kind === "dir" ? `${n.size} item${n.size === 1 ? "" : "s"}` : `${n.size} B`;

export function FileBrowser() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Index of the panel currently brought to the front. */
  const [active, setActive] = useState(0);
  /** Path of node names inside the active panel, for nested directories. */
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

  function selectPanel(i: number) {
    setActive(i);
    setTrail([]);
    setOpen(null);
  }

  return (
    <div className="stack" style={{ ["--count" as string]: sections.length }}>
      {sections.map((section, i) => {
        const isActive = i === active;

        // Walk into any nested directories the visitor has opened.
        let level: Node[] = section.children ?? [];
        for (const name of trail) {
          const next = level.find((n) => n.name === name && n.kind === "dir");
          if (!next?.children) break;
          level = next.children;
        }

        return (
          <article
            key={section.name}
            className={`panel${isActive ? " is-active" : ""}`}
            style={{ ["--i" as string]: i }}
          >
            <button
              className="panel__tab"
              onClick={() => selectPanel(i)}
              aria-expanded={isActive}
            >
              {section.name.toUpperCase()} {tag(section.name)}
            </button>

            <div className="panel__body">
              {isActive ? (
                <>
                  <h2 className="panel__title">{section.name}</h2>

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
                              setOpen((o) =>
                                o?.name === node.name ? null : node,
                              );
                            }
                          }}
                        >
                          <span className="entry__name">
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
                </>
              ) : (
                /* Panels in the pile stay near-empty so they don't read
                   through the translucent panel in front. */
                <p className="panel__hint">
                  {section.name} · {humanSize(section)}
                </p>
              )}
            </div>

            <span className="panel__marks" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </article>
        );
      })}
    </div>
  );
}

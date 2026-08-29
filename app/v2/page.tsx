"use client";

import { useState } from "react";
import { PixelIntro } from "@/components/PixelIntro";
import { FileBrowser } from "@/components/FileBrowser";
import "./terminal.css";

export default function TerminalPage() {
  const [entered, setEntered] = useState(false);

  return (
    <div className="term">
      {entered ? (
        <main className="term__main">
          <header className="term__head">
            <span className="term__title">AMANDA JUVERA</span>
            <span className="term__meta">CS · UNIVERSITY OF MICHIGAN</span>
          </header>
          <FileBrowser />
        </main>
      ) : (
        <PixelIntro onDone={() => setEntered(true)} />
      )}
    </div>
  );
}

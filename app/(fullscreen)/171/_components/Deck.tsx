"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { slides } from "@/lib/readmission/slides";
import type { ModelData } from "@/lib/readmission/model";
import Demo from "./Demo";

const last = slides.length - 1;

function fromHash(): number {
  if (typeof window === "undefined") return 0;
  const n = parseInt(window.location.hash.slice(1), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), last) : 0;
}

const typing = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA" || el.isContentEditable);

export default function Deck(): JSX.Element {
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const [help, setHelp] = useState(false);
  const [idle, setIdle] = useState(false);
  const [model, setModel] = useState<ModelData | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  const go = useCallback((n: number) => setI(Math.min(Math.max(n, 0), last)), []);
  const next = useCallback(() => setI((v) => Math.min(v + 1, last)), []);
  const prev = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    setI(fromHash());
    const onHash = () => setI(fromHash());
    window.addEventListener("hashchange", onHash);
    fetch("/171/model.json")
      .then((r) => r.json())
      .then(setModel)
      .catch(() => setModel(null));
    for (const s of slides) if (s.image) new Image().src = s.image;
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const h = `#${i + 1}`;
    if (window.location.hash !== h) window.history.replaceState(null, "", h);
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (typing(e.target)) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      switch (e.key) {
        case "ArrowRight": case "ArrowDown": case "PageDown": case " ": case "Enter":
          e.preventDefault(); next(); break;
        case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace":
          e.preventDefault(); prev(); break;
        case "Home": go(0); break;
        case "End": go(last); break;
        case "f": case "F": fullscreen(); break;
        case "n": case "N": setNotes((v) => !v); break;
        case "?": setHelp((v) => !v); break;
        default:
          if (/^[1-9]$/.test(e.key)) go(parseInt(e.key, 10) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, fullscreen]);

  const wake = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2500);
  };
  useEffect(() => {
    wake();
    return () => clearTimeout(idleTimer.current);
  }, []);

  const s = slides[i];

  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (s.demo) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.25) prev();
    else next();
  };

  return (
    <div
      ref={root}
      onMouseMove={wake}
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        const t = touch.current; touch.current = null;
        if (!t || s.demo) return;
        const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
      }}
      className={`fixed inset-0 z-50 flex select-none flex-col bg-black font-sans text-zinc-100 ${idle ? "cursor-none" : ""}`}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <div
          onClick={onStageClick}
          className={`relative aspect-video overflow-hidden bg-white ${s.demo ? "" : "cursor-pointer"}`}
          style={{ containerType: "size", width: `min(100vw, calc((100vh - ${notes ? "9rem" : "0px"}) * 16 / 9))` }}
        >
          {s.demo ? (
            <div className="select-text"><Demo model={model} /></div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.image!} alt={s.title} draggable={false} className="absolute inset-0 h-full w-full object-contain" />
          )}
        </div>

        <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-3 transition-opacity duration-300 ${idle && !help ? "opacity-0" : "opacity-100"}`}>
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-zinc-900/85 px-2 py-1 text-sm shadow-lg ring-1 ring-white/10 backdrop-blur">
            <button aria-label="Previous slide" onClick={prev} disabled={i === 0} className="rounded-full px-3 py-1 hover:bg-white/10 disabled:opacity-30">←</button>
            <span className="min-w-[4.5rem] text-center tabular-nums text-zinc-300">{i + 1} / {slides.length}</span>
            <button aria-label="Next slide" onClick={next} disabled={i === last} className="rounded-full px-3 py-1 hover:bg-white/10 disabled:opacity-30">→</button>
            <span className="mx-1 h-4 w-px bg-white/15" />
            <button onClick={() => setNotes((v) => !v)} className={`rounded-full px-3 py-1 hover:bg-white/10 ${notes ? "text-sky-300" : ""}`}>Notes</button>
            <button onClick={fullscreen} className="rounded-full px-3 py-1 hover:bg-white/10">Fullscreen</button>
            <button aria-label="Keyboard shortcuts" onClick={() => setHelp((v) => !v)} className="rounded-full px-3 py-1 hover:bg-white/10">?</button>
          </div>
        </div>

        {help && (
          <div className="absolute right-4 top-4 rounded-lg bg-zinc-900/95 p-4 text-sm leading-6 text-zinc-200 ring-1 ring-white/10">
            <div className="mb-1 font-semibold">Keys</div>
            <div>→ / Space / click: next</div>
            <div>← / click left edge: previous</div>
            <div>1–9, Home, End: jump</div>
            <div>N: speaker notes · F: fullscreen</div>
            <div>Esc in the demo form: back to slide keys</div>
          </div>
        )}
      </div>

      {notes && (
        <div className="h-36 shrink-0 overflow-y-auto border-t border-white/10 bg-zinc-950 px-6 py-3 text-[15px] leading-6 text-zinc-200">
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Slide {i + 1}: {s.title}</div>
          {s.notes}
        </div>
      )}
    </div>
  );
}

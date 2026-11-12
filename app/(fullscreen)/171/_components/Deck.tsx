"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelData } from "@/lib/readmission/model";
import { StepCtx } from "./kit";
import { SLIDES } from "./slides";

const last = SLIDES.length - 1;
type Pos = { i: number; step: number };

function parseHash(): Pos {
  if (typeof window === "undefined") return { i: 0, step: 0 };
  const [a, b] = window.location.hash.slice(1).split(".");
  const n = parseInt(a, 10);
  const i = Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), last) : 0;
  const k = parseInt(b, 10);
  return { i, step: Number.isFinite(k) ? Math.min(Math.max(k, 0), SLIDES[i].steps) : 0 };
}

const fwd = ({ i, step }: Pos): Pos =>
  step < SLIDES[i].steps ? { i, step: step + 1 } : i < last ? { i: i + 1, step: 0 } : { i, step };
const back = ({ i, step }: Pos): Pos =>
  step > 0 ? { i, step: step - 1 } : i > 0 ? { i: i - 1, step: SLIDES[i - 1].steps } : { i, step };

const typing = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA" || el.isContentEditable);

/** One slide at one build step, scaled to its 16:9 box. */
function SlideView({ pos, model, width, preview = false }: { pos: Pos; model: ModelData | null; width: string; preview?: boolean }) {
  const s = SLIDES[pos.i];
  return (
    <div
      className="relative aspect-video shrink-0 overflow-hidden bg-white"
      style={{ containerType: "size", width, fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif" }}
    >
      <StepCtx.Provider value={pos.step}>
        {preview && s.demo ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-[3cqw] text-zinc-500">Live demo</div>
        ) : (
          s.render({ n: pos.i + 1, model })
        )}
      </StepCtx.Provider>
    </div>
  );
}

function Notes({ pos, big = false }: { pos: Pos; big?: boolean }) {
  const s = SLIDES[pos.i];
  const cur = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    cur.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [pos]);
  return (
    <div className={big ? "text-[22px] leading-[1.5]" : "text-[15px] leading-6"}>
      <div className={`mb-2 font-semibold uppercase tracking-wide text-zinc-500 ${big ? "text-sm" : "text-xs"}`}>
        Slide {pos.i + 1} · {s.title} · <span className={s.speaker === "Nils" ? "text-sky-300" : "text-amber-300"}>{s.speaker}</span>
        {s.steps > 0 && <span> · click {pos.step} of {s.steps}</span>}
      </div>
      {s.notes.map((t, k) => (
        <p key={k} ref={k === pos.step ? cur : undefined} className={`m-0 mb-2 ${k === pos.step ? "text-white" : k < pos.step ? "text-zinc-500" : "text-zinc-600"}`}>
          {t}
        </p>
      ))}
      {s.ask && (
        <div className={`mt-3 border-t border-white/10 pt-2 text-zinc-400 ${big ? "text-[17px]" : "text-[13px]"}`}>
          <span className="font-semibold text-zinc-300">If asked: </span>
          {s.ask.join(" ")}
        </div>
      )}
    </div>
  );
}

export default function Deck(): JSX.Element {
  const [pos, setPos] = useState<Pos>({ i: 0, step: 0 });
  const [mode, setMode] = useState<"main" | "presenter" | "export">("main");
  const [notes, setNotes] = useState(false);
  const [help, setHelp] = useState(false);
  const [idle, setIdle] = useState(false);
  const [model, setModel] = useState<ModelData | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const chan = useRef<BroadcastChannel | null>(null);
  const [ready, setReady] = useState(false);
  const [local, setLocal] = useState(0); // bumps on every move made in this window
  const posRef = useRef(pos);
  posRef.current = pos;

  const move = useCallback((f: (p: Pos) => Pos) => {
    setPos((p) => f(p));
    setLocal((v) => v + 1);
  }, []);
  const next = useCallback(() => move(fwd), [move]);
  const prev = useCallback(() => move(back), [move]);
  const go = useCallback((i: number) => move(() => ({ i: Math.min(Math.max(i, 0), last), step: 0 })), [move]);

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setMode(q.has("presenter") ? "presenter" : q.has("export") ? "export" : "main");
    setPos(parseHash());
    setReady(true);
    if (q.has("export")) {
      // Lets the export script read slide titles, step counts and notes.
      (window as unknown as { __deck: unknown }).__deck = SLIDES.map(({ title, speaker, steps, notes, ask }) => ({ title, speaker, steps, notes, ask }));
    }
    const onHash = () => setPos(parseHash());
    window.addEventListener("hashchange", onHash);
    fetch("/171/model.json").then((r) => r.json()).then(setModel).catch(() => setModel(null));
    if ("BroadcastChannel" in window) {
      chan.current = new BroadcastChannel("ecs171-deck");
      chan.current.onmessage = (e: MessageEvent<{ type: "pos"; pos: Pos } | { type: "hello" }>) => {
        if (e.data.type === "hello") {
          chan.current?.postMessage({ type: "pos", pos: posRef.current });
          return;
        }
        setPos(e.data.pos);
      };
      if (q.has("presenter")) chan.current.postMessage({ type: "hello" });
    }
    return () => {
      window.removeEventListener("hashchange", onHash);
      chan.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const h = `#${pos.i + 1}${pos.step ? `.${pos.step}` : ""}`;
    if (window.location.hash !== h) window.history.replaceState(null, "", h);
  }, [pos, ready]);

  useEffect(() => {
    if (local) chan.current?.postMessage({ type: "pos", pos: posRef.current });
  }, [local]);

  useEffect(() => {
    if (mode !== "presenter") return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (typing(e.target)) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      switch (e.key) {
        case "ArrowRight": case "ArrowDown": case "PageDown": case " ": case "Enter":
          e.preventDefault(); next(); setStart((s) => s ?? Date.now()); break;
        case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace":
          e.preventDefault(); prev(); break;
        case "Home": go(0); break;
        case "End": go(last); break;
        case "f": case "F": fullscreen(); break;
        case "n": case "N": setNotes((v) => !v); break;
        case "p": case "P":
          window.open(`/171?presenter${window.location.hash}`, "ecs171-presenter", "width=1280,height=800");
          break;
        case "r": case "R": setStart(Date.now()); break;
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

  const s = SLIDES[pos.i];

  if (!ready) return <div className="fixed inset-0 z-50 bg-black" />;

  if (mode === "export") {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <style>{`*{transition:none!important}`}</style>
        <SlideView pos={pos} model={model} width="100vw" />
      </div>
    );
  }

  if (mode === "presenter") {
    const nxt = fwd(pos);
    const end = nxt.i === pos.i && nxt.step === pos.step;
    const secs = start ? Math.max(0, Math.floor((now - start) / 1000)) : 0;
    return (
      <div className="fixed inset-0 z-50 grid grid-cols-[3fr_2fr] gap-5 bg-zinc-950 p-5 font-sans text-zinc-100">
        <div className="flex min-h-0 flex-col gap-3">
          <SlideView pos={pos} model={model} width="100%" preview />
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg bg-zinc-900 p-4"><Notes pos={pos} big /></div>
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Next</div>
          {end ? <div className="flex aspect-video items-center justify-center rounded bg-zinc-900 text-zinc-500">End</div> : <SlideView pos={nxt} model={model} width="100%" preview />}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-4xl font-semibold tabular-nums">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</div>
            <div className="text-xl tabular-nums text-zinc-400">{pos.i + 1} / {SLIDES.length}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={prev} className="flex-1 rounded-lg bg-zinc-800 py-4 text-2xl hover:bg-zinc-700">←</button>
            <button onClick={() => { next(); setStart((v) => v ?? Date.now()); }} className="flex-[2] rounded-lg bg-sky-700 py-4 text-2xl hover:bg-sky-600">→</button>
          </div>
          <div className="text-sm text-zinc-500">Timer starts on the first click. R resets it. This window controls the slides tab.</div>
          <div className="mt-auto space-y-1 overflow-y-auto text-sm">
            {SLIDES.map((d, k) => (
              <button key={k} onClick={() => go(k)} className={`block w-full rounded px-2 py-0.5 text-left ${k === pos.i ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                {k + 1}. {d.title} <span className={d.speaker === "Nils" ? "text-sky-400/70" : "text-amber-400/70"}>· {d.speaker}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <div onClick={onStageClick} className={s.demo ? "" : "cursor-pointer"}>
          <SlideView pos={pos} model={model} width={`min(100vw, calc((100vh - ${notes ? "14rem" : "0px"}) * 16 / 9))`} />
        </div>

        <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-3 transition-opacity duration-300 ${idle && !help ? "opacity-0" : "opacity-100"}`}>
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-zinc-900/85 px-2 py-1 text-sm shadow-lg ring-1 ring-white/10 backdrop-blur">
            <button aria-label="Previous" onClick={prev} className="rounded-full px-3 py-1 hover:bg-white/10">←</button>
            <span className="min-w-[4.5rem] text-center tabular-nums text-zinc-300">{pos.i + 1} / {SLIDES.length}</span>
            <button aria-label="Next" onClick={next} className="rounded-full px-3 py-1 hover:bg-white/10">→</button>
            <span className="mx-1 h-4 w-px bg-white/15" />
            <button onClick={() => setNotes((v) => !v)} className={`rounded-full px-3 py-1 hover:bg-white/10 ${notes ? "text-sky-300" : ""}`}>Notes</button>
            <button onClick={() => window.open(`/171?presenter${window.location.hash}`, "ecs171-presenter", "width=1280,height=800")} className="rounded-full px-3 py-1 hover:bg-white/10">Presenter</button>
            <button onClick={fullscreen} className="rounded-full px-3 py-1 hover:bg-white/10">Fullscreen</button>
            <button aria-label="Keyboard shortcuts" onClick={() => setHelp((v) => !v)} className="rounded-full px-3 py-1 hover:bg-white/10">?</button>
          </div>
        </div>

        {help && (
          <div className="absolute right-4 top-4 rounded-lg bg-zinc-900/95 p-4 text-sm leading-6 text-zinc-200 ring-1 ring-white/10">
            <div className="mb-1 font-semibold">Keys</div>
            <div>→ / Space / click: next point or slide</div>
            <div>← / click left edge: back</div>
            <div>1–9, Home, End: jump to a slide</div>
            <div>N: notes · P: presenter window · F: fullscreen</div>
            <div>Esc in the demo form: back to slide keys</div>
          </div>
        )}
      </div>

      {notes && (
        <div className="h-56 shrink-0 overflow-y-auto border-t border-white/10 bg-zinc-950 px-6 py-3">
          <Notes pos={pos} />
        </div>
      )}
    </div>
  );
}

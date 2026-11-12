"use client";

import { createContext, useContext, type ReactNode } from "react";

export const C = {
  ink: "#17212b",
  mut: "#5b6773",
  faint: "#8a949e",
  acc: "#1f4e79",
  accSoft: "#e8eff6",
  red: "#b3261e",
  redSoft: "#fbeceb",
  green: "#1f6f3f",
  line: "#e3e7ec",
  bar: "#1f4e79",
  barDim: "#c9d6e3",
};

/** Current build step of the slide being rendered. */
export const StepCtx = createContext(0);
export const useStep = () => useContext(StepCtx);

/** Reveals its children once the slide reaches build step `at`. */
export function R({ at = 0, children, className = "", style }: { at?: number; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const on = useStep() >= at;
  return (
    <div
      className={`transition-[opacity,transform] duration-500 ease-out ${on ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[0.8cqw] opacity-0"} ${className}`}
      style={style}
      aria-hidden={!on}
    >
      {children}
    </div>
  );
}

/** SVG version of R. */
export function G({ at = 0, children }: { at?: number; children: ReactNode }) {
  const on = useStep() >= at;
  return <g style={{ opacity: on ? 1 : 0, transition: "opacity 500ms ease-out" }}>{children}</g>;
}

export function Frame({ kicker, title, children, n }: { kicker?: string; title: ReactNode; children: ReactNode; n: number }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-white px-[5.5cqw] pb-[3cqw] pt-[4cqw]" style={{ color: C.ink }}>
      {kicker && (
        <div className="text-[1.25cqw] font-semibold uppercase tracking-[0.12em]" style={{ color: C.acc }}>
          {kicker}
        </div>
      )}
      <h2 className="m-0 mt-[0.6cqw] text-[3.4cqw] font-bold leading-[1.12] tracking-[-0.01em]">{title}</h2>
      <div className="relative mt-[2.6cqw] min-h-0 flex-1">{children}</div>
      <div className="flex justify-between text-[1cqw]" style={{ color: C.faint }}>
        <span>ECS 171 · Group 15</span>
        <span>{n}</span>
      </div>
    </div>
  );
}

/** A short line with a bold lead, used for one-click-one-point lists. */
export function Point({ lead, children, tone = "ink" }: { lead?: ReactNode; children?: ReactNode; tone?: "ink" | "red" | "green" | "acc" }) {
  const color = tone === "red" ? C.red : tone === "green" ? C.green : tone === "acc" ? C.acc : C.ink;
  return (
    <div className="text-[2.1cqw] leading-[1.3]">
      {lead && <span className="font-bold" style={{ color }}>{lead} </span>}
      <span style={{ color: C.ink }}>{children}</span>
    </div>
  );
}

/** The "so what" line at the bottom of a results slide. */
export function Answer({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[0.8cqw] px-[2cqw] py-[1.3cqw] text-[2.1cqw] font-semibold leading-[1.3]" style={{ background: C.accSoft, color: C.acc }}>
      {children}
    </div>
  );
}

export function Stat({ value, label, tone = "acc" }: { value: ReactNode; label: ReactNode; tone?: "acc" | "red" | "ink" }) {
  const color = tone === "red" ? C.red : tone === "ink" ? C.ink : C.acc;
  return (
    <div>
      <div className="text-[4.6cqw] font-bold leading-[1] tracking-[-0.02em]" style={{ color }}>{value}</div>
      <div className="mt-[0.6cqw] text-[1.6cqw] leading-[1.3]" style={{ color: C.mut }}>{label}</div>
    </div>
  );
}

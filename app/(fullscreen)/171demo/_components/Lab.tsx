"use client";

import { useEffect, useMemo, useState } from "react";
import { explain, prob, sigmoid, treePath, type ModelData } from "@/lib/readmission/model";
import gains from "@/lib/readmission/gains.json";

const C = {
  ink: "#17212b", mut: "#5b6773", faint: "#8a949e", acc: "#1f4e79", accSoft: "#e8eff6",
  red: "#b3261e", redSoft: "#fbeceb", green: "#1f6f3f", line: "#e3e7ec", orange: "#d07a1f", bg: "#f4f6f8",
};

type Form = Record<string, string>;
const DEFAULT: Form = {
  age_mid: "75", gender: "Female", time_in_hospital: "4", num_medications: "15", number_inpatient: "0",
  number_emergency: "0", number_diagnoses: "8", a1c_ord: "", diag_1_group: "Circulatory", discharge_disposition: "1",
};
const EXAMPLES: Record<string, Form> = {
  "Low risk": { age_mid: "55", gender: "Female", time_in_hospital: "2", num_medications: "8", number_inpatient: "0", number_emergency: "0", number_diagnoses: "4", a1c_ord: "0", diag_1_group: "Musculoskeletal", discharge_disposition: "1" },
  "High risk": { age_mid: "75", gender: "Male", time_in_hospital: "9", num_medications: "25", number_inpatient: "5", number_emergency: "2", number_diagnoses: "9", a1c_ord: "", diag_1_group: "Circulatory", discharge_disposition: "22" },
};
const DISCHARGE: Record<string, string> = { "1": "Home", "6": "Home with home health", "3": "Skilled nursing facility", "22": "Rehab facility", "2": "Another short-term hospital" };
const A1C: Record<string, string> = { "": "Not measured", "0": "Normal", "1": ">7", "2": ">8" };
const DIAG = ["Circulatory", "Respiratory", "Digestive", "Diabetes", "Injury", "Musculoskeletal", "Genitourinary", "Neoplasms", "Other"];
const AGES: [string, string][] = [["35", "30-39"], ["45", "40-49"], ["55", "50-59"], ["65", "60-69"], ["75", "70-79"], ["85", "80-89"]];

const SWEEPS: { key: string; label: string; vals: number[] }[] = [
  { key: "number_inpatient", label: "Hospital stays, past year", vals: Array.from({ length: 11 }, (_, i) => i) },
  { key: "time_in_hospital", label: "Days in hospital", vals: Array.from({ length: 14 }, (_, i) => i + 1) },
  { key: "number_diagnoses", label: "Number of diagnoses", vals: Array.from({ length: 16 }, (_, i) => i + 1) },
  { key: "num_medications", label: "Number of medications", vals: Array.from({ length: 13 }, (_, i) => 1 + i * 5) },
  { key: "number_emergency", label: "ER visits, past year", vals: Array.from({ length: 11 }, (_, i) => i) },
  { key: "age_mid", label: "Age", vals: [35, 45, 55, 65, 75, 85] },
];

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

function Card({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border bg-white ${className}`} style={{ borderColor: "#d0d5db" }}>
      <div className="flex items-baseline justify-between gap-3 border-b px-3 py-1.5" style={{ borderColor: "#d0d5db", background: "#fafbfc" }}>
        <h2 className="m-0 font-mono text-[12.5px] font-semibold" style={{ color: C.ink }}>{title}</h2>
        {sub && <span className="font-mono text-[11px]" style={{ color: C.faint }}>{sub}</span>}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

/* ---------- breakdown (TreeSHAP waterfall) ---------- */
function Waterfall({ m, form }: { m: ModelData; form: Form }) {
  const e = useMemo(() => explain(m, form), [m, form]);
  const onForm = e.steps.filter((s) => s.onForm).sort((a, b) => Math.abs(b.phi) - Math.abs(a.phi));
  const other = e.steps.filter((s) => !s.onForm).reduce((a, s) => a + s.phi, 0);
  const rows: { name: string; phi: number }[] = [...onForm.map((s) => ({ name: s.key, phi: s.phi })), { name: "(not on form)", phi: other }];
  let z = e.startMargin;
  const bars = rows.map((r) => { const a = sigmoid(z); z += r.phi; return { ...r, a, b: sigmoid(z) }; });
  const max = Math.max(e.start, ...bars.map((b) => Math.max(b.a, b.b))) * 1.12;
  const W = 640, L = 210, R = 600, row = 27, top = 12;
  const x = (p: number) => L + (p / max) * (R - L);
  const H = top + (rows.length + 2) * row + 26;
  const ticks = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6].filter((t) => t <= max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top} y2={H - 24} stroke={C.line} />
          <text x={x(t)} y={H - 8} textAnchor="middle" fontSize={11} fill={C.mut}>{pct(t, 0)}</text>
        </g>
      ))}
      <line x1={x(m.threshold)} x2={x(m.threshold)} y1={top} y2={H - 24} stroke={C.red} strokeDasharray="4 4" />
      <text x={x(m.threshold) + 4} y={top + 4} fontSize={10.5} fill={C.red}>threshold</text>
      {[{ name: "E[f(x)]", a: 0, b: e.start, phi: 0, base: true }, ...bars.map((b) => ({ ...b, base: false })), { name: "f(x)", a: 0, b: e.probability, phi: 0, base: true }].map((r, i) => {
        const y = top + i * row;
        const lo = Math.min(r.a, r.b), hi = Math.max(r.a, r.b);
        const up = r.b >= r.a;
        const fill = r.base ? "#6b7785" : up ? C.red : C.green;
        return (
          <g key={r.name}>
            <text x={L - 10} y={y + 17} textAnchor="end" fontSize={12} fontWeight={r.base ? 700 : 400} fill={C.ink} fontFamily="ui-monospace, monospace">{r.name}</text>
            <rect x={x(lo)} y={y + 6} width={Math.max(1.5, x(hi) - x(lo))} height={15} rx={2} fill={fill} style={{ transition: "all 300ms" }} />
            <text x={x(hi) + 5} y={y + 18} fontSize={11.5} fill={r.base ? C.ink : fill} fontWeight={r.base ? 700 : 600}>
              {r.base ? pct(r.b) : `${up ? "+" : "−"}${(Math.abs(r.b - r.a) * 100).toFixed(1)}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- what-if curve ---------- */
function WhatIf({ m, form }: { m: ModelData; form: Form }) {
  const [k, setK] = useState(0);
  const sw = SWEEPS[k];
  const pts = useMemo(() => sw.vals.map((v) => ({ v, p: prob(m, { ...form, [sw.key]: String(v) }) })), [m, form, sw]);
  const cur = Number(form[sw.key]);
  const curP = prob(m, form);
  const W = 560, H = 270, L = 48, R = 540, T = 14, B = 232;
  const ymax = Math.max(0.2, ...pts.map((p) => p.p), curP) * 1.1;
  const xmin = sw.vals[0], xmax = sw.vals[sw.vals.length - 1];
  const x = (v: number) => L + ((v - xmin) / (xmax - xmin)) * (R - L);
  const y = (p: number) => B - (p / ymax) * (B - T);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p.v)} ${y(p.p)}`).join(" ");
  const yt = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].filter((t) => t <= ymax);
  return (
    <div>
      <div className="mb-1 font-mono text-[12px]" style={{ color: C.mut }}>
        vary{" "}
        <select value={k} onChange={(e) => setK(Number(e.target.value))} className="border bg-white px-1 py-0.5 font-mono text-[12px]" style={{ borderColor: "#d0d5db", color: C.ink }}>
          {SWEEPS.map((s, i) => <option key={s.key} value={i}>{s.key}</option>)}
        </select>{" "}
        , all other inputs fixed
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {yt.map((t) => (
          <g key={t}><line x1={L} x2={R} y1={y(t)} y2={y(t)} stroke={C.line} /><text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={C.mut}>{pct(t, 0)}</text></g>
        ))}
        {sw.vals.filter((_, i) => sw.vals.length <= 11 || i % 2 === 0).map((v) => (
          <text key={v} x={x(v)} y={B + 18} textAnchor="middle" fontSize={11} fill={C.mut}>{sw.key === "age_mid" ? `${v - 5}s` : v}</text>
        ))}
        <text x={(L + R) / 2} y={H - 4} textAnchor="middle" fontSize={11.5} fill={C.mut} fontFamily="ui-monospace, monospace">{sw.key}</text>
        
        <line x1={L} x2={R} y1={y(m.threshold)} y2={y(m.threshold)} stroke={C.red} strokeDasharray="5 4" />
        <text x={R - 4} y={y(m.threshold) - 6} textAnchor="end" fontSize={11} fill={C.red}>threshold {m.threshold.toFixed(3)}</text>
        <path d={d} fill="none" stroke={C.acc} strokeWidth={2.5} />
        {pts.map((p) => <circle key={p.v} cx={x(p.v)} cy={y(p.p)} r={3} fill={C.acc} />)}
        {cur >= xmin && cur <= xmax && (
          <g>
            <line x1={x(cur)} x2={x(cur)} y1={T} y2={B} stroke={C.ink} strokeOpacity={0.25} />
            <circle cx={x(cur)} cy={y(curP)} r={5} fill="white" stroke={C.ink} strokeWidth={2} />
            <text x={x(cur) + (x(cur) > R - 90 ? -10 : 10)} y={y(curP) - 10} textAnchor={x(cur) > R - 90 ? "end" : "start"} fontSize={12} fontWeight={700} fill={C.ink}>{pct(curP)}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ---------- gains curve on the real test set ---------- */
const MODELS: [string, string][] = [["XGBoost", C.acc], ["Random forest", C.orange], ["Logistic regression", "#8a6fb0"]];
function Gains() {
  const [k, setK] = useState(10); // index into 0..200 (0.5% steps)
  const g = gains as { n: number; pos: number; models: Record<string, number[]> };
  const W = 620, H = 300, L = 46, R = 596, T = 10, B = 262;
  const x = (f: number) => L + f * (R - L);
  const y = (f: number) => B - f * (B - T);
  const frac = k / 200;
  const called = Math.round(frac * g.n);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
          <g key={t}>
            <line x1={L} x2={R} y1={y(t)} y2={y(t)} stroke={C.line} /><line x1={x(t)} x2={x(t)} y1={T} y2={B} stroke={C.line} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={C.mut}>{pct(t, 0)}</text>
            <text x={x(t)} y={B + 17} textAnchor="middle" fontSize={11} fill={C.mut}>{pct(t, 0)}</text>
          </g>
        ))}
        <text x={(L + R) / 2} y={H - 4} textAnchor="middle" fontSize={11.5} fill={C.mut}>fraction of patients contacted (sorted by predicted risk)</text>
        <text x={14} y={(T + B) / 2} textAnchor="middle" fontSize={11.5} fill={C.mut} transform={`rotate(-90 14 ${(T + B) / 2})`}>recall</text>
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke={C.faint} strokeDasharray="5 4" />
        <text x={x(0.62)} y={y(0.55)} fontSize={11} fill={C.faint} transform={`rotate(-29 ${x(0.62)} ${y(0.55)})`}>random</text>
        {MODELS.slice().reverse().map(([name, col]) => (
          <path key={name} d={g.models[name].map((c, i) => `${i ? "L" : "M"}${x(i / 200)} ${y(c / g.pos)}`).join(" ")} fill="none" stroke={col} strokeWidth={name === "XGBoost" ? 3 : 2} />
        ))}
        
        <line x1={x(frac)} x2={x(frac)} y1={T} y2={B} stroke={C.ink} strokeWidth={1.5} />
        {MODELS.map(([name, col]) => <circle key={name} cx={x(frac)} cy={y(g.models[name][k] / g.pos)} r={5} fill={col} stroke="white" strokeWidth={1.5} />)}
      </svg>
      <div>
        <label className="flex items-center gap-3 font-mono text-[12px]" style={{ color: C.ink }}>
          <span className="shrink-0">top {pct(frac, 1)} (n={called.toLocaleString()})</span>
          <input type="range" min={1} max={100} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full accent-[#1f4e79]" />
        </label>
        <table className="mt-2 w-full border-collapse font-mono text-[12px]">
          <thead><tr className="text-left" style={{ color: C.mut }}><th className="pb-1 font-normal">model</th><th className="pb-1 text-right font-normal">recall</th><th className="pb-1 text-right font-normal">precision</th><th className="pb-1 text-right font-normal">lift</th></tr></thead>
          <tbody>
            {MODELS.map(([name, col]) => {
              const c = g.models[name][k];
              const prec = called ? c / called : 0;
              return (
                <tr key={name} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="py-1" style={{ color: col }}>■ {name}</td>
                  <td className="py-1 text-right tabular-nums">{(c / g.pos).toFixed(3)}</td>
                  <td className="py-1 text-right tabular-nums">{prec.toFixed(3)}</td>
                  <td className="py-1 text-right tabular-nums">{(prec / (g.pos / g.n)).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- one tree, with missing values ---------- */
function TreeWalk({ m, form }: { m: ModelData; form: Form }) {
  const firstWithMissing = useMemo(() => {
    for (let t = 0; t < m.trees.length; t++) if (treePath(m, t, form).steps.some((s) => s.missing && s.feature.startsWith("a1c"))) return t;
    for (let t = 0; t < m.trees.length; t++) if (treePath(m, t, form).steps.some((s) => s.missing)) return t;
    return 0;
  }, [m, form]);
  const [t, setT] = useState<number | null>(null);
  const ti = t ?? firstWithMissing;
  const path = useMemo(() => treePath(m, ti, form), [m, ti, form]);
  const filled = useMemo(() => (form.a1c_ord === "" ? prob(m, { ...form, a1c_ord: "0" }) : null), [m, form]);
  const asIs = useMemo(() => prob(m, form), [m, form]);
  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[12px]" style={{ color: C.mut }}>
        <button onClick={() => setT(Math.max(0, ti - 1))} className="border px-1.5" style={{ borderColor: "#d0d5db" }}>‹</button>
        <span className="tabular-nums">tree {ti}/{m.trees.length - 1}</span>
        <button onClick={() => setT(Math.min(m.trees.length - 1, ti + 1))} className="border px-1.5" style={{ borderColor: "#d0d5db" }}>›</button>
        <button onClick={() => setT(null)} className="ml-2 underline">first tree splitting on a1c_ord</button>
      </div>
      <ol className="m-0 mt-2 list-none space-y-0.5 p-0">
        {path.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2 border-l-2 px-2 py-1 font-mono text-[12px] leading-5" style={{ background: s.missing ? C.redSoft : "transparent", borderColor: s.missing ? C.red : C.line }}>
            <span className="w-5 shrink-0 text-right tabular-nums" style={{ color: C.faint }}>{s.node}</span>
            <span className="flex-1 whitespace-pre-wrap">
              <span style={{ color: C.ink }}>{s.feature} &lt; {+s.threshold.toFixed(3)}</span>{"  "}
              {s.missing ? (
                <span style={{ color: C.red }}>x = NaN → default {s.defaultLeft ? "left (yes)" : "right (no)"}</span>
              ) : (
                <span style={{ color: C.mut }}>x = {+s.value.toFixed(3)} → {s.left ? "left (yes)" : "right (no)"}</span>
              )}
            </span>
          </li>
        ))}
        <li className="flex gap-2 border-l-2 px-2 py-1 font-mono text-[12px]" style={{ borderColor: C.acc, color: C.acc }}>
          <span className="w-5 shrink-0" /><span>leaf = {path.leaf >= 0 ? "+" : ""}{path.leaf.toFixed(4)} (log-odds; prediction = sum over {m.trees.length} trees)</span>
        </li>
      </ol>
      {filled !== null && (
        <div className="mt-3 border-t pt-2 font-mono text-[12px]" style={{ borderColor: C.line, color: C.mut }}>
          a1c_ord = NaN: <b style={{ color: C.ink }}>{pct(asIs)}</b>   vs   imputed as normal (0): <b style={{ color: C.ink }}>{pct(filled)}</b>
        </div>
      )}
    </div>
  );
}

/* ---------- page ---------- */
const field = "mt-0.5 block w-full border bg-white px-1.5 py-1 font-mono text-[13px] outline-none focus:border-[#1f4e79]";
export default function Lab(): JSX.Element {
  const [m, setM] = useState<ModelData | null>(null);
  const [form, setForm] = useState<Form>(DEFAULT);
  useEffect(() => { fetch("/171/model.json").then((r) => r.json()).then(setM).catch(() => setM(null)); }, []);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const p = useMemo(() => (m ? prob(m, form) : null), [m, form]);
  const flagged = m && p !== null && p >= m.threshold;

  const num = (k: string, label: string, min: number, max: number) => (
    <label className="block font-mono text-[11.5px]" style={{ color: C.mut }}>{label}
      <input type="number" min={min} max={max} value={form[k]} onChange={set(k)} className={field} style={{ borderColor: "#d0d5db", color: C.ink }} />
    </label>
  );
  const sel = (k: string, label: string, opts: [string, string][]) => (
    <label className="block font-mono text-[11.5px]" style={{ color: C.mut }}>{label}
      <select value={form[k]} onChange={set(k)} className={field} style={{ borderColor: "#d0d5db", color: C.ink }}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans" style={{ background: "#f0f2f4", color: C.ink }}>
      <main className="mx-auto grid max-w-[1500px] grid-cols-[280px_1fr_1fr] gap-3 p-3">
        <div className="row-span-2 space-y-3">
          <Card title="input">
            <div className="grid grid-cols-1 gap-y-1.5">
              {sel("age_mid", "age", AGES)}
              {sel("gender", "gender", [["Female", "Female"], ["Male", "Male"]])}
              {num("time_in_hospital", "time_in_hospital", 1, 14)}
              {num("num_medications", "num_medications", 1, 81)}
              {num("number_inpatient", "number_inpatient", 0, 21)}
              {num("number_emergency", "number_emergency", 0, 76)}
              {num("number_diagnoses", "number_diagnoses", 1, 16)}
              {sel("a1c_ord", "a1c_ord", Object.entries(A1C))}
              <div>{sel("diag_1_group", "diag_1_group", DIAG.map((d) => [d, d]))}</div>
              <div>{sel("discharge_disposition", "discharge_disposition", Object.entries(DISCHARGE))}</div>
            </div>
            <div className="mt-2 flex gap-2">
              {Object.keys(EXAMPLES).map((k) => (
                <button key={k} onClick={() => setForm(EXAMPLES[k])} className="flex-1 border px-2 py-1 font-mono text-[12px]" style={{ borderColor: "#d0d5db", color: C.ink, background: "#fafbfc" }}>load: {k.toLowerCase()}</button>
              ))}
            </div>
          </Card>
          <Card title="output">
            <div className="font-mono text-[12px]" style={{ color: C.mut }}>P(readmit ≤ 30d)</div>
            <div className="font-mono text-[40px] font-semibold leading-tight tabular-nums">{p === null ? "…" : pct(p)}</div>
            <div className="font-mono text-[13px]" style={{ color: flagged ? C.red : C.mut }}>{m ? (flagged ? `FLAG  (≥ ${m.threshold.toFixed(3)})` : `no flag  (< ${m.threshold.toFixed(3)})`) : "loading model…"}</div>
            {m && <div className="mt-1 font-mono text-[12px]" style={{ color: C.faint }}>base rate {m.base_rate.toFixed(3)}</div>}
            <p className="m-0 mt-2 text-[11.5px] leading-4" style={{ color: C.faint }}>Inputs not on the form: training medians/modes, or NaN.</p>
          </Card>
        </div>
        {m ? (
          <>
            <Card title="TreeSHAP contributions" sub="Δ risk, percentage points">
              <Waterfall m={m} form={form} />
            </Card>
            <Card title="sensitivity: one input at a time" sub="this patient">
              <WhatIf m={m} form={form} />
            </Card>
            <Card title="decision path" sub="red: missing value, learned default direction">
              <TreeWalk m={m} form={form} />
            </Card>
            <Card title="cumulative gains, held-out test set" sub={`n=${(gains as { n: number }).n.toLocaleString()}, ${(gains as { pos: number }).pos.toLocaleString()} readmitted`}>
              <Gains />
            </Card>
          </>
        ) : (
          <div className="col-span-2 flex items-center justify-center font-mono text-[13px]" style={{ color: C.mut }}>loading model.json…</div>
        )}
      </main>
    </div>
  );
}

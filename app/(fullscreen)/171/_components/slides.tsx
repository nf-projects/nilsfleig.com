"use client";

import type { ReactNode } from "react";
import type { ModelData } from "@/lib/readmission/model";
import Demo from "./Demo";
import { Answer, C, Frame, G, Point, R, Stat, useStep } from "./kit";

// All numbers come from results/*.csv and results/eda.json in nf-projects/ecs171-readmission.

export type SlideDef = {
  title: string;
  speaker: "Nils" | "Alex" | "Alex, then Nils";
  /** Number of clicks after the slide first appears. */
  steps: number;
  /** What to say at each build step: notes[0] when the slide appears, notes[k] after click k.
   * The demo slide has no builds; its notes are the steps of the demo. */
  notes: string[];
  /** Short facts for Q&A, not read out. */
  ask?: string[];
  demo?: boolean;
  render: (p: { n: number; model: ModelData | null }) => ReactNode;
};

const pct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;

/* ---------- small charts ---------- */

function People() {
  return (
    <svg viewBox="0 0 900 140" className="w-full">
      {Array.from({ length: 9 }, (_, k) => {
        const x = 50 + k * 100;
        const hot = k === 8;
        const fill = hot ? C.red : "#c9d1da";
        return (
          <g key={k}>
            <circle cx={x} cy={32} r={22} fill={fill} />
            <path d={`M${x - 34} 134 v-38 a34 34 0 0 1 68 0 v38 z`} fill={fill} />
          </g>
        );
      })}
    </svg>
  );
}

function PriorVisits() {
  const step = useStep();
  const data: [string, number][] = [["0", 0.0859], ["1", 0.1325], ["2", 0.1793], ["3", 0.2103], ["4", 0.2414], ["5+", 0.3713]];
  const W = 900, H = 470, L = 70, B = 400, T = 30, max = 0.4;
  const y = (v: number) => B - (v / max) * (B - T);
  const bw = 100, gap = (W - L - 20 - bw * 6) / 5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" style={{ fontFamily: "inherit" }}>
      {[0, 0.1, 0.2, 0.3, 0.4].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - 10} y1={y(t)} y2={y(t)} stroke={C.line} />
          <text x={L - 12} y={y(t) + 8} textAnchor="end" fontSize={24} fill={C.mut}>{pct(t)}</text>
        </g>
      ))}
      {data.map(([k, v], i) => {
        const x = L + 10 + i * (bw + gap);
        const hl = step >= 1 && (i === 0 || i === 5);
        const fill = step >= 1 ? (i === 5 ? C.red : i === 0 ? C.bar : C.barDim) : C.bar;
        return (
          <g key={k}>
            <rect x={x} y={y(v)} width={bw} height={B - y(v)} rx={4} fill={fill} style={{ transition: "fill 400ms" }} />
            <text x={x + bw / 2} y={y(v) - 10} textAnchor="middle" fontSize={hl ? 34 : 27} fontWeight={700} fill={i === 5 && step >= 1 ? C.red : C.ink}>{pct(v)}</text>
            <text x={x + bw / 2} y={B + 34} textAnchor="middle" fontSize={28} fill={C.ink}>{k}</text>
          </g>
        );
      })}
      <line x1={L} x2={W - 10} y1={y(0.1139)} y2={y(0.1139)} stroke={C.ink} strokeDasharray="8 6" strokeWidth={2} />
      <line x1={L + 20} x2={L + 70} y1={T + 4} y2={T + 4} stroke={C.ink} strokeDasharray="8 6" strokeWidth={2} />
      <text x={L + 80} y={T + 12} fontSize={24} fill={C.ink}>average, 11.4%</text>
      <text x={(W + L) / 2} y={H - 2} textAnchor="middle" fontSize={26} fill={C.mut}>Hospital stays in the year before</text>
    </svg>
  );
}

function Missingness() {
  const data: [string, number][] = [
    ["Weight", 0.9685], ["Glucose test (not run)", 0.9481], ["A1C test (not run)", 0.8305],
    ["Doctor specialty", 0.4894], ["Insurance / payer", 0.3966], ["Admission type", 0.1021],
  ];
  const W = 760, L = 300, row = 64, H = data.length * row + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {data.map(([k, v], i) => {
        const yy = 8 + i * row;
        const w = v * (W - L - 90);
        const a1c = k.startsWith("A1C");
        return (
          <g key={k}>
            <text x={L - 16} y={yy + 33} textAnchor="end" fontSize={25} fill={C.ink} fontWeight={a1c ? 700 : 400}>{k}</text>
            <rect x={L} y={yy + 8} width={w} height={36} rx={4} fill={a1c ? C.red : C.bar} />
            <text x={L + w + 10} y={yy + 35} fontSize={24} fill={C.ink} fontWeight={700}>{pct(v)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ModelDots() {
  const step = useStep();
  const rows = [
    { k: "Baseline (guessing)", v: 0.1139, lo: null as number | null, hi: null as number | null },
    { k: "Logistic regression", v: 0.2369, lo: 0.2184, hi: 0.2586 },
    { k: "Random forest", v: 0.2576, lo: 0.2349, hi: 0.2819 },
    { k: "XGBoost", v: 0.2624, lo: 0.2399, hi: 0.2865 },
  ];
  const W = 1000, L = 340, R0 = 970, row = 86, top = 30, x0 = 0.1, x1 = 0.3;
  const x = (v: number) => L + ((v - x0) / (x1 - x0)) * (R0 - L);
  const H = top + rows.length * row + 72;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.1, 0.15, 0.2, 0.25, 0.3].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top - 6} y2={top + rows.length * row} stroke={C.line} />
          <text x={x(t)} y={top + rows.length * row + 30} textAnchor="middle" fontSize={24} fill={C.mut}>{t.toFixed(2)}</text>
        </g>
      ))}
      <text x={(L + R0) / 2} y={H - 4} textAnchor="middle" fontSize={24} fill={C.mut}>Test PR-AUC, higher is better (95% interval)</text>
      {rows.map((r, i) => {
        const yy = top + i * row + row / 2;
        const xgb = r.k === "XGBoost";
        const dim = (step === 1 && r.k === "Random forest") || (step === 2 && r.k === "Logistic regression");
        return (
          <g key={r.k} style={{ opacity: dim ? 0.35 : 1, transition: "opacity 400ms" }}>
            <text x={L - 20} y={yy + 9} textAnchor="end" fontSize={29} fontWeight={xgb ? 700 : 400} fill={r.lo === null ? C.mut : C.ink}>{r.k}</text>
            {r.lo !== null && <line x1={x(r.lo)} x2={x(r.hi!)} y1={yy} y2={yy} stroke={xgb ? C.acc : "#7d8b99"} strokeWidth={5} strokeLinecap="round" />}
            <circle cx={x(r.v)} cy={yy} r={r.lo === null ? 9 : 13} fill={r.lo === null ? C.faint : xgb ? C.acc : "#4a5a6a"} />
            <text x={x(r.v)} y={yy - 22} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.ink}>{r.v.toFixed(3)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Gap({ vs, d, ci, ok = false }: { vs: string; d: string; ci: string; ok?: boolean }) {
  return (
    <div className="rounded-[1cqw] p-[1.6cqw]" style={{ background: ok ? "#eaf4ee" : C.redSoft }}>
      <div className="text-[1.5cqw]" style={{ color: C.mut }}>XGBoost vs {vs}</div>
      <div className="mt-[0.3cqw] text-[2.6cqw] font-bold leading-none" style={{ color: ok ? C.green : C.red }}>{d} {ok ? "✓" : "≈ 0"}</div>
      <div className="mt-[0.5cqw] text-[1.5cqw]" style={{ color: C.ink }}>{ok ? "Real gap" : "Within noise"}: interval {ci}</div>
    </div>
  );
}

function Strategies() {
  const rows = [
    { k: "Built-in (XGBoost decides)", pr: 0.2259, t: "0.3 s" },
    { k: "Missing as its own category", pr: 0.2256, t: "0.3 s" },
    { k: "Fill with most common value", pr: 0.2232, t: "0.4 s" },
    { k: "Fill from similar patients (KNN)", pr: 0.2234, t: "45.9 s" },
  ];
  return (
    <table className="w-full border-collapse text-[1.7cqw]">
      <thead>
        <tr className="text-left text-[1.3cqw]" style={{ color: C.mut }}>
          <th className="pb-[0.6cqw] font-semibold">Strategy</th>
          <th className="pb-[0.6cqw] text-right font-semibold">CV PR-AUC</th>
          <th className="pb-[0.6cqw] text-right font-semibold">Prep time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.k} style={{ borderTop: `1px solid ${C.line}` }}>
            <td className="py-[0.7cqw]" style={{ fontWeight: i === 0 ? 700 : 400 }}>{r.k}</td>
            <td className="py-[0.7cqw] text-right tabular-nums" style={{ fontWeight: i === 0 ? 700 : 400 }}>{r.pr.toFixed(4)}</td>
            <td className="py-[0.7cqw] text-right tabular-nums" style={{ color: r.t.startsWith("45") ? C.red : C.ink, fontWeight: r.t.startsWith("45") ? 700 : 400 }}>{r.t}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Masking() {
  const rates = [0, 20, 40, 60, 80];
  const native = [0.2259, 0.2163, 0.2123, 0.2028, 0.1989];
  const mean = [0.2259, 0.2178, 0.2127, 0.2044, 0.1992];
  const W = 640, H = 400, L = 90, Rr = 610, T = 20, B = 330, y0 = 0.195, y1 = 0.23;
  const x = (r: number) => L + (r / 80) * (Rr - L);
  const y = (v: number) => B - ((v - y0) / (y1 - y0)) * (B - T);
  const path = (vs: number[]) => vs.map((v, i) => `${i ? "L" : "M"}${x(rates[i])} ${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.2, 0.21, 0.22, 0.23].map((t) => (
        <g key={t}>
          <line x1={L} x2={Rr} y1={y(t)} y2={y(t)} stroke={C.line} />
          <text x={L - 10} y={y(t) + 7} textAnchor="end" fontSize={23} fill={C.mut}>{t.toFixed(2)}</text>
        </g>
      ))}
      {rates.map((r) => <text key={r} x={x(r)} y={B + 30} textAnchor="middle" fontSize={23} fill={C.mut}>{r}%</text>)}
      <text x={(L + Rr) / 2} y={H - 6} textAnchor="middle" fontSize={23} fill={C.mut}>Values hidden completely at random</text>
      <path d={path(mean)} fill="none" stroke="#d07a1f" strokeWidth={4} strokeDasharray="10 7" />
      <path d={path(native)} fill="none" stroke={C.acc} strokeWidth={4} />
      {native.map((v, i) => <circle key={i} cx={x(rates[i])} cy={y(v)} r={6} fill={C.acc} />)}
      <g>
        <line x1={360} x2={400} y1={40} y2={40} stroke={C.acc} strokeWidth={4} />
        <text x={410} y={48} fontSize={23} fill={C.ink}>Built-in</text>
        <line x1={360} x2={400} y1={72} y2={72} stroke="#d07a1f" strokeWidth={4} strokeDasharray="10 7" />
        <text x={410} y={80} fontSize={23} fill={C.ink}>Fill with the mean</text>
      </g>
    </svg>
  );
}

function Drivers() {
  const data: [string, number][] = [
    ["Hospital stays, past year", 0.3072], ["Where they go after discharge", 0.2217], ["Primary diagnosis", 0.0779],
    ["Insurance / payer", 0.0721], ["Number of diagnoses", 0.0565], ["Doctor specialty", 0.0505],
  ];
  const W = 1000, L = 420, row = 66, H = data.length * row + 60, max = 0.32;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {data.map(([k, v], i) => {
        const yy = 6 + i * row;
        const w = (v / max) * (W - L - 90);
        const top2 = i < 2;
        const fill = top2 ? C.acc : C.barDim;
        return (
          <g key={k}>
            <text x={L - 18} y={yy + 37} textAnchor="end" fontSize={27} fill={C.ink} fontWeight={top2 ? 700 : 400}>{k}</text>
            <rect x={L} y={yy + 10} width={w} height={38} rx={4} fill={fill} style={{ transition: "fill 400ms" }} />
          </g>
        );
      })}
      <text x={L} y={H - 8} fontSize={22} fill={C.mut}>Average effect on a prediction (mean |SHAP|, test set)</text>
    </svg>
  );
}

function Recall() {
  const rows = [
    { k: "Caucasian", pos: 1674, r: 0.505, lo: 0.477, hi: 0.534 },
    { k: "African American", pos: 455, r: 0.488, lo: 0.429, hi: 0.546 },
    { k: "Hispanic", pos: 50, r: 0.5, lo: 0.286, hi: 0.673 },
    { k: "Other", pos: 29, r: 0.414, lo: 0.231, hi: 0.586 },
    { k: "Race missing", pos: 42, r: 0.286, lo: 0.111, hi: 0.457 },
    { k: "Asian", pos: 13, r: 0.154, lo: 0, hi: 0.375 },
  ];
  const step = useStep();
  const W = 900, L = 330, Rr = 870, row = 70, top = 10, max = 0.8;
  const x = (v: number) => L + (v / max) * (Rr - L);
  const H = top + rows.length * row + 70;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.2, 0.4, 0.6, 0.8].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top} y2={top + rows.length * row} stroke={C.line} />
          <text x={x(t)} y={top + rows.length * row + 30} textAnchor="middle" fontSize={23} fill={C.mut}>{t.toFixed(1)}</text>
        </g>
      ))}
      <text x={(L + Rr) / 2} y={H - 6} textAnchor="middle" fontSize={23} fill={C.mut}>Share of readmissions caught (recall), 95% interval</text>
      {rows.map((r, i) => {
        const yy = top + i * row + row / 2;
        const small = r.pos < 100;
        return (
          <g key={r.k} style={{ opacity: step === 1 && !small ? 0.35 : 1, transition: "opacity 400ms" }}>
            <text x={L - 18} y={yy + 2} textAnchor="end" fontSize={28} fill={C.ink}>{r.k}</text>
            <text x={L - 18} y={yy + 27} textAnchor="end" fontSize={21} fill={C.mut}>{r.pos.toLocaleString()} readmissions</text>
            <line x1={x(r.lo)} x2={x(r.hi)} y1={yy} y2={yy} stroke={small ? "#d07a1f" : C.acc} strokeWidth={5} strokeLinecap="round" />
            <circle cx={x(r.r)} cy={yy} r={11} fill={small ? "#d07a1f" : C.acc} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- the deck ---------- */

export const SLIDES: SlideDef[] = [
  {
    title: "Title",
    speaker: "Nils",
    steps: 0,
    notes: [
      "We're Group 15, Nils and Alex. Our assigned paper is XGBoost, and we used it to predict which diabetic patients come back to the hospital within 30 days.",
    ],
    render: () => (
      <div className="absolute inset-0 flex flex-col justify-between bg-white px-[6cqw] py-[5.5cqw]" style={{ color: C.ink }}>
        <div className="text-[1.4cqw] font-semibold uppercase tracking-[0.12em]" style={{ color: C.acc }}>ECS 171 · Group 15</div>
        <div>
          <h1 className="m-0 text-[5.6cqw] font-bold leading-[1.05] tracking-[-0.02em]">Who comes back<br />within 30 days?</h1>
          <p className="m-0 mt-[1.8cqw] max-w-[60cqw] text-[2.2cqw] leading-[1.35]" style={{ color: C.mut }}>
            Predicting hospital readmission for diabetic patients with XGBoost
          </p>
        </div>
        <div className="flex items-end justify-between text-[1.5cqw]" style={{ color: C.mut }}>
          <div><span className="font-semibold" style={{ color: C.ink }}>Nils Fleig · Alex Wong</span></div>
          <div className="text-right">Paper: Chen &amp; Guestrin, <i>XGBoost: A Scalable Tree Boosting System</i>, KDD 2016</div>
        </div>
      </div>
    ),
  },
  {
    title: "The problem",
    speaker: "Nils",
    steps: 2,
    notes: [
      "About 1 in 9 diabetic patients is back in the hospital within 30 days.",
      "[click] That's costly, because Medicare cuts payments to hospitals with too many readmissions.",
      "[click] Our goal is a risk score at discharge, so staff know who to follow up with first.",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="The problem" title={<>About <span style={{ color: C.red }}>1 in 9</span> diabetic patients is back in the hospital within 30 days</>}>
        <div className="flex h-full flex-col gap-[5cqw]">
          <div className="w-[70cqw] pt-[1cqw]"><People /></div>
          <div className="space-y-[1.8cqw]">
            <R at={1}><Point lead="Costly:">Medicare cuts payments to hospitals with high readmission rates</Point></R>
            <R at={2}><Point lead="Goal:" tone="acc">a risk score at discharge, so staff know who to follow up with first</Point></R>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    title: "XGBoost",
    speaker: "Nils",
    steps: 2,
    notes: [
      "XGBoost builds many small decision trees in sequence, each fixing the mistakes of the ones before it.",
      "[click] It adds a penalty on complex trees to avoid overfitting.",
      "[click] And it has a built-in way to handle missing values: at every split it learns which direction missing values should go. That third idea is our focus.",
    ],
    ask: ["The paper's main focus is speed at scale: quantile sketches, cache-aware access, out-of-core training. Those matter on billions of rows, less on our 100k."],
    render: ({ n }) => {
      const cards: [string, string, string][] = [
        ["1", "Trees in sequence", "Each new tree fixes the mistakes of the ones before it"],
        ["2", "Regularization", "A penalty on complex trees keeps it from overfitting"],
        ["3", "Built-in missing values", "Every split learns which way missing values should go"],
      ];
      return (
        <Frame n={n} kicker="Background: the paper" title="XGBoost in three ideas">
          <div className="grid h-[62%] grid-cols-3 gap-[2cqw]">
            {cards.map(([k, h, t], i) => (
              <R key={k} at={i} className="h-full">
                <div
                  className="flex h-full flex-col rounded-[1cqw] p-[2.2cqw]"
                  style={{ background: i === 2 ? C.accSoft : "#f4f6f8", outline: i === 2 ? `0.25cqw solid ${C.acc}` : "none" }}
                >
                  <div className="text-[4cqw] font-bold leading-none" style={{ color: i === 2 ? C.acc : C.faint }}>{k}</div>
                  <div className="mt-[1.6cqw] text-[2.3cqw] font-bold leading-[1.2]">{h}</div>
                  <div className="mt-[1cqw] text-[1.8cqw] leading-[1.35]" style={{ color: C.mut }}>{t}</div>
                  {i === 2 && <div className="mt-auto text-[1.5cqw] font-semibold" style={{ color: C.acc }}>← our focus</div>}
                </div>
              </R>
            ))}
          </div>
        </Frame>
      );
    },
  },
  {
    title: "Our two questions",
    speaker: "Nils",
    steps: 2,
    notes: [
      "The paper shows this is faster. We asked whether it's also more accurate. Two questions:",
      "[click] One, does XGBoost beat logistic regression and random forest?",
      "[click] Two, does its built-in missing-value handling beat filling in values first?",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="What we tested" title="The paper says it's faster. Is it also more accurate?">
        <div className="grid grid-cols-2 gap-[2.4cqw] pt-[3cqw]">
          {[
            ["Q1", "Does XGBoost beat logistic regression and random forest?"],
            ["Q2", "Does its built-in missing-value handling beat filling in the values first?"],
          ].map(([k, t], i) => (
            <R key={k} at={i + 1}>
              <div className="min-h-[22cqw] rounded-[1cqw] p-[2.8cqw]" style={{ background: "#f4f6f8" }}>
                <div className="text-[4.4cqw] font-bold leading-none" style={{ color: C.acc }}>{k}</div>
                <div className="mt-[1.6cqw] text-[2.8cqw] font-semibold leading-[1.25]">{t}</div>
              </div>
            </R>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    title: "The data",
    speaker: "Alex",
    steps: 2,
    notes: [
      "Our data is about 99,000 hospital visits from 70,000 diabetic patients at 130 US hospitals. We removed visits that ended in death or hospice, since those patients can't come back.",
      "[click] Only 11.4% are readmitted,",
      "[click] so accuracy is useless: always guessing 'no' is 89% accurate. We use PR-AUC, which rewards finding the rare readmissions. Random guessing scores 0.114.",
    ],
    ask: ["PR-AUC: area under the precision-recall curve. A random guess scores the base rate, 0.114."],
    render: ({ n }) => (
      <Frame n={n} kicker="Data" title="UCI Diabetes 130-US Hospitals">
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-4 gap-[2cqw]">
            <Stat value="99,340" label="hospital visits" />
            <Stat value="69,987" label="patients" />
            <Stat value="130" label="US hospitals" />
            <Stat value="10 years" label="1999 to 2008" />
          </div>
          <div className="mt-[0.8cqw] text-[1.25cqw]" style={{ color: C.faint }}>After removing 2,423 visits that ended in death or hospice</div>
          <R at={1} className="mt-[3cqw]">
            <div className="flex h-[3.6cqw] w-full overflow-hidden rounded-[0.6cqw]" style={{ background: "#e6eaee" }}>
              <div className="flex items-center pl-[1cqw] text-[1.6cqw] font-bold text-white" style={{ width: "11.4%", background: C.red }}>11.4%</div>
            </div>
            <div className="mt-[0.8cqw] text-[2cqw]"><span className="font-bold" style={{ color: C.red }}>11.4%</span> are readmitted within 30 days</div>
          </R>
          <R at={2} className="mt-[2.2cqw]">
            <Point lead="So accuracy is useless:">always saying &ldquo;no&rdquo; is 89% accurate. We use <b>PR-AUC</b>, which rewards finding the rare readmissions. Random guessing scores 0.114.</Point>
          </R>
        </div>
      </Frame>
    ),
  },
  {
    title: "Strongest signal",
    speaker: "Alex",
    steps: 1,
    notes: [
      "The strongest signal is prior hospital stays.",
      "[click] A patient with no stays in the past year has a 9% chance of coming back. With five or more it's 37%. That's four times the risk.",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="Data" title="Patients who were in the hospital before come back more">
        <div className="flex h-full gap-[3cqw]">
          <div className="h-full w-[60%]"><PriorVisits /></div>
          <R at={1} className="flex flex-col justify-center">
            <div className="text-[5cqw] font-bold leading-none"><span>9%</span><span style={{ color: C.faint }}> → </span><span style={{ color: C.red }}>37%</span></div>
            <div className="mt-[1cqw] text-[2cqw] leading-[1.3]" style={{ color: C.mut }}>from no prior stays to five or more: <b style={{ color: C.ink }}>4× the risk</b></div>
          </R>
        </div>
      </Frame>
    ),
  },
  {
    title: "Missing data",
    speaker: "Alex",
    steps: 2,
    notes: [
      "Lots of data is missing. Weight is missing 97% of the time, and the A1C blood test wasn't run in 83% of visits.",
      "[click] And missing can mean something: patients who didn't get the test were readmitted 11.7% of the time versus 9.9% for those who did.",
      "[click] A test not being ordered is information. That's why the missing-value question matters.",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="Data" title="A lot is missing, and missing can mean something">
        <div className="flex h-full gap-[3cqw]">
          <div className="w-[56%]">
            <div className="mb-[0.6cqw] text-[1.4cqw]" style={{ color: C.mut }}>Share of visits where the value is missing</div>
            <Missingness />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-[2cqw]">
            <R at={1}>
              <div className="text-[1.6cqw] font-semibold" style={{ color: C.mut }}>Readmitted within 30 days</div>
              <div className="mt-[0.8cqw] grid grid-cols-2 gap-[1.4cqw]">
                <Stat value="9.9%" label="A1C test run" tone="ink" />
                <Stat value="11.7%" label="A1C test not run" tone="red" />
              </div>
            </R>
            <R at={2}><Answer>A test not being ordered is information</Answer></R>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    title: "How we tested",
    speaker: "Alex, then Nils",
    steps: 3,
    notes: [
      "Alex: Many patients appear more than once, so we split train and test by patient. Otherwise the same person would be in both and the score would be inflated.",
      "[click] Nils: We trained logistic regression, random forest and XGBoost,",
      "[click] tuned each with cross-validation, and used the test set once.",
      "[click] One detail: normal encoding turns a missing value into all zeros, which hides it. We keep it as missing so XGBoost's own handling actually runs.",
    ],
    ask: ["Tuning: random search, 3-fold cross-validation grouped by patient. The missing-value comparison used 5-fold, also grouped by patient."],
    render: ({ n }) => {
      const steps: [string, string][] = [
        ["Split by patient", "80% train, 20% test. 16,341 patients have repeat visits"],
        ["3 models", "Logistic regression, random forest, XGBoost"],
        ["Tune, then test once", "Cross-validation, scored by PR-AUC. Test set used once"],
      ];
      return (
        <Frame n={n} kicker="Method" title="How we tested">
          <div className="flex h-full flex-col">
            <div className="grid grid-cols-3 gap-[1.6cqw]">
              {steps.map(([h, t], i) => (
                <R key={h} at={i}>
                  <div className="h-full rounded-[1cqw] p-[1.8cqw]" style={{ background: "#f4f6f8" }}>
                    <div className="text-[1.3cqw] font-semibold" style={{ color: C.acc }}>Step {i + 1}</div>
                    <div className="mt-[0.4cqw] text-[2.2cqw] font-bold">{h}</div>
                    <div className="mt-[0.6cqw] text-[1.6cqw] leading-[1.35]" style={{ color: C.mut }}>{t}</div>
                  </div>
                </R>
              ))}
            </div>
            <R at={3} className="mt-[2.6cqw]">
              <div className="flex items-center gap-[3cqw] rounded-[1cqw] p-[1.8cqw]" style={{ outline: `0.2cqw solid ${C.acc}` }}>
                <div className="flex-1 text-[1.9cqw] leading-[1.35]">
                  <b>Keeping missing values visible.</b> One-hot encoding turns a missing race into all zeros, which hides it. We keep it missing so XGBoost&apos;s own handling actually runs.
                </div>
                <table className="text-center text-[1.5cqw] tabular-nums">
                  <thead><tr style={{ color: C.mut }}><th className="px-[0.8cqw] font-normal"></th><th className="px-[0.8cqw] font-normal">White</th><th className="px-[0.8cqw] font-normal">Black</th><th className="px-[0.8cqw] font-normal">…</th></tr></thead>
                  <tbody>
                    <tr><td className="pr-[0.8cqw] text-right" style={{ color: C.mut }}>usual</td><td>0</td><td>0</td><td>0</td></tr>
                    <tr className="font-bold" style={{ color: C.acc }}><td className="pr-[0.8cqw] text-right">ours</td><td>NaN</td><td>NaN</td><td>NaN</td></tr>
                  </tbody>
                </table>
              </div>
            </R>
          </div>
        </Frame>
      );
    },
  },
  {
    title: "Q1 results",
    speaker: "Nils",
    steps: 3,
    notes: [
      "XGBoost scored 0.262, random forest 0.258, logistic regression 0.237, and random guessing 0.114.",
      "[click] XGBoost clearly beats logistic regression.",
      "[click] But against random forest the gap is within noise: the interval includes zero.",
      "[click] So XGBoost is the best, but only clearly beats logistic regression.",
    ],
    ask: [
      "ROC-AUC: XGBoost 0.689, random forest 0.681, logistic regression 0.670. On ROC-AUC XGBoost does beat random forest (CI 0.004 to 0.013).",
      "Cross-validation PR-AUC was 0.226, a bit lower than the test score. The CV number is the safer estimate.",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="Results · Q1" title="Does XGBoost beat the other models?">
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-[1.75fr_1fr] items-center gap-[2.4cqw]">
            <ModelDots />
            <div className="space-y-[1.6cqw]">
              <R at={1}><Gap vs="logistic regression" d="+0.025" ci="0.015 to 0.035" ok /></R>
              <R at={2}><Gap vs="random forest" d="+0.005" ci="−0.002 to 0.012" /></R>
            </div>
          </div>
          <R at={3} className="mt-auto"><Answer>XGBoost is the best, but it only clearly beats logistic regression</Answer></R>
        </div>
      </Frame>
    ),
  },
  {
    title: "Q2 results",
    speaker: "Nils",
    steps: 2,
    notes: [
      "Built-in handling scored slightly higher than filling in values, and tied with treating missing as its own category. KNN filling took 46 seconds per run and gained nothing.",
      "[click] To find out why, we hid values completely at random. The edge disappeared.",
      "[click] So the built-in advantage exists because missing values carry real information, not because it recovers lost data.",
    ],
    ask: [
      "The gains are small: about 0.0025 PR-AUC over mode and KNN, with a fold-to-fold SD of about 0.0017.",
      "Regularization: shrinkage (the learning rate) was the part of the paper's regularization that mattered most here.",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="Results · Q2" title="Does built-in missing handling beat filling in values?">
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-[1.15fr_1fr] gap-[3cqw]">
            <div><Strategies /></div>
            <R at={1}>
              <div className="text-[1.5cqw] font-semibold">If values go missing at random, the edge disappears</div>
              <Masking />
            </R>
          </div>
          <R at={2} className="mt-auto"><Answer>Slightly, and only because missing values carry real information</Answer></R>
        </div>
      </Frame>
    ),
  },
  {
    title: "What drives predictions",
    speaker: "Alex",
    steps: 0,
    notes: [
      "Using SHAP, the biggest drivers are the number of hospital stays in the past year and where the patient goes after discharge, far above anything else. This matches what we saw in the data.",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="Inside the model" title="What drives the predictions">
        <div className="flex h-full items-center gap-[3cqw]">
          <div className="w-[66%]"><Drivers /></div>
          <R at={0} className="flex-1">
            <div className="text-[2.4cqw] font-bold leading-[1.25]" style={{ color: C.acc }}>Past stays and discharge destination</div>
            <div className="mt-[1cqw] text-[1.8cqw] leading-[1.35]" style={{ color: C.mut }}>matter far more than anything else</div>
          </R>
        </div>
      </Frame>
    ),
  },
  {
    title: "Using it",
    speaker: "Alex",
    steps: 3,
    notes: [
      "Because readmissions are rare, we choose a cutoff.",
      "[click] At our cutoff we flag 26% of patients, catch 49% of readmissions, and about 1 in 5 flags is correct.",
      "[click] If staff can only call the top 5%, 38% of those really come back, 3.3 times the normal rate.",
      "[click] So it's best for ordering a follow-up list, not for yes/no decisions.",
    ],
    ask: ["Class weights: we tried them for all three models and they didn't improve PR-AUC, so we handle the imbalance with the cutoff instead. The cutoff is the one with the best F1 score, 13.7%."],
    render: ({ n }) => (
      <Frame n={n} kicker="Using the model" title="Readmissions are rare, so we choose a cutoff">
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-2 gap-[2.4cqw]">
            <R at={1}>
              <div className="h-full rounded-[1cqw] p-[2cqw]" style={{ background: "#f4f6f8" }}>
                <div className="text-[1.5cqw] font-semibold" style={{ color: C.mut }}>At the cutoff: flag 26% of patients</div>
                <div className="mt-[1cqw] text-[4cqw] font-bold leading-none" style={{ color: C.acc }}>49%</div>
                <div className="mt-[0.6cqw] text-[1.7cqw]">of readmissions caught</div>
                <div className="mt-[0.6cqw] text-[1.7cqw]" style={{ color: C.mut }}>1 in 5 flags is right</div>
              </div>
            </R>
            <R at={2}>
              <div className="h-full rounded-[1cqw] p-[2cqw]" style={{ background: "#f4f6f8" }}>
                <div className="text-[1.5cqw] font-semibold" style={{ color: C.mut }}>Call only the top 5%</div>
                <div className="mt-[1cqw] text-[4cqw] font-bold leading-none" style={{ color: C.acc }}>38%</div>
                <div className="mt-[0.6cqw] text-[1.7cqw]">of them are readmitted</div>
                <div className="mt-[0.6cqw] text-[1.7cqw]" style={{ color: C.mut }}>3.3× the base rate</div>
              </div>
            </R>
          </div>
          <R at={3} className="mt-auto"><Answer>Best used to order a follow-up list, not to make yes/no calls</Answer></R>
        </div>
      </Frame>
    ),
  },
  {
    title: "Live demo",
    speaker: "Alex",
    steps: 0,
    demo: true,
    notes: [
      "This runs the same trained model entirely in the browser.",
      "[Click 'Example: lower risk'] A younger patient, short stay, no prior visits: low risk, below our follow-up threshold.",
      "[Click 'Example: higher risk'] An older patient, long stay, five prior visits, sent to rehab: flagged for follow-up.",
      "[Set 'Inpatient visits, past year' to 0, click Predict] Risk drops. Prior visits matter most. (25% to about 17%, still just above the 13.7% cutoff.)",
      "[Point at 'What moved this prediction'] These are SHAP values, showing which inputs pushed the risk up or down.",
      "[Press Esc or click outside the form, then →] If asked: fields not on the form use typical values or are left missing, so the numbers are illustrative.",
    ],
    render: ({ model }) => <div className="select-text"><Demo model={model} /></div>,
  },
  {
    title: "Fairness",
    speaker: "Nils",
    steps: 3,
    notes: [
      "Does it work equally well for everyone? For the two largest racial groups, it catches about half of readmissions.",
      "[click] For small groups we have too few cases to tell, so we can't confirm it works for them.",
      "[click] It also ranks patients over 70 worse.",
      "[click] So we'd use it only to offer extra help, with a clinician deciding, and audit it first.",
    ],
    ask: [
      "Removing race barely changes the score, but payer and prior visits can act as proxies for access to care.",
      "Gender: recall is about 0.48 for men and 0.51 for women.",
    ],
    render: ({ n }) => (
      <Frame n={n} kicker="Ethics" title="Does it work equally well for everyone?">
        <div className="flex h-full flex-col">
          <div className="grid grid-cols-[1.3fr_1fr] gap-[3cqw]">
            <Recall />
            <div className="flex flex-col gap-[2cqw] pt-[0.5cqw]">
              <R at={1}><Point lead="Small groups:">too few cases to tell. We can&apos;t confirm it works for them.</Point></R>
              <R at={2}><Point lead="Older patients:">ranked worse. ROC-AUC 0.73 under 50, 0.66 over 70.</Point></R>
            </div>
          </div>
          <R at={3} className="mt-auto"><Answer>Use it to offer extra help, with a clinician deciding. Audit it first.</Answer></R>
        </div>
      </Frame>
    ),
  },
  {
    title: "Takeaways",
    speaker: "Nils",
    steps: 3,
    notes: [
      "Three lessons. One: XGBoost was best, but only by a little. The data limits every model.",
      "[click] Two: keep missing values visible. It matters more than how you fill them in.",
      "[click] Three: this is a ranking tool, not a decision tool.",
      "[click] Thank you, questions?",
    ],
    render: ({ n }) => {
      const t: [string, string][] = [
        ["XGBoost was best, but only by a little.", "The data limits every model."],
        ["Keep missing values visible.", "It matters more than how you fill them in."],
        ["A ranking tool, not a decision tool.", "Good for ordering a follow-up list."],
      ];
      return (
        <Frame n={n} kicker="Takeaways" title="What we learned">
          <div className="flex h-full flex-col">
            <div className="space-y-[2cqw]">
              {t.map(([a, b], i) => (
                <R key={a} at={i}>
                  <div className="flex items-baseline gap-[2cqw]">
                    <div className="w-[3cqw] text-[3.4cqw] font-bold" style={{ color: C.acc }}>{i + 1}</div>
                    <div className="text-[2.5cqw] leading-[1.25]"><b>{a}</b> <span style={{ color: C.mut }}>{b}</span></div>
                  </div>
                </R>
              ))}
            </div>
            <R at={3} className="mt-auto">
              <div className="flex items-end justify-between">
                <div className="text-[4.4cqw] font-bold" style={{ color: C.acc }}>Thank you. Questions?</div>
                <div className="text-right text-[1.5cqw]" style={{ color: C.mut }}>Nils Fleig · Alex Wong<br />Try the demo: nilsfleig.com/171</div>
              </div>
            </R>
          </div>
        </Frame>
      );
    },
  },
];

// Runs the ECS 171 Group 15 readmission model in the browser.
// Mirrors app/app.py from the project repo: the same one-hot encoder
// (missing="nan" mode), the same XGBoost trees, and TreeSHAP contributions
// for the "what moved this prediction" list.

export type Tree = {
  l: number[]; // left child, -1 at a leaf
  r: number[]; // right child
  f: number[]; // split feature index
  c: number[]; // split threshold, or the leaf value at a leaf
  d: number[]; // 1 if missing values go left
  h: number[]; // cover (sum of hessians)
};

export type ModelData = {
  base_score: string | number;
  trees: Tree[];
  num: string[];
  cat: string[];
  levels: Record<string, string[]>;
  names: string[];
  threshold: number;
  base_rate: number;
  defaults: Record<string, number | string | null>;
  columns: string[];
};

export type Factor = { name: string; effect: number };
export type Prediction = {
  probability: number;
  threshold: number;
  base_rate: number;
  flagged: boolean;
  factors: Factor[];
};

type Value = number | string | null | undefined;

const NICE: Record<string, string> = {
  number_inpatient: "Prior inpatient visits",
  number_emergency: "Prior ER visits",
  number_outpatient: "Prior outpatient visits",
  number_diagnoses: "Number of diagnoses",
  time_in_hospital: "Days in hospital",
  num_medications: "Number of medications",
  num_lab_procedures: "Lab procedures",
  num_procedures: "Procedures",
  age_mid: "Age",
  a1c_ord: "A1C result",
  glu_ord: "Glucose test",
  weight_mid: "Weight",
  discharge_disposition: "Discharge destination",
  diag_1_group: "Primary diagnosis",
  diag_2_group: "Secondary diagnosis",
  diag_3_group: "Third diagnosis",
  insulin: "Insulin",
  admission_type: "Admission type",
  admission_source: "Admission source",
  medical_specialty: "Doctor specialty",
  payer_code: "Payer",
  race: "Race",
  gender: "Gender",
  diabetesMed: "On diabetes meds",
  change: "Meds changed",
};

// The demo doesn't ask for these, so they're left blank instead of guessing.
const LEFT_MISSING = [
  "race", "payer_code", "medical_specialty", "weight_mid", "glu_ord",
  "admission_type", "admission_source", "diag_2_group", "diag_3_group",
];

const FORM_FIELDS = new Set([
  "age_mid", "gender", "time_in_hospital", "num_medications", "number_inpatient",
  "number_emergency", "number_diagnoses", "a1c_ord", "diag_1_group", "discharge_disposition",
]);

const isMissing = (v: Value) => v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v));

function baseMargin(bs: string | number): number {
  const p = typeof bs === "number" ? bs : parseFloat(String(bs).replace(/[[\]]/g, ""));
  return Math.log(p / (1 - p));
}

/** Builds the full input row the same way app.py's row_from does. */
export function rowFrom(m: ModelData, form: Record<string, Value>): Record<string, Value> {
  const r: Record<string, Value> = { ...m.defaults };
  for (const c of LEFT_MISSING) r[c] = null;
  for (const [k, v] of Object.entries(form)) if (m.columns.includes(k)) r[k] = isMissing(v) ? null : v;
  return r;
}

/** One-hot encoder, missing="nan": a missing category makes all its dummies NaN. */
export function encode(m: ModelData, row: Record<string, Value>): Float64Array {
  const z: number[] = [];
  for (const c of m.num) {
    const v = row[c];
    const n = isMissing(v) ? NaN : Number(v);
    z.push(Number.isNaN(n) ? NaN : Math.fround(n));
  }
  for (const c of m.cat) {
    const v = row[c];
    const miss = isMissing(v);
    const s = miss ? "" : String(v);
    const lv = m.levels[c];
    for (const l of lv) z.push(miss ? NaN : s === l ? 1 : 0);
    z.push(miss ? NaN : lv.includes(s) ? 0 : 1); // "=rare"
  }
  if (z.length !== m.names.length) throw new Error(`encoded ${z.length} features, expected ${m.names.length}`);
  return Float64Array.from(z);
}

function hotChild(t: Tree, n: number, x: Float64Array): number {
  const v = x[t.f[n]];
  if (Number.isNaN(v)) return t.d[n] ? t.l[n] : t.r[n];
  return v < t.c[n] ? t.l[n] : t.r[n];
}

function treeValue(t: Tree, x: Float64Array): number {
  let n = 0;
  while (t.l[n] !== -1) n = hotChild(t, n, x);
  return t.c[n];
}

// ---- TreeSHAP (Lundberg et al. 2018, algorithm 2) ----
type El = { d: number; z: number; o: number; w: number };

function extend(p: El[], u: number, z: number, o: number, d: number) {
  p[u] = { d, z, o, w: u === 0 ? 1 : 0 };
  for (let i = u - 1; i >= 0; i--) {
    p[i + 1].w += (o * p[i].w * (i + 1)) / (u + 1);
    p[i].w = (z * p[i].w * (u - i)) / (u + 1);
  }
}

function unwind(p: El[], u: number, k: number) {
  const o = p[k].o, z = p[k].z;
  let next = p[u].w;
  for (let i = u - 1; i >= 0; i--) {
    if (o !== 0) {
      const tmp = p[i].w;
      p[i].w = (next * (u + 1)) / ((i + 1) * o);
      next = tmp - (p[i].w * z * (u - i)) / (u + 1);
    } else {
      p[i].w = (p[i].w * (u + 1)) / (z * (u - i));
    }
  }
  for (let i = k; i < u; i++) p[i] = { ...p[i + 1], w: p[i].w };
}

function unwoundSum(p: El[], u: number, k: number): number {
  const o = p[k].o, z = p[k].z;
  let next = p[u].w, total = 0;
  for (let i = u - 1; i >= 0; i--) {
    if (o !== 0) {
      const tmp = (next * (u + 1)) / ((i + 1) * o);
      total += tmp;
      next = p[i].w - (tmp * z * (u - i)) / (u + 1);
    } else {
      total += p[i].w / z / ((u - i) / (u + 1));
    }
  }
  return total;
}

function shapRecurse(t: Tree, x: Float64Array, phi: Float64Array, n: number, parent: El[], u: number, pz: number, po: number, pf: number) {
  const p = parent.slice(0, u).map((e) => ({ ...e }));
  extend(p, u, pz, po, pf);
  if (t.l[n] === -1) {
    for (let i = 1; i <= u; i++) {
      const w = unwoundSum(p, u, i);
      phi[p[i].d] += w * (p[i].o - p[i].z) * t.c[n];
    }
    return;
  }
  const hot = hotChild(t, n, x);
  const cold = hot === t.l[n] ? t.r[n] : t.l[n];
  let iz = 1, io = 1, k = 1;
  for (; k <= u; k++) if (p[k].d === t.f[n]) break;
  if (k <= u) {
    iz = p[k].z; io = p[k].o;
    unwind(p, u, k);
    u -= 1;
  }
  const cover = t.h[n];
  shapRecurse(t, x, phi, hot, p, u + 1, (t.h[hot] / cover) * iz, io, t.f[n]);
  shapRecurse(t, x, phi, cold, p, u + 1, (t.h[cold] / cover) * iz, 0, t.f[n]);
}

export function contributions(m: ModelData, x: Float64Array): Float64Array {
  const phi = new Float64Array(m.names.length);
  for (const t of m.trees) shapRecurse(t, x, phi, 0, [], 0, 1, 1, -1);
  return phi;
}

export function margin(m: ModelData, x: Float64Array): number {
  let s = baseMargin(m.base_score);
  for (const t of m.trees) s += treeValue(t, x);
  return s;
}

/** Same output as POST /predict in app.py. */
export function predict(m: ModelData, form: Record<string, Value>): Prediction {
  const x = encode(m, rowFrom(m, form));
  const probability = 1 / (1 + Math.exp(-margin(m, x)));
  const phi = contributions(m, x);
  const total = new Map<string, number>();
  m.names.forEach((n, i) => {
    const col = n.split("=")[0];
    total.set(col, (total.get(col) ?? 0) + phi[i]);
  });
  const factors = Array.from(total.entries())
    .filter(([k]) => FORM_FIELDS.has(k))
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5)
    .map(([k, v]) => ({ name: NICE[k] ?? k, effect: v }));
  return { probability, threshold: m.threshold, base_rate: m.base_rate, flagged: probability >= m.threshold, factors };
}

export type Explanation = {
  probability: number;
  /** Model output for an average patient (the TreeSHAP expected value), as a probability. */
  start: number;
  startMargin: number;
  /** Per input column, its push in log-odds. Sums to margin - startMargin. */
  steps: { key: string; name: string; phi: number; onForm: boolean }[];
};

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
export const niceName = (k: string) => NICE[k] ?? k;
export const isFormField = (k: string) => FORM_FIELDS.has(k);

/** Full TreeSHAP breakdown of one prediction, grouped by input column. */
export function explain(m: ModelData, form: Record<string, Value>): Explanation {
  const x = encode(m, rowFrom(m, form));
  const z = margin(m, x);
  const phi = contributions(m, x);
  const total = new Map<string, number>();
  m.names.forEach((n, i) => {
    const col = n.split("=")[0];
    total.set(col, (total.get(col) ?? 0) + phi[i]);
  });
  const sum = Array.from(total.values()).reduce((a, b) => a + b, 0);
  const startMargin = z - sum;
  const steps = Array.from(total.entries()).map(([key, v]) => ({ key, name: niceName(key), phi: v, onForm: FORM_FIELDS.has(key) }));
  return { probability: sigmoid(z), start: sigmoid(startMargin), startMargin, steps };
}

/** Probability only, for sweeps. */
export function prob(m: ModelData, form: Record<string, Value>): number {
  return sigmoid(margin(m, encode(m, rowFrom(m, form))));
}

export type PathStep = { node: number; feature: string; threshold: number; value: number; missing: boolean; left: boolean; defaultLeft: boolean };

/** The route one patient takes through tree t, and the leaf value it ends on. */
export function treePath(m: ModelData, t: number, form: Record<string, Value>): { steps: PathStep[]; leaf: number } {
  const tree = m.trees[t];
  const x = encode(m, rowFrom(m, form));
  const steps: PathStep[] = [];
  let n = 0;
  while (tree.l[n] !== -1) {
    const v = x[tree.f[n]];
    const missing = Number.isNaN(v);
    const next = hotChild(tree, n, x);
    steps.push({ node: n, feature: m.names[tree.f[n]], threshold: tree.c[n], value: v, missing, left: next === tree.l[n], defaultLeft: !!tree.d[n] });
    n = next;
  }
  return { steps, leaf: tree.c[n] };
}

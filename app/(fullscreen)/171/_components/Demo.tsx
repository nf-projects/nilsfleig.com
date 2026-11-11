"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { predict, type ModelData, type Prediction } from "@/lib/readmission/model";

const EXAMPLES: Record<"low" | "high", Record<string, string>> = {
  low: {
    age_mid: "55", gender: "Female", time_in_hospital: "2", num_medications: "8", number_inpatient: "0",
    number_emergency: "0", number_diagnoses: "4", a1c_ord: "0", diag_1_group: "Musculoskeletal", discharge_disposition: "1",
  },
  high: {
    age_mid: "75", gender: "Male", time_in_hospital: "9", num_medications: "25", number_inpatient: "5",
    number_emergency: "2", number_diagnoses: "9", a1c_ord: "", diag_1_group: "Circulatory", discharge_disposition: "22",
  },
};

const field = "mt-[0.3cqw] block w-full rounded-[0.4cqw] border border-[#d6dbe1] bg-white px-[0.6cqw] py-[0.45cqw] text-[1.25cqw] text-[#17212b] outline-none focus:border-[#1f4e79]";
const label = "block text-[1.05cqw] font-semibold text-[#17212b]";

export default function Demo({ model }: { model: ModelData | null }): JSX.Element {
  const form = useRef<HTMLFormElement>(null);
  const [out, setOut] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    if (!model || !form.current) return;
    try {
      const data = Object.fromEntries(new FormData(form.current)) as Record<string, string>;
      setOut(predict(model, data));
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }

  function example(which: "low" | "high") {
    const f = form.current;
    if (!f) return;
    for (const [k, v] of Object.entries(EXAMPLES[which])) {
      const el = f.elements.namedItem(k) as HTMLInputElement | HTMLSelectElement | null;
      if (el) el.value = v;
    }
    run();
  }

  useEffect(() => {
    if (model) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run();
  };

  return (
    <div className="absolute inset-0 bg-white px-[4.5cqw] pt-[3cqw] text-[#17212b]" style={{ fontFamily: "Calibri, Carlito, 'Segoe UI', system-ui, sans-serif" }}>
      <h2 className="m-0 text-[2.4cqw] font-bold text-[#1f4e79]">Live demo: 30-day readmission risk</h2>
      <p className="m-0 mt-[0.4cqw] text-[1.2cqw] text-[#5b6773]">
        XGBoost trained on the UCI Diabetes 130-US Hospitals data. It runs entirely in this browser, with the same encoder and trees as the tested model.
      </p>
      <div className="mt-[1.6cqw] grid grid-cols-[1.25fr_1fr] gap-[1.6cqw]">
        <form ref={form} onSubmit={onSubmit} className="grid grid-cols-2 gap-x-[1.2cqw] gap-y-[0.9cqw] rounded-[0.8cqw] border border-[#d6dbe1] bg-[#f6f7f9] p-[1.4cqw]">
          <label className={label}>Age
            <select name="age_mid" defaultValue="75" className={field}>
              <option value="35">30-39</option><option value="45">40-49</option><option value="55">50-59</option>
              <option value="65">60-69</option><option value="75">70-79</option><option value="85">80-89</option>
            </select>
          </label>
          <label className={label}>Gender
            <select name="gender" className={field}><option>Female</option><option>Male</option></select>
          </label>
          <label className={label}>Days in hospital
            <input name="time_in_hospital" type="number" min={1} max={14} defaultValue={4} className={field} />
          </label>
          <label className={label}>Number of medications
            <input name="num_medications" type="number" min={1} max={81} defaultValue={15} className={field} />
          </label>
          <label className={label}>Inpatient visits, past year
            <input name="number_inpatient" type="number" min={0} max={21} defaultValue={0} className={field} />
          </label>
          <label className={label}>ER visits, past year
            <input name="number_emergency" type="number" min={0} max={76} defaultValue={0} className={field} />
          </label>
          <label className={label}>Number of diagnoses
            <input name="number_diagnoses" type="number" min={1} max={16} defaultValue={8} className={field} />
          </label>
          <label className={label}>A1C result
            <select name="a1c_ord" className={field}>
              <option value="">Not measured</option><option value="0">Normal</option><option value="1">&gt;7</option><option value="2">&gt;8</option>
            </select>
          </label>
          <label className={label}>Primary diagnosis
            <select name="diag_1_group" className={field}>
              {["Circulatory", "Respiratory", "Digestive", "Diabetes", "Injury", "Musculoskeletal", "Genitourinary", "Neoplasms", "Other"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className={label}>Discharged to
            <select name="discharge_disposition" className={field}>
              <option value="1">Home</option><option value="6">Home with home health</option><option value="3">Skilled nursing facility</option>
              <option value="22">Rehab facility</option><option value="2">Another short term hospital</option>
            </select>
          </label>
          <div className="col-span-2 mt-[0.4cqw] flex flex-wrap gap-[0.7cqw]">
            <button type="submit" disabled={!model} className="rounded-[0.4cqw] border border-[#1f4e79] bg-[#1f4e79] px-[1.1cqw] py-[0.6cqw] text-[1.2cqw] font-semibold text-white disabled:opacity-50">Predict</button>
            <button type="button" disabled={!model} onClick={() => example("low")} className="rounded-[0.4cqw] border border-[#1f4e79] bg-white px-[1.1cqw] py-[0.6cqw] text-[1.2cqw] font-semibold text-[#1f4e79] disabled:opacity-50">Example: lower risk</button>
            <button type="button" disabled={!model} onClick={() => example("high")} className="rounded-[0.4cqw] border border-[#1f4e79] bg-white px-[1.1cqw] py-[0.6cqw] text-[1.2cqw] font-semibold text-[#1f4e79] disabled:opacity-50">Example: higher risk</button>
          </div>
        </form>
        <section aria-live="polite" className="rounded-[0.8cqw] border border-[#d6dbe1] p-[1.4cqw]">
          <div className="text-[1.15cqw] text-[#5b6773]">Predicted risk</div>
          <div className="text-[4.6cqw] font-bold leading-[1.1]">{out ? `${(out.probability * 100).toFixed(1)}%` : model ? "--" : "Loading model…"}</div>
          <div className={`mt-[0.4cqw] text-[1.4cqw] font-bold ${out?.flagged ? "text-[#b3261e]" : "text-[#17212b]"}`}>
            {error ? `Error: ${error}` : out ? (out.flagged ? "▲ Flag for follow-up" : "○ Below follow-up threshold") : ""}
          </div>
          {out && (
            <div className="mt-[0.3cqw] text-[1.1cqw] text-[#5b6773]">
              Average patient: {(out.base_rate * 100).toFixed(1)}%. Follow-up threshold: {(out.threshold * 100).toFixed(1)}%.
            </div>
          )}
          <h3 className="m-0 mt-[1.4cqw] text-[1.3cqw] font-bold">What moved this prediction</h3>
          <ul className="m-0 mt-[0.5cqw] list-none p-0">
            {out?.factors.map((f) => (
              <li key={f.name} className="flex justify-between gap-[1cqw] border-t border-[#d6dbe1] py-[0.5cqw] text-[1.25cqw]">
                <span>{f.name}</span>
                <span className={f.effect > 0 ? "text-[#b3261e]" : "text-[#1f6f3f]"}>{f.effect > 0 ? "▲ raises" : "▼ lowers"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="absolute bottom-[2.2cqw] left-[4.5cqw] m-0 text-[1cqw] text-[#5b6773]">
        Class project only, not for clinical use. Data is from 1999-2008. Fields not on this form use typical values or are left missing.
      </p>
      <p className="absolute bottom-[2.2cqw] right-[4.5cqw] m-0 text-[1cqw] text-[#5b6773]">Alex</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function PracticalActivityBlock({ block }) {
  const steps = Array.isArray(block.steps) ? block.steps : [];
  const [checked, setChecked] = useState([]);
  const complete = steps.length > 0 && checked.length === steps.length;

  const toggle = (index) => {
    setChecked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  };

  return (
    <ActivityShell icon={<ClipboardCheck size={17} />} eyebrow="Apply what you learned" title={block.title} tone="emerald">
      <p className="text-xs font-medium leading-relaxed text-slate-600">{block.instructions}</p>
      <div className="mt-4 space-y-2">
        {steps.map((step, index) => {
          const done = checked.includes(index);
          return (
            <label key={index} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${done ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"}`}>
              <input type="checkbox" checked={done} onChange={() => toggle(index)} className="mt-0.5 accent-emerald-600" />
              <span className={`text-xs font-semibold leading-relaxed ${done ? "text-emerald-800 line-through" : "text-slate-700"}`}>{step}</span>
            </label>
          );
        })}
      </div>
      {complete && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed"><span className="font-black">Expected outcome: </span>{block.expectedOutcome}</p>
        </div>
      )}
      <div className="mt-3 rounded-xl bg-violet-50 p-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-violet-700">Reflect</p>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{block.reflectionQuestion}</p>
      </div>
    </ActivityShell>
  );
}

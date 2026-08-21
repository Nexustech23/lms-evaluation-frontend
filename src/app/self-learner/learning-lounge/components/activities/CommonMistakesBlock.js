"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function CommonMistakesBlock({ block }) {
  const [open, setOpen] = useState(0);
  const items = Array.isArray(block.items) ? block.items : [];
  if (!items.length) return null;

  return (
    <ActivityShell icon={<AlertTriangle size={17} />} eyebrow="Learn from mistakes" title={block.title} tone="amber">
      <div className="space-y-2">
        {items.map((item, index) => {
          const expanded = open === index;
          return (
            <div key={index} className="overflow-hidden rounded-xl border border-amber-200 bg-white">
              <button type="button" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                <span className="text-xs font-black text-[#1E1B4B]">{item.mistake}</span>
                <ChevronDown size={15} className={`shrink-0 text-amber-600 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && (
                <div className="border-t border-amber-100 p-4 pt-3">
                  <p className="text-xs font-medium leading-relaxed text-slate-600"><span className="font-black text-amber-700">Why it happens: </span>{item.whyItHappens}</p>
                  <p className="mt-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold leading-relaxed text-emerald-800"><span className="font-black">Better approach: </span>{item.correction}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ActivityShell>
  );
}

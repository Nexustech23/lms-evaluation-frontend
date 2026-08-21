"use client";

import { useState } from "react";
import {
  ArrowRight,
  Clock3,
  Grid3X3,
  ListOrdered,
  MousePointerClick,
  Network,
  Table2,
  Workflow,
} from "lucide-react";

const visualIcons = {
  grid: Grid3X3,
  table: Table2,
  sequence: ListOrdered,
  flow: Workflow,
  timeline: Clock3,
  hierarchy: Network,
};

function VisualHeader({ visual }) {
  const Icon = visualIcons[visual.kind] || Grid3X3;
  return (
    <div>
      <div className="flex items-center gap-2 text-[#6C63FF]">
        <Icon size={15} />
        <span className="text-[9px] font-black uppercase tracking-[0.18em]">Explore the visual · {visual.kind}</span>
      </div>
      <h4 className="mt-2 text-base font-black text-[#1E1B4B]">{visual.title}</h4>
      <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{visual.purpose}</p>
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#F3F1FF] p-3 text-xs font-bold leading-relaxed text-[#4F46E5]">
        <MousePointerClick size={14} className="mt-0.5 shrink-0" /> {visual.interactionPrompt}
      </p>
    </div>
  );
}

function GridOrTableVisual({ visual }) {
  const [selected, setSelected] = useState(null);
  const columns = visual.columnHeaders || [];
  const rows = visual.rows || [];
  const selectedRow = selected ? rows[selected.row] : null;
  const selectedColumn = selected ? columns[selected.column] : null;
  const selectedValue = selectedRow && selected ? selectedRow.values[selected.column] : null;

  return (
    <div className="mt-4">
      <div className="overflow-x-auto rounded-2xl border border-[#6C63FF]/20 bg-white p-3">
        <div
          className="grid min-w-[420px] gap-2"
          style={{ gridTemplateColumns: `minmax(80px, 0.8fr) repeat(${columns.length}, minmax(90px, 1fr))` }}
        >
          <div className="flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-2 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">
            Row / column
          </div>
          {columns.map((header, columnIndex) => (
            <div
              key={`${header}-${columnIndex}`}
              className={`flex min-h-12 items-center justify-center rounded-xl px-2 text-center text-[10px] font-black transition ${selected?.column === columnIndex ? "bg-[#6C63FF] text-white" : "bg-[#ECEAFF] text-[#4F46E5]"}`}
            >
              {header}
            </div>
          ))}

          {rows.flatMap((row, rowIndex) => [
            <div
              key={`label-${row.label}-${rowIndex}`}
              className={`flex min-h-14 items-center justify-center rounded-xl px-2 text-center text-[10px] font-black transition ${selected?.row === rowIndex ? "bg-[#1E1B4B] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {row.label}
            </div>,
            ...row.values.map((value, columnIndex) => {
              const isSelected = selected?.row === rowIndex && selected?.column === columnIndex;
              const isRelated = selected?.row === rowIndex || selected?.column === columnIndex;
              return (
                <button
                  type="button"
                  key={`cell-${rowIndex}-${columnIndex}`}
                  onClick={() => setSelected({ row: rowIndex, column: columnIndex })}
                  className={`min-h-14 rounded-xl border px-3 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 ${isSelected ? "scale-[1.03] border-[#6C63FF] bg-[#6C63FF] text-white shadow-md" : isRelated ? "border-[#A7A1FF] bg-[#F3F1FF] text-[#312E81]" : "border-slate-200 bg-white text-slate-700 hover:border-[#A7A1FF] hover:bg-[#FAF9FF]"}`}
                  aria-label={`${row.label}, ${columns[columnIndex]}: ${value}`}
                >
                  {value}
                </button>
              );
            }),
          ])}
        </div>
      </div>

      {selected ? (
        <div className="mt-3 grid gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-3">
          <p className="text-xs font-semibold text-slate-600"><span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">Row</span>{selectedRow.label}</p>
          <p className="text-xs font-semibold text-slate-600"><span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">Column</span>{selectedColumn}</p>
          <p className="text-xs font-black text-[#1E1B4B]"><span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">Value at intersection</span>{selectedValue}</p>
        </div>
      ) : (
        <p className="mt-3 text-center text-[10px] font-semibold text-slate-400">Select any cell to highlight its row, column, and intersection.</p>
      )}
    </div>
  );
}

function ItemVisual({ visual }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = visual.items || [];
  const selected = items[selectedIndex];
  const horizontal = visual.kind === "sequence" || visual.kind === "flow";

  if (visual.kind === "hierarchy") {
    return (
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <button
            type="button"
            key={`${item.label}-${index}`}
            onClick={() => setSelectedIndex(index)}
            style={{ marginLeft: `${Math.min(item.level || 0, 5) * 20}px`, width: `calc(100% - ${Math.min(item.level || 0, 5) * 20}px)` }}
            className={`block rounded-xl border p-3 text-left transition ${selectedIndex === index ? "border-[#6C63FF] bg-[#6C63FF] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#A7A1FF]"}`}
          >
            <span className="text-[9px] font-black uppercase tracking-wider opacity-70">Level {item.level || 0}</span>
            <span className="mt-0.5 block text-xs font-black">{item.label}{item.value ? ` · ${item.value}` : ""}</span>
          </button>
        ))}
        <SelectedItem item={selected} />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className={horizontal ? "flex items-stretch gap-2 overflow-x-auto pb-2" : "space-y-2"}>
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className={horizontal ? "flex shrink-0 items-center gap-2" : "flex items-center gap-3"}>
            {visual.kind === "timeline" && <div className={`h-3 w-3 shrink-0 rounded-full ${selectedIndex === index ? "bg-[#6C63FF] ring-4 ring-[#E8E5FF]" : "bg-slate-300"}`} />}
            <button
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`${horizontal ? "w-40" : "w-full"} rounded-xl border p-3 text-left transition ${selectedIndex === index ? "border-[#6C63FF] bg-[#6C63FF] text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-[#A7A1FF]"}`}
            >
              {item.value && <span className="block text-[9px] font-black uppercase tracking-wider opacity-70">{item.value}</span>}
              <span className="mt-0.5 block text-xs font-black">{item.label}</span>
            </button>
            {horizontal && index < items.length - 1 && <ArrowRight size={16} className="shrink-0 text-[#6C63FF]" />}
          </div>
        ))}
      </div>
      <SelectedItem item={selected} />
    </div>
  );
}

function SelectedItem({ item }) {
  if (!item) return null;
  return (
    <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-wider text-blue-700">Current focus</p>
      <p className="mt-1 text-xs font-black text-[#1E1B4B]">{item.label}{item.value ? ` · ${item.value}` : ""}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">{item.description}</p>
    </div>
  );
}

export default function StructuredVisualRenderer({ visual }) {
  if (!visual?.kind) return null;
  const isGrid = visual.kind === "grid" || visual.kind === "table";

  return (
    <section className="rounded-2xl border border-[#6C63FF]/20 bg-gradient-to-br from-white to-[#FAF9FF] p-5">
      <VisualHeader visual={visual} />
      {isGrid ? <GridOrTableVisual visual={visual} /> : <ItemVisual visual={visual} />}
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-relaxed text-amber-900">
        <span className="font-black">What this shows: </span>{visual.caption}
      </p>
    </section>
  );
}

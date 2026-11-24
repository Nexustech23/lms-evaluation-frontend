"use client";

// Small pieces shared by the Reports pages: a number tile, a chart card with a "view data" table, and loading boxes.
// A number the app cannot work out is shown as "-" with the reason underneath, never as 0.

import { useState } from "react";
import { FaArrowDown, FaArrowUp, FaMinus } from "react-icons/fa";

export const ANCHOR = "#1d4ed8"; // one anchor colour for chart marks; a failing grade uses the contrasting FAIL colour
export const FAIL = "#dc2626";

export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-2xl bg-white/60 ${className}`} />;
}

export function SectionTitle({ id, children, aside }) {
  return (
    <div id={id} className="scroll-mt-24 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-lg font-bold text-white">{children}</h2>
      {aside}
    </div>
  );
}

// The direction of a change is told with an icon and a word, never by colour alone.
function Comparison({ compare }) {
  if (!compare) return null;
  const Icon = compare.direction === "up" ? FaArrowUp : compare.direction === "down" ? FaArrowDown : FaMinus;
  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
      <Icon aria-hidden="true" className="shrink-0 text-gray-500" size={10} />
      <span className="sr-only">{compare.directionText}: </span>
      <span>{compare.text}</span>
    </p>
  );
}

export function Tile({ label, value, lines = [], reason, compare, progress }) {
  const missing = value === null || value === undefined;
  return (
    <div className="min-w-0 rounded-2xl bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${missing ? "text-gray-400" : "text-gray-900"}`}>{missing ? "-" : value}</p>
      {missing && reason && <p className="mt-1 text-xs text-gray-500">{reason}</p>}
      {!missing && progress !== undefined && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200" role="presentation">
          <div className="h-1.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: ANCHOR }} />
        </div>
      )}
      {!missing && <Comparison compare={compare} />}
      {!missing &&
        lines.map((line) => (
          <p key={line} className="mt-1 text-xs text-gray-600">
            {line}
          </p>
        ))}
    </div>
  );
}

// A chart with a title, a note about what it covers, and a table of the same numbers for people who cannot see the chart.
export function ChartCard({ title, note, empty, emptyText, viewLabel, hideLabel, columns, rows, children, className = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <figure className={`min-w-0 rounded-2xl bg-white p-4 shadow-lg ${className}`}>
      <figcaption className="mb-2">
        <span className="block text-base font-semibold text-gray-900">{title}</span>
        {note && <span className="block text-xs text-gray-500">{note}</span>}
      </figcaption>
      {empty ? (
        <p className="flex h-[220px] items-center justify-center text-center text-sm text-gray-500">{emptyText}</p>
      ) : (
        <>
          <div className="h-[220px] w-full" role="img" aria-label={title}>
            {children}
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-2 rounded px-1 text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            {open ? hideLabel : viewLabel}
          </button>
          {open && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[260px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    {columns.map((c, i) => (
                      <th key={c} className={`py-1.5 pr-3 font-semibold ${i > 0 ? "text-right" : ""}`}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row[0]} className="border-b border-gray-100">
                      {row.map((cell, i) => (
                        <td key={i} className={`py-1.5 pr-3 ${i > 0 ? "text-right tabular-nums" : "font-medium"}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </figure>
  );
}

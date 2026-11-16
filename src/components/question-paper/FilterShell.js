"use client";
import { withAlpha, darkenColor } from "@/lib/question-paper/colorHelpers";

/**
 * The look of the filter bar, shared by the college filter (src/college) and the school filter (src/school).
 * Each of them decides which dropdowns exist; this only draws them.
 *
 *   dropdowns: [{ label, value, disabled, options: [{ id, name }], onChange }]
 */
export default function FilterShell({
  color, loadingSubjects, dropdowns, onClear, filterNote, filterHint, clearLabel,
  columns = "grid-cols-2 md:grid-cols-4 lg:grid-cols-7",
}) {
  const selCls =
    "p-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-400 outline-none transition bg-white";

  return (
    <div
      className="mb-5 rounded-xl p-4"
      style={{
        backgroundColor: withAlpha(color, 0.05),
        border: `1px solid ${withAlpha(color, 0.15)}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">
          {filterNote}
          <span className="text-gray-400 font-normal ml-1">{filterHint}</span>
        </p>
      </div>

      <div className={`grid ${columns} gap-3`}>
        {dropdowns.map(({ label, value, disabled, options, onChange }) => (
          <select
            key={label}
            className={selCls}
            value={value}
            disabled={disabled || loadingSubjects}
            onChange={(e) => onChange(e.target.value)}
            style={{ borderColor: withAlpha(color, 0.3), color: darkenColor(color) }}
          >
            <option value="">{label}</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        ))}

        {/* Clear button */}
        <button
          onClick={onClear}
          className="px-3 py-2 rounded text-sm font-semibold transition"
          style={{ backgroundColor: withAlpha(color, 0.12), color: darkenColor(color) }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = withAlpha(color, 0.22))}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = withAlpha(color, 0.12))}
        >
          {clearLabel}
        </button>
      </div>
    </div>
  );
}

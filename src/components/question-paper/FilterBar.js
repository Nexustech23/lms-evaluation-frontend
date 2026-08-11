"use client";
import { withAlpha, darkenColor } from "@/lib/question-paper/colorHelpers";

/**
 * Cascading filter bar: School → Programme → [Department] → Batch → Semester → Subject
 * Department is skipped automatically for batch-based programmes (no real departments).
 *
 * Props:
 *   color               – brand hex
 *   loadingSubjects     – boolean
 *   schools / programmes / departments / batches / semesters / filteredSubjects
 *   selectedSchool / selectedProgramme / selectedDepartment / selectedBatch / selectedSemester / selectedSubject
 *   onSchoolChange / onProgrammeChange / onDepartmentChange / onBatchChange / onSemesterChange / onSubjectChange
 *   onClear             – resets all selections
 *   filterNote / filterHint / labelMap / clearLabel  – i18n strings
 */
export default function FilterBar({
  color,
  loadingSubjects,
  schools,
  programmes,
  departments,
  batches,
  semesters,
  filteredSubjects,
  selectedSchool,
  selectedProgramme,
  selectedDepartment,
  selectedBatch,
  selectedSemester,
  selectedSubject,
  onSchoolChange,
  onProgrammeChange,
  onDepartmentChange,
  onBatchChange,
  onSemesterChange,
  onSubjectChange,
  onClear,
  filterNote,
  filterHint,
  labelMap,   // { school, programme, department, batch, semester, subject }
  clearLabel,
}) {
  const selCls =
    "p-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-400 outline-none transition bg-white";

  // ✅ "null" id = backend placeholder meaning no real department exists
  const hasDepartments =
    departments.length > 0 && !departments.every((d) => d.id === "null");

  const dropdowns = [
    {
      label:    labelMap.school,
      value:    selectedSchool?.id || "",
      disabled: loadingSubjects,
      options:  schools,
      onChange: (v) => onSchoolChange(v),
    },
    {
      label:    labelMap.programme,
      value:    selectedProgramme?.id || "",
      disabled: !selectedSchool,
      options:  programmes,
      onChange: (v) => onProgrammeChange(v),
    },

    // ✅ Only include department dropdown for department-based programmes
    ...(hasDepartments
      ? [
          {
            label:    labelMap.department,
            value:    selectedDepartment?.id || "",
            disabled: !selectedProgramme,
            options:  departments,
            onChange: (v) => onDepartmentChange(v),
          },
        ]
      : []),

    {
      label:    labelMap.batch,
      value:    selectedBatch?.id || "",
      // ✅ With departments: wait for department selection
      // Without departments: unlock after programme selection
      disabled: hasDepartments ? !selectedDepartment : !selectedProgramme,
      options:  batches,
      onChange: (v) => onBatchChange(v),
    },
    {
      label:    labelMap.semester,
      value:    selectedSemester,
      disabled: !selectedBatch,
      options:  semesters.map((s) => ({ id: s, name: `Semester ${s}` })),
      onChange: (v) => onSemesterChange(v),
    },
    {
      label:    labelMap.subject,
      value:    selectedSubject?._id || "",
      disabled: !selectedSemester,
      options:  filteredSubjects.map((s) => ({ id: s._id, name: s.subject_name })),
      onChange: (v) => onSubjectChange(v),
    },
  ];

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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
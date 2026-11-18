"use client";
import FilterShell from "@/components/question-paper/FilterShell";

/**
 * College filter bar (semester based): School → Programme → [Department] → Batch → Semester → Subject.
 * Schools have classes, not semesters, and use their own filter in src/school.
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
    <FilterShell
      color={color}
      loadingSubjects={loadingSubjects}
      dropdowns={dropdowns}
      onClear={onClear}
      filterNote={filterNote}
      filterHint={filterHint}
      clearLabel={clearLabel}
    />
  );
}

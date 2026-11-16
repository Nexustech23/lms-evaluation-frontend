"use client";
import FilterShell from "@/components/question-paper/FilterShell";

/**
 * School filter bar: School → Programme → [Department] → Class → Subject.
 * A school has classes, not semesters, so there is no semester step: Subject unlocks as soon as the Class is picked
 * and lists every subject of that class. The college filter (src/college) is the semester based one.
 *
 * Props are the college filter's, without the semester ones:
 *   color / loadingSubjects / schools / programmes / departments / batches / filteredSubjects
 *   selectedSchool / selectedProgramme / selectedDepartment / selectedBatch / selectedSubject
 *   onSchoolChange / onProgrammeChange / onDepartmentChange / onBatchChange / onSubjectChange / onClear
 *   filterNote / filterHint / clearLabel, and labelMap { school, programme, department, batch, subject }
 */
export default function ClassFilterBar({
  color,
  loadingSubjects,
  schools,
  programmes,
  departments,
  batches,
  filteredSubjects,
  selectedSchool,
  selectedProgramme,
  selectedDepartment,
  selectedBatch,
  selectedSubject,
  onSchoolChange,
  onProgrammeChange,
  onDepartmentChange,
  onBatchChange,
  onSubjectChange,
  onClear,
  filterNote,
  filterHint,
  labelMap,
  clearLabel,
}) {
  // "null" id = backend placeholder meaning no real department exists
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
      label:    labelMap.batch,                               // a school's batch is a class
      value:    selectedBatch?.id || "",
      disabled: hasDepartments ? !selectedDepartment : !selectedProgramme,
      options:  batches,
      onChange: (v) => onBatchChange(v),
    },
    {
      label:    labelMap.subject,
      value:    selectedSubject?._id || "",
      disabled: !selectedBatch,
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
      columns="grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
    />
  );
}

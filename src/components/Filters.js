"use client";

import React, {
  useState,
  useContext,
} from "react";

import { AuthContext } from "@/app/AuthContext";

import { useTranslations } from "next-intl";

import {
  useFacultySchools,
  useFacultyProgrammes,
  useFacultyDepartments,
  useFacultyBatches,
  useFacultySemesters,
  useFacultySubjects,
} from "@/api/Filter";

/* =========================================================
   HELPERS
========================================================= */

function withAlpha(
  hex = "#ff7f10",
  alpha = 1
) {
  const h = hex.replace("#", "");

  const r = parseInt(
    h.substring(0, 2),
    16
  );

  const g = parseInt(
    h.substring(2, 4),
    16
  );

  const b = parseInt(
    h.substring(4, 6),
    16
  );

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* =========================================================
   DROPDOWN ITEM
========================================================= */

function DropdownItem({
  isSelected,
  color,
  onClick,
  children,
}) {
  const [hovered,
    setHovered] =
    useState(false);

  const style = isSelected
    ? {
        backgroundColor:
          color,
        color: "#fff",
      }
    : hovered
    ? {
        backgroundColor:
          withAlpha(
            color,
            0.12
          ),
        color: "#374151",
      }
    : {
        color: "#374151",
      };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() =>
        setHovered(true)
      }
      onMouseLeave={() =>
        setHovered(false)
      }
      style={style}
      className="px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors"
    >
      {children}
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Filters({
  filters,
  setFilters,
}) {
  const { user } =
    useContext(AuthContext);

  const t = useTranslations(
    "filters"
  );

  const ts = useTranslations(
    "subjects"
  );

  const color =
    user?.color || "#ff7f10";

  const [openDropdown,
    setOpenDropdown] =
    useState(null);

  /* =========================================================
     SCHOOL QUERY
  ========================================================= */

  const {
    data: schoolData = {},
  } = useFacultySchools();

  /* =========================================================
     PROGRAMME QUERY
  ========================================================= */

  const {
    data: programmeData = {},
  } = useFacultyProgrammes(
    filters.selectedSchool
  );

  /* =========================================================
     DEPARTMENT QUERY
  ========================================================= */

  const {
    data: departmentData = {},
  } = useFacultyDepartments({
    school_id:
      filters.selectedSchool,

    programme_id:
      filters.selectedProgramme,
  });

  /* =========================================================
     BATCH QUERY
  ========================================================= */

  const {
    data: batchData = {},
  } = useFacultyBatches({
    school_id:
      filters.selectedSchool,

    programme_id:
      filters.selectedProgramme,

    department_id:
      filters.selectedDepartment,
  });

  /* =========================================================
     SEMESTER QUERY
  ========================================================= */

  const {
    data: semesterData = {},
  } = useFacultySemesters({
    school_id:
      filters.selectedSchool,

    programme_id:
      filters.selectedProgramme,

    department_id:
      filters.selectedDepartment,

    batch_id:
      filters.selectedBatch,
  });

  /* =========================================================
     SUBJECT QUERY
  ========================================================= */

  const {
    data: subjectData = {},
  } = useFacultySubjects({
    school_id:
      filters.selectedSchool,

    programme_id:
      filters.selectedProgramme,

    department_id:
      filters.selectedDepartment,

    batch_id:
      filters.selectedBatch,

    semester:
      filters.selectedSemester,
  });

  /* =========================================================
     DERIVED
  ========================================================= */

  const schools =
    schoolData.schools || [];

  const programmes =
    programmeData.programmes || [];

  const departments =
    departmentData.departments || [];

  const hasDepartments =
    departmentData
      .has_departments ||
    false;

  const batches =
    batchData.batches || [];

  const semesters =
    semesterData.semesters || [];

  const subjects =
    subjectData.subjects || [];

  /* =========================================================
     UPDATE
  ========================================================= */

  const update = (
    key,
    value
  ) => {
    setFilters((prev) => {
      if (
        key ===
        "selectedSchool"
      ) {
        return {
          ...prev,

          selectedSchool:
            value,

          selectedProgramme:
            "",

          selectedDepartment:
            "",

          selectedBatch:
            "",

          selectedSemester:
            "",

          selectedSubject:
            "",
        };
      }

      if (
        key ===
        "selectedProgramme"
      ) {
        return {
          ...prev,

          selectedProgramme:
            value,

          selectedDepartment:
            "",

          selectedBatch:
            "",

          selectedSemester:
            "",

          selectedSubject:
            "",
        };
      }

      if (
        key ===
        "selectedDepartment"
      ) {
        return {
          ...prev,

          selectedDepartment:
            value,

          selectedBatch:
            "",

          selectedSemester:
            "",

          selectedSubject:
            "",
        };
      }

      if (
        key ===
        "selectedBatch"
      ) {
        return {
          ...prev,

          selectedBatch:
            value,

          selectedSemester:
            "",

          selectedSubject:
            "",
        };
      }

      if (
        key ===
        "selectedSemester"
      ) {
        return {
          ...prev,

          selectedSemester:
            value,

          selectedSubject:
            "",
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });

    setOpenDropdown(null);
  };

  /* =========================================================
     SELECT FIELDS
  ========================================================= */

  const selectFields = [
    {
      key: "selectedSchool",

      label: ts("school"),

      value:
        filters.selectedSchool,

      options: schools,

      getLabel: (o) =>
        o.school_name,

      getValue: (o) =>
        o.id,
    },

    {
      key: "selectedProgramme",

      label: ts("programme"),

      value:
        filters.selectedProgramme,

      options: programmes,

      getLabel: (o) =>
        o.programme_name,

      getValue: (o) =>
        o.id,
    },

    ...(hasDepartments
      ? [
          {
            key:
              "selectedDepartment",

            label:
              ts("department"),

            value:
              filters.selectedDepartment,

            options:
              departments,

            getLabel: (o) =>
              o.department_name,

            getValue: (o) =>
              o.id,
          },
        ]
      : []),

    {
      key: "selectedBatch",

      label: ts("batch"),

      value:
        filters.selectedBatch,

      options: batches,

      getLabel: (o) =>
        o.batch_name,

      getValue: (o) =>
        o.id,
    },

    {
      key:
        "selectedSemester",

      label:
        ts("semester"),

      value:
        filters.selectedSemester,

      options: semesters,

      getLabel: (o) => o,

      getValue: (o) => o,
    },

    {
      key:
        "selectedSubject",

      label:
        ts("subject"),

      value:
        filters.selectedSubject,

      options: subjects,

      getLabel: (o) =>
        o.subject_name,

      getValue: (o) =>
        o.id,
    },
  ];

  return (
    <div
      className="w-full rounded-2xl bg-white shadow-md p-4"
      style={{
        border: `1px solid ${withAlpha(
          color,
          0.15
        )}`,
      }}
    >
      <div className="flex justify-between mb-3">
        <span className="font-semibold text-gray-700 uppercase text-sm">
          Filters
        </span>

        <button
          onClick={() => {
            setFilters({
              selectedSchool:
                "",

              selectedProgramme:
                "",

              selectedDepartment:
                "",

              selectedBatch:
                "",

              selectedSemester:
                "",

              selectedSubject:
                "",
            });
          }}
          className="text-xs px-3 py-1 rounded-xl"
          style={{
            backgroundColor:
              withAlpha(
                color,
                0.12
              ),

            color,
          }}
        >
          {t("clearAll")}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {selectFields.map(({
          key,
          label,
          value,
          options,
          getLabel,
          getValue,
        }) => {

          const selectedOption =
            options.find(
              (o) =>
                getValue(o) ===
                value
            );

          const triggerStyle =
            value
              ? {
                  backgroundColor:
                    color,

                  color: "#fff",

                  borderColor:
                    color,
                }

              : {
                  backgroundColor:
                    withAlpha(
                      color,
                      0.08
                    ),

                  color:
                    withAlpha(
                      color,
                      0.85
                    ),

                  borderColor:
                    withAlpha(
                      color,
                      0.25
                    ),
                };

          return (
            <div
              key={key}
              className="relative"
            >
              <label className="text-xs text-gray-500">
                {label}
              </label>

              <div
                onClick={() => {
                  setOpenDropdown(
                    openDropdown === key
                      ? null
                      : key
                  );
                }}
                style={triggerStyle}
                className="mt-1 px-3 py-2 rounded-xl cursor-pointer text-sm font-medium border transition-colors"
              >
                {selectedOption
                  ? getLabel(
                      selectedOption
                    )
                  : label}
              </div>

              {openDropdown ===
                key && (
                <div
                  className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  style={{
                    borderColor:
                      withAlpha(
                        color,
                        0.2
                      ),
                  }}
                >
                  {options.length ===
                  0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      No options
                    </div>
                  ) : (
                    options.map(
                      (o, i) => (
                        <DropdownItem
                          key={i}
                          isSelected={
                            getValue(
                              o
                            ) ===
                            value
                          }
                          color={color}
                          onClick={() =>
                            update(
                              key,
                              getValue(
                                o
                              )
                            )
                          }
                        >
                          {getLabel(o)}
                        </DropdownItem>
                      )
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
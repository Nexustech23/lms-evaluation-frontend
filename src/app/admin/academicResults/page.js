"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

/* =========================================================
   HELPERS
========================================================= */

function withAlpha(hex = "#ff7f10", alpha = 1) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenColor(hex = "#ff7f10", amount = 0.35) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.floor(parseInt(h.substring(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(parseInt(h.substring(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.floor(parseInt(h.substring(4, 6), 16) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

const GRADE_STYLES = {
  "A+": { bg: "rgba(34,197,94,0.14)", color: "#15803d" },
  A: { bg: "rgba(34,197,94,0.12)", color: "#16a34a" },
  "B+": { bg: "rgba(234,179,8,0.14)", color: "#a16207" },
  B: { bg: "rgba(234,179,8,0.12)", color: "#b45309" },
  "C+": { bg: "rgba(249,115,22,0.14)", color: "#c2410c" },
  C: { bg: "rgba(249,115,22,0.12)", color: "#ea580c" },
  D: { bg: "rgba(239,68,68,0.13)", color: "#b91c1c" },
  U: { bg: "rgba(239,68,68,0.13)", color: "#b91c1c" },
};

function GradeBadge({ grade }) {
  if (!grade) return <span className="text-gray-300 text-xs">—</span>;
  const style = GRADE_STYLES[grade] || { bg: "rgba(156,163,175,0.15)", color: "#4b5563" };
  return (
    <span
      className="inline-flex min-w-12 justify-center rounded-full px-4 py-1.5 text-sm font-extrabold shadow-sm"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {grade}
    </span>
  );
}

/* =========================================================
   BREADCRUMB
========================================================= */
function Breadcrumb({ trail, onNavigate, color }) {
  if (trail.length === 0) return null;
  return (
    <div className="flex items-center flex-wrap gap-1 mb-6 text-sm">
      <button
        onClick={() => onNavigate(-1)}
        className="font-semibold hover:underline"
        style={{ color: darkenColor(color) }}
      >
        All Schools
      </button>
      {trail.map((item, i) => (
        <React.Fragment key={i}>
          <span className="text-gray-400 mx-1">›</span>
          <button
            onClick={() => onNavigate(i)}
            className="hover:underline text-gray-600"
            style={
              i === trail.length - 1
                ? { color: darkenColor(color), fontWeight: 700 }
                : {}
            }
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

/* =========================================================
   STEP HEADER
========================================================= */
function StepHeader({ label, color }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="text-lg font-bold text-gray-800">{label}</h2>
    </div>
  );
}

/* =========================================================
   BOX GRID
========================================================= */
function BoxGrid({ items, onSelect, color, getLabel, getKey, emptyText, loading }) {
  const [hovered, setHovered] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        {emptyText || "Nothing found."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const key = getKey(item);
        const isHovered = hovered === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            className="text-left rounded-2xl p-4 transition-all duration-150 shadow-sm focus:outline-none"
            style={{
              backgroundColor: isHovered ? withAlpha(color, 0.18) : withAlpha(color, 0.07),
              border: `1.5px solid ${withAlpha(color, isHovered ? 0.45 : 0.18)}`,
              transform: isHovered ? "translateY(-2px)" : "none",
              boxShadow: isHovered
                ? `0 6px 20px ${withAlpha(color, 0.18)}`
                : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: withAlpha(color, 0.14) }}
            >
              {item._icon || "📁"}
            </div>
            <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
              {getLabel(item)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   SEMESTER PILLS
========================================================= */
function SemesterGrid({ semesters, onSelect, color }) {
  const [hovered, setHovered] = useState(null);

  if (!semesters || semesters.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">No semesters found.</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {semesters.map((s) => {
        const isHovered = hovered === s;
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(null)}
            className="px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 shadow-sm"
            style={{
              backgroundColor: isHovered ? color : withAlpha(color, 0.1),
              color: isHovered ? "#fff" : darkenColor(color),
              border: `1.5px solid ${withAlpha(color, isHovered ? 1 : 0.25)}`,
              transform: isHovered ? "translateY(-1px)" : "none",
              boxShadow: isHovered ? `0 4px 14px ${withAlpha(color, 0.3)}` : "none",
            }}
          >
            Semester {s}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   SUBJECTS LIST  (click one to see results)
========================================================= */
function SubjectsList({ subjects, color, loading, onSelectSubject }) {
  const [hovered, setHovered] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No subjects found for this semester.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {subjects.map((sub) => {
        const isHovered = hovered === sub._id;
        return (
          <button
            key={sub._id}
            onClick={() => onSelectSubject(sub)}
            onMouseEnter={() => setHovered(sub._id)}
            onMouseLeave={() => setHovered(null)}
            className="text-left rounded-2xl p-5 transition-all duration-150 shadow-sm focus:outline-none"
            style={{
              backgroundColor: isHovered ? withAlpha(color, 0.18) : withAlpha(color, 0.07),
              border: `1.5px solid ${withAlpha(color, isHovered ? 0.45 : 0.18)}`,
              transform: isHovered ? "translateY(-2px)" : "none",
              boxShadow: isHovered
                ? `0 6px 20px ${withAlpha(color, 0.18)}`
                : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: withAlpha(color, 0.14) }}
            >
              📘
            </div>

            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {sub.subject_name}
            </p>
            <p className="text-xs text-gray-400 mt-1">{sub.subject_code || "No code"}</p>

            <div className="flex gap-2 mt-3 flex-wrap">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: withAlpha(color, 0.12), color: darkenColor(color) }}
              >
                {sub.batch_name}
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: withAlpha(color, 0.12), color: darkenColor(color) }}
              >
                Sem {sub.semester}
              </span>
            </div>

            <p className="text-xs font-semibold mt-3" style={{ color: darkenColor(color) }}>
              View Results →
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   MARKS BADGE
========================================================= */
function MarksBadge({ result }) {
  if (!result) {
    return (
      <span className="inline-block px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-400">
        —
      </span>
    );
  }

  const pct = result.percentage ?? 0;
  const bg = pct >= 75 ? "rgba(34,197,94,0.12)" : pct >= 50 ? "rgba(234,179,8,0.12)" : "rgba(239,68,68,0.12)";
  const textColor = pct >= 75 ? "#15803d" : pct >= 50 ? "#a16207" : "#b91c1c";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="inline-block px-2 py-1 rounded-lg text-xs font-bold"
        style={{ backgroundColor: bg, color: textColor }}
      >
        {result.final_marks}/{result.max_marks}
      </span>
      <span className="text-[10px] text-gray-400">{pct}%</span>
    </div>
  );
}

/* =========================================================
   STUDENT RESULTS GRID
========================================================= */
function StudentResultsGrid({ data, color, loading }) {
  const [sortBy, setSortBy] = useState("roll"); // "roll" | "grade"

  const students = data?.students;
  const sortedStudents = useMemo(() => {
    if (!students) return students;
    if (sortBy !== "grade") return students;
    // Grade is a monotonic function of composite_percentage (better % = better
    // grade), so sorting by composite_percentage descending groups same-grade
    // students together in the right order without hardcoding a grade list.
    return [...students].sort((a, b) => {
      const pa = a.composite_percentage;
      const pb = b.composite_percentage;
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return pb - pa;
    });
  }, [students, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  const { subject, exams, total_students, total_exams } = data;

  if (total_exams === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No exams found for this subject.
      </div>
    );
  }

  if (total_students === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No student answer sheets found for this subject.
      </div>
    );
  }

  const grandMax = exams.reduce((s, e) => s + (e.weightage_percent || 0), 0);

  return (
    <div>
      {/* Subject info bar */}
      <div
        className="flex items-center gap-4 rounded-2xl px-5 py-4 mb-5"
        style={{
          backgroundColor: withAlpha(color, 0.08),
          border: `1px solid ${withAlpha(color, 0.2)}`,
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: withAlpha(color, 0.15) }}
        >
          📘
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm">{subject.subject_name}</p>
          <p className="text-xs text-gray-400">{subject.subject_code || "No code"}</p>
        </div>
        <div className="flex gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color }}>{total_students}</p>
            <p className="text-xs text-gray-400">Students</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color }}>{total_exams}</p>
            <p className="text-xs text-gray-400">Exams</p>
          </div>
        </div>
      </div>

      {/* Sort control */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-500">Sort by:</span>
        {[
          { key: "roll", label: "Roll No." },
          { key: "grade", label: "Grade" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition"
            style={
              sortBy === opt.key
                ? { backgroundColor: color, color: "#fff" }
                : { backgroundColor: withAlpha(color, 0.08), color: darkenColor(color) }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid table */}
      <div
        className="overflow-x-auto rounded-2xl border"
        style={{ borderColor: withAlpha(color, 0.2) }}
      >
        <table className="w-full text-sm border-collapse">

          {/* ── HEADER ── */}
          <thead>
            {/* Row 1: exam titles */}
            <tr style={{ backgroundColor: withAlpha(color, 0.1) }}>
              <th
                className="text-left px-5 py-3 font-semibold text-gray-700 sticky left-0 z-10 min-w-[130px]"
                style={{ backgroundColor: withAlpha(color, 0.1) }}
              >
                Student
              </th>
              {exams.map((exam) => (
                <th
                  key={exam.exam_id}
                  className="text-center px-4 py-2 font-semibold text-gray-700 min-w-[130px]"
                >
                  <p className="text-sm">{exam.exam_title}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: darkenColor(color) }}>
                    {exam.exam_type}
                  </p>
                </th>
              ))}
              <th className="text-center px-4 py-2 font-semibold text-gray-700 min-w-[100px]">
                Total
              </th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700 min-w-[100px]">
                Composite %
              </th>
              <th className="text-center px-4 py-2 font-semibold text-gray-700 min-w-[90px]">
                Grade
              </th>
            </tr>

            {/* Row 2: max marks + date */}
            <tr style={{ backgroundColor: withAlpha(color, 0.05) }}>
              <td
                className="px-5 py-1.5 text-xs text-gray-400 sticky left-0"
                style={{ backgroundColor: withAlpha(color, 0.05) }}
              >
                Roll No.
              </td>
              {exams.map((exam) => (
                <td key={exam.exam_id} className="text-center px-4 py-1.5 text-xs text-gray-400">
                  Weightage: {exam.weightage_percent}  %
                  {exam.exam_date && (
                    <span className="ml-1 text-gray-300">
                      ·{" "}
                      {new Date(exam.exam_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  )}
                </td>
              ))}
              <td className="text-center px-4 py-1.5 text-xs text-gray-400">
                Total: {grandMax} %
              </td>
              <td className="text-center px-4 py-1.5 text-xs text-gray-400">
                Weighted by exam %
              </td>
              <td className="text-center px-4 py-1.5 text-xs text-gray-400">
                Relative
              </td>
            </tr>
          </thead>

          {/* ── ROWS ── */}
          <tbody>
            {sortedStudents.map((student, idx) => {
              const totalObtained = exams.reduce((sum, exam) => {
                const r = student.results[exam.exam_id];
                return sum + (r ? r.final_marks : 0);
              }, 0);
              const totalPct = grandMax
                ? Math.round((totalObtained / grandMax) * 100)
                : 0;

              return (
                <tr
                  key={student.student_id}
                  className="border-t transition-colors hover:bg-gray-50"
                  style={{ borderColor: withAlpha(color, 0.1) }}
                >
                  {/* Roll */}
                  <td
                    className="px-5 py-3 sticky left-0 bg-white z-10 font-semibold text-gray-800 text-sm"
                    style={{ borderRight: `1px solid ${withAlpha(color, 0.1)}` }}
                  >
                    {idx + 1}. {student.student_id}
                  </td>

                  {/* Per-exam marks */}
                  {exams.map((exam) => (
                    <td key={exam.exam_id} className="px-4 py-3 text-center">
                      <MarksBadge result={student.results[exam.exam_id]} />
                    </td>
                  ))}

                  {/* Row total */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className="inline-block px-2 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: withAlpha(color, 0.12),
                          color: darkenColor(color),
                        }}
                      >
                        {totalObtained}/{grandMax}
                      </span>
                      <span className="text-[10px] text-gray-400">{totalPct}%</span>
                    </div>
                  </td>

                  {/* Composite % (server-computed, weightage-aware) */}
                  <td className="px-4 py-3 text-center">
                    {student.composite_percentage != null ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold text-gray-800">
                          {student.composite_percentage}%
                        </span>
                        {student.is_partial && (
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: "#a16207" }}
                            title={`Only ${Math.round((student.coverage_ratio || 0) * 100)}% of the course weight has been graded so far`}
                          >
                            ⚠ Partial ({Math.round((student.coverage_ratio || 0) * 100)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Grade */}
                  <td className="px-4 py-3 text-center">
                    <GradeBadge grade={student.course_grade} />
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* ── FOOTER: class averages ── */}
          <tfoot>
            <tr
              style={{
                backgroundColor: withAlpha(color, 0.06),
                borderTop: `2px solid ${withAlpha(color, 0.2)}`,
              }}
            >
              <td
                className="px-5 py-3 text-xs font-bold text-gray-600 sticky left-0"
                style={{ backgroundColor: withAlpha(color, 0.06) }}
              >
                Class Avg
              </td>

              {exams.map((exam) => {
                const appeared = students.filter(
                  (s) => s.results[exam.exam_id] !== null
                );
                const avg = appeared.length
                  ? (
                    appeared.reduce(
                      (sum, s) =>
                        sum + (s.results[exam.exam_id]?.final_marks || 0),
                      0
                    ) / appeared.length
                  ).toFixed(1)
                  : "—";

                return (
                  <td key={exam.exam_id} className="text-center px-4 py-3">
                    <span className="text-xs font-bold" style={{ color: darkenColor(color) }}>
                      {avg}
                    </span>
                    {appeared.length < students.length && (
                      <p className="text-[10px] text-gray-400">
                        {appeared.length}/{students.length} appeared
                      </p>
                    )}
                  </td>
                );
              })}

              <td className="text-center px-4 py-3">
                <span className="text-xs font-bold" style={{ color: darkenColor(color) }}>
                  {students.length
                    ? (
                      students.reduce((sum, student) => {
                        const obt = exams.reduce((s, e) => {
                          const r = student.results[e.exam_id];
                          return s + (r ? r.final_marks : 0);
                        }, 0);
                        return sum + (grandMax ? (obt / grandMax) * 100 : 0);
                      }, 0) / students.length
                    ).toFixed(1) + "%"
                    : "—"}
                </span>
              </td>

              {/* Composite % class average */}
              <td className="text-center px-4 py-3">
                <span className="text-xs font-bold" style={{ color: darkenColor(color) }}>
                  {(() => {
                    const graded = students.filter((s) => s.composite_percentage != null);
                    if (!graded.length) return "—";
                    const avg =
                      graded.reduce((sum, s) => sum + s.composite_percentage, 0) / graded.length;
                    return avg.toFixed(1) + "%";
                  })()}
                </span>
              </td>

              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "rgba(34,197,94,0.25)" }} />
          ≥ 75%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "rgba(234,179,8,0.25)" }} />
          50–74%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "rgba(239,68,68,0.25)" }} />
          &lt; 50%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block bg-gray-100" />
          Absent / Not uploaded
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SavedResult() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const t = useTranslations("courseOutcomePage");

  /* ── step: school | programme | department | batch | semester | subjects | student_results ── */
  const [step, setStep] = useState("school");
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ── list data ── */
  const [schools, setSchools] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resultsData, setResultsData] = useState(null);

  /* ── selections ── */
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [hasDepartment, setHasDepartment] = useState(true);

  /* ── load schools ── */
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/schools`, { params: { page: 1, limit: 0 }, withCredentials: true })
      .then((res) =>
        setSchools((res.data.schools || []).map((s) => ({ ...s, _icon: "🏫" })))
      )
      .catch(() => toast.error("Failed to load schools"))
      .finally(() => setLoading(false));
  }, []);

  /* ── handlers ── */

  const handleSelectSchool = async (school) => {
    setLoading(true);
    setSelectedSchool(school);
    setTrail([{ label: school.school_name, step: "school" }]);
    try {
      const res = await axios.get(`/api/programmes/${school.id}`, {
        params: { page: 1, limit: 0 },
        withCredentials: true,
      });
      setProgrammes((res.data.programmes || []).map((p) => ({ ...p, _icon: "🎓" })));
      setStep("programme");
    } catch {
      toast.error("Failed to load programmes");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProgramme = async (programme) => {
    setLoading(true);
    setSelectedProgramme(programme);
    try {
      const res = await axios.get(`/api/departments/${programme.id}`, {
        params: { page: 1, limit: 0 },
        withCredentials: true,
      });
      const data = res.data.departments || [];
      const realDepts = data.filter((d) => d.id !== null && d.department_name !== null);
      setHasDepartment(realDepts.length > 0);

      if (realDepts.length > 0) {
        setDepartments(realDepts.map((d) => ({ ...d, _icon: "🏛️" })));
        setTrail([
          { label: selectedSchool.school_name, step: "school" },
          { label: programme.programme_name, step: "programme" },
        ]);
        setStep("department");
      } else {
        const batchRes = await axios.get(`/api/batches`, {
          params: { page: 1, limit: 0, programme_id: programme.id },
          withCredentials: true,
        });
        setBatches((batchRes.data.batches || []).map((b) => ({ ...b, _icon: "📅" })));
        setTrail([
          { label: selectedSchool.school_name, step: "school" },
          { label: programme.programme_name, step: "programme" },
        ]);
        setStep("batch");
      }
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDepartment = async (dept) => {
    setLoading(true);
    setSelectedDepartment(dept);
    setTrail([
      { label: selectedSchool.school_name, step: "school" },
      { label: selectedProgramme.programme_name, step: "programme" },
      { label: dept.department_name, step: "department" },
    ]);
    try {
      const res = await axios.get(`/api/batches`, {
        params: { page: 1, limit: 0, department_id: dept.id },
        withCredentials: true,
      });
      setBatches((res.data.batches || []).map((b) => ({ ...b, _icon: "📅" })));
      setStep("batch");
    } catch {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    const allSemesters = [...new Set(batch.semesters || [])].sort((a, b) => a - b);
    setSemesters(allSemesters);
    setTrail((prev) => [
      ...prev.filter((t) => t.step !== "batch" && t.step !== "semester"),
      { label: batch.batch_name, step: "batch" },
    ]);
    setStep("semester");
  };

  const handleSelectSemester = async (sem) => {
    setLoading(true);
    setSelectedSemester(sem);
    setTrail((prev) => [
      ...prev.filter((t) => t.step !== "semester"),
      { label: `Semester ${sem}`, step: "semester" },
    ]);
    try {
      const params = { page: 1, limit: 0, semester: sem };
      if (selectedSchool) params.school_id = selectedSchool.id;
      if (selectedProgramme) params.programme_id = selectedProgramme.id;
      if (selectedDepartment) params.department_id = selectedDepartment.id;
      if (selectedBatch) params.batch_id = selectedBatch.id;

      const res = await axios.get(`/api/subjects/institute`, {
        params,
        withCredentials: true,
      });
      setSubjects(res.data.subjects || []);
      setStep("subjects");
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  /* click a subject card → fetch results from the new controller */
  const handleSelectSubject = async (sub) => {
    setLoading(true);
    setResultsData(null);
    setTrail((prev) => [
      ...prev.filter((t) => t.step !== "subject"),
      { label: sub.subject_name, step: "subject" },
    ]);
    try {
      const res = await axios.get(`/api/subject/result/${sub.id}`, {
        withCredentials: true,
      });
      setResultsData(res.data);
      setStep("student_results");
    } catch {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  /* ── breadcrumb back navigation ── */
  const handleBreadcrumbNavigate = (trailIndex) => {
    const reset = () => {
      setResultsData(null);
      setSelectedSemester(null);
      setSelectedBatch(null);
      setSelectedDepartment(null);
      setSelectedProgramme(null);
    };

    if (trailIndex === -1) {
      reset();
      setSelectedSchool(null);
      setStep("school");
      setTrail([]);
      return;
    }

    const target = trail[trailIndex];

    if (target.step === "school") {
      reset();
      setStep("programme");
      setTrail(trail.slice(0, 1));
    } else if (target.step === "programme") {
      setResultsData(null);
      setSelectedSemester(null);
      setSelectedBatch(null);
      setSelectedDepartment(null);
      setStep(hasDepartment ? "department" : "batch");
      setTrail(trail.slice(0, 2));
    } else if (target.step === "department") {
      setResultsData(null);
      setSelectedSemester(null);
      setSelectedBatch(null);
      setStep("batch");
      setTrail(trail.slice(0, 3));
    } else if (target.step === "batch") {
      setResultsData(null);
      setSelectedSemester(null);
      setStep("semester");
      setTrail(trail.slice(0, trail.findIndex((t) => t.step === "batch") + 1));
    } else if (target.step === "semester") {
      setResultsData(null);
      setStep("subjects");
      setTrail(trail.slice(0, trail.findIndex((t) => t.step === "semester") + 1));
    }
  };

  /* ── step header labels ── */
  const stepLabel = {
    school: "Select a School",
    programme: "Select a Programme",
    department: "Select a Department",
    batch: "Select a Batch",
    semester: "Select a Semester",
    subjects: `Subjects — Semester ${selectedSemester}`,
    student_results: resultsData
      ? `${resultsData.subject?.subject_name} — Results`
      : "Results",
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="min-h-screen" style={{ backgroundColor: withAlpha(color, 1) }}>
      <Navbar title={t("title")} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[500px]">

          <Breadcrumb trail={trail} onNavigate={handleBreadcrumbNavigate} color={color} />
          <div className="flex items-center justify-between mb-6">
            <StepHeader label={stepLabel[step]} color={color} />
            {step === "subjects" && (
              <button
                onClick={() => router.push("/admin/academicResults/combined-result")}
                className="px-5 py-2 rounded-lg text-white font-semibold shadow hover:opacity-90 transition"
                style={{ backgroundColor: color }}
              >
                Combined Result
              </button>
            )}
          </div>


          {step === "school" && (
            <BoxGrid
              items={schools} onSelect={handleSelectSchool} color={color}
              getLabel={(s) => s.school_name} getKey={(s) => s.id}
              emptyText="No schools found." loading={loading}
            />
          )}

          {step === "programme" && (
            <BoxGrid
              items={programmes} onSelect={handleSelectProgramme} color={color}
              getLabel={(p) => p.programme_name} getKey={(p) => p.id}
              emptyText="No programmes found." loading={loading}
            />
          )}

          {step === "department" && (
            <BoxGrid
              items={departments} onSelect={handleSelectDepartment} color={color}
              getLabel={(d) => d.department_name} getKey={(d) => d.id}
              emptyText="No departments found." loading={loading}
            />
          )}

          {step === "batch" && (
            <BoxGrid
              items={batches} onSelect={handleSelectBatch} color={color}
              getLabel={(b) => b.batch_name} getKey={(b) => b.id}
              emptyText="No batches found." loading={loading}
            />
          )}

          {step === "semester" && (
            <SemesterGrid semesters={semesters} onSelect={handleSelectSemester} color={color} />
          )}

          {step === "subjects" && (
            <SubjectsList
              subjects={subjects} color={color} loading={loading}
              onSelectSubject={handleSelectSubject}
            />
          )}

          {step === "student_results" && (
            <StudentResultsGrid data={resultsData} color={color} loading={loading} />
          )}

        </div>
      </div>
    </div>
  );
}
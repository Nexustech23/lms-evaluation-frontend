"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

// ─── Global Styles ─────────────────────────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.google/apis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  * { font-family: 'DM Sans', sans-serif; }
  code, .mono { font-family: 'DM Mono', monospace; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,.25); }
    70%  { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
    100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  .animate-fade-in-up { animation: fadeInUp .45s ease both; }
  .anim-delay-1 { animation-delay: .08s; }
  .anim-delay-2 { animation-delay: .16s; }
  .anim-delay-3 { animation-delay: .24s; }
  .anim-delay-4 { animation-delay: .32s; }
  .anim-delay-5 { animation-delay: .40s; }

  /* Scrollable table container */
  .table-scroll { overflow-x: auto; scrollbar-width: thin; scrollbar-color: #c7d2fe #f0f2ff; }
  .table-scroll::-webkit-scrollbar { height: 5px; }
  .table-scroll::-webkit-scrollbar-track { background: #f0f2ff; border-radius: 99px; }
  .table-scroll::-webkit-scrollbar-thumb { background: #a5b4fc; border-radius: 99px; }

  /* Sticky first column */
  .sticky-col { position: sticky; left: 0; z-index: 2; background: #fff; }
  .sticky-col-header { position: sticky; left: 0; z-index: 3; }

  /* Row hover */
  .data-row:hover td, .data-row:hover .sticky-col { background: #f5f7ff !important; }

  /* Section card */
  .section-card {
    background: #fff;
    border: 1px solid #e2e5f0;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(30,41,90,.06), 0 1px 2px rgba(30,41,90,.04);
    overflow: hidden;
  }
  .section-header {
    padding: 22px 28px 18px;
    border-bottom: 1px solid #e8eaf4;
    background: linear-gradient(135deg, #0b0b37 0%, #172051 100%);
  }
  .section-body { padding: 0; }

  /* Progress bar */
  .progress-track { background: #e8eaf4; border-radius: 99px; overflow: hidden; height: 6px; }
  .progress-fill   { height: 100%; border-radius: 99px; transition: width .6s cubic-bezier(.4,0,.2,1); }

  /* PO bar */
  .po-bar-track { background: #eef0fb; border-radius: 6px; overflow: hidden; }
  .po-bar-fill  { border-radius: 6px; transition: height .5s ease; }

  /* Level pill */
  .level-pill {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 28px; height: 22px; padding: 0 8px;
    border-radius: 6px; font-size: 14px; font-weight: 600; letter-spacing: .02em;
  }

  /* Table base */
  .styled-table { border-collapse: collapse; width: 100%; font-size: 14px; }
  .styled-table th {
    background: #f4f5fb; color: #4a4e6a; font-weight: 600;
    font-size: 14px; letter-spacing: .04em; text-transform: uppercase;
    padding: 10px 14px; border-bottom: 1.5px solid #dde0f0;
    white-space: nowrap;
  }
  .styled-table td {
    padding: 9px 14px; border-bottom: 1px solid #eceef6; vertical-align: middle;
    color: #2d3052;
  }
  .styled-table thead tr:first-child th { border-top: none; }
  .styled-table tfoot td {
    background: #f4f5fb; font-weight: 600; border-top: 2px solid #d8daf0;
    padding: 10px 14px;
  }

  /* Avatar */
  .student-avatar {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    color: #fff; font-size: 14px; font-weight: 700;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-right: 8px;
  }

  /* Tooltip hint */
  .hint { font-size: 14px; color: #8b90b5; font-weight: 400; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildColumns(students) {
  const colMap = new Map();
  for (const student of students) {
    for (const q of student.questions || []) {
      for (const co of q.cos || []) {
        const key = `${q.question_no}|${co.co_code}`;
        if (!colMap.has(key))
          colMap.set(key, { questionNo: q.question_no, coCode: co.co_code, maxMarks: co.max_marks });
      }
    }
  }
  return [...colMap.values()].sort((a, b) =>
    a.questionNo !== b.questionNo ? a.questionNo - b.questionNo : a.coCode.localeCompare(b.coCode)
  );
}
function buildStudentLookup(student) {
  const map = {};
  for (const q of student.questions || [])
    for (const co of q.cos || [])
      map[`${q.question_no}|${co.co_code}`] = co.obtained_marks;
  return map;
}
function aggregateByCO(student) {
  const agg = {};
  for (const q of student.questions || []) {
    for (const co of q.cos || []) {
      if (!agg[co.co_code]) agg[co.co_code] = { obtained: 0, max: 0 };
      agg[co.co_code].obtained += co.obtained_marks || 0;
      agg[co.co_code].max += co.max_marks || 0;
    }
  }
  return agg;
}

// ─── Color helpers ─────────────────────────────────────────────────────────────
function pct(obtained, max) {
  if (!max) return null;
  return Math.round((obtained / max) * 100);
}
function cellStyle(p) {
  if (p === null) return {};
  if (p >= 75) return { background: "#ecfdf5", color: "#065f46" };
  if (p >= 50) return { background: "#fffbeb", color: "#92400e" };
  return { background: "#fff1f2", color: "#9f1239" };
}
function badgeStyle(p) {
  if (p === null) return { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" };
  if (p >= 75) return { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" };
  if (p >= 50) return { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" };
  return { background: "#ffe4e6", color: "#9f1239", border: "1px solid #fda4af" };
}
function levelStyle(level) {
  if (level === 3) return { background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" };
  if (level === 2) return { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" };
  if (level === 1) return { background: "#ffe4e6", color: "#9f1239", border: "1px solid #fda4af" };
  return { background: "#f3f4f6", color: "#9ca3af", border: "1px solid #e5e7eb" };
}
function attainedStyle(isAttained) {
  return isAttained
    ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
    : { background: "#ffe4e6", color: "#9f1239", border: "1px solid #fda4af" };
}
function corrStyle(val) {
  if (!val || val === 0) return null;
  if (val === 3) return { background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" };
  if (val === 2) return { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" };
  return { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
}

// ─── Shared Section Wrapper ────────────────────────────────────────────────────
function SectionCard({ title, subtitle, badge, children, className = "" }) {
  return (
    <div className={`section-card ${className}`}>
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#ffffff", letterSpacing: "-.01em" }}>
              {title}
            </h2>
            {subtitle && (
              <p className="hint" style={{ margin: "4px 0 0" }}>{subtitle}</p>
            )}
          </div>
          {badge && (
            <span style={{
              background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd",
              borderRadius: 8, padding: "3px 11px", fontSize: 12, fontWeight: 600, flexShrink: 0
            }}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value, color = "#6366f1" }) {
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center",
      background: "#f8f9ff", border: "1px solid #e0e3f4", borderRadius: 10,
      padding: "8px 18px", gap: 2
    }}>
      <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, color: "#8b90b5", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ─── Target / Level helpers ────────────────────────────────────────────────────
function getCOLevelInfo(studentPcts, targets) {
  if (!studentPcts?.length || !targets?.length) return null;
  const comparisionPct = targets[0].comparision_percentage;
  const total = studentPcts.filter((p) => p !== null).length;
  const studentsAbove = studentPcts.filter((p) => p !== null && p > comparisionPct).length;
  const achievementPct = total > 0 ? Math.round((studentsAbove / total) * 100) : 0;
  const matched = targets.find((t) => achievementPct >= t.min_percentage && achievementPct <= t.max_percentage);
  return { achievementPct, level: matched?.level ?? 0, comparisionPct, studentsAbove, total };
}

// ─── Direct Attainment helpers ─────────────────────────────────────────────────
function buildDirectAttainment(exams, targets, coAttainmentTarget = 2) {

  const coSet = new Set();
  const examInfos = [];
  for (const exam of exams) {
    examInfos.push({
      examId: exam.exam_id,
      folderName: exam.folder_name,
      weightage: exam.weightage ?? 0,
      isCourseExitSummary: exam.is_course_exit_summary ?? false,  // ✅ ADD
    });
    for (const student of exam.students || [])
      for (const q of student.questions || [])
        for (const co of q.cos || [])
          coSet.add(co.co_code);
  }
  const allCOs = [...coSet].sort((a, b) => a.localeCompare(b));
  const levelMatrix = {};
  const finalAttainment = {};
  for (const co of allCOs) {
    levelMatrix[co] = {};
    finalAttainment[co] = 0;
    for (const exam of exams) {
      const studentPcts = (exam.students || []).map((student) => {
        const agg = aggregateByCO(student);
        const d = agg[co];
        return d ? pct(d.obtained, d.max) : null;
      });
      const info = getCOLevelInfo(studentPcts, targets);
      const level = info?.level ?? 0;
      const weightage = exam.weightage ?? 0;
      const weighted = level * (weightage / 100);
      levelMatrix[co][exam.exam_id] = { level, weighted, achievementPct: info?.achievementPct ?? null };
      finalAttainment[co] += weighted;
    }
    finalAttainment[co] = Math.round(finalAttainment[co] * 100) / 100;
  }
  return { allCOs, examInfos, levelMatrix, finalAttainment };
}

// ─── Direct Attainment Table ───────────────────────────────────────────────────
function DirectAttainmentTable({ exams, targets, coAttainmentTarget }) {
  
  const t = useTranslations("coAnalysisPage");
  const tc = useTranslations("common");
  const { allCOs, examInfos, levelMatrix, finalAttainment } = useMemo(
    () => buildDirectAttainment(exams, targets, coAttainmentTarget),
    [exams, targets, coAttainmentTarget]
  );
  if (!allCOs.length || !examInfos.length) return null;
  const totalWeightage = examInfos.reduce((s, e) => s + (e.weightage ?? 0), 0);
  const attainedCount = allCOs.filter((co) => finalAttainment[co] >= coAttainmentTarget).length;

  return (
    <SectionCard
      title={t("directCOAttainment")}
      subtitle={t("subjectiveAttainment")}
      badge={`${attainedCount}/${allCOs.length} ${t("attained")}`}
      className="animate-fade-in-up anim-delay-3"
    >
      <div style={{ display: "flex", gap: 12, padding: "16px 24px", borderBottom: "1px solid #eceef6", flexWrap: "wrap" }}>
        <StatChip label={t("totalWeightage")} value={`${totalWeightage}%`} color="#6366f1" />
        <StatChip label={t("COAttained")} value={attainedCount} color="#059669" />
        <StatChip label={t("threshold")} value={`≥ ${coAttainmentTarget}`} color="#d97706" />
      </div>
      <div className="table-scroll">
        <table className="styled-table">
          <thead>
            <tr>
              <th className="sticky-col-header" style={{ minWidth: 80 }}>CO</th>
              <th style={{ minWidth: 110, background: "#f0f2fd" }}>{t("threshold")}</th>
              {examInfos.map((exam) => (
                <th
                  key={exam.examId}
                  colSpan={2}
                  style={{
                    minWidth: 160, textAlign: "center",
                    background: "#f0f2fd", borderLeft: "2px solid #dde0f0"
                  }}
                >
                  {exam.folderName || `Exam ${exam.examId}`}
                  {exam.isCourseExitSummary && (
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      marginLeft: 6,
                      background: "#fef3c7", color: "#92400e",
                      border: "1px solid #fcd34d",
                      borderRadius: 6, padding: "1px 7px",
                      fontSize: 10, fontWeight: 700, letterSpacing: ".04em"
                    }}>
                      CES
                    </span>
                  )}
                  <span style={{ display: "block", fontSize: 10, color: "#a5b4fc", fontWeight: 500, marginTop: 1 }}>
                    {exam.weightage}% weight
                    {exam.isCourseExitSummary && (
                      <span style={{ marginLeft: 4, color: "#d97706" }}>(Indirect)</span>
                    )}
                  </span>
                </th>
              ))}
              <th style={{ minWidth: 130, textAlign: "center", background: "#1e1f3b", color: "#e0e3ff" }}>
                {t("finalAttainment")}
              </th>
            </tr>
            <tr>
              <th className="sticky-col-header"></th>
              <th style={{ background: "#f8f9ff", fontSize: 10, color: "#9ca3af" }}>{t("FacultySet")}</th>
              {examInfos.map((exam) => (
                <React.Fragment key={exam.examId}>
                  <th style={{ textAlign: "center", background: "#f8f9ff", borderLeft: "2px solid #dde0f0", fontSize: 10 }}>{t("level")}</th>
                  <th style={{ textAlign: "center", background: "#f8f9ff", fontSize: 10 }}>L × W/100</th>
                </React.Fragment>
              ))}
              <th style={{ background: "#262847", color: "#a5b4fc", fontSize: 10 }}>{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {allCOs.map((co) => {
              const final = finalAttainment[co];
              const isAttained = final >= coAttainmentTarget;
              return (
                <tr key={co} className="data-row">
                  <td className="sticky-col" style={{ fontWeight: 700, color: "#4f46e5", fontSize: 13 }}>
                    {co}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="level-pill" style={{ background: "#f0f2fd", color: "#4f46e5", border: "1px solid #c7d2fe" }}>
                      ≥ {coAttainmentTarget}
                    </span>
                  </td>
                  {examInfos.map((exam) => {
                    const cell = levelMatrix[co]?.[exam.examId];
                    const level = cell?.level ?? 0;
                    const weighted = cell?.weighted ?? 0;
                    const achPct = cell?.achievementPct;
                    return (
                      <React.Fragment key={exam.examId}>
                        <td style={{ textAlign: "center", borderLeft: "2px solid #eceef6" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <span className="level-pill" style={levelStyle(level)}>
                              {level === 0 ? "—" : `${level}`}
                            </span>
                            {achPct !== null && (
                              <span style={{ fontSize: 12, color: "#8b90b5" }}>{achPct}%</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{
                            fontFamily: " monospace", fontSize: 16, fontWeight: 500,
                            color: weighted >= 2 ? "#059669" : weighted >= 1 ? "#d97706" : "#5c5c5c"
                          }}>
                            {weighted > 0 ? weighted.toFixed(2) : "—"}
                          </span>
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 15, color: isAttained ? "#059669" : "#dc2626" }}>
                        {final.toFixed(2)}
                      </span>
                      <span className="level-pill" style={attainedStyle(isAttained)}>
                        {isAttained ? `✓ ${t("attained")}` : `✗ ${t("notAttained")}`}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="sticky-col">{t("weightage")}</td>
              <td></td>
              {examInfos.map((exam) => (
                <React.Fragment key={exam.examId}>
                  <td colSpan={2} style={{ textAlign: "center", borderLeft: "2px solid #dde0f0", color: "#4f46e5" }}>
                    {exam.weightage}%
                  </td>
                </React.Fragment>
              ))}
              <td style={{ textAlign: "center", color: "#4f46e5" }}>= {totalWeightage}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </SectionCard>
  );
}

// ─── CO Attainment Summary ─────────────────────────────────────────────────────
function COAttainmentSummary({ exams, targets, coList, coPOMatrix, coAttainmentTarget }) {
  
  const t = useTranslations("coAnalysisPage");
  const tc = useTranslations("common");
  const { allCOs, finalAttainment } = useMemo(
    () => buildDirectAttainment(exams, targets, coAttainmentTarget),
    [exams, targets, coAttainmentTarget]
  );

  const { poCodes, correlationLookup } = useMemo(() => {
    if (!coPOMatrix || typeof coPOMatrix !== "object" || Array.isArray(coPOMatrix))
      return { poCodes: [], correlationLookup: {} };
    const poSet = new Set();
    const lookup = {};
    for (const [co, poMap] of Object.entries(coPOMatrix)) {
      lookup[co] = {};
      for (const [po, val] of Object.entries(poMap || {})) {
        poSet.add(po);
        lookup[co][po] = val;
      }
    }
    return { poCodes: [...poSet].sort((a, b) => a.localeCompare(b)), correlationLookup: lookup };
  }, [coPOMatrix]);

  const poAttainment = useMemo(() => {
    const result = {};
    for (const po of poCodes) {
      const mapped = allCOs.filter((co) => (correlationLookup[co]?.[po] ?? 0) > 0);
      if (!mapped.length) { result[po] = null; continue; }
      const attainedCorrSum = mapped.reduce((sum, co) => {
        const isAttained = (finalAttainment[co] ?? 0) >= coAttainmentTarget;
        return sum + (isAttained ? (correlationLookup[co]?.[po] ?? 0) : 0);
      }, 0);
      const totalCorrSum = mapped.reduce((sum, co) => sum + (correlationLookup[co]?.[po] ?? 0), 0);
      result[po] = {
        pct: totalCorrSum > 0 ? Math.round((attainedCorrSum / totalCorrSum) * 100) : 0,
        attained: attainedCorrSum, total: totalCorrSum,
      };
    }
    return result;
  }, [poCodes, allCOs, correlationLookup, finalAttainment, coAttainmentTarget]);

  if (!allCOs.length) return null;

  const attained = allCOs.filter((co) => finalAttainment[co] >= coAttainmentTarget);
  const notAttained = allCOs.filter((co) => finalAttainment[co] < coAttainmentTarget);
  const attPct = Math.round((attained.length / allCOs.length) * 100);

  return (
    <SectionCard
      title={t("coAttainmentSummary")}
      subtitle={`${attained.length} of ${allCOs.length} ${t("COAttained")} · ${t("POCorrelation")}`}
      className="animate-fade-in-up anim-delay-4"
    >
      {/* Progress */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eceef6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#4a4e6a" }}>{t("overallAttainment")}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: attPct >= 75 ? "#059669" : attPct >= 50 ? "#d97706" : "#dc2626" }}>
                {attPct}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${attPct}%`,
                  background: attPct >= 75 ? "linear-gradient(90deg,#34d399,#059669)" : attPct >= 50 ? "linear-gradient(90deg,#fcd34d,#d97706)" : "linear-gradient(90deg,#fca5a5,#dc2626)"
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <StatChip label={t("attained")} value={attained.length} color="#059669" />
            <StatChip label={t("notAttained")} value={notAttained.length} color="#dc2626" />
          </div>
        </div>
        {/* Correlation legend */}
        {poCodes.length > 0 && (
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#8b90b5", fontWeight: 600 }}>{t("correlation")}:</span>
            {[3, 2, 1].map((v) => (
              <span key={v} className="level-pill" style={corrStyle(v)}>
                {v} — {v === 3 ? "High" : v === 2 ? "Medium" : "Low"}
              </span>
            ))}
            <span style={{ fontSize: 11, color: "#9ca3af" }}>— {t("noMapping")}</span>
          </div>
        )}
      </div>

      <div className="table-scroll">
        <table className="styled-table">
          <thead>
            <tr>
              <th className="sticky-col-header" style={{ minWidth: 80 }}>CO</th>
              <th style={{ minWidth: 100, background: "#f0f2fd" }}>{t("threshold")}</th>
              <th style={{ minWidth: 100, textAlign: "center" }}>{t("finalAttainment")}</th>
              <th style={{ minWidth: 120, textAlign: "center" }}>{t("status")}</th>
              {poCodes.map((po) => (
                <th key={po} style={{ minWidth: 72, textAlign: "center" }}>{po}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allCOs.map((co) => {
              const val = finalAttainment[co];
              const isAttained = val >= coAttainmentTarget;
              return (
                <tr key={co} className="data-row">
                  <td className="sticky-col" style={{ fontWeight: 700, color: "#4f46e5" }}>{co}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="level-pill" style={{ background: "#f0f2fd", color: "#4f46e5", border: "1px solid #c7d2fe" }}>
                      ≥ {coAttainmentTarget}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 14, color: isAttained ? "#059669" : "#dc2626" }}>
                    {val.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="level-pill" style={attainedStyle(isAttained)}>
                      {isAttained ? `✓ ${t("attained")}` : `✗ ${t("notAttained")}`}
                    </span>
                  </td>
                  {poCodes.map((po) => {
                    const corr = correlationLookup[co]?.[po];
                    const style = corrStyle(corr);
                    return (
                      <td key={po} style={{ textAlign: "center" }}>
                        {corr && corr > 0 ? (
                          <span className="level-pill" style={style}>{corr}</span>
                        ) : (
                          <span style={{ color: "#d1d5db", fontSize: 16 }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {poCodes.length > 0 && (
            <tfoot>
              <tr>
                <td className="sticky-col" colSpan={4} style={{ color: "#021ace" }}>{t("poOverview")}</td>
                {poCodes.map((po) => {
                  const info = poAttainment[po];
                  if (!info) return <td key={po} style={{ textAlign: "center", color: "#9ca3af" }}>—</td>;
                  const { pct: p, attained: att, total } = info;
                  const s = badgeStyle(p);
                  return (
                    <td key={po} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span className="level-pill" style={s}>{p}%</span>
                        <span style={{ fontSize: 10, color: "#8b90b5" }}>{att}/{total}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: p >= 60 ? "#059669" : "#dc2626" }}>
                          {p >= 60 ? "✓" : "✗"}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </SectionCard>
  );
}

// ─── CO-PO Matrix Table ─────────────────────────────────────────────────────────
function COPOMatrixTable({ coPOMatrix, exams, targets, coList, coAttainmentTarget }) {
  
  const t = useTranslations("coAnalysisPage");
  const tc = useTranslations("common");
  const { finalAttainment } = useMemo(
    () => buildDirectAttainment(exams, targets, coAttainmentTarget),
    [exams, targets, coAttainmentTarget]
  );
  const { poCodes, coRows, poAttainment } = useMemo(() => {
    if (!coPOMatrix?.length) return { poCodes: [], coRows: [], poAttainment: {} };
    const poSet = new Set();
    for (const row of coPOMatrix)
      for (const pm of row.po_mapping || []) poSet.add(pm.po_code);
    const poCodes = [...poSet].sort((a, b) => a.localeCompare(b));
    const coRows = coPOMatrix.map((row) => {
      const correlationMap = {};
      for (const pm of row.po_mapping || []) correlationMap[pm.po_code] = pm.correlation;
      const isAttained = (finalAttainment[row.co_code] ?? 0) >= coAttainmentTarget;
      return { coCode: row.co_code, correlationMap, isAttained };
    });
    const poAttainment = {};
    for (const po of poCodes) {
      const mapped = coRows.filter((r) => (r.correlationMap[po] ?? 0) > 0);
      const attained = mapped.filter((r) => r.isAttained);
      poAttainment[po] = mapped.length > 0 ? Math.round((attained.length / mapped.length) * 100) : null;
    }
    return { poCodes, coRows, poAttainment };
  }, [coPOMatrix, finalAttainment, coAttainmentTarget]);

  if (!coRows.length || !poCodes.length) return null;

  return (
    <SectionCard
      title={t("coPoMatrix")}
      subtitle={t("POCorrelation")}
      className="animate-fade-in-up anim-delay-5"
    >
      {/* Legend */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid #eceef6", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#8b90b5" }}>{t("correlation")}:</span>
        {[3, 2, 1].map((v) => (
          <span key={v} className="level-pill" style={corrStyle(v)}>
            {v} — {v === 3 ? t("high") : v === 2 ? t("medium") : t("low")}
          </span>
        ))}
        <span style={{ fontSize: 11, color: "#9ca3af" }}>0 / — {t("noMapping")}</span>
      </div>

      <div className="table-scroll">
        <table className="styled-table">
          <thead>
            <tr>
              <th className="sticky-col-header" style={{ minWidth: 90 }}>CO</th>
              <th style={{ minWidth: 130, background: "#f0f2fd" }}>{t("attainmentAnalysis")}</th>
              {poCodes.map((po) => (
                <th key={po} style={{ minWidth: 68, textAlign: "center" }}>{po}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coRows.map((row) => (
              <tr key={row.coCode} className="data-row">
                <td className="sticky-col" style={{ fontWeight: 700, color: "#4f46e5" }}>{row.coCode}</td>
                <td>
                  <span className="level-pill" style={attainedStyle(row.isAttained)}>
                    {row.isAttained ? `✓ ${t("attained")}` : `✗ ${t("notAttained")}`}
                  </span>
                </td>
                {poCodes.map((po) => {
                  const corr = row.correlationMap[po];
                  return (
                    <td key={po} style={{ textAlign: "center" }}>
                      {corr && corr > 0 ? (
                        <span className="level-pill" style={corrStyle(corr)}>{corr}</span>
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: 16 }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="sticky-col" style={{ color: "#4a4e6a" }}>{t("poAttainment")}</td>
              <td style={{ fontSize: 11, color: "#8b90b5" }}>{t("attained")} / {t("mapped")}</td>
              {poCodes.map((po) => {
                const val = poAttainment[po];
                const attainedCount = coRows.filter((r) => (r.correlationMap[po] ?? 0) > 0 && r.isAttained).length;
                const totalCount = coRows.filter((r) => (r.correlationMap[po] ?? 0) > 0).length;
                return (
                  <td key={po} style={{ textAlign: "center" }}>
                    {val !== null ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span className="level-pill" style={badgeStyle(val)}>{val}%</span>
                        <span style={{ fontSize: 10, color: "#8b90b5" }}>{attainedCount}/{totalCount}</span>
                      </div>
                    ) : <span style={{ color: "#d1d5db" }}>—</span>}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* PO Bar chart */}
      <div style={{ padding: "20px 24px", borderTop: "1px solid #eceef6" }}>
        <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: "#4a4e6a", textTransform: "uppercase", letterSpacing: ".06em" }}>
         {t("poOverview")}
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          {poCodes.map((po) => {
            const val = poAttainment[po];
            if (val === null) return null;
            const color = val >= 75 ? "#059669" : val >= 50 ? "#d97706" : "#dc2626";
            const bgColor = val >= 75 ? "#d1fae5" : val >= 50 ? "#fef3c7" : "#ffe4e6";
            return (
              <div key={po} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color }}>{val}%</span>
                <div className="po-bar-track" style={{ width: 36, height: 64 }}>
                  <div
                    className="po-bar-fill"
                    style={{
                      height: `${val}%`, background: color, marginTop: `${100 - val}%`,
                      opacity: .85
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4a4e6a" }}>{po}</span>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}


// ─── Exam Table ────────────────────────────────────────────────────────────────
function ExamTable({ exam }) {
  
  const t = useTranslations("coAnalysisPage");
  const tc = useTranslations("common");
  const { students: rawStudents, folder_name, is_course_exit_summary } = exam;
  const students = useMemo(
    () => [...rawStudents].sort((a, b) => {
      const lA = (a.student_name?.trim() || a.filename || "").toLowerCase();
      const lB = (b.student_name?.trim() || b.filename || "").toLowerCase();
      return lA.localeCompare(lB);
    }),
    [rawStudents]
  );
  const columns = useMemo(() => buildColumns(students), [students]);
  const questionGroups = useMemo(() => {
    const groups = [];
    let prev = null;
    for (const col of columns) {
      if (prev?.questionNo !== col.questionNo) groups.push({ questionNo: col.questionNo, cols: [col] });
      else groups[groups.length - 1].cols.push(col);
      prev = col;
    }
    return groups;
  }, [columns]);
  const allCOCodes = useMemo(() => {
    const set = new Set(columns.map((c) => c.coCode));
    return [...set].sort();
  }, [columns]);

  return (
    <SectionCard
      title={
        folder_name
          ? `${folder_name} ${is_course_exit_summary ? "( CES )" : ""}`
          : `${t("exam")}`
      }
      subtitle={`${students.length} student${students.length !== 1 ? "s" : ""}`}
      badge={`${students.length} Students`}

      className="animate-fade-in-up  anim-delay-1"
    >
      <div className="table-scroll">
        <table className="styled-table">
          <thead>
            <tr>
              <th className="sticky-col-header" rowSpan={2} style={{ minWidth: 180, verticalAlign: "bottom" }}>{t("student")}</th>
              {questionGroups.map((g) => (
                <th
                  key={g.questionNo}
                  colSpan={g.cols.length}
                  style={{
                    textAlign: "center", borderLeft: "2px solid #dde0f0",
                    background: "#eef0fb", color: "#4f46e5"
                  }}
                >
                  Q {g.questionNo}
                </th>
              ))}
              <th
                colSpan={allCOCodes.length}
                style={{ textAlign: "center", background: "#f0f9ff", color: "#0369a1" }}
              >
                {t("coSummary")}
              </th>
            </tr>
            <tr>
              {columns.map((col, i) => {
                const isLastInGroup = i === columns.length - 1 || columns[i + 1]?.questionNo !== col.questionNo;
                return (
                  <th key={i} style={{
                    textAlign: "center", borderLeft: i === 0 || columns[i - 1]?.questionNo !== col.questionNo ? "2px solid #dde0f0" : undefined,
                    background: "#f8f9ff", minWidth: 72
                  }}>
                    <div style={{ fontWeight: 700, color: "#4f46e5", fontSize: 14 }}>{col.coCode}</div>
                    <div style={{ fontSize: 14, color: "#9ca3af", fontWeight: 400 }}>{col.maxMarks}</div>
                  </th>
                );
              })}
              {allCOCodes.map((co) => (
                <th key={co} style={{ textAlign: "center", minWidth: 110, background: "#f0f9ff" }}>
                  <div style={{ fontWeight: 700, color: "#0369a1", fontSize: 14 }}>{co}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const lookup = buildStudentLookup(student);
              const coAgg = aggregateByCO(student);
              const label = student.student_name?.trim() || student.filename || `Student ${idx + 1}`;
              return (
                <tr key={idx} className="data-row">
                  <td className="sticky-col">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="student-avatar">{label.charAt(0).toUpperCase()}</span>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{label}</span>
                    </div>
                  </td>
                  {columns.map((col, i) => {
                    const key = `${col.questionNo}|${col.coCode}`;
                    const obtained = lookup[key];
                    const isFirst = i === 0 || columns[i - 1]?.questionNo !== col.questionNo;
                    const p = obtained !== undefined ? pct(obtained, col.maxMarks) : null;
                    return (
                      <td key={i} style={{
                        textAlign: "center", borderLeft: isFirst ? "2px solid #eceef6" : undefined,
                        ...cellStyle(p)
                      }}>
                        {obtained !== undefined ? (
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500 }}>
                            {obtained}
                          </span>
                        ) : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                    );
                  })}
                  {allCOCodes.map((co) => {
                    const agg = coAgg[co];
                    const p = agg ? pct(agg.obtained, agg.max) : null;
                    return (
                      <td key={co} style={{ textAlign: "center" }}>
                        {agg ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#4d49bd" }}>
                              {agg.obtained.toFixed(1)}<span style={{ color: "#1d1d1d" }}> / {agg.max.toFixed(0)}</span>
                            </span>
                            {p !== null && <span className="level-pill" style={badgeStyle(p)}>{p}%</span>}
                          </div>
                        ) : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
   const t = useTranslations("coAnalysisPage");
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "80px 24px", textAlign: "center"
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 34, marginBottom: 20,
        boxShadow: "0 4px 20px rgba(99,102,241,.2)"
      }}>📊</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#1e1f3b" }}>{t("noDataTitle")}</h3>
      <p style={{ margin: 0, color: "#8b90b5", maxWidth: 320, lineHeight: 1.6 }}>
      {t("noDataDesc")}
      </p>
    </div>
  );
}

// ─── Section Divider ───────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "12px 0" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#e0e3f4)" }} />
      <span style={{
        fontSize: 14, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
        color: "#010c47", padding: "4px 14px", background: "#f0f2fd",
        border: "1px solid #dde0f0", borderRadius: 99
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#e0e3f4,transparent)" }} />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const Page = () => {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const [cOAttainementTarget, setCOAttainmentTarget] = useState(0);
  const [coReport, setCoReport] = useState([]);
  const [targets, setTargets] = useState([]);
  const [coPOMatrix, setCoPOMatrix] = useState({});
  const [coList, setCoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const t = useTranslations("coAnalysisPage");
  const tc = useTranslations("common");

  const downloadExcel = async (subjectId) => {
    try {
      if (!subjectId) return;

      const res = await axios.get(
        `/api/co-detailed-excel/${subjectId}`,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "CO_Detailed_Report.xlsx"); // file name
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      toast.error("Failed to download CO report");
    }
  };
  const fetchCOReport = async () => {
    try {
      if (!subjectId) return;
      setLoading(true);
      const res = await axios.get(`/api/combinedCO/${subjectId}`, { withCredentials: true });
      setCoReport(res.data.exams || []);
    } catch { toast.error("Failed to load CO report"); }
    finally { setLoading(false); }
  };
  const fetchProgrammeTargets = async () => {
    try {
      if (!subjectId) return;
      const res = await axios.get(`/api/programmes_po_target/${subjectId}`, { withCredentials: true });
      setTargets(res.data.targets || []);
      setCOAttainmentTarget(res.data.coAttainmentTarget);
    } catch (err) { console.warn("Could not fetch programme targets:", err); }
  };
  const fetchSubject = async () => {
    try {
      if (!subjectId) return;
      const res = await axios.get(`/api/subject/${subjectId}`, { withCredentials: true });
      setCoPOMatrix(res.data.subject.co_po_matrix || {});
      setCoList(res.data.subject.co || []);
    } catch (err) { console.warn("Could not fetch subject CO-PO matrix:", err); }
  };

  useEffect(() => {
    fetchCOReport();
    fetchProgrammeTargets();
    fetchSubject();
  }, [subjectId]);
  console.log(coReport)

  const router = useRouter()
  return (
    <div className="h-screen overflow-y-auto" style={{backgroundColor:user?.color}}>
      <style>{GLOBAL_STYLE}</style>
      <Navbar />

      <div className="mb-4">
        <button
          onClick={() => router.back()}
          style={{backgroundColor:user?.color}}
          className="flex items-center mb-4 border border-white px-4 ml-4 py-2 text-sm  rounded text-white"
        >
          <FaArrowLeft />
          {tc("back")}
        </button>
      </div>

      <div style={{ minHeight: "100vh", borderRadius: "20px", margin: "16px", background: "#eff1ff" }}>

        {/* ── Page Header ── */}

        <div className="flex justify-between items-center p-6 rounded-xl">

          <div >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, }}>
              <span style={{
                background: "rgba(159, 161, 254, 0.2)", color: "#000e51",
                border: "1px solid rgba(165,180,252,.3)", borderRadius: 8,
                padding: "3px 12px", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase"
              }}>
                {t("titleBadge")}
              </span>
            </div>
            <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: "#191717", letterSpacing: "-.02em" }}>
              {t("mainTitle")}
            </h1>
            <p style={{ margin: 0, color: "#666666", fontSize: 14, fontWeight: 400 }}>
              {t("subtitle")}
            </p>
          </div>
          <div className="bg-gray-700  h-10 p-2 rounded cursor-pointer flex justify-center text-white" onClick={() => downloadExcel(subjectId)}>{t("downloadExcel")}</div>
        </div>

        {/* ── Main Content ── */}
        <div className="p-6">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 280 }}>
              <Spinner />
            </div>
          ) : coReport.length === 0 ? (
            <div className="section-card animate-fade-in-up">
              <EmptyState />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Per-exam tables */}
              {coReport.map((exam) => (
                <ExamTable key={exam.exam_id} exam={exam} />
              ))}

              <SectionDivider label={t("attainmentAnalysis")} />

              {/* Direct Attainment */}
              <DirectAttainmentTable
                exams={coReport}
                targets={targets}
                coAttainmentTarget={cOAttainementTarget}
              />

              {/* CO Summary + PO correlation */}
              <COAttainmentSummary
                exams={coReport}
                targets={targets}
                coList={coList}
                coPOMatrix={coPOMatrix}
                coAttainmentTarget={cOAttainementTarget}
              />

              {/* CO-PO Matrix */}
              {coPOMatrix.length > 0 && (
                <>
                  <SectionDivider label="CO-PO Mapping" />
                  <COPOMatrixTable
                    coPOMatrix={coPOMatrix}
                    exams={coReport}
                    targets={targets}
                    coList={coList}
                    coAttainmentTarget={cOAttainementTarget}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;

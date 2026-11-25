"use client";

// Backlog and At-risk: the students who need follow-up, with the reason for each, and the mandatory exams not cleared.
// THIS PAGE SHOWS STUDENT NAMES. Every view and every export is recorded in an access log on the server. The counts equal
// the Reports dashboard's tiles. A student is at risk by a visible rule, and the reasons are shown on every row.

import { Suspense, useContext, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FaLock } from "react-icons/fa";

import { AuthContext } from "@/app/AuthContext";
import { COLLEGE, instituteTypeOf } from "@/institute/instituteKind";
import Navbar from "@/components/ui/Navbar";
import { Skeleton, Tile } from "../reportsUi";
import { ScopeBar, useReportData, useScope } from "../scope";

const SEGMENTS = [
  ["", "all"],
  ["backlog", "backlog"],
  ["at-risk", "atRisk"],
];
const LABELS = ["Backlog", "Arrear", "Back paper", "ATKT", "Supplementary"];
const dash = (value) => (value === null || value === undefined || value === "" ? "-" : value);

function Panel({ title, note, children }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-lg">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
      <div className="mt-3 overflow-x-auto">{children}</div>
    </section>
  );
}

function Table({ columns, rows, numeric = [] }) {
  return (
    <table className="w-full min-w-[560px] text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-600">
          {columns.map((c, i) => (
            <th key={`${c}-${i}`} scope="col" className={`py-2 pr-3 font-semibold ${numeric.includes(i) ? "text-right" : ""}`}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className="border-b border-gray-100 align-top">
            {row.map((cell, i) => (
              <td key={i} className={`py-2 pr-3 ${numeric.includes(i) ? "text-right tabular-nums" : i === 0 ? "font-medium text-gray-900" : "text-gray-700"}`}>
                {dash(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BacklogAtRisk() {
  const t = useTranslations("reports");
  const b = useTranslations("reports.backlog");
  const locale = useLocale();
  const { user } = useContext(AuthContext);
  const scope = useScope();
  const isCollege = instituteTypeOf(user) === COLLEGE;
  const segment = SEGMENTS.some(([value]) => value === scope.segment) ? scope.segment : "";
  const { data, failed, refreshing, retry } = useReportData("/api/reports/backlog-at-risk", { ...scope, segment }, isCollege);
  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  const [busy, setBusy] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const [labelFailed, setLabelFailed] = useState(false);

  const download = async () => {
    setBusy(true);
    setExportFailed(false);
    try {
      const params = {};
      if (scope.programme) params.programme = scope.programme;
      if (scope.batch) params.batch = scope.batch;
      if (scope.semester) params.semester = scope.semester;
      if (segment) params.segment = segment;
      const res = await axios.get("/api/reports/backlog-at-risk/export", { params, responseType: "blob", withCredentials: true });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = /filename="?([^";]+)"?/.exec(res.headers["content-disposition"] || "")?.[1] || "backlog-at-risk.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const saveLabel = async (value) => {
    setLabelFailed(false);
    try {
      await axios.put("/api/reports/settings", { backlog_label: value }, { withCredentials: true });
      retry();
    } catch {
      setLabelFailed(true);
    }
  };

  const label = data?.labels?.backlog || "Backlog";
  const title = b("title", { label });
  const shell = (children) => (
    <div className="min-h-screen" style={{ backgroundColor: user?.color || "#ff7f10" }}>
      <Navbar title={title} />
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">{children}</div>
    </div>
  );
  const message = (text, withRetry) => (
    <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
      <p className="font-semibold text-gray-900">{text}</p>
      {withRetry && (
        <button type="button" onClick={retry} className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
          {t("state.retry")}
        </button>
      )}
    </div>
  );

  if (!isCollege || failed === "college") return shell(message(t("state.collegeOnly")));
  if (failed === "error" && !data) return shell(message(t("state.error"), true));
  if (!data) {
    return shell(
      <div role="status" aria-live="polite">
        <span className="sr-only">{t("state.loading")}</span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="mt-4 h-72" />
      </div>
    );
  }

  const { summary, rules } = data;
  const noResults = summary.with_results === 0;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generated_at));
  const shown = (section) => (section.truncated ? t("dataCheck.truncated", { shown: section.items.length, total: nf.format(section.total) }) : null);
  const reasonText = (r) => (r.code === "failed_papers" ? b("reason.failed_papers", { n: r.value }) : b("reason.low_cgpa", { value: nf.format(r.value), min: nf.format(rules.at_risk_min_cgpa) }));
  const subjectsText = (s) =>
    s.subjects.map((x) => `${t("filters.semester")} ${dash(x.semester)}: ${dash(x.subject)}`).join("; ") +
    (s.more_subjects ? `; ${b("moreSubjects", { n: s.more_subjects })}` : "");
  const segmentLabel = (key) => (key === "atRisk" ? b("segment.atRisk") : key === "backlog" ? b("segment.backlog", { label }) : b("segment.all"));

  return shell(
    <>
      <div className="text-white">
        <nav aria-label="breadcrumb" className="text-sm">
          <Link href={`/admin/reports${scope.query}`} className="underline-offset-2 hover:underline">{t("title")}</Link>
          <span aria-hidden="true"> › </span>
          <span aria-current="page">{title}</span>
        </nav>
        <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        <p className="text-sm text-white/90">{b("question")}</p>
      </div>

      <p className="flex items-start gap-2 rounded-2xl bg-white p-3 text-sm text-gray-900 shadow-lg" role="note">
        <FaLock aria-hidden="true" className="mt-0.5 shrink-0 text-gray-700" />
        {b("confidential")}
      </p>

      <ScopeBar filters={data.filters} scope={data.scope} programme={scope.programme} batch={scope.batch}
        semester={scope.semester} update={scope.update} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={b("listTitle")} className="flex flex-wrap gap-2">
          {SEGMENTS.map(([value, key]) => (
            <button key={key} type="button" onClick={() => scope.update({ segment: value })} aria-current={segment === value ? "true" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                segment === value ? "bg-white text-gray-900 shadow" : "bg-white/20 text-white hover:bg-white/30"
              }`}>
              {segmentLabel(key)}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white">
          <span>{b("export.note")}</span>
          <button type="button" onClick={download} disabled={busy || noResults}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-900 shadow hover:bg-gray-100 disabled:opacity-60">
            {busy ? b("export.busy") : b("export.button")}
          </button>
        </div>
      </div>
      {exportFailed && <p role="alert" className="rounded-2xl bg-white p-3 text-sm text-red-700 shadow-lg">{b("export.failed")}</p>}

      <div className={refreshing ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={refreshing}>
        {failed === "error" && (
          <div className="mb-4 rounded-2xl bg-white p-3 text-sm text-gray-900 shadow-lg">
            {t("state.error")} <button type="button" onClick={retry} className="font-medium text-blue-700 underline">{t("state.retry")}</button>
          </div>
        )}

        {/* ---- summary strip: the same numbers as the dashboard tiles ---- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Tile label={b("summary.withResults")} value={noResults ? null : nf.format(summary.with_results)} reason={t("reason.no_results")} />
          <Tile label={b("summary.backlogStudents", { label })} value={noResults ? null : nf.format(summary.backlog_students)}
            reason={t("reason.no_results")} lines={[b("summary.papers", { n: nf.format(summary.backlog_papers) })]} />
          <Tile label={b("summary.atRisk")} value={noResults ? null : nf.format(summary.at_risk_students)} reason={t("reason.no_results")}
            lines={[b("summary.of", { n: nf.format(summary.with_results) })]} />
          <Tile label={b("summary.notCleared")} value={nf.format(summary.not_cleared)} />
        </div>

        <p className="mt-3 text-sm text-white/95">
          {b("ruleLine", { papers: rules.at_risk_failed_papers, cgpa: nf.format(rules.at_risk_min_cgpa), label, grades: rules.fail_grades.join("/") })}
        </p>

        <div className="mt-4 space-y-4">
          <Panel title={b("listTitle")} note={shown(data.students)}>
            {noResults ? (
              <p className="text-sm text-gray-600">{b("noResults")}</p>
            ) : data.students.total === 0 ? (
              <p className="text-sm text-gray-600">{b("empty")}</p>
            ) : (
              <Table
                columns={[b("col.student"), b("col.id"), b("col.programme"), b("col.batch"), b("col.failed"), b("col.which"), b("col.cgpa"), b("col.reason")]}
                numeric={[4, 6]}
                rows={data.students.items.map((s) => [s.name, s.student_id, s.programme, s.batch, nf.format(s.failed), subjectsText(s),
                  s.cgpa === null ? null : nf.format(s.cgpa), s.reasons.map(reasonText).join("; ")])} />
            )}
          </Panel>

          <Panel title={b("notClearedTitle")} note={shown(data.not_cleared) || b("notClearedNote")}>
            {data.not_cleared.total === 0 ? (
              <p className="text-sm text-gray-600">{b("emptyNotCleared")}</p>
            ) : (
              <Table
                columns={[b("col.student"), b("col.id"), b("col.exam"), b("col.subject"), b("col.semester"), b("col.reason"), b("col.marks"), b("col.minimum")]}
                numeric={[4, 6, 7]}
                rows={data.not_cleared.items.map((u) => [u.name, u.student_id, u.exam, u.subject, u.semester, b(`reason.${u.reason}`),
                  u.percentage === null ? null : nf.format(u.percentage), u.minimum === null ? null : nf.format(u.minimum)])} />
            )}
          </Panel>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">
          <label htmlFor="backlog-label" className="font-semibold text-gray-900">{b("label.title")}</label>
          <select id="backlog-label" value={label} onChange={(e) => saveLabel(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
            {LABELS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          {labelFailed && <span role="alert" className="text-red-700">{b("label.failed")}</span>}
        </div>

        <details className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">
          <summary className="cursor-pointer font-semibold text-gray-900">{b("definitions.title")}</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{b("definitions.atRisk", { papers: rules.at_risk_failed_papers, cgpa: nf.format(rules.at_risk_min_cgpa) })}</li>
            <li>{b("definitions.backlog", { grades: rules.fail_grades.join("/") })}</li>
            <li>{b("definitions.notCleared")}</li>
            <li>{b("definitions.matching")}</li>
            <li>{b("definitions.left")}</li>
          </ul>
        </details>

        <p className="mt-4 text-xs text-white/90">{t("dataCheck.generated", { date })}</p>
      </div>
    </>
  );
}

export default function BacklogAtRiskPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <BacklogAtRisk />
    </Suspense>
  );
}

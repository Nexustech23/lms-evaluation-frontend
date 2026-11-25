"use client";

// Result Analysis: how a semester's results turned out, by programme, subject and grade, with an Excel download.
// The same scope bar as the Reports dashboard; the pass % equals the dashboard's. No student is named on this page.

import { Suspense, useContext, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AuthContext } from "@/app/AuthContext";
import { COLLEGE, instituteTypeOf } from "@/institute/instituteKind";
import Navbar from "@/components/ui/Navbar";
import { ANCHOR, ChartCard, FAIL, Skeleton, Tile } from "../reportsUi";
import { ScopeBar, useReportData, useScope } from "../scope";

const VIEWS = ["overview", "programmes", "subjects", "grades"];
const dash = (value) => (value === null || value === undefined || value === "" ? "-" : value);

function Panel({ children }) {
  return <section className="rounded-2xl bg-white p-4 shadow-lg">{children}</section>;
}

function Table({ columns, rows, numeric = [], rowClass }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
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
            <tr key={r} className={`border-b border-gray-100 ${rowClass ? rowClass(r) : ""}`}>
              {row.map((cell, i) => (
                <td key={i} className={`py-2 pr-3 ${numeric.includes(i) ? "text-right tabular-nums" : i === 0 ? "font-medium text-gray-900" : "text-gray-700"}`}>
                  {dash(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultAnalysis() {
  const t = useTranslations("reports");
  const r = useTranslations("reports.resultAnalysis");
  const locale = useLocale();
  const { user } = useContext(AuthContext);
  const scope = useScope();
  const isCollege = instituteTypeOf(user) === COLLEGE;
  const { data, failed, refreshing, retry } = useReportData("/api/reports/result-analysis", scope, isCollege);
  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const pct = (v) => (v === null || v === undefined ? null : `${nf.format(v)}%`);
  const num = (v) => (v === null || v === undefined ? null : nf.format(v));

  const [busy, setBusy] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);

  const view = VIEWS.includes(scope.view) ? scope.view : "overview";
  const setView = (next) => scope.update({ view: next === "overview" ? "" : next });

  const download = async () => {
    setBusy(true);
    setExportFailed(false);
    try {
      const params = {};
      if (scope.programme) params.programme = scope.programme;
      if (scope.batch) params.batch = scope.batch;
      if (scope.semester) params.semester = scope.semester;
      const res = await axios.get("/api/reports/result-analysis/export", { params, responseType: "blob", withCredentials: true });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = /filename="?([^";]+)"?/.exec(res.headers["content-disposition"] || "")?.[1] || "result-analysis.xlsx";
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

  const shell = (children) => (
    <div className="min-h-screen" style={{ backgroundColor: user?.color || "#ff7f10" }}>
      <Navbar title={t("catalogue.resultAnalysisName")} />
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
  const empty = summary.appeared === 0;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generated_at));
  const compare = (value, previous, text) => {
    if (value === null || value === undefined || previous === null || previous === undefined) return undefined;
    const direction = value > previous ? "up" : value < previous ? "down" : "same";
    return { direction, directionText: t(`compare.${direction}`), text };
  };
  const failGrades = rules.fail_grades;
  const anySmall = data.subjects.some((s) => s.small) || data.programmes.some((p) => p.small);
  const passCell = (value, small) => (value === null ? null : `${pct(value)}${small ? ` (${r("note.smallShort")})` : ""}`);

  const subjectChart = data.subjects.filter((s) => s.pass_pct !== null);
  const chartHeight = Math.max(220, subjectChart.length * 34 + 40);

  const tabs = (
    <nav aria-label={t("catalogue.resultAnalysisName")} className="flex flex-wrap gap-2">
      {VIEWS.map((name) => (
        <button
          key={name}
          type="button"
          aria-current={view === name ? "true" : undefined}
          onClick={() => setView(name)}
          className={`rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            view === name ? "bg-white text-gray-900 shadow" : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          {r(`tabs.${name}`)}
        </button>
      ))}
    </nav>
  );

  return shell(
    <>
      <div className="text-white">
        <nav aria-label="breadcrumb" className="text-sm">
          <Link href={`/admin/reports${scope.query}`} className="underline-offset-2 hover:underline">{t("title")}</Link>
          <span aria-hidden="true"> › </span>
          <span aria-current="page">{t("catalogue.resultAnalysisName")}</span>
        </nav>
        <h1 className="mt-1 text-2xl font-bold">{t("catalogue.resultAnalysisName")}</h1>
        <p className="text-sm text-white/90">{r("question")}</p>
      </div>

      <ScopeBar filters={data.filters} scope={data.scope} programme={scope.programme} batch={scope.batch}
        semester={scope.semester} update={scope.update} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {tabs}
        <div className="flex flex-wrap items-center gap-3 text-sm text-white">
          <span>{r("export.note", { subjects: nf.format(data.subjects.length), programmes: nf.format(data.programmes.length) })}</span>
          <button type="button" onClick={download} disabled={busy || empty}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-900 shadow hover:bg-gray-100 disabled:opacity-60">
            {busy ? r("export.busy") : r("export.button")}
          </button>
        </div>
      </div>
      {exportFailed && <p role="alert" className="rounded-2xl bg-white p-3 text-sm text-red-700 shadow-lg">{r("export.failed")}</p>}

      <div className={refreshing ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={refreshing}>
        {failed === "error" && (
          <div className="mb-4 rounded-2xl bg-white p-3 text-sm text-gray-900 shadow-lg">
            {t("state.error")} <button type="button" onClick={retry} className="font-medium text-blue-700 underline">{t("state.retry")}</button>
          </div>
        )}

        {/* ---- summary strip, the same on every tab ---- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Tile label={r("summary.appeared")} value={empty ? null : num(summary.appeared)} reason={t("reason.no_results")}
            lines={[r("summary.passedFailed", { passed: nf.format(summary.passed), failed: nf.format(summary.failed) })]} />
          <Tile label={r("summary.passPercent")} value={pct(summary.pass_pct)} reason={t("reason.no_results")}
            lines={[r("summary.passedOf", { passed: nf.format(summary.passed), appeared: nf.format(summary.appeared) })]}
            compare={compare(summary.pass_pct, summary.previous_pass_pct,
              summary.previous_pass_pct === null ? "" : t("compare.pass", { value: nf.format(summary.previous_pass_pct ?? 0) }))} />
          <Tile label={r("summary.averageCgpa")} value={num(summary.average_cgpa)} reason={t("reason.no_results")}
            lines={summary.highest_cgpa === null ? [] : [r("summary.highLow", { high: nf.format(summary.highest_cgpa), low: nf.format(summary.lowest_cgpa) })]}
            compare={compare(summary.average_cgpa, summary.previous_average_cgpa,
              summary.previous_average_cgpa === null ? "" : t("compare.cgpa", { value: nf.format(summary.previous_average_cgpa ?? 0) }))} />
          <Tile label={r("summary.lowestSubject")} value={summary.lowest_subject ? summary.lowest_subject.name : null} reason={t("reason.no_results")}
            lines={summary.lowest_subject ? [r("summary.subjectLine", { pct: nf.format(summary.lowest_subject.pass_pct), n: nf.format(summary.lowest_subject.n) })] : []} />
        </div>

        {empty ? (
          <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">{r("empty")}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {view === "overview" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <ChartCard className="lg:col-span-7" title={r("chart.subjectPass")} height={chartHeight}
                  note={r("chart.target", { value: nf.format(rules.pass_target_percent) })}
                  empty={!subjectChart.length} emptyText={r("empty")} viewLabel={t("chart.viewData")} hideLabel={t("chart.hideData")}
                  columns={[r("col.subject"), r("col.passPercent"), r("col.appeared")]}
                  rows={subjectChart.map((s) => [s.name, pct(s.pass_pct), s.appeared])}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChart} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [pct(v), r("chart.passPercent")]} />
                      <ReferenceLine x={rules.pass_target_percent} stroke="#6b7280" strokeDasharray="4 4" />
                      <Bar dataKey="pass_pct" isAnimationActive={false}>
                        {subjectChart.map((s) => <Cell key={s.name} fill={s.pass_pct < rules.pass_target_percent ? FAIL : ANCHOR} />)}
                        <LabelList dataKey="pass_pct" position="right" formatter={(v) => `${nf.format(v)}%`} fontSize={12} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard className="lg:col-span-5" title={r("chart.cgpaBands")}
                  empty={!data.cgpa_distribution.length} emptyText={r("empty")} viewLabel={t("chart.viewData")} hideLabel={t("chart.hideData")}
                  columns={[r("chart.band"), r("chart.students")]} rows={data.cgpa_distribution.map((b) => [b.label, nf.format(b.count)])}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.cgpa_distribution} margin={{ top: 18, right: 8, bottom: 4, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} width={36} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [nf.format(v), r("chart.students")]} />
                      <Bar dataKey="count" fill={ANCHOR} isAnimationActive={false}>
                        <LabelList dataKey="count" position="top" fontSize={12} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}

            {view === "programmes" && (
              <Panel>
                <Table columns={[r("col.programme"), r("col.appeared"), r("col.passed"), r("col.passPercent"), r("col.averageCgpa")]}
                  numeric={[1, 2, 3, 4]}
                  rows={data.programmes.map((p) => [
                    p.below_target ? `${p.name} (${r("note.belowTarget")})` : p.name, num(p.appeared), num(p.passed),
                    passCell(p.pass_pct, p.small), num(p.average_cgpa),
                  ])} />
              </Panel>
            )}

            {view === "subjects" && (
              <Panel>
                <Table columns={[r("col.subject"), r("col.appeared"), r("col.passed"), r("col.passPercent"), r("col.mean"), r("col.median"), r("col.highest"), r("col.lowest")]}
                  numeric={[1, 2, 3, 4, 5, 6, 7]}
                  rows={data.subjects.map((s) => [s.name, num(s.appeared), num(s.passed), passCell(s.pass_pct, s.small),
                    num(s.mean), num(s.median), num(s.highest), num(s.lowest)])} />
              </Panel>
            )}

            {view === "grades" && (
              <Panel>
                <Table columns={[r("col.subject"), ...data.grades.order]} numeric={data.grades.order.map((_, i) => i + 1)}
                  rows={[
                    [r("col.allSubjects"), ...data.grades.order.map((g) => nf.format(data.grades.overall.find((o) => o.grade === g)?.count ?? 0))],
                    ...data.grades.subjects.map((s) => [s.name, ...data.grades.order.map((g) => nf.format(s.counts[g] ?? 0))]),
                  ]}
                  rowClass={(index) => (index === 0 ? "bg-gray-50 font-semibold" : "")} />
                <p className="mt-2 text-xs text-gray-500">{failGrades.join(", ")}</p>
              </Panel>
            )}

            {anySmall && view !== "overview" && view !== "grades" && (
              <p className="rounded-2xl bg-white p-3 text-xs text-gray-600 shadow-lg">{r("note.small", { n: rules.small_group })}</p>
            )}
          </div>
        )}

        <details className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">
          <summary className="cursor-pointer font-semibold text-gray-900">{r("definitions.title")}</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{r("definitions.pass", { grades: failGrades.join("/") })}</li>
            <li>{r("definitions.subject")}</li>
            <li>{r("definitions.cgpa")}</li>
            <li>{r("definitions.small", { n: rules.small_group })}</li>
            <li>{r("definitions.left")}</li>
          </ul>
        </details>

        <p className="mt-4 text-xs text-white/90">{t("dataCheck.generated", { date })}</p>
      </div>
    </>
  );
}

export default function ResultAnalysisPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <ResultAnalysis />
    </Suspense>
  );
}

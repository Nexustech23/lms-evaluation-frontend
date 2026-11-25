"use client";

// Reports dashboard for an Institute Admin of a college: the scope bar, the overview numbers, two charts and what needs
// attention. The numbers come from GET /api/reports/overview. A number the app cannot work out is shown as "-".

import { Suspense, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AuthContext } from "@/app/AuthContext";
import { COLLEGE, instituteTypeOf } from "@/institute/instituteKind";
import Navbar from "@/components/ui/Navbar";
import { ANCHOR, CatalogueCard, ChartCard, FAIL, SectionTitle, Skeleton, Tile } from "./reportsUi";
import { ScopeBar, useScope } from "./scope";

// The reports that exist, by the name the API gives them. A tile or a row links only to a report that is built.
const REPORT_PATHS = { "data-check": "/admin/reports/data-check" };

function ReportsHome() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { user } = useContext(AuthContext);

  // The scope lives in the address, so a link or a refresh shows the same numbers.
  const { programme, batch, semester, update, query } = useScope();

  const isCollege = instituteTypeOf(user) === COLLEGE;
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(null); // null | "error" | "college"
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isCollege) return undefined;
    let cancelled = false;
    setRefreshing(true);
    setFailed(null);
    const params = {};
    if (programme) params.programme = programme;
    if (batch) params.batch = batch;
    if (semester) params.semester = semester;
    axios
      .get("/api/reports/overview", { params, withCredentials: true })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setFailed(err?.response?.status === 403 ? "college" : "error");
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCollege, programme, batch, semester, attempt]);

  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const pct = (v) => `${nf.format(v)}%`;

  const bg = { backgroundColor: user?.color || "#ff7f10" };
  const shell = (children) => (
    <div className="min-h-screen" style={bg}>
      <Navbar title={t("title")} />
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">{children}</div>
    </div>
  );
  const message = (text, retry) => (
    <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
      <p className="font-semibold text-gray-900">{text}</p>
      {retry && (
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
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
        <Skeleton className="mb-4 h-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Skeleton className="h-72 lg:col-span-7" />
          <Skeleton className="h-72 lg:col-span-5" />
        </div>
      </div>
    );
  }

  const { tiles, filters, scope, rules } = data;
  const reason = (tile) => (tile.reason ? t(`reason.${tile.reason}`) : undefined);
  const date = data.as_of
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.as_of))
    : null;

  const compare = (current, previous, text) => {
    if (current === null || current === undefined || previous === null || previous === undefined) return undefined;
    const direction = current > previous ? "up" : current < previous ? "down" : "same";
    return { direction, directionText: t(`compare.${direction}`), text };
  };
  const evaluation = tiles.evaluation;
  const evaluationLines = evaluation.value === null ? [] : [t("sub.evaluation", { done: evaluation.value, total: evaluation.of })];
  if (evaluation.pending) evaluationLines.push(t("sub.evaluationPending", { n: evaluation.pending }));

  const readiness = [
    <Tile key="students" label={t("tile.students")} value={nf.format(tiles.students.value)}
      lines={data.coverage.with_results ? [t("sub.studentsResults", { n: nf.format(data.coverage.with_results) })] : []} />,
    <Tile key="exams" label={t("tile.exams")} value={nf.format(tiles.exams.value)}
      lines={scope.semester ? [t("sub.exams")] : []} />,
    <Tile key="evaluation" label={t("tile.evaluation")}
      value={evaluation.value === null ? null : pct(evaluation.of ? Math.round((evaluation.value / evaluation.of) * 100) : 0)}
      reason={reason(evaluation)} lines={evaluationLines} href={`${REPORT_PATHS["data-check"]}${query}`}
      progress={evaluation.of ? Math.round((evaluation.value / evaluation.of) * 100) : undefined} />,
    <Tile key="checks" label={t("tile.dataChecks")}
      value={tiles.data_checks.value === null ? null : nf.format(tiles.data_checks.value)} reason={reason(tiles.data_checks)}
      href={`${REPORT_PATHS["data-check"]}${query}`}
      lines={[t("sub.dataChecks", { courses: tiles.data_checks.courses, exams: tiles.data_checks.exams, stale: tiles.data_checks.stale })]} />,
  ];
  const results = [
    <Tile key="pass" label={t("tile.passPercent")} value={tiles.pass_percent.value === null ? null : pct(tiles.pass_percent.value)}
      reason={reason(tiles.pass_percent)} lines={[t("sub.pass", { n: nf.format(tiles.pass_percent.of ?? 0) })]}
      compare={compare(tiles.pass_percent.value, tiles.pass_percent.previous,
        tiles.pass_percent.previous === null ? "" : t("compare.pass", { value: nf.format(tiles.pass_percent.previous ?? 0) }))} />,
    <Tile key="cgpa" label={t("tile.averageCgpa")} value={tiles.average_cgpa.value === null ? null : nf.format(tiles.average_cgpa.value)}
      reason={reason(tiles.average_cgpa)}
      compare={compare(tiles.average_cgpa.value, tiles.average_cgpa.previous,
        tiles.average_cgpa.previous === null ? "" : t("compare.cgpa", { value: nf.format(tiles.average_cgpa.previous ?? 0) }))} />,
    <Tile key="backlogs" label={t("tile.backlogs")} value={tiles.backlogs.value === null ? null : nf.format(tiles.backlogs.value)}
      reason={reason(tiles.backlogs)} lines={[t("sub.backlogs", { papers: nf.format(tiles.backlogs.papers ?? 0) })]} />,
    <Tile key="risk" label={t("tile.atRisk")} value={tiles.at_risk.value === null ? null : nf.format(tiles.at_risk.value)}
      reason={reason(tiles.at_risk)} lines={[t("sub.atRisk", { n: nf.format(tiles.at_risk.of ?? 0) })]} />,
  ];

  const points = data.pass_trend.points;
  const grades = data.grade_distribution.items;
  const attention = data.attention;

  return shell(
    <>
      {/* ---- header: when the numbers are from, and the way to the sections ---- */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-white">
        <p className="text-sm">{date ? t("asOf", { date }) : t("noDate")}</p>
        <nav className="flex gap-4 text-sm font-medium" aria-label={t("title")}>
          <a href="#overview" className="underline-offset-2 hover:underline">{t("jumpOverview")}</a>
          <a href="#attention" className="underline-offset-2 hover:underline">{t("jumpAttention")}</a>
        </nav>
      </div>

      {/* ---- scope bar ---- */}
      <ScopeBar
        filters={filters}
        scope={scope}
        programme={programme}
        batch={batch}
        semester={semester}
        update={update}
        coverage={t("coverage", { withResults: nf.format(data.coverage.with_results), students: nf.format(data.coverage.students) })}
      />

      <div className={refreshing ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={refreshing}>
        {failed === "error" && (
          <div className="mb-4 rounded-2xl bg-white p-3 text-sm text-gray-900 shadow-lg">
            {t("state.error")}{" "}
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="font-medium text-blue-700 underline">
              {t("state.retry")}
            </button>
          </div>
        )}

        {/* ---- overview tiles ---- */}
        <SectionTitle id="overview">{t("overview")}</SectionTitle>
        <h3 className="mb-2 mt-3 text-sm font-semibold text-white/90">{t("groupReadiness")}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{readiness}</div>
        <h3 className="mb-2 mt-5 text-sm font-semibold text-white/90">{t("groupResults")}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{results}</div>

        {/* ---- charts ---- */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <ChartCard className="lg:col-span-7" title={t("chart.passTrend")}
            note={[data.pass_trend.batch && t("chart.passTrendBatch", { batch: data.pass_trend.batch }), t("chart.passTrendNote")].filter(Boolean).join(" · ")}
            empty={!points.length} emptyText={t("chart.empty")} viewLabel={t("chart.viewData")} hideLabel={t("chart.hideData")}
            columns={[t("chart.semester"), t("chart.passPercent"), t("chart.appeared")]}
            rows={points.map((p) => [p.semester, pct(p.pass_pct), p.n])}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={44} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [pct(v), t("chart.passPercent")]} labelFormatter={(v) => `${t("chart.semester")} ${v}`} />
                <ReferenceLine y={rules.pass_target_percent} stroke="#6b7280" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="pass_pct" stroke={ANCHOR} strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard className="lg:col-span-5" title={t("chart.grades")}
            note={data.grade_distribution.semester ? t("chart.gradesSemester", { n: data.grade_distribution.semester }) : undefined}
            empty={!grades.length} emptyText={t("chart.empty")} viewLabel={t("chart.viewData")} hideLabel={t("chart.hideData")}
            columns={[t("chart.grade"), t("chart.students"), t("chart.share")]}
            rows={grades.map((g) => [g.grade, nf.format(g.count), pct(g.percent ?? 0)])}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grades} margin={{ top: 18, right: 8, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} width={36} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [nf.format(v), t("chart.students")]} />
                <Bar dataKey="count" isAnimationActive={false}>
                  {grades.map((g) => <Cell key={g.grade} fill={rules.fail_grades.includes(g.grade) ? FAIL : ANCHOR} />)}
                  <LabelList dataKey="count" position="top" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ---- needs attention ---- */}
        <div className="mt-5">
          <SectionTitle id="attention">{t("attention.title")}</SectionTitle>
          <ul className="mt-3 divide-y divide-gray-100 rounded-2xl bg-white shadow-lg">
            {attention.items.map((item) => (
              <li key={item.key} className="flex items-start gap-3 p-4 text-sm text-gray-900">
                <FaExclamationTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <span className="sr-only">{t("attention.title")}: </span>
                  {t(`attention.${item.key}`, {
                    count: nf.format(item.count),
                    of: item.of === undefined ? "-" : nf.format(item.of),
                    target: nf.format(rules.pass_target_percent),
                    names: (item.names || []).join(", "),
                  })}
                </span>
                {REPORT_PATHS[item.report] && (
                  <Link href={`${REPORT_PATHS[item.report]}${query}`}
                    className="ml-auto shrink-0 font-medium text-blue-700 underline-offset-2 hover:underline">
                    {t("attention.view")}
                  </Link>
                )}
              </li>
            ))}
            {!attention.items.length && (
              <li className="flex items-center gap-3 p-4 text-sm text-gray-600">
                {attention.all_clear ? (
                  <>
                    <FaCheckCircle aria-hidden="true" className="shrink-0 text-green-700" />
                    {t("attention.allClear")}
                  </>
                ) : (
                  "-"
                )}
              </li>
            )}
          </ul>
        </div>

        {/* ---- the reports that exist ---- */}
        <div className="mt-5">
          <SectionTitle id="catalogue">{t("catalogue.title")}</SectionTitle>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CatalogueCard
              step={1}
              href={`${REPORT_PATHS["data-check"]}${query}`}
              name={t("catalogue.dataCheckName")}
              question={t("catalogue.dataCheckQuestion")}
              status={
                tiles.data_checks.value === null
                  ? { tone: "none", text: t("catalogue.statusNone") }
                  : tiles.data_checks.value + (tiles.evaluation.pending || 0) > 0
                    ? { tone: "fix", text: t("catalogue.statusFix", { n: nf.format(tiles.data_checks.value + (tiles.evaluation.pending || 0)) }) }
                    : { tone: "ok", text: t("catalogue.statusClear") }
              }
              meta={[t("catalogue.forAdmin"), t("catalogue.aggregates")]}
            />
          </div>
        </div>

        {/* ---- how the numbers are worked out ---- */}
        <details className="mt-5 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">
          <summary className="cursor-pointer font-semibold text-gray-900">{t("definitions.title")}</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{t("definitions.pass")}</li>
            <li>{t("definitions.cgpa")}</li>
            <li>{t("definitions.backlogs", { grades: rules.fail_grades.join("/") })}</li>
            <li>{t("definitions.atRisk", { papers: rules.at_risk_failed_papers, cgpa: nf.format(rules.at_risk_min_cgpa) })}</li>
            <li>{t("definitions.stale")}</li>
          </ul>
        </details>
      </div>
    </>
  );
}

export default function ReportsPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <ReportsHome />
    </Suspense>
  );
}

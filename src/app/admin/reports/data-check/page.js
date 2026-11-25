"use client";

// Data Check: which courses, exams and results are incomplete, so an admin knows what to fix before the other numbers can
// be trusted. The same scope bar as the Reports dashboard; the counts equal the dashboard's. Students appear only as counts.

import { Suspense, useContext, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FaCheckCircle } from "react-icons/fa";

import { AuthContext } from "@/app/AuthContext";
import { COLLEGE, instituteTypeOf } from "@/institute/instituteKind";
import Navbar from "@/components/ui/Navbar";
import { Skeleton, Tile } from "../reportsUi";
import { ScopeBar, useReportData, useScope } from "../scope";

const dash = (value) => (value === null || value === undefined || value === "" ? "-" : value);

function Section({ id, title, count, fix, link, truncated, children }) {
  const t = useTranslations("reports.dataCheck");
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl bg-white p-4 shadow-lg" aria-labelledby={`${id}-title`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`${id}-title`} className="text-base font-semibold text-gray-900">
          {title} <span className="font-normal text-gray-500">({count})</span>
        </h2>
        {link && (
          <Link href={link.href} className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline">
            {link.text}
          </Link>
        )}
      </div>
      {count > 0 ? (
        <>
          <p className="mt-1 text-sm text-gray-600">{fix}</p>
          <div className="mt-3 overflow-x-auto">{children}</div>
          {truncated && <p className="mt-2 text-xs text-gray-500">{truncated}</p>}
        </>
      ) : (
        <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <FaCheckCircle aria-hidden="true" className="shrink-0 text-green-700" />
          {t("allFine")}
        </p>
      )}
    </section>
  );
}

function Table({ columns, rows, numeric = [] }) {
  return (
    <table className="w-full min-w-[420px] text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-600">
          {columns.map((c, i) => (
            <th key={c} scope="col" className={`py-2 pr-3 font-semibold ${numeric.includes(i) ? "text-right" : ""}`}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className="border-b border-gray-100">
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

function DataCheck() {
  const t = useTranslations("reports");
  const d = useTranslations("reports.dataCheck");
  const locale = useLocale();
  const { user } = useContext(AuthContext);
  const scope = useScope();
  const isCollege = instituteTypeOf(user) === COLLEGE;
  const { data, failed, refreshing, retry } = useReportData("/api/reports/data-check", scope, isCollege);
  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  const shell = (children) => (
    <div className="min-h-screen" style={{ backgroundColor: user?.color || "#ff7f10" }}>
      <Navbar title={t("catalogue.dataCheckName")} />
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
        <Skeleton className="mt-4 h-60" />
      </div>
    );
  }

  const { summary } = data;
  const shown = (section) => (section.truncated ? d("truncated", { shown: section.items.length, total: nf.format(section.total) }) : null);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generated_at));
  const missing = (n) => (data.checks_ran ? nf.format(n) : null);

  return shell(
    <>
      <div className="text-white">
        <nav aria-label="breadcrumb" className="text-sm">
          <Link href={`/admin/reports${scope.query}`} className="underline-offset-2 hover:underline">
            {t("title")}
          </Link>
          <span aria-hidden="true"> › </span>
          <span aria-current="page">{t("catalogue.dataCheckName")}</span>
        </nav>
        <h1 className="mt-1 text-2xl font-bold">{t("catalogue.dataCheckName")}</h1>
        <p className="text-sm text-white/90">{d("question")}</p>
      </div>

      <ScopeBar filters={data.filters} scope={data.scope} programme={scope.programme} batch={scope.batch}
        semester={scope.semester} update={scope.update} />

      <div className={refreshing ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={refreshing}>
        {failed === "error" && (
          <div className="mb-4 rounded-2xl bg-white p-3 text-sm text-gray-900 shadow-lg">
            {t("state.error")}{" "}
            <button type="button" onClick={retry} className="font-medium text-blue-700 underline">{t("state.retry")}</button>
          </div>
        )}

        {/* ---- summary strip: the same numbers as the dashboard tiles ---- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Tile label={d("summary.courses")} value={missing(summary.courses.count)} reason={t("reason.nothing_to_check")}
            lines={[d("summary.of", { n: nf.format(summary.courses.of) })]} />
          <Tile label={d("summary.exams")} value={missing(summary.exams.count)} reason={t("reason.nothing_to_check")}
            lines={[d("summary.of", { n: nf.format(summary.exams.of) })]} />
          <Tile label={d("summary.evaluation")} value={summary.evaluation.of ? nf.format(summary.evaluation.pending) : null}
            reason={t("reason.no_answers")} lines={[d("summary.of", { n: nf.format(summary.evaluation.of) })]} />
          <Tile label={d("summary.stale")} value={missing(summary.stale.count)} reason={t("reason.nothing_to_check")} />
        </div>

        {!data.checks_ran ? (
          <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">{d("noChecks")}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {data.all_clear && (
              <p className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-medium text-gray-900 shadow-lg">
                <FaCheckCircle aria-hidden="true" className="shrink-0 text-green-700" />
                {d("allClear")}
              </p>
            )}

            <Section id="courses" title={d("section.courses")} count={data.courses.total} fix={d("fix.courses")}
              truncated={shown(data.courses)}
              link={user?.hasCOAccess ? { href: "/admin/co", text: d("link.courses") } : null}>
              <Table columns={[d("col.course"), d("col.code"), d("col.programme"), d("col.batch"), d("col.semester")]}
                rows={data.courses.items.map((c) => [c.name, c.code, c.programme, c.batch, c.semester])} numeric={[4]} />
            </Section>

            <Section id="exams" title={d("section.exams")} count={data.exams.total} fix={d("fix.exams")} truncated={shown(data.exams)}>
              <Table columns={[d("col.exam"), d("col.subject"), d("col.semester"), d("col.faculty")]}
                rows={data.exams.items.map((e) => [e.name, e.subject, e.semester, e.faculty])} numeric={[2]} />
            </Section>

            <Section id="evaluation" title={d("section.evaluation")} count={data.evaluation.total} fix={d("fix.evaluation")}
              truncated={shown(data.evaluation)}>
              <Table columns={[d("col.exam"), d("col.subject"), d("col.semester"), d("col.pending"), d("col.total")]}
                rows={data.evaluation.items.map((e) => [e.name, e.subject, e.semester, nf.format(e.pending), nf.format(e.total)])}
                numeric={[2, 3, 4]} />
            </Section>

            <Section id="stale" title={d("section.stale")} count={summary.stale.count} fix={d("fix.stale")}
              truncated={shown(data.stale)} link={{ href: "/admin/academic-transcript", text: d("link.stale") }}>
              <Table columns={[d("col.batch"), d("col.semester"), d("col.students")]}
                rows={data.stale.items.map((s) => [s.batch, s.semester, nf.format(s.students)])} numeric={[1, 2]} />
            </Section>
          </div>
        )}

        <details className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">
          <summary className="cursor-pointer font-semibold text-gray-900">{d("definitions.title")}</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{d("definitions.courses")}</li>
            <li>{d("definitions.exams")}</li>
            <li>{d("definitions.evaluation")}</li>
            <li>{d("definitions.stale")}</li>
            <li>{d("definitions.scope")}</li>
          </ul>
        </details>

        <p className="mt-4 text-xs text-white/90">{d("generated", { date })}</p>
      </div>
    </>
  );
}

export default function DataCheckPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <DataCheck />
    </Suspense>
  );
}

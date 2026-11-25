"use client";

// CO / PO Attainment: how far the course outcomes (CO) and programme outcomes (PO) were attained, rolled up by programme and
// by batch, with every course listed. The CO numbers are worked out the same way as the per-course Excel report. A course
// that cannot be worked out is listed with the reason and left out of the roll-ups, never counted as zero. No student is named.

import { Suspense, useContext, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { AuthContext } from "@/app/AuthContext";
import { COLLEGE, instituteTypeOf } from "@/institute/instituteKind";
import Navbar from "@/components/ui/Navbar";
import { Skeleton, Tile } from "../reportsUi";
import { ScopeBar, useReportData, useScope } from "../scope";

const dash = (value) => (value === null || value === undefined || value === "" ? "-" : value);
// A darker cell is a higher level; the number and the level are always printed, so colour is never the only cue.
const TINT = ["bg-white", "bg-blue-50", "bg-blue-100", "bg-blue-200"];
const tint = (level) => TINT[Math.min(3, Math.max(0, Math.floor(level ?? 0)))];

function Panel({ title, note, children }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-lg">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
      <div className="mt-3 overflow-x-auto">{children}</div>
    </section>
  );
}

function PoTable({ firstColumn, groups, poCodes, t, nf }) {
  return (
    <table className="w-full min-w-[520px] text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-600">
          <th scope="col" className="py-2 pr-3 font-semibold">{firstColumn}</th>
          <th scope="col" className="py-2 pr-3 text-right font-semibold">{t("col.courses")}</th>
          <th scope="col" className="py-2 pr-3 text-right font-semibold">{t("col.attained")}</th>
          {poCodes.map((po) => (
            <th key={po} scope="col" className="py-2 px-2 text-center font-semibold">{po}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {groups.map((g) => (
          <tr key={g.id} className="border-b border-gray-100">
            <th scope="row" className="py-2 pr-3 text-left font-medium text-gray-900">{dash(g.name)}</th>
            <td className="py-2 pr-3 text-right tabular-nums">{nf.format(g.subjects)}</td>
            <td className="py-2 pr-3 text-right tabular-nums">{nf.format(g.co_attained)} / {nf.format(g.co_total)}</td>
            {poCodes.map((po) => {
              const v = g.po[po];
              return (
                <td key={po} className={`py-2 px-2 text-center tabular-nums ${v ? tint(v.level) : ""}`}>
                  {v ? (
                    <>
                      <span className="font-medium text-gray-900">{nf.format(v.percent)}%</span>
                      <span className="block text-xs text-gray-600">{t("heat.level", { value: nf.format(v.level) })}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Attainment() {
  const t = useTranslations("reports");
  const a = useTranslations("reports.attainment");
  const locale = useLocale();
  const { user } = useContext(AuthContext);
  const scope = useScope();
  const isCollege = instituteTypeOf(user) === COLLEGE;
  const { data, failed, refreshing, retry } = useReportData("/api/reports/attainment", scope, isCollege);
  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  const [busy, setBusy] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);

  const download = async () => {
    setBusy(true);
    setExportFailed(false);
    try {
      const params = {};
      if (scope.programme) params.programme = scope.programme;
      if (scope.batch) params.batch = scope.batch;
      if (scope.semester) params.semester = scope.semester;
      const res = await axios.get("/api/reports/attainment/export", { params, responseType: "blob", withCredentials: true });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = /filename="?([^";]+)"?/.exec(res.headers["content-disposition"] || "")?.[1] || "co-po-attainment.xlsx";
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
      <Navbar title={t("catalogue.attainmentName")} />
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

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generated_at));
  const counts = data.counts;
  const overall = data.overall;
  const leftOut = (counts.no_data || 0) + (counts.pending_review || 0) + (counts.no_targets || 0);
  const computed = !data.too_many && counts.computed > 0;
  const fixNote = (status) => (status === "ok" ? null : a(`fix.${status}`));

  return shell(
    <>
      <div className="text-white">
        <nav aria-label="breadcrumb" className="text-sm">
          <Link href={`/admin/reports${scope.query}`} className="underline-offset-2 hover:underline">{t("title")}</Link>
          <span aria-hidden="true"> › </span>
          <span aria-current="page">{t("catalogue.attainmentName")}</span>
        </nav>
        <h1 className="mt-1 text-2xl font-bold">{t("catalogue.attainmentName")}</h1>
        <p className="text-sm text-white/90">{a("question")}</p>
      </div>

      <ScopeBar filters={data.filters} scope={data.scope} programme={scope.programme} batch={scope.batch}
        semester={scope.semester} update={scope.update} allSemesters />

      <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-white">
        <span>{a("export.note")}</span>
        <button type="button" onClick={download} disabled={busy || !computed}
          className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-900 shadow hover:bg-gray-100 disabled:opacity-60">
          {busy ? a("export.busy") : a("export.button")}
        </button>
      </div>
      {exportFailed && <p role="alert" className="rounded-2xl bg-white p-3 text-sm text-red-700 shadow-lg">{a("export.failed")}</p>}

      <div className={refreshing ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={refreshing}>
        {failed === "error" && (
          <div className="mb-4 rounded-2xl bg-white p-3 text-sm text-gray-900 shadow-lg">
            {t("state.error")} <button type="button" onClick={retry} className="font-medium text-blue-700 underline">{t("state.retry")}</button>
          </div>
        )}

        {data.too_many ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-gray-900 shadow-lg" role="status">
            {a("tooMany", { n: nf.format(data.subjects_in_scope), limit: nf.format(data.limit) })}
          </p>
        ) : (
          <>
            {/* ---- summary strip ---- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Tile label={a("summary.inScope")} value={nf.format(counts.in_scope)} />
              <Tile label={a("summary.computed")} value={counts.in_scope ? nf.format(counts.computed) : null} reason={a("empty")}
                lines={[a("summary.ofN", { n: nf.format(counts.in_scope) }), a("summary.withPo", { n: nf.format(counts.with_po) })]} />
              <Tile label={a("summary.cos")} value={overall && overall.co_total ? `${nf.format(Math.round((overall.co_attained / overall.co_total) * 100))}%` : null}
                reason={a("empty")} lines={overall && overall.co_total ? [a("summary.coLine", { attained: nf.format(overall.co_attained), total: nf.format(overall.co_total) })] : []} />
              <Tile label={a("summary.leftOut")} value={counts.in_scope ? nf.format(leftOut) : null}
                lines={counts.no_matrix ? [`${a("status.no_matrix")}: ${nf.format(counts.no_matrix)}`] : []} />
            </div>

            {counts.in_scope === 0 || counts.computed === 0 ? (
              <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">{a("empty")}</p>
            ) : null}

            <div className="mt-4 space-y-4">
              {data.programmes.length > 0 && (
                <Panel title={a("section.programmes")} note={a("heat.note")}>
                  <PoTable firstColumn={a("col.programme")} groups={data.programmes} poCodes={data.po_codes} t={a} nf={nf} />
                </Panel>
              )}
              {data.batches.length > 0 && (
                <Panel title={a("section.batches")} note={a("heat.note")}>
                  <PoTable firstColumn={a("col.batch")} groups={data.batches} poCodes={data.po_codes} t={a} nf={nf} />
                </Panel>
              )}

              {data.subjects.length > 0 && (
                <Panel title={a("section.courses")}>
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-600">
                        {[a("col.course"), a("col.code"), a("col.programme"), a("col.batch"), a("col.semester"), a("col.status"), a("col.cos")].map((c) => (
                          <th key={c} scope="col" className="py-2 pr-3 font-semibold">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.subjects.map((s) => (
                        <tr key={s.id} className="border-b border-gray-100 align-top">
                          <th scope="row" className="py-2 pr-3 text-left font-medium text-gray-900">{dash(s.name)}</th>
                          <td className="py-2 pr-3 text-gray-700">{dash(s.code)}</td>
                          <td className="py-2 pr-3 text-gray-700">{dash(s.programme)}</td>
                          <td className="py-2 pr-3 text-gray-700">{dash(s.batch)}</td>
                          <td className="py-2 pr-3 text-gray-700">{dash(s.semester)}</td>
                          <td className="py-2 pr-3 text-gray-700">
                            <span className="font-medium">{a(`status.${s.status}`)}</span>
                            {fixNote(s.status) && <span className="mt-0.5 block text-xs text-gray-500">{fixNote(s.status)}</span>}
                          </td>
                          <td className="py-2 pr-3 text-gray-700">
                            {s.co.length === 0 ? "-" : s.co.map((c) => (
                              <span key={c.code} className="mr-3 inline-block whitespace-nowrap">
                                <span className="font-medium">{c.code}</span> {nf.format(c.score)}/{nf.format(c.target)}{" "}
                                <span className="text-xs text-gray-500">({c.attained ? a("co.attained") : a("co.notAttained")})</span>
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Panel>
              )}
            </div>
          </>
        )}

        <details className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-lg">
          <summary className="cursor-pointer font-semibold text-gray-900">{a("definitions.title")}</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{a("definitions.co")}</li>
            <li>{a("definitions.po")}</li>
            <li>{a("definitions.rollup")}</li>
            <li>{a("definitions.left")}</li>
            <li>{a("definitions.limits")}</li>
          </ul>
        </details>

        <p className="mt-4 text-xs text-white/90">{t("dataCheck.generated", { date })}</p>
      </div>
    </>
  );
}

export default function AttainmentPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <Attainment />
    </Suspense>
  );
}

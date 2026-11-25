"use client";

// The scope (programme, batch, semester) every Reports page shares. It lives in the address, so a link, a refresh or the
// back button shows the same numbers, and a tile on the dashboard opens its report with the same scope.

import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700";

export function scopeQuery({ programme, batch, semester }) {
  const params = new URLSearchParams();
  if (programme) params.set("programme", programme);
  if (batch) params.set("batch", batch);
  if (semester) params.set("semester", semester);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function useScope() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const programme = search.get("programme") || "";
  const batch = search.get("batch") || "";
  const semester = search.get("semester") || "";
  const view = search.get("view") || ""; // which part of a report is open; not part of the scope other reports share
  const segment = search.get("segment") || ""; // which group a list shows; likewise not part of the shared scope

  const update = (changes) => {
    const next = new URLSearchParams(search.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    const text = next.toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  };
  return { programme, batch, semester, view, segment, update, query: scopeQuery({ programme, batch, semester }) };
}

// The scope as request parameters.
export function scopeParams({ programme, batch, semester, segment }) {
  const params = {};
  if (programme) params.programme = programme;
  if (batch) params.batch = batch;
  if (semester) params.semester = semester;
  if (segment) params.segment = segment;
  return params;
}

// Downloads a file the server builds for the scope (Excel or PDF). `busy` holds which kind is being prepared.
export function useDownload() {
  const [busy, setBusy] = useState("");
  const [failed, setFailed] = useState(false);
  const run = async (kind, path, params, fallbackName) => {
    setBusy(kind);
    setFailed(false);
    try {
      const res = await axios.get(path, { params, responseType: "blob", withCredentials: true });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = /filename="?([^";]+)"?/.exec(res.headers["content-disposition"] || "")?.[1] || fallbackName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setFailed(true);
    } finally {
      setBusy("");
    }
  };
  return { busy, failed, run };
}

// Loads one report for the scope. `failed` is "college" when the API says reports are for colleges only, else "error".
// The last answer stays on screen while a new scope loads, so the page does not jump.
export function useReportData(path, { programme, batch, semester, segment }, enabled = true) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setRefreshing(true);
    setFailed(null);
    const params = {};
    if (programme) params.programme = programme;
    if (batch) params.batch = batch;
    if (semester) params.semester = semester;
    if (segment) params.segment = segment;
    axios
      .get(path, { params, withCredentials: true })
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
  }, [enabled, path, programme, batch, semester, segment, attempt]);

  return { data, failed, refreshing, retry: () => setAttempt((n) => n + 1) };
}

// The scope bar: three choices, the scope in words, and a way back to the latest. `filters` and `scope` come from the API.
export function ScopeBar({ filters, scope, programme, batch, semester, update, coverage, allSemesters = false }) {
  const t = useTranslations("reports");
  const batchesForProgramme = filters.batches.filter((b) => !programme || b.programme_id === programme);
  const programmeName = filters.programmes.find((p) => p.id === programme)?.name;
  const batchName = filters.batches.find((b) => b.id === batch)?.name;
  return (
    <section className="rounded-2xl bg-white p-4 shadow-lg" aria-label={t("overview")}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-gray-700">
          {t("filters.programme")}
          <select
            className={`${selectClass} mt-1`}
            value={programme}
            onChange={(e) => {
              const next = e.target.value;
              const keep = filters.batches.some((b) => b.id === batch && (!next || b.programme_id === next));
              update({ programme: next, batch: keep ? batch : "" });
            }}
          >
            <option value="">{t("filters.all")}</option>
            {filters.programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          {t("filters.batch")}
          <select className={`${selectClass} mt-1`} value={batch} onChange={(e) => update({ batch: e.target.value })}>
            <option value="">{t("filters.all")}</option>
            {batchesForProgramme.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          {t("filters.semester")}
          <select className={`${selectClass} mt-1`} value={semester} onChange={(e) => update({ semester: e.target.value })}>
            <option value="">
              {allSemesters
                ? t("attainment.semesterAll")
                : scope.semester
                  ? `${t("filters.semester")} ${scope.semester} (${t("filters.latest")})`
                  : t("filters.latest")}
            </option>
            {filters.semesters.map((n) => (
              <option key={n} value={n}>{`${t("filters.semester")} ${n}`}</option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-700"
        role="status"
        aria-live="polite"
      >
        <p>
          {t("scope", {
            semester: scope.semester ? `${t("filters.semester")} ${scope.semester}` : allSemesters ? t("attainment.semesterAll") : "-",
            programme: programmeName || t("filters.all"),
            batch: batchName || t("filters.all"),
          })}
          {coverage ? ` · ${coverage}` : ""}
        </p>
        {(programme || batch || semester) && (
          <button
            type="button"
            onClick={() => update({ programme: "", batch: "", semester: "" })}
            className="rounded px-1 font-medium text-blue-700 underline-offset-2 hover:underline"
          >
            {t("filters.reset")}
          </button>
        )}
      </div>
    </section>
  );
}

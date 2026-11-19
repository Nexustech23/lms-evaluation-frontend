"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";
import {
  MAX_BANDS, blankBand, fromServer, gradeFor, rangesOf, toPayload, validateScale,
} from "@/school/grading";

// The Grading page of a school. Grades come from each student's own percentage (no ranking). The CBSE nine-point scale
// is in place until the school edits it; "Reset to CBSE default" brings it back.

const withAlpha = (hex = "#ff7f10", alpha = 1) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const inputClass = "rounded-lg border px-2 py-2 text-sm font-semibold outline-none focus:ring-2 sm:px-3";

const show = (value) => (Number.isFinite(value) ? String(Math.round(value * 100) / 100) : "");

function scaleFromServer(data) {
  return { pass: String(data.pass_percentage), bands: data.bands.map(fromServer) };
}

export default function SchoolGrading() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";

  const [scale, setScale] = useState({ pass: "33", bands: [] });
  const [saved, setSaved] = useState(null);          // what the server has, as a payload, to tell when something changed
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tryMarks, setTryMarks] = useState("");

  const apply = (data) => {
    const next = scaleFromServer(data);
    setScale(next);
    setSaved(JSON.stringify(toPayload(next)));
    setIsDefault(!!data.is_default);
  };

  useEffect(() => {
    let cancelled = false;
    axios.get("/api/school-grading", { withCredentials: true })
      .then((res) => { if (!cancelled) apply(res.data.data); })
      .catch((err) => toast.error(err?.response?.data?.detail || "Could not load the grading"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const problem = useMemo(() => validateScale(scale), [scale]);
  const changed = saved !== null && !problem && JSON.stringify(toPayload(scale)) !== saved;
  const ranges = useMemo(() => rangesOf(scale.bands), [scale.bands]);
  const passMark = Number(scale.pass);
  const tried = tryMarks === "" ? null : gradeFor(tryMarks, scale.bands);

  const editBand = (key, field, value) => setScale((s) => ({
    ...s, bands: s.bands.map((band) => (band.key === key ? { ...band, [field]: value } : band)),
  }));
  const removeBand = (key) => setScale((s) => ({ ...s, bands: s.bands.filter((band) => band.key !== key) }));
  const addBand = () => setScale((s) => ({ ...s, bands: [...s.bands, blankBand()] }));

  const save = async () => {
    if (problem) return;
    setBusy(true);
    try {
      const res = await axios.put("/api/school-grading", toPayload(scale), { withCredentials: true });
      apply(res.data.data);
      toast.success("Grading saved");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save the grading");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Go back to the CBSE nine-point scale? Your changes to the grades will be removed.")) return;
    setBusy(true);
    try {
      const res = await axios.delete("/api/school-grading", { withCredentials: true });
      apply(res.data.data);
      toast.success("Grading reset to the CBSE default");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not reset the grading");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: withAlpha(color, 1) }}>
      <Navbar title="Grading" />

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="min-h-[400px] rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="h-7 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            <h2 className="text-lg font-bold text-gray-800">Grading</h2>
            {!loading && (
              <span
                data-testid="grading-badge"
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: withAlpha(color, 0.12), color }}
              >
                {isDefault ? "CBSE default" : "Edited by your school"}
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <label htmlFor="grading-pass" className="text-sm font-semibold text-gray-700">Pass mark</label>
                <input
                  id="grading-pass"
                  data-testid="grading-pass"
                  type="number" min="0" max="100" step="0.01"
                  value={scale.pass}
                  onChange={(e) => setScale((s) => ({ ...s, pass: e.target.value }))}
                  className={`${inputClass} w-24 text-right`}
                  style={{ borderColor: withAlpha(color, 0.3) }}
                />
                <span className="text-sm text-gray-500">% a student needs in a subject to pass</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      <th className="px-1 sm:px-2">Grade</th>
                      <th className="px-1 sm:px-2">Marks from (%)</th>
                      <th className="hidden px-2 sm:table-cell">Marks up to</th>
                      <th className="px-1 sm:px-2">Grade point</th>
                      <th className="px-1 sm:px-2">Result</th>
                      <th className="px-2" />
                    </tr>
                  </thead>
                  <tbody data-testid="grading-rows">
                    {ranges.map(({ band, from, below }) => {
                      const passes = Number.isFinite(from) && Number.isFinite(passMark) && from >= passMark;
                      return (
                        <tr key={band.key} data-testid="grading-row" style={{ backgroundColor: withAlpha(color, 0.05) }}>
                          <td className="rounded-l-xl px-1 py-2 sm:px-2">
                            <input
                              aria-label="Grade name" data-testid="grade-name"
                              value={band.grade} maxLength={8}
                              onChange={(e) => editBand(band.key, "grade", e.target.value)}
                              className={`${inputClass} w-14 font-bold sm:w-24`} style={{ borderColor: withAlpha(color, 0.3) }}
                            />
                          </td>
                          <td className="px-1 py-2 sm:px-2">
                            <input
                              aria-label={`Marks from for ${band.grade || "this grade"}`} data-testid="grade-from"
                              type="number" min="0" max="100" step="0.01" value={band.min}
                              onChange={(e) => editBand(band.key, "min", e.target.value)}
                              className={`${inputClass} w-16 text-right sm:w-28`} style={{ borderColor: withAlpha(color, 0.3) }}
                            />
                          </td>
                          <td className="hidden px-2 py-2 text-gray-600 sm:table-cell" data-testid="grade-upto">
                            {below === null ? "100" : Number.isFinite(below) ? `below ${show(below)}` : "—"}
                          </td>
                          <td className="px-1 py-2 sm:px-2">
                            <input
                              aria-label={`Grade point for ${band.grade || "this grade"}`} data-testid="grade-point"
                              type="number" min="0" max="10" step="0.5" value={band.point}
                              onChange={(e) => editBand(band.key, "point", e.target.value)}
                              className={`${inputClass} w-14 text-right sm:w-24`} style={{ borderColor: withAlpha(color, 0.3) }}
                            />
                          </td>
                          <td className="px-1 py-2 sm:px-2" data-testid="grade-result">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${passes ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {passes ? "Pass" : "Fail"}
                            </span>
                          </td>
                          <td className="rounded-r-xl px-1 py-2 text-right sm:px-2">
                            <button
                              type="button" aria-label={`Remove ${band.grade || "grade"}`} data-testid="grade-remove"
                              disabled={scale.bands.length <= 1}
                              onClick={() => removeBand(band.key)}
                              className="px-1 text-lg font-bold text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button" data-testid="grade-add" onClick={addBand} disabled={scale.bands.length >= MAX_BANDS}
                className="mt-1 text-sm font-semibold hover:underline disabled:opacity-40" style={{ color }}
              >
                + Add grade
              </button>

              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                <label htmlFor="grading-try" className="font-semibold text-gray-700">Try a percentage</label>
                <input
                  id="grading-try" data-testid="grading-try" type="number" min="0" max="100" step="0.01"
                  value={tryMarks} onChange={(e) => setTryMarks(e.target.value)}
                  className={`${inputClass} w-24 text-right`} style={{ borderColor: withAlpha(color, 0.3) }}
                />
                <span data-testid="grading-try-result" className="font-bold text-gray-800">
                  {tried
                    ? `${tried.grade} (grade point ${tried.point || 0}) · ${Number(tryMarks) >= passMark ? "Pass" : "Fail"}`
                    : "—"}
                </span>
              </div>

              <p
                data-testid="grading-problem"
                className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${problem ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
              >
                {problem || "The grades cover every mark from 0 to 100."}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button" data-testid="grading-reset" onClick={reset} disabled={busy || isDefault}
                  className="text-sm font-semibold text-gray-500 transition hover:text-gray-700 disabled:opacity-40"
                >
                  Reset to CBSE default
                </button>
                <button
                  type="button" data-testid="grading-save" onClick={save} disabled={!changed || busy}
                  className="rounded-xl px-6 py-2.5 font-semibold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ backgroundColor: color }}
                >
                  {busy ? "Saving..." : "Save grading"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

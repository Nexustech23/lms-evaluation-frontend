"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "@/app/AuthContext";
import { withAlpha } from "@/lib/question-paper/colorHelpers";
import Navbar from "@/components/ui/Navbar";

// The student's own real results, from GET /api/student/results. A value the app does not have is shown as "-".
function show(value) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function number(value, digits = 2) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits).replace(/\.?0+$/, "") : "-";
}

export default function ResultPage() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/student/results", { withCredentials: true })
      .then((res) => {
        if (cancelled) return;
        setResults(res.data);
        const list = res.data?.semesters || [];
        setSelected(list.length ? list[list.length - 1].semester : null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const semesters = useMemo(() => results?.semesters || [], [results]);
  const current = semesters.find((s) => s.semester === selected) || null;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: withAlpha(color) }}>
      <Navbar title={"Result"} />

      <div className="min-h-screen p-4 mx-2 mb-6 rounded-xl" style={{ backgroundColor: color }}>
        <div className="max-w-6xl mx-auto space-y-6">
          {loading && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center text-gray-600">Loading your results...</div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <p className="font-semibold text-gray-900">Your results could not be loaded</p>
              <p className="text-sm text-gray-600 mt-1">-</p>
            </div>
          )}

          {!loading && !error && results && (
            <>
              {/* ---------- Summary ---------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { title: "Student", value: show(results.name) },
                  { title: "Enrollment No", value: show(results.enrollment_no) },
                  { title: "Programme", value: show(results.programme_name) },
                  { title: "CGPA", value: number(results.cgpa) },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-3xl p-6 shadow-xl">
                    <p className="text-gray-500 text-sm">{item.title}</p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-2 break-words">{item.value}</h2>
                  </div>
                ))}
              </div>

              {results.results_stale && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                  Some of your results are being updated and are not shown yet.
                </div>
              )}

              {/* ---------- Semesters ---------- */}
              {semesters.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
                  <p className="font-semibold text-gray-900">No results yet</p>
                  <p className="text-sm text-gray-600 mt-1">-</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="bg-white border border-orange-100 rounded-2xl p-2 flex flex-wrap gap-2 shadow-lg">
                      {semesters.map((s) => (
                        <button
                          key={s.semester}
                          onClick={() => setSelected(s.semester)}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            selected === s.semester ? "text-white shadow-lg" : "text-[#0d3b4a] hover:bg-blue-50"
                          }`}
                          style={{ backgroundColor: selected === s.semester ? color : "" }}
                        >
                          {show(s.label || `Semester ${s.semester}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {current && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                      <div className="p-6 border-b border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { title: "TGPA", value: number(current.tgpa) },
                          { title: "Total credits", value: number(current.total_credits) },
                          { title: "Credit points", value: number(current.total_credit_points) },
                          { title: "Total marks", value: number(current.overall_total) },
                        ].map((item) => (
                          <div key={item.title}>
                            <p className="text-gray-500 text-sm">{item.title}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                          <thead className="bg-gray-50">
                            <tr className="text-left text-gray-600 font-semibold text-sm">
                              <th className="p-4">Subject</th>
                              <th className="p-4">Credits</th>
                              <th className="p-4">Marks</th>
                              <th className="p-4">Grade</th>
                              <th className="p-4">Grade point</th>
                              <th className="p-4">Credit points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {current.subjects.length === 0 && (
                              <tr>
                                <td className="p-4 text-gray-500" colSpan={6}>-</td>
                              </tr>
                            )}
                            {current.subjects.map((row, i) => (
                              <tr key={`${row.subject}-${i}`} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{show(row.subject)}</td>
                                <td className="p-4 text-gray-700">{number(row.credits)}</td>
                                <td className="p-4 text-gray-700">{number(row.marks)}</td>
                                <td className="p-4">
                                  <span
                                    className="px-3 py-1 rounded-full text-sm font-semibold"
                                    style={{ backgroundColor: `${color}1f`, color: "#111827" }}
                                  >
                                    {show(row.grade)}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-700">{number(row.grade_point)}</td>
                                <td className="p-4 text-gray-700">{number(row.credit_points)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

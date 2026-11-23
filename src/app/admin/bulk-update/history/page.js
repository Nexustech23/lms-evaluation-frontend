"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

import { AuthContext } from "@/app/AuthContext";
import { darkenColor } from "@/lib/question-paper/colorHelpers";
import Navbar from "@/components/ui/Navbar";

const FIELD_LABELS = {
  name: "Name",
  father_name: "Father Name",
  dob: "Date of Birth",
  contact_no: "Contact No",
};

const STATUS_STYLE = {
  previewed: "bg-gray-100 text-gray-700",
  expired: "bg-gray-100 text-gray-500",
  applied: "bg-green-100 text-green-800",
  undone: "bg-amber-100 text-amber-800",
};

const STATUS_LABEL = {
  previewed: "Preview only",
  expired: "Preview expired",
  applied: "Applied",
  undone: "Undone",
};

// The backend answers errors as {detail: "text"} or {detail: {message, rows}}.
function errorText(err, fallback) {
  const data = err?.response?.data;
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg).filter(Boolean).join(" ") || fallback;
  return data?.error || data?.message || fallback;
}

function conflictRows(err) {
  const rows = err?.response?.data?.detail?.rows;
  return Array.isArray(rows) ? rows : [];
}

function show(value) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export default function BulkUpdateHistoryPage() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [openId, setOpenId] = useState(null);
  const [details, setDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);

  const [undoId, setUndoId] = useState(null);
  const [undoReason, setUndoReason] = useState("");
  const [undoing, setUndoing] = useState(false);
  const [problem, setProblem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await axios.get("/api/bulk-update/history", {
        params: { limit: 100 },
        withCredentials: true,
      });
      setItems(res.data?.items || []);
    } catch (err) {
      setLoadError(errorText(err, "Could not load the history"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleDetails = async (id) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (details[id]) return;
    setDetailLoading(true);
    try {
      const res = await axios.get(`/api/bulk-update/${id}`, { withCredentials: true });
      setDetails((old) => ({ ...old, [id]: res.data }));
    } catch (err) {
      toast.error(errorText(err, "Could not load the details"));
      setOpenId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const startUndo = (id) => {
    setUndoId(id);
    setUndoReason("");
    setProblem(null);
  };

  const runUndo = async () => {
    setUndoing(true);
    setProblem(null);
    try {
      const res = await axios.post(
        `/api/bulk-update/${undoId}/undo`,
        { reason: undoReason.trim() },
        { withCredentials: true }
      );
      toast.success(
        res.data?.already_undone
          ? "This update was already undone. Nothing more was changed."
          : `Undone. ${res.data?.undone_count ?? ""} student(s) restored.`
      );
      setDetails((old) => {
        const copy = { ...old };
        delete copy[undoId];
        return copy;
      });
      setUndoId(null);
      setOpenId(null);
      await load();
    } catch (err) {
      setProblem({
        id: undoId,
        message: errorText(err, "Could not undo the update"),
        rows: conflictRows(err),
      });
    } finally {
      setUndoing(false);
    }
  };

  const reasonOk = undoReason.trim().length >= 3 && undoReason.trim().length <= 500;

  return (
    <>
      <Navbar title="Bulk Update History" />

      <div className="mb-4 mx-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 px-4 ml-4 py-2 text-sm bg-white rounded"
          style={{ color: darkenColor(color) }}
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      <div className="min-h-screen p-4 mx-6 mb-6 rounded-xl" style={{ backgroundColor: color }}>
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Bulk Update History</h3>
              <p className="text-gray-600 text-sm mt-0.5">
                Every bulk update of your students, newest first. An applied update can be undone for 7 days.
              </p>
            </div>
            <Link
              href="/admin/bulk-update"
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-[#ff7f10]"
            >
              New bulk update
            </Link>
          </div>

          <div className="px-6 py-5 space-y-3">
            {loading && <p className="text-sm text-gray-500">Loading...</p>}

            {!loading && loadError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {loadError}{" "}
                <button type="button" onClick={load} className="underline">
                  Try again
                </button>
              </div>
            )}

            {!loading && !loadError && items.length === 0 && (
              <p className="text-sm text-gray-500">No bulk updates yet.</p>
            )}

            {items.map((item) => {
              const counts = item.counts || {};
              const detail = details[item.batch_id];
              return (
                <div key={item.batch_id} className="border rounded-xl overflow-hidden">
                  <div className="p-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-800 break-all">{show(item.file_name)}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[item.status] || "bg-gray-100 text-gray-700"}`}
                        >
                          {STATUS_LABEL[item.status] || item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Uploaded {formatTime(item.created_at)} · {counts.to_update ?? 0} to change ·{" "}
                        {counts.unchanged ?? 0} same · {counts.rejected ?? 0} problems
                      </p>
                      {item.applied_at && (
                        <p className="text-xs text-gray-500">Applied {formatTime(item.applied_at)}</p>
                      )}
                      {item.reason && (
                        <p className="text-sm text-gray-700">
                          <span className="text-gray-500">Reason: </span>
                          {item.reason}
                        </p>
                      )}
                      {item.undone_at && (
                        <p className="text-sm text-amber-800">
                          Undone {formatTime(item.undone_at)}
                          {item.undo_reason ? ` — ${item.undo_reason}` : ""}
                        </p>
                      )}
                      {item.can_undo && (
                        <p className="text-xs text-gray-500">Can be undone until {formatTime(item.undo_until)}</p>
                      )}
                      {item.status === "applied" && !item.can_undo && (
                        <p className="text-xs text-gray-500">The time to undo has passed.</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDetails(item.batch_id)}
                        className="px-3 py-1.5 rounded-lg text-sm border text-gray-700"
                      >
                        {openId === item.batch_id ? "Hide details" : "View details"}
                      </button>
                      {item.can_undo && (
                        <button
                          type="button"
                          onClick={() => startUndo(item.batch_id)}
                          disabled={undoing}
                          className="px-3 py-1.5 rounded-lg text-sm text-white bg-[#ff7f10] disabled:opacity-50"
                        >
                          Undo
                        </button>
                      )}
                    </div>
                  </div>

                  {undoId === item.batch_id && (
                    <div className="border-t bg-orange-50 p-4 space-y-2">
                      <p className="text-sm text-gray-800">
                        This puts back the old values of the {counts.to_update ?? 0} student(s) and their login accounts,
                        all together or none. It works only if nobody has changed them since the update.
                      </p>
                      <textarea
                        value={undoReason}
                        onChange={(e) => setUndoReason(e.target.value)}
                        maxLength={500}
                        rows={2}
                        placeholder="Reason for undoing (3 to 500 characters)"
                        className="w-full p-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={runUndo}
                          disabled={!reasonOk || undoing}
                          className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-[#ff7f10] disabled:opacity-50"
                        >
                          {undoing ? "Undoing..." : "Yes, undo"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setUndoId(null)}
                          disabled={undoing}
                          className="px-4 py-2 rounded-lg text-sm border text-gray-700 bg-white disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {problem && problem.id === item.batch_id && (
                    <div className="border-t bg-red-50 p-4 text-sm text-red-800 space-y-2">
                      <p className="font-semibold">{problem.message}</p>
                      {problem.rows.length > 0 && (
                        <ul className="list-disc ml-5 space-y-0.5">
                          {problem.rows.map((r, i) => (
                            <li key={i}>
                              Row {show(r.row)}
                              {r.enrollment_no ? ` (${r.enrollment_no})` : ""}: {show(r.reason || r.error)}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs">Nothing was changed.</p>
                    </div>
                  )}

                  {openId === item.batch_id && (
                    <div className="border-t p-4">
                      {detailLoading && !detail && <p className="text-sm text-gray-500">Loading...</p>}
                      {detail && (
                        <>
                          {(detail.changes || []).length === 0 ? (
                            <p className="text-sm text-gray-500">No student changes in this update.</p>
                          ) : (
                            <div className="overflow-x-auto border rounded-lg">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 text-left">
                                  <tr>
                                    <th className="px-3 py-2">Row</th>
                                    <th className="px-3 py-2">Enrollment No</th>
                                    <th className="px-3 py-2">Student</th>
                                    <th className="px-3 py-2">What changed</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detail.changes.map((c) => (
                                    <tr key={`${c.row}-${c.enrollment_no}`} className="border-t align-top">
                                      <td className="px-3 py-2">{c.row}</td>
                                      <td className="px-3 py-2">{c.enrollment_no}</td>
                                      <td className="px-3 py-2">{show(c.student_name)}</td>
                                      <td className="px-3 py-2 space-y-1">
                                        {Object.entries(c.changes || {}).map(([field, v]) => (
                                          <div key={field}>
                                            <span className="text-gray-500">{FIELD_LABELS[field] || field}: </span>
                                            <span className="line-through text-red-600">{show(v.old)}</span>
                                            <span className="mx-1">→</span>
                                            <span className="text-green-700 font-medium">{show(v.new)}</span>
                                          </div>
                                        ))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {detail.changes_truncated && (
                            <p className="text-xs text-gray-500 mt-1">
                              Only the first {(detail.changes || []).length} changes are shown here.
                            </p>
                          )}
                          {(detail.rejected || []).length > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              {detail.rejected.length} problem row(s) were in the file
                              {item.status === "applied" ? " and were skipped" : ""}.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

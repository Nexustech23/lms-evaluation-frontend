"use client";

import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaPlus,
  FaUndo,
} from "react-icons/fa";

import { AuthContext } from "@/app/AuthContext";
import { darkenColor } from "@/lib/question-paper/colorHelpers";
import Navbar from "@/components/ui/Navbar";
import {
  FIELD_LABELS,
  Modal,
  conflictRows,
  errorText,
  formatTime,
  show,
} from "../bulkUpdateUi";

const STATUS_STYLE = {
  previewed: "bg-gray-100 text-gray-700 border-gray-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
  applied: "bg-green-100 text-green-800 border-green-200",
  undone: "bg-amber-100 text-amber-800 border-amber-200",
};

const STATUS_LABEL = {
  previewed: "Preview only",
  expired: "Preview expired",
  applied: "Applied",
  undone: "Undone",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "undone", label: "Undone" },
  { key: "preview", label: "Previews" },
];

function matches(filter, status) {
  if (filter === "all") return true;
  if (filter === "preview") return status === "previewed" || status === "expired";
  return status === filter;
}

export default function BulkUpdateHistoryPage() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");

  const [openId, setOpenId] = useState(null);
  const [details, setDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);

  const [undoItem, setUndoItem] = useState(null);
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

  const visible = useMemo(() => items.filter((item) => matches(filter, item.status)), [items, filter]);

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

  const openUndo = (item) => {
    setUndoItem(item);
    setUndoReason("");
    setProblem(null);
  };

  const closeUndo = () => {
    if (!undoing) setUndoItem(null);
  };

  const runUndo = async () => {
    setUndoing(true);
    setProblem(null);
    const id = undoItem.batch_id;
    try {
      const res = await axios.post(
        `/api/bulk-update/${id}/undo`,
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
        delete copy[id];
        return copy;
      });
      setUndoItem(null);
      setOpenId(null);
      await load();
    } catch (err) {
      setProblem({ message: errorText(err, "Could not undo the update"), rows: conflictRows(err) });
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

      <div className="min-h-screen p-4 sm:p-6 mx-6 mb-6 rounded-xl" style={{ backgroundColor: color }}>
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* ---------- Header ---------- */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Update History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Every bulk update of your students, newest first. An applied update can be undone for 7 days.
              </p>
            </div>
            <Link
              href="/admin/bulk-update"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#ff7f10] hover:bg-[#e8700a] shadow"
            >
              <FaPlus className="text-xs" />
              New bulk update
            </Link>
          </div>

          <div className="px-6 sm:px-8 py-6 space-y-5">
            {/* ---------- Filters ---------- */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                    filter === f.key
                      ? "bg-[#ff7f10] text-white border-[#ff7f10]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading && <p className="text-sm text-gray-500 py-8 text-center">Loading the history...</p>}

            {!loading && loadError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex flex-wrap items-center gap-3">
                <FaExclamationTriangle />
                <span>{loadError}</span>
                <button type="button" onClick={load} className="underline font-semibold">
                  Try again
                </button>
              </div>
            )}

            {!loading && !loadError && visible.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                <p className="font-semibold text-gray-800">
                  {items.length === 0 ? "No bulk updates yet" : "Nothing matches this filter"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {items.length === 0
                    ? "When you upload a file to update students, it will show up here."
                    : "Choose another filter above."}
                </p>
              </div>
            )}

            {/* ---------- Table ---------- */}
            {!loading && !loadError && visible.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600 text-left text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3">File</th>
                      <th className="px-4 py-3">Applied</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Students</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item, index) => {
                      const counts = item.counts || {};
                      const detail = details[item.batch_id];
                      const open = openId === item.batch_id;
                      return (
                        <Fragment key={item.batch_id}>
                          <tr className={`align-top border-t border-gray-100 ${index % 2 ? "bg-gray-50/60" : "bg-white"}`}>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900 break-all">{show(item.file_name)}</p>
                              <p className="text-xs text-gray-500">Uploaded {formatTime(item.created_at)}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              {item.applied_at ? formatTime(item.applied_at) : "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-700 max-w-xs">
                              {show(item.reason)}
                              {item.undone_at && (
                                <p className="mt-1 text-xs text-amber-800">
                                  Undone {formatTime(item.undone_at)}
                                  {item.undo_reason ? `: ${item.undo_reason}` : ""}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              <b className="text-green-700">{counts.to_update ?? 0}</b> changed
                              <p className="text-xs text-gray-500">
                                {counts.unchanged ?? 0} same · {counts.rejected ?? 0} problems
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  STATUS_STYLE[item.status] || STATUS_STYLE.previewed
                                }`}
                              >
                                {STATUS_LABEL[item.status] || item.status}
                              </span>
                              {item.can_undo && (
                                <p className="mt-1 text-xs text-gray-500">Undo until {formatTime(item.undo_until)}</p>
                              )}
                              {item.status === "applied" && !item.can_undo && (
                                <p className="mt-1 text-xs text-gray-500">Undo time passed</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleDetails(item.batch_id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  {open ? "Hide" : "Details"}
                                  {open ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                {item.can_undo && (
                                  <button
                                    type="button"
                                    onClick={() => openUndo(item)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#ff7f10] hover:bg-[#e8700a]"
                                  >
                                    <FaUndo />
                                    Undo
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {open && (
                            <tr className="border-t border-gray-100 bg-white">
                              <td colSpan={6} className="px-4 py-4">
                                {detailLoading && !detail && <p className="text-sm text-gray-500">Loading...</p>}
                                {detail && (
                                  <>
                                    {(detail.changes || []).length === 0 ? (
                                      <p className="text-sm text-gray-500">No student changes in this update.</p>
                                    ) : (
                                      <div className="overflow-auto max-h-96 rounded-lg border border-gray-200">
                                        <table className="min-w-full text-sm">
                                          <thead className="sticky top-0 bg-gray-100 text-gray-600 text-left text-xs uppercase tracking-wide">
                                            <tr>
                                              <th className="px-4 py-2.5 w-16">Row</th>
                                              <th className="px-4 py-2.5">Enrollment No</th>
                                              <th className="px-4 py-2.5">Student</th>
                                              <th className="px-4 py-2.5">What changed</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {detail.changes.map((c) => (
                                              <tr key={`${c.row}-${c.enrollment_no}`} className="align-top border-t border-gray-100">
                                                <td className="px-4 py-2.5 text-gray-500">{c.row}</td>
                                                <td className="px-4 py-2.5 font-medium text-gray-800">{c.enrollment_no}</td>
                                                <td className="px-4 py-2.5 text-gray-800">{show(c.student_name)}</td>
                                                <td className="px-4 py-2.5 space-y-1.5">
                                                  {Object.entries(c.changes || {}).map(([field, v]) => (
                                                    <div key={field} className="flex flex-wrap items-center gap-2">
                                                      <span className="inline-block min-w-[6.5rem] px-2 py-0.5 rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
                                                        {FIELD_LABELS[field] || field}
                                                      </span>
                                                      <span className="text-red-600 line-through">{show(v.old)}</span>
                                                      <FaArrowRight className="text-gray-400 text-xs" />
                                                      <span className="text-green-700 font-semibold">{show(v.new)}</span>
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
                                      <p className="text-xs text-gray-500 mt-2">
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
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {undoItem && (
        <Modal
          title="Undo this update?"
          busy={undoing}
          onClose={closeUndo}
          footer={
            <>
              <button
                type="button"
                onClick={closeUndo}
                disabled={undoing}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runUndo}
                disabled={!reasonOk || undoing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#ff7f10] hover:bg-[#e8700a] disabled:opacity-50"
              >
                {undoing ? "Undoing..." : "Yes, undo"}
              </button>
            </>
          }
        >
          <p>
            This puts back the old values of <b>{undoItem.counts?.to_update ?? 0}</b> student(s) and their login
            accounts, all together or none. It works only if nobody has changed them since the update.
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Reason for undoing <span className="text-red-500">*</span>
            </label>
            <textarea
              value={undoReason}
              onChange={(e) => setUndoReason(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="3 to 500 characters"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          {problem && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 space-y-2">
              <p className="flex items-center gap-2 font-semibold">
                <FaExclamationTriangle />
                {problem.message}
              </p>
              {problem.rows.length > 0 && (
                <ul className="list-disc ml-6 space-y-0.5">
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
        </Modal>
      )}
    </>
  );
}

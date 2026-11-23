"use client";

import { useContext, useRef, useState } from "react";
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

const SAMPLE_CSV =
  "Enrollment No,Name,Father Name,DOB,Contact No\n" +
  "EN2024001,Asha Rao,Mohan Rao,2004-05-06,9876543210\n";

// The backend answers errors as {detail: "text"} or {detail: {message, rows}}.
function errorText(err, fallback) {
  const data = err?.response?.data;
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg).filter(Boolean).join(" ") || fallback;
  return data?.error || data?.message || fallback;
}

// A 409 carries {message, rows}: the rows are the students that stopped the update.
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

export default function BulkUpdatePage() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const router = useRouter();
  const fileInput = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [reason, setReason] = useState("");
  const [skipRejected, setSkipRejected] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);
  const [problem, setProblem] = useState(null);

  const clearApplyState = () => {
    setReason("");
    setSkipRejected(false);
    setConfirming(false);
    setResult(null);
    setProblem(null);
  };

  const pickFile = (event) => {
    const chosen = event.target.files?.[0] || null;
    setFile(chosen);
    setPreview(null);
    clearApplyState();
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulk_update_sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const runPreview = async () => {
    if (!file) {
      toast.error("Choose an .xlsx or .csv file first");
      return;
    }
    setLoading(true);
    setPreview(null);
    clearApplyState();
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post("/api/bulk-update/students/preview", form, {
        withCredentials: true,
      });
      setPreview(res.data);
      toast.success("Preview ready. Nothing has been changed yet.");
    } catch (err) {
      toast.error(errorText(err, "Could not read the file"));
    } finally {
      setLoading(false);
    }
  };

  const runApply = async () => {
    setApplying(true);
    setProblem(null);
    try {
      const res = await axios.post(
        `/api/bulk-update/${preview.batch_id}/apply`,
        { reason: reason.trim(), skip_rejected: skipRejected },
        { withCredentials: true }
      );
      setResult(res.data);
      setConfirming(false);
      toast.success(
        res.data?.already_applied
          ? "This update was already applied. Nothing more was changed."
          : "Update applied."
      );
    } catch (err) {
      setConfirming(false);
      setProblem({ message: errorText(err, "Could not apply the update"), rows: conflictRows(err) });
    } finally {
      setApplying(false);
    }
  };

  const reset = () => {
    clearApplyState();
    setFile(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const counts = preview?.counts || {};
  const changes = preview?.changes || [];
  const rejected = preview?.rejected || [];
  const reasonOk = reason.trim().length >= 3 && reason.trim().length <= 500;
  const needsSkip = (counts.rejected || 0) > 0;
  const canSubmit = !!preview?.can_apply && reasonOk && (!needsSkip || skipRejected) && !result;
  const toChange = counts.to_update || 0;

  return (
    <>
      <Navbar title="Bulk Update" />

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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* ---------- Upload ---------- */}
          <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Bulk Update Students</h3>
                <p className="text-gray-600 text-sm mt-0.5">
                  Update details of students who are already enrolled. First you see a preview; nothing changes until you apply it.
                </p>
              </div>
              <Link
                href="/admin/bulk-update/history"
                className="px-4 py-2 rounded-lg text-sm border text-gray-700"
              >
                History and undo
              </Link>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  The first row must be the column names. <b>Enrollment No</b> is required and finds the student.
                  Add one or more of: <b>Name</b>, <b>Father Name</b>, <b>DOB</b>, <b>Contact No</b>.
                </p>
                <p>A blank cell keeps the student&apos;s current value. Other columns are ignored.</p>
                <button
                  type="button"
                  onClick={downloadSample}
                  className="text-orange-600 underline"
                >
                  Download a sample file
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInput}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={pickFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
                >
                  {file ? "Change file" : "Choose file"}
                </button>
                <span className="text-sm text-gray-700 break-all max-w-xs">
                  {file ? file.name : "No file chosen"}
                </span>
                <button
                  type="button"
                  onClick={runPreview}
                  disabled={!file || loading}
                  className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold bg-[#ff7f10] disabled:opacity-50"
                >
                  {loading ? "Checking..." : "Preview"}
                </button>
                {(file || preview) && (
                  <button
                    type="button"
                    onClick={reset}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-lg text-sm border text-gray-700 disabled:opacity-50"
                  >
                    Start over
                  </button>
                )}
              </div>
              {!file && (
                <p className="text-xs text-gray-500">Choose an .xlsx or .csv file first, then click Preview.</p>
              )}
            </div>
          </div>

          {/* ---------- Preview ---------- */}
          {preview && (
            <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-gray-800 text-lg">Preview</h3>
                <p className="text-gray-600 text-sm mt-0.5">
                  {preview.file_name} · valid until {formatTime(preview.expires_at)}
                </p>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Rows in file" value={counts.rows} />
                  <Stat label="Will change" value={counts.to_update} tone="green" />
                  <Stat label="Already the same" value={counts.unchanged} />
                  <Stat label="Problems" value={counts.rejected} tone={counts.rejected ? "red" : undefined} />
                </div>

                {(preview.warnings || []).length > 0 && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 space-y-1">
                    {preview.warnings.map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                  </div>
                )}

                {/* Changes */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Changes ({counts.to_update || 0})</h4>
                  {changes.length === 0 ? (
                    <p className="text-sm text-gray-500">No student would change.</p>
                  ) : (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-left">
                          <tr>
                            <th className="px-3 py-2">Row</th>
                            <th className="px-3 py-2">Enrollment No</th>
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">What changes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {changes.map((c) => (
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
                  {preview.changes_truncated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Only the first {changes.length} changes are shown here. All of them will be applied.
                    </p>
                  )}
                </div>

                {/* Rejected */}
                {rejected.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Rows with problems ({counts.rejected || rejected.length})</h4>
                    <div className="overflow-x-auto border border-red-200 rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-red-50 text-red-700 text-left">
                          <tr>
                            <th className="px-3 py-2">Row</th>
                            <th className="px-3 py-2">Enrollment No</th>
                            <th className="px-3 py-2">Problem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rejected.map((r, i) => (
                            <tr key={`${r.row}-${i}`} className="border-t">
                              <td className="px-3 py-2">{r.row}</td>
                              <td className="px-3 py-2">{show(r.enrollment_no)}</td>
                              <td className="px-3 py-2">{r.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {preview.rejected_truncated && (
                      <p className="text-xs text-gray-500 mt-1">Only the first {rejected.length} problem rows are shown.</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Fix these in your file and preview again, or skip them when you apply.</p>
                  </div>
                )}

                {(preview.ignored_columns || []).length > 0 && (
                  <p className="text-xs text-gray-500">
                    Not read (cannot be changed here): {preview.ignored_columns.join(", ")}
                  </p>
                )}

                {/* ---------- Apply ---------- */}
                <div className="border-t pt-4 space-y-3">
                  {result ? (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800 space-y-1">
                      <p className="font-semibold">
                        {result.already_applied
                          ? "This update was already applied earlier. Nothing more was changed."
                          : `Done. ${result.applied_count ?? toChange} student(s) updated.`}
                      </p>
                      {!result.already_applied && (result.skipped_count || 0) > 0 && (
                        <p>{result.skipped_count} problem row(s) were skipped.</p>
                      )}
                      {result.can_undo && (
                        <p>You can undo this until {formatTime(result.undo_until)} from the update history.</p>
                      )}
                    </div>
                  ) : preview.status !== "previewed" ? (
                    <p className="text-sm text-amber-700">
                      This preview can no longer be applied (it is {preview.status}). Upload the file again to make a new preview.
                    </p>
                  ) : !preview.can_apply ? (
                    <p className="text-sm text-gray-600">Nothing to apply: no student would change.</p>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for this update <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          maxLength={500}
                          rows={2}
                          placeholder="For example: Corrected names after checking admission records"
                          className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <p className="text-xs text-gray-400 mt-0.5">3 to 500 characters. It is saved in the update history.</p>
                      </div>

                      {needsSkip && (
                        <label className="flex items-start gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={skipRejected}
                            onChange={(e) => setSkipRejected(e.target.checked)}
                            className="mt-1"
                          />
                          <span>
                            Skip the {counts.rejected} problem row(s) and apply only the {toChange} good one(s).
                          </span>
                        </label>
                      )}

                      {!confirming ? (
                        <button
                          type="button"
                          onClick={() => setConfirming(true)}
                          disabled={!canSubmit || applying}
                          className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold bg-[#ff7f10] disabled:opacity-50"
                        >
                          Apply update
                        </button>
                      ) : (
                        <div className="rounded-lg border border-orange-300 bg-orange-50 p-3 space-y-2">
                          <p className="text-sm text-gray-800">
                            This will change <b>{toChange}</b> student(s) and their login accounts, all together or none.
                            You can undo it for 7 days. Continue?
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={runApply}
                              disabled={applying}
                              className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-[#ff7f10] disabled:opacity-50"
                            >
                              {applying ? "Applying..." : "Yes, apply"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirming(false)}
                              disabled={applying}
                              className="px-4 py-2 rounded-lg text-sm border text-gray-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {problem && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 space-y-2">
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
                      <p className="text-xs">Nothing was changed. Fix the cause and use Start over to preview again.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, tone }) {
  const colors = {
    green: "text-green-700 bg-green-50",
    red: "text-red-700 bg-red-50",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[tone] || "bg-gray-50 text-gray-800"}`}>
      <div className="text-2xl font-bold">{value ?? 0}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

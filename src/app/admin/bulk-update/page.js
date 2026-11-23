"use client";

import { useContext, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCloudUploadAlt,
  FaDownload,
  FaEquals,
  FaExclamationTriangle,
  FaFileAlt,
  FaHistory,
  FaListUl,
  FaTimes,
  FaUserEdit,
} from "react-icons/fa";

import { AuthContext } from "@/app/AuthContext";
import { darkenColor } from "@/lib/question-paper/colorHelpers";
import Navbar from "@/components/ui/Navbar";

const FIELD_LABELS = {
  name: "Name",
  father_name: "Father Name",
  dob: "Date of Birth",
  contact_no: "Contact No",
};

const COLUMNS = [
  { label: "Enrollment No", required: true, hint: "Finds the student" },
  { label: "Name" },
  { label: "Father Name" },
  { label: "DOB" },
  { label: "Contact No" },
];

const STEPS = ["Upload file", "Review changes", "Apply"];

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

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowed(file) {
  const name = (file?.name || "").toLowerCase();
  return name.endsWith(".xlsx") || name.endsWith(".csv");
}

export default function BulkUpdatePage() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const router = useRouter();
  const fileInput = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
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

  const chooseFile = (chosen) => {
    if (chosen && !isAllowed(chosen)) {
      toast.error("Only .xlsx or .csv files can be used");
      return;
    }
    setFile(chosen || null);
    setPreview(null);
    clearApplyState();
  };

  const pickFile = (event) => {
    chooseFile(event.target.files?.[0] || null);
    event.target.value = "";
  };

  const dropFile = (event) => {
    event.preventDefault();
    setDragging(false);
    if (loading) return;
    chooseFile(event.dataTransfer?.files?.[0] || null);
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

  // 0 = upload, 1 = review, 2 = apply (the result is shown)
  const step = !preview ? 0 : result ? 2 : 1;

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

      <div className="min-h-screen p-4 sm:p-6 mx-6 mb-6 rounded-xl" style={{ backgroundColor: color }}>
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* ---------- Header ---------- */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Update Students</h2>
              <p className="text-sm text-gray-600 mt-1">
                Correct details of students who are already enrolled. You review everything first; nothing changes until you apply.
              </p>
            </div>
            <Link
              href="/admin/bulk-update/history"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <FaHistory className="text-gray-500" />
              History and undo
            </Link>
          </div>

          {/* ---------- Steps ---------- */}
          <div className="px-6 sm:px-8 pt-6">
            <Stepper current={step} />
          </div>

          <div className="px-6 sm:px-8 py-6 space-y-8">
            {/* ---------- Step 1: upload ---------- */}
            <section className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Choose a file to upload"
                    onClick={() => !loading && fileInput.current?.click()}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !loading) {
                        e.preventDefault();
                        fileInput.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={dropFile}
                    className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition ${
                      dragging
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/50"
                    } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <input
                      ref={fileInput}
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={pickFile}
                      className="hidden"
                    />
                    <FaCloudUploadAlt className="mx-auto text-5xl text-orange-500" />
                    <p className="mt-3 text-base font-semibold text-gray-800">
                      Drag your file here, or <span className="text-orange-600 underline">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Excel (.xlsx) or CSV (.csv). The first row must be the column names.</p>
                  </div>

                  {file && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                      <FaFileAlt className="text-xl text-orange-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={reset}
                        disabled={loading}
                        aria-label="Remove file"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={runPreview}
                      disabled={!file || loading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold bg-[#ff7f10] hover:bg-[#e8700a] shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Checking the file..." : "Preview changes"}
                      {!loading && <FaArrowRight />}
                    </button>
                    <button
                      type="button"
                      onClick={downloadSample}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <FaDownload className="text-gray-500" />
                      Download sample file
                    </button>
                    {!file && <span className="text-xs text-gray-500">Choose a file to continue.</span>}
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
                  <h3 className="text-sm font-bold text-gray-800">Columns in your file</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {COLUMNS.map((c) => (
                      <span
                        key={c.label}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          c.required
                            ? "bg-orange-100 text-orange-800 border-orange-300"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        {c.label}
                        {c.required && <span className="text-[10px] uppercase tracking-wide">required</span>}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-gray-600 list-disc ml-4">
                    <li>Enrollment No finds the student. Use at least one of the other columns.</li>
                    <li>A blank cell keeps the student&apos;s current value.</li>
                    <li>Other columns are ignored.</li>
                    <li>Up to 2000 rows in one file.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ---------- Step 2: review ---------- */}
            {preview && (
              <section className="space-y-6 border-t border-gray-100 pt-8">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Review changes</h3>
                    <p className="text-sm text-gray-600">
                      {preview.file_name} · this preview is valid until {formatTime(preview.expires_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Stat icon={<FaListUl />} label="Rows in file" value={counts.rows} tone="gray" />
                  <Stat icon={<FaUserEdit />} label="Will change" value={counts.to_update} tone="green" />
                  <Stat icon={<FaEquals />} label="Already the same" value={counts.unchanged} tone="blue" />
                  <Stat
                    icon={<FaExclamationTriangle />}
                    label="Problems"
                    value={counts.rejected}
                    tone={counts.rejected ? "red" : "gray"}
                  />
                </div>

                {(preview.warnings || []).length > 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 space-y-1">
                    {preview.warnings.map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                  </div>
                )}

                {/* Changes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Students that will change ({counts.to_update || 0})</h4>
                  {changes.length === 0 ? (
                    <p className="text-sm text-gray-500 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                      No student would change.
                    </p>
                  ) : (
                    <div className="overflow-auto max-h-[28rem] rounded-xl border border-gray-200">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-gray-100 text-gray-600 text-left text-xs uppercase tracking-wide">
                          <tr>
                            <th className="px-4 py-3 w-16">Row</th>
                            <th className="px-4 py-3">Enrollment No</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">What changes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {changes.map((c, index) => (
                            <tr
                              key={`${c.row}-${c.enrollment_no}`}
                              className={`align-top border-t border-gray-100 ${index % 2 ? "bg-gray-50/60" : "bg-white"}`}
                            >
                              <td className="px-4 py-3 text-gray-500">{c.row}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{c.enrollment_no}</td>
                              <td className="px-4 py-3 text-gray-800">{show(c.student_name)}</td>
                              <td className="px-4 py-3 space-y-1.5">
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
                  {preview.changes_truncated && (
                    <p className="text-xs text-gray-500 mt-2">
                      Only the first {changes.length} changes are shown here. All of them will be applied.
                    </p>
                  )}
                </div>

                {/* Rejected */}
                {rejected.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <FaExclamationTriangle />
                      Rows with problems ({counts.rejected || rejected.length})
                    </h4>
                    <div className="overflow-auto max-h-72 rounded-lg border border-red-200 bg-white">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-red-50 text-red-700 text-left text-xs uppercase tracking-wide">
                          <tr>
                            <th className="px-4 py-2.5 w-16">Row</th>
                            <th className="px-4 py-2.5">Enrollment No</th>
                            <th className="px-4 py-2.5">Problem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rejected.map((r, i) => (
                            <tr key={`${r.row}-${i}`} className="border-t border-red-100">
                              <td className="px-4 py-2.5 text-gray-500">{r.row}</td>
                              <td className="px-4 py-2.5 font-medium text-gray-800">{show(r.enrollment_no)}</td>
                              <td className="px-4 py-2.5 text-red-700">{r.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {preview.rejected_truncated && (
                      <p className="text-xs text-gray-500 mt-2">Only the first {rejected.length} problem rows are shown.</p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      Fix these in your file and preview again, or skip them when you apply.
                    </p>
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
                        <p className="text-xs text-gray-500 mt-0.5">3 to 500 characters. It is saved in the update history.</p>
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
                      <p className="text-xs">Nothing was changed. Fix the cause and use Remove file to preview again.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center w-full">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-[#ff7f10] text-white ring-4 ring-orange-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <FaCheck className="text-xs" /> : index + 1}
              </span>
              <span
                className={`text-sm font-semibold hidden sm:inline ${
                  active ? "text-gray-900" : done ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span className={`mx-3 h-0.5 flex-1 rounded ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Stat({ icon, label, value, tone }) {
  const tones = {
    gray: "bg-gray-50 border-gray-200 text-gray-800",
    green: "bg-green-50 border-green-200 text-green-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${tones[tone] || tones.gray}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-lg shadow-sm">{icon}</span>
      <div>
        <div className="text-2xl font-bold leading-none">{value ?? 0}</div>
        <div className="text-xs mt-1 opacity-80">{label}</div>
      </div>
    </div>
  );
}

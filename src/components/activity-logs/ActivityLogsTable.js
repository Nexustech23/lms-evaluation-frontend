"use client";

import React from "react";
import Spinner from "@/components/ui/Spinner";

const ROLE_LABELS = {
  self_learner: "Self-Learner",
  institute_student: "Institute Student",
};

const PROVIDER_LABELS = {
  claude: "Claude",
  gemini: "Gemini",
};

const formatTokens = (input, output) => {
  if (!input && !output) return "— / —";
  return `${(input || 0).toLocaleString()} / ${(output || 0).toLocaleString()}`;
};

/**
 * Shared table+pagination shell for the admin/super-admin Activity Logs
 * pages. `variant` picks the name/email field pair (students vs faculty);
 * `showCost` adds the provider/tokens/cost columns (super-admin only) and,
 * for the students variant, the Type column (self-learner vs institute
 * student — faculty rows have no such split).
 */
export default function ActivityLogsTable({
  variant,
  rows,
  loading,
  error,
  pagination,
  onPrev,
  onNext,
  showCost = false,
  accentColor = "#ff7f10",
  emptyMessage = "No activity recorded yet.",
}) {
  const isFaculty = variant === "faculty";
  const nameField = isFaculty ? "faculty_name" : "student_name";
  const emailField = isFaculty ? "faculty_email" : "student_email";
  const showType = !isFaculty && showCost;
  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.limit || 1));

  return (
    <>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color={accentColor} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full border-collapse text-gray-800">
              <thead>
                <tr className="bg-orange-100">
                  <th className="p-3 text-left">{isFaculty ? "Faculty" : "Student"}</th>
                  <th className="p-3 text-left">Email</th>
                  {showType && <th className="p-3 text-left">Type</th>}
                  <th className="p-3 text-left">Action</th>
                  {showCost && <th className="p-3 text-left">Provider</th>}
                  {showCost && <th className="p-3 text-right">Tokens (In / Out)</th>}
                  {showCost && <th className="p-3 text-right">Cost (USD)</th>}
                  <th className="p-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((log, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">{log[nameField] || "—"}</td>
                      <td className="p-3">{log[emailField] || "—"}</td>
                      {showType && (
                        <td className="p-3">{ROLE_LABELS[log.student_role] || log.student_role}</td>
                      )}
                      <td className="p-3">{log.action}</td>
                      {showCost && (
                        <td className="p-3">{PROVIDER_LABELS[log.provider] || log.provider}</td>
                      )}
                      {showCost && (
                        <td className="p-3 text-right text-sm">
                          {formatTokens(log.input_tokens, log.output_tokens)}
                        </td>
                      )}
                      {showCost && (
                        <td className="p-3 text-right text-sm">${(log.cost_usd || 0).toFixed(4)}</td>
                      )}
                      <td className="p-3 text-sm">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3 + (showType ? 1 : 0) + (showCost ? 3 : 0)}
                      className="text-center py-10 text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {Math.max(totalPages, 1)} · {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Previous
              </button>
              <button
                onClick={onNext}
                disabled={pagination.page >= totalPages}
                className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

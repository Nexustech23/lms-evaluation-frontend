"use client";
import React from "react";

/**
 * Notes about a generated paper, for the faculty only: questions the answer check flagged,
 * and the answer key the AI wrote while making the paper. Nothing here is part of the paper.
 */
export default function ReviewNotes({ notes }) {
  if (!notes) return null;
  const flags = notes.reviewFlags || [];
  const key = notes.answerKey || [];
  const status = notes.answerCheck;
  if (!flags.length && !key.length && status !== "failed" && status !== "done") return null;

  return (
    <div className="rounded-lg border text-sm" style={{ borderColor: "#e5e7eb", background: "#fff" }} data-testid="review-notes">
      {status === "failed" && (
        <p className="px-3.5 py-2.5 text-amber-700 bg-amber-50 rounded-t-lg">
          The answer check could not run this time. Please check the answers yourself before using the paper.
        </p>
      )}
      {flags.length > 0 && (
        <div className="px-3.5 py-2.5 bg-red-50 rounded-t-lg">
          <p className="font-semibold text-red-700">Check these questions before you use the paper</p>
          <ul className="mt-1 list-disc pl-5 text-red-800">
            {flags.map((f) => (
              <li key={f.number}><strong>Q{f.number}</strong>: {f.issue}</li>
            ))}
          </ul>
        </div>
      )}
      {status === "done" && flags.length === 0 && (
        <p className="px-3.5 py-2.5 text-green-800 bg-green-50 rounded-t-lg">
          The answer check found no problems. A teacher should still read the paper.
        </p>
      )}
      {key.length > 0 && (
        <details className="px-3.5 py-2.5">
          <summary className="cursor-pointer font-medium text-gray-700">Answer key (for you only, not in the paper)</summary>
          <ul className="mt-2 space-y-1 text-gray-700">
            {key.map((k) => (
              <li key={k.number}>
                <strong>Q{k.number}</strong>: {k.answer || "—"}
                {k.working ? <span className="text-gray-500"> ({k.working})</span> : null}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { startRecoverablePolling } from "@/lib/pollBackoff";

export default function RubricSuggestionPanel({ folderId, disabled, questionCount, onApply }) {
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState([]);
  const [applying, setApplying] = useState(null);
  const cancelPoll = useRef(null);
  const mounted = useRef(false);
  const endpoint = `/api/evaluation-details/${folderId}/suggestions`;

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    axios.get(endpoint, { withCredentials: true, signal: controller.signal })
      .then(({ data }) => { if (mounted.current) setJob(data); })
      .catch(() => { /* Manual editing remains available if no cached draft can be loaded. */ });
    return () => { mounted.current = false; controller.abort(); cancelPoll.current?.(); };
  }, [endpoint]);

  useEffect(() => {
    if (!["queued", "processing"].includes(job?.status)) return;
    cancelPoll.current = startRecoverablePolling({
      request: async (signal) => {
        const { data } = await axios.get(endpoint, { withCredentials: true, signal });
        if (data.status === "failed") {
          const failure = new Error(data.error || "Suggestion generation failed.");
          failure.response = { status: 422, data };
          throw failure;
        }
        return data;
      },
      onProgress: setJob,
      onDone: (data) => { setJob(data); setError(""); },
      onError: (err) => {
        setError(err?.response?.data?.error || err.message || "Suggestions unavailable.");
        // Keep reconnecting to the existing job possible without resubmission.
        setJob((previous) => ({ ...previous, status: err?.response?.data?.status === "failed" ? "failed" : "disconnected" }));
      },
    });
    return () => cancelPoll.current?.();
  }, [endpoint, job?.status]);

  async function generate() {
    setBusy(true);
    setError("");
    try {
      if (["completed", "disconnected"].includes(job?.status)) {
        const { data } = await axios.get(endpoint, { withCredentials: true });
        if (mounted.current) setJob(data);
        return; // Reconnecting never submits a paid request, even after a paper change.
      }
      const { data } = await axios.post(endpoint, { retry_failed: job?.status === "failed" }, { withCredentials: true });
      if (mounted.current) { setJob(data); setApplied([]); }
    } catch (err) {
      if (mounted.current) setError(err?.response?.data?.error || "Could not start suggestions. Your edits were preserved.");
    } finally { if (mounted.current) setBusy(false); }
  }

  async function apply(question) {
    setApplying(question.question_no);
    try {
      const { data } = await axios.get(endpoint, { withCredentials: true });
      if (!mounted.current) return;
      if (data.source_id !== job.source_id || data.status !== "completed") {
        throw new Error("The paper or course outcomes changed. Load suggestions for the current paper.");
      }
      if (job.result.questions.length !== questionCount) throw new Error("The question count changed. Reload before applying suggestions.");
      onApply(question.question_no - 1, question, job.source_id);
      setApplied((previous) => [...new Set([...previous, question.question_no])]);
    } catch (err) { if (mounted.current) setError(err?.response?.data?.error || err.message); }
    finally { if (mounted.current) setApplying(null); }
  }

  const running = ["queued", "processing"].includes(job?.status);
  return (
    <section className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4" aria-label="AI rubric suggestions">
      <h3 className="font-semibold text-gray-900">AI-suggested question details and parameters</h3>
      <p className="mt-1 text-sm text-gray-700">
        Extract printed marks and CO tags and suggest criteria with Sonnet 5.5. Generation uses AI credits.
        Review and apply each draft, then edit and confirm using the existing save action.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={generate} disabled={disabled || busy || running}
          className="rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">
          {busy ? "Connecting…" : running ? "Generating suggestions…" : job?.status === "failed" ? "Retry generation (uses credits)" :
            job?.status === "disconnected" ? "Reconnect to existing draft" : job?.status === "completed" ? "Load saved suggestions" : "Generate suggestions (uses credits)"}
        </button>
        {job?.status === "completed" && <span className="text-sm text-blue-800">Draft available for review. Loading it again uses no generation credits.</span>}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {job?.error && <p role="status" className="mt-2 text-sm text-amber-800">{job.error}</p>}
      {job?.result?.questions && (
        <div className="mt-4 max-h-[38rem] space-y-3 overflow-y-auto">
          {job.result.questions.map((q) => (
            <article key={q.question_no} className="rounded border bg-white p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>Question {q.question_no}</strong>
                <button type="button" disabled={disabled || applying !== null || q.status !== "draft_ready"}
                  onClick={() => apply(q)} className="rounded border border-blue-600 px-3 py-1 text-blue-800 disabled:opacity-40">
                  {applying === q.question_no ? "Checking…" : applied.includes(q.question_no) ? "Apply again" : "Use this draft"}
                </button>
              </div>
              <p className="mt-2">Minimum: {q.min_marks} ({q.min_source === "default" ? "default" : "printed"}) · Maximum: {q.max_marks ?? "Not specified"}</p>
              {q.max_quote && <p className="text-gray-600">Printed marks: {q.max_quote}</p>}
              <p>Printed COs: {q.co_tags?.length ? q.co_tags.map((c) => `${c.co_code}${c.eligible ? "" : " (not available in this exam)"}`).join(", ") : "Not specified"}</p>
              {!!q.parameters?.length && <ul className="mt-2 list-disc pl-5">{q.parameters.map((p) => <li key={p.name}>{p.name}: {p.percentage}%</li>)}</ul>}
              {q.guidelines && <p className="mt-2 whitespace-pre-wrap text-gray-700">{q.guidelines}</p>}
              {q.notes?.map((note, index) => <p key={index} className="mt-1 text-amber-800">{note}</p>)}
              {q.status === "needs_clarification" && <p className="mt-2 font-medium text-amber-900">Complete this question manually or correct the paper before generating a new draft.</p>}
              {q.co_tags?.filter((c) => c.eligible).length > 1 && <p className="mt-1 text-gray-600">Allocate CO marks manually after applying; no split was assumed.</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

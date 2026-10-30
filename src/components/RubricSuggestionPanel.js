"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { startRecoverablePolling } from "@/lib/pollBackoff";

export function parameterErrorMessage(err, fallback = "Could not fill parameters. Your edits were preserved.") {
  const detail = err?.response?.data?.detail;
  if (detail?.code === "QUESTION_MAPPING_REQUIRED") {
    return "Could not identify all questions automatically. Check the uploaded question paper and question count. Your existing parameters were kept.";
  }
  return (typeof detail === "string" && detail) || err?.response?.data?.error || err?.message || fallback;
}

export default function RubricSuggestionPanel({ folderId, disabled, questionCount, onApply }) {
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const cancelPoll = useRef(null);
  const mounted = useRef(false);
  const latest = useRef({ onApply, disabled, questionCount });
  const endpoint = `/api/evaluation-details/${folderId}/suggestions`;

  useEffect(() => { latest.current = { onApply, disabled, questionCount }; }, [onApply, disabled, questionCount]);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    // Opening an existing exam never replaces saved fields or spends credits.
    axios.get(endpoint, { withCredentials: true, signal: controller.signal })
      .then(({ data }) => { if (mounted.current) setJob(data); })
      .catch((err) => {
        if (mounted.current && !controller.signal.aborted) setError(parameterErrorMessage(err));
      });
    return () => { mounted.current = false; controller.abort(); cancelPoll.current?.(); };
  }, [endpoint]);

  async function fillForm(candidate) {
    const { data } = await axios.get(endpoint, { withCredentials: true });
    if (!mounted.current) return;
    if (data.status !== "completed" || !data.source_id || data.source_id !== candidate.source_id) {
      throw new Error("The paper or course outcomes changed. Reload parameters for the current paper.");
    }
    if (latest.current.disabled) throw new Error("Wait for saving to finish before filling parameters.");
    if (data.result?.questions?.length !== latest.current.questionCount) {
      throw new Error("The question count changed. Reload before filling parameters.");
    }
    const count = latest.current.onApply(data.result.questions, data.source_id);
    setMessage(count === false ? "Your existing fields were kept." :
      count ? `Filled ${count} question(s). Review the fields below, edit as needed, then Save.` :
        "No questions could be filled. Check the warnings beside each question.");
  }

  useEffect(() => {
    if (!["queued", "processing"].includes(job?.status)) return;
    cancelPoll.current = startRecoverablePolling({
      request: async (signal) => {
        const { data } = await axios.get(endpoint, { withCredentials: true, signal });
        if (data.status === "failed") {
          const failure = new Error(data.error || "Parameter generation failed.");
          failure.response = { status: 422, data };
          throw failure;
        }
        return data;
      },
      onProgress: setJob,
      onDone: async (data) => {
        setJob(data);
        setError("");
        setBusy(true);
        try { await fillForm(data); }
        catch (err) { if (mounted.current) setError(parameterErrorMessage(err)); }
        finally { if (mounted.current) setBusy(false); }
      },
      onError: (err) => {
        setError(parameterErrorMessage(err, "Parameters unavailable."));
        setJob((previous) => ({ ...previous, status: err?.response?.data?.status === "failed" ? "failed" : "disconnected" }));
      },
    });
    return () => cancelPoll.current?.();
  // fillForm uses the latest editor callback, including edits made while waiting.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, job?.status]);

  async function generate() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (["completed", "disconnected"].includes(job?.status)) {
        const { data } = await axios.get(endpoint, { withCredentials: true });
        if (!mounted.current) return;
        setJob(data);
        if (data.status === "completed") await fillForm(data);
        return; // Loading/reconnecting never submits a paid request.
      }
      const { data } = await axios.post(endpoint, { retry_failed: job?.status === "failed" }, { withCredentials: true });
      if (!mounted.current) return;
      setJob(data);
      if (data.status === "completed") await fillForm(data);
    } catch (err) {
      if (mounted.current) setError(parameterErrorMessage(err));
    } finally { if (mounted.current) setBusy(false); }
  }

  const running = ["queued", "processing"].includes(job?.status);
  const reviewQuestions = (job?.result?.questions || []).filter((question) => question.status === "needs_clarification");
  return (
    <section className="mb-6" aria-label="AI evaluation parameters">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={generate} disabled={disabled || busy || running || !questionCount}
          className="rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">
          {busy ? "Filling parameters…" : running ? "Generating parameters…" : "Generate parameters"}
        </button>
      </div>
      {message && <p role="status" className="mt-3 text-sm text-blue-800">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {reviewQuestions.length > 0 && <div className="mt-3 space-y-3">
        <p role="status" className="text-sm text-amber-800">{reviewQuestions.length} question(s) need your review. Valid suggestions are available; complete the flagged fields below before saving.</p>
        {reviewQuestions.map((question) => <details key={question.question_no} className="rounded border border-amber-200 p-3 text-sm">
          <summary className="cursor-pointer font-semibold">{question.section ? `${question.section} · ` : ""}{question.question_label || `Question ${question.question_no}`} — review AI draft</summary>
          {(question.notes || []).map((note, index) => <p key={index} className="mt-2 text-amber-800">{note}</p>)}
          {question.review_draft && <div className="mt-2 space-y-2">
            <p>AI-proposed maximum (unconfirmed): {question.review_draft.max_marks ?? "Not supplied"}</p>
            <p>Quoted source: {question.review_draft.max_quote || "Not supplied"}</p>
            <ul className="list-disc pl-5">{question.review_draft.parameters?.map((parameter, index) => <li key={index}>{parameter.name}: {parameter.percentage}%</li>)}</ul>
            <p className="whitespace-pre-wrap">{question.review_draft.guidelines}</p>
            <p>These values were not applied. Check the paper and enter the confirmed criteria in this question&apos;s fields.</p>
          </div>}
        </details>)}
      </div>}
    </section>
  );
}

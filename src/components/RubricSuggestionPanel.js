"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { startRecoverablePolling } from "@/lib/pollBackoff";

export default function RubricSuggestionPanel({ folderId, disabled, questionCount, onApply }) {
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mapping, setMapping] = useState(null);
  const [boundaries, setBoundaries] = useState([]);
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
      .catch((err) => { if (mounted.current) showMapping(err); });
    return () => { mounted.current = false; controller.abort(); cancelPoll.current?.(); };
  }, [endpoint]);

  function showMapping(err) {
    const detail = err?.response?.data?.detail;
    if (detail?.code !== "QUESTION_MAPPING_REQUIRED") return false;
    setMapping(detail);
    setBoundaries(Array.from({ length: detail.question_count }, (_, index) => {
      const candidate = detail.candidates?.length === detail.question_count ? detail.candidates[index] : null;
      return { start: candidate?.start ?? "", question_label: candidate?.question_label ?? "" };
    }));
    setError("");
    return true;
  }

  async function confirmMapping() {
    setBusy(true);
    setError("");
    try {
      const selected = boundaries.map((row) => ({ start: Number(row.start), question_label: row.question_label.trim() }));
      if (boundaries.some((row) => row.start === "" || !row.question_label.trim()) ||
          selected.some((row, i) => i > 0 && row.start <= selected[i - 1].start)) {
        throw new Error("Choose each question's starting line and printed label, in paper order.");
      }
      await axios.post(`/api/evaluation-details/${folderId}/question-mapping`, {
        source_id: mapping.mapping_source_id, questions: selected,
      }, { withCredentials: true });
      const { data } = await axios.get(endpoint, { withCredentials: true });
      if (!mounted.current) return;
      setMapping(null);
      setJob(data);
      setMessage("Question mapping confirmed. Select Generate parameters to continue.");
    } catch (err) {
      if (mounted.current && !showMapping(err)) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : err.message || "Could not confirm question mapping.");
      }
    } finally { if (mounted.current) setBusy(false); }
  }

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
        catch (err) { if (mounted.current) setError(err?.response?.data?.error || err.message); }
        finally { if (mounted.current) setBusy(false); }
      },
      onError: (err) => {
        setError(err?.response?.data?.error || err.message || "Parameters unavailable.");
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
      if (mounted.current && !showMapping(err)) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : err?.response?.data?.error || err.message || "Could not fill parameters. Your edits were preserved.");
      }
    } finally { if (mounted.current) setBusy(false); }
  }

  const running = ["queued", "processing"].includes(job?.status);
  return (
    <section className="mb-6" aria-label="AI evaluation parameters">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={generate} disabled={disabled || busy || running || !questionCount || !!mapping}
          className="rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">
          {busy ? "Filling parameters…" : running ? "Generating parameters…" : "Generate parameters"}
        </button>
      </div>
      {mapping && <div className="mt-3 rounded border border-amber-200 p-4">
        <h3 className="font-semibold">Confirm question mapping</h3>
        <p className="mt-1 text-sm">Your paper keeps its printed numbering. Choose the starting line for each of the {mapping.question_count} evaluation rows. Include subparts in the same row when they are graded together. If the row count is wrong, correct the exam question count first. This step uses no AI credits.</p>
        <details className="my-3 text-sm">
          <summary className="cursor-pointer">View extracted paper</summary>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap">{mapping.lines.map((line) => line.text).join("\n")}</pre>
        </details>
        {boundaries.map((row, index) => <div key={index} className="mb-3 grid gap-2 sm:grid-cols-2">
          <label className="text-sm">Evaluation row {index + 1} starts at
            <select className="mt-1 block w-full rounded border p-2" value={row.start} disabled={busy || disabled}
              onChange={(event) => {
                const value = event.target.value;
                const candidate = mapping.candidates.find((item) => item.start === Number(value));
                setBoundaries((previous) => previous.map((item, i) => i === index ? {
                  start: value, question_label: candidate?.question_label || item.question_label,
                } : item));
              }}>
              <option value="">Select question starting line</option>
              {mapping.lines.map((line) => <option key={line.start} value={line.start}>
                {line.section ? `${line.section}: ` : ""}{line.text.slice(0, 180)}
              </option>)}
            </select>
          </label>
          <label className="text-sm">Printed question label
            <input className="mt-1 block w-full rounded border p-2" value={row.question_label} maxLength={120} disabled={busy || disabled}
              placeholder="e.g. 1(i), 8(a), Question 3"
              onChange={(event) => setBoundaries((previous) => previous.map((item, i) => i === index ? { ...item, question_label: event.target.value } : item))} />
          </label>
        </div>)}
        <button type="button" onClick={confirmMapping} disabled={busy || disabled}
          className="rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">Confirm mapping</button>
      </div>}
      {message && <p role="status" className="mt-3 text-sm text-blue-800">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}

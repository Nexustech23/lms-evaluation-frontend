"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { startRecoverablePolling } from "@/lib/pollBackoff";

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
      .catch(() => { /* Manual editing remains available. */ });
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
      if (mounted.current) setError(err?.response?.data?.error || err.message || "Could not fill parameters. Your edits were preserved.");
    } finally { if (mounted.current) setBusy(false); }
  }

  const running = ["queued", "processing"].includes(job?.status);
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
    </section>
  );
}

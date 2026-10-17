// Exponential backoff for background-job status polling (Perf Phase 5.2).
//
// The AI / grading / question-paper jobs can run for minutes. Polling their
// status at a fixed 2.5-4s interval fires ~45 identical requests at the
// backend for a 3-minute job. Backing the interval off keeps early feedback
// snappy while cutting poll volume on long jobs by ~5x.
//
// Behaviour on completion is unchanged — only the wait cadence between polls.

export const POLL_START_MS = 1500;
export const POLL_MAX_MS = 15000;
export const POLL_FACTOR = 1.5;

/**
 * Given the delay just used (or 0 / undefined for the first poll), return
 * the next delay: POLL_START_MS first, then *POLL_FACTOR each call, capped
 * at POLL_MAX_MS.
 */
export function nextPollDelay(current) {
  if (!current || current < POLL_START_MS) return POLL_START_MS;
  return Math.min(Math.round(current * POLL_FACTOR), POLL_MAX_MS);
}

export function isRetryablePollError(error) {
  const status = error?.response?.status;
  const jobStatus = error?.response?.data?.status;
  if (jobStatus === "failed" || jobStatus === "error") return false;
  return !status || [408, 425, 429].includes(status) || status >= 500;
}

export function startRecoverablePolling({ request, onProgress, onDone, onError, onReconnect,
  schedule = setTimeout, unschedule = clearTimeout }) {
  let stopped = false;
  let delay = 0;
  let timer;
  let controller;
  const again = () => {
    if (!stopped) timer = schedule(tick, (delay = nextPollDelay(delay)));
  };
  const tick = async () => {
    if (stopped) return;
    controller = new AbortController();
    try {
      const job = await request(controller.signal);
      if (stopped) return;
      if (["queued", "processing", "running"].includes(job.status)) {
        onProgress?.(job);
        again();
      } else if (["done", "completed"].includes(job.status)) {
        stopped = true;
        onDone(job);
      } else {
        stopped = true;
        onError(new Error(job.user_message || job.message || job.error || "Job failed"));
      }
    } catch (error) {
      if (stopped) return;
      if (isRetryablePollError(error)) {
        onReconnect?.();
        again();
      } else {
        stopped = true;
        onError(error);
      }
    }
  };
  again();
  return () => { stopped = true; unschedule(timer); controller?.abort(); };
}

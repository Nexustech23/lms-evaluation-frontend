/* Metadata only: never collect form values, request bodies, tokens or answer text. */
import axios from "axios";

export function installClientDiagnostics() {
  if (typeof window === "undefined" || window.__lmsDiagnostics) return;
  const nativeFetch = window.fetch.bind(window);
  const queue = [];
  let timer = null;
  let flushing = false;
  let dropped = 0;
  let retryMs = 2000;
  const id = () => window.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const sessionId = id();
  let sequence = 0;
  const path = (value) => {
    try { return new URL(value, window.location.href).pathname.slice(0, 300); }
    catch { return ""; }
  };
  const isAPI = (value) => {
    try {
      const url = new URL(value, window.location.href);
      return url.origin === window.location.origin && url.pathname.startsWith("/api/") &&
        url.pathname !== "/api/client-events";
    } catch { return false; }
  };
  const errorType = (error) => /^[A-Za-z0-9_.-]{1,80}$/.test(error?.name || "") ? error.name : "ClientError";
  function schedule(delay = 2000) {
    if (!timer) timer = window.setTimeout(() => { timer = null; void flush(); }, delay);
  }
  function record(item) {
    try {
      if (queue.length >= 500) { dropped++; return; }
      queue.push({ ...item, page: path(window.location.href), session_id: sessionId,
        sequence: ++sequence, timestamp_ms: Date.now() });
      schedule();
    } catch { /* Instrumentation must not interrupt a user action. */ }
  }
  async function flush() {
    if (flushing || !queue.length) return;
    flushing = true;
    // Stay below the server's 16 KiB limit even for long route paths.
    const batch = [];
    while (queue.length && batch.length < 20) {
      if (new TextEncoder().encode(JSON.stringify({ events: [...batch, queue[0]] })).length > 12000) break;
      batch.push(queue.shift());
    }
    if (dropped && batch.length < 20) {
      batch.push({ event: "client.dropped", dropped_count: Math.min(dropped, 1000000) });
      dropped = 0;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await nativeFetch("/api/client-events", {
        method: "POST", credentials: "same-origin", keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }), signal: controller.signal,
      });
      if (!response.ok) throw new Error("DiagnosticsUnavailable");
      retryMs = 2000;
    } catch {
      // Bounded retry queue. Never recursively report telemetry failures.
      queue.unshift(...batch);
      if (queue.length > 500) { dropped += queue.length - 500; queue.length = 500; }
      retryMs = Math.min(retryMs * 2, 60000);
    } finally {
      window.clearTimeout(timeout);
      flushing = false;
      if (queue.length) schedule(retryMs);
    }
  }
  window.__lmsDiagnostics = { record, flush };

  function instrumentAxios(client) {
  if (client.__lmsDiagnostics) return;
  client.__lmsDiagnostics = true;
  client.interceptors.request.use((config) => {
    if (!isAPI(config.url)) return config;
    const requestId = id();
    config.headers = config.headers || {};
    config.headers["X-Request-ID"] = requestId;
    config.__lmsTrace = { requestId, started: performance.now() };
    return config;
  });
  function axiosResult(config, response, error) {
    if (!config?.__lmsTrace) return;
    const trace = config.__lmsTrace;
    record({ event: "api.request", path: path(config.url), method: (config.method || "GET").toUpperCase(),
      request_id: response?.headers?.["x-request-id"] || trace.requestId,
      status: response?.status || 0, duration_ms: Math.max(0, Math.round(performance.now() - trace.started)),
      ...(error ? { error_type: errorType(error) } : {}),
    });
  }
  client.interceptors.response.use((response) => {
    axiosResult(response.config, response); return response;
  }, (error) => {
    axiosResult(error.config, error.response, error); return Promise.reject(error);
  });
  }
  window.__lmsDiagnostics.instrumentAxios = instrumentAxios;
  instrumentAxios(axios);

  window.fetch = async function (input, init) {
    const url = typeof input === "string" || input instanceof URL ? String(input) : input.url;
    if (!isAPI(url)) return nativeFetch(input, init);
    const requestId = id();
    const started = performance.now();
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    headers.set("X-Request-ID", requestId);
    const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    try {
      const response = await nativeFetch(input, { ...init, headers });
      record({ event: "api.request", path: path(url), method, request_id: response.headers.get("X-Request-ID") || requestId,
        status: response.status, duration_ms: Math.max(0, Math.round(performance.now() - started)) });
      return response;
    } catch (error) {
      record({ event: "api.request", path: path(url), method, request_id: requestId, status: 0,
        duration_ms: Math.max(0, Math.round(performance.now() - started)), error_type: errorType(error) });
      throw error;
    }
  };
  document.addEventListener("click", (e) => {
    const control = e.target instanceof Element && e.target.closest("button,[role=button],input[type=submit]");
    if (control) {
      // A DOM position identifies the control without capturing its text/value.
      const parts = [];
      let node = control;
      for (let depth = 0; node && depth < 6; depth++, node = node.parentElement) {
        const siblings = node.parentElement ? [...node.parentElement.children].filter(n => n.tagName === node.tagName) : [node];
        parts.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${siblings.indexOf(node) + 1})`);
      }
      record({ event: "ui.action", action: "button.click", control: parts.join(">") });
    }
  }, true);
  document.addEventListener("submit", () => record({ event: "ui.action", action: "submit" }), true);
  window.addEventListener("error", (e) => record({ event: "client.error", error_type: errorType(e.error),
    path: path(e.filename || ""), line: e.lineno || 0, column: e.colno || 0 }));
  window.addEventListener("unhandledrejection", (e) => record({ event: "client.error", error_type: errorType(e.reason) }));
  window.addEventListener("pagehide", () => { void flush(); });
}

export function traceAxiosClient(client) {
  installClientDiagnostics();
  if (typeof window !== "undefined") window.__lmsDiagnostics?.instrumentAxios(client);
}

installClientDiagnostics();

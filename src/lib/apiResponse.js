/** Decode API responses without exposing proxy HTML, stack traces or parser errors. */
export async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  let data;
  if (/\bjson\b/i.test(contentType)) {
    try { data = await response.json(); } catch { /* Controlled fallback below. */ }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    const error = new Error(`Service is temporarily unavailable (HTTP ${response.status}). Please try again.`);
    error.userMessage = error.message;
    error.status = response.status;
    error.requestId = response.headers.get("x-request-id");
    throw error;
  }
  return data;
}

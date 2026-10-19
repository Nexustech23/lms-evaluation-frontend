// Exam forms use the saved calendar time. Converting through Date/toISOString
// shifts a naive datetime according to the browser's timezone.
export function examDateTimeInput(value) {
  if (typeof value !== "string") return "";
  const match = value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  return match ? match[0] : "";
}

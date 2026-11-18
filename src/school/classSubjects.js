// A school has no semesters. The subjects of a class are the subjects of all its (hidden) semester groups, each once.
//
// `bySemester` is what the page already builds for a batch: { "1": [subject, ...], "2": [subject, ...] }.
// A subject listed under two semesters under the same name is shown once (the first one, by semester).
export function subjectsOfClass(bySemester) {
  const seen = new Set();
  const subjects = [];
  const semesters = Object.keys(bySemester || {}).sort((a, b) => Number(a) - Number(b) || String(a).localeCompare(String(b)));
  for (const semester of semesters) {
    for (const subject of bySemester[semester] || []) {
      const key = String(subject.subject_name || subject._id).trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      subjects.push(subject);
    }
  }
  return subjects.sort((a, b) => String(a.subject_name).localeCompare(String(b.subject_name)));
}

// What a school paper calls its class: the batch the teacher picked ("Class 12"), else the class chosen in the CBSE card.
export function classLabel(batchName, cbseClass) {
  const name = String(batchName || "").trim();
  if (name) return name;
  return cbseClass ? `Class ${cbseClass}` : "";
}

// Classes in the order a teacher expects: Class 7, Class 10, Class 12 (not Class 10, Class 12, Class 7).
export function sortClasses(batches) {
  return [...batches].sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: "base" }));
}

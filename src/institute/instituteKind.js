// What kind of institute a user belongs to, and the words that kind uses.
// Pages that differ between a school and a college pick their school or college component from this one place,
// instead of scattering "if school" through long files. An institute with no type saved (every existing one) is a college.
import { DEFAULT_INSTITUTE_TYPE } from "@/lib/instituteType";

export const SCHOOL = "school";
export const COLLEGE = "college";

// The signed-in user comes from /api/me, which carries `institute_type` for admins, faculty and students.
export function instituteTypeOf(user) {
  return user?.institute_type || DEFAULT_INSTITUTE_TYPE;
}

export const isSchool = (user) => instituteTypeOf(user) === SCHOOL;

// The word each kind of institute uses. A college keeps today's wording; add a key here when a screen needs a new word.
//   semester: the term a subject belongs to (a school has none, so its screens say Class)
//   batch:    a group of students (in a school that group is a class)
const TERMS = {
  [COLLEGE]: { semester: "Semester", batch: "Batch" },
  [SCHOOL]: { semester: "Class", batch: "Class" },
};

export function term(type, key) {
  return (TERMS[type] || TERMS[COLLEGE])[key] ?? TERMS[COLLEGE][key] ?? key;
}

// The kinds of exam a paper can be for. A school sits annual, half-yearly and pre-board exams, not semester exams.
const EXAM_TYPES = {
  [COLLEGE]: ["End Semester Examination", "Mid Semester Examination", "Unit Test", "Quiz", "Internal Assessment"],
  [SCHOOL]: ["Annual Examination", "Half Yearly Examination", "Pre-Board Examination", "Periodic Test", "Unit Test", "Class Test"],
};

export const examTypesFor = (type) => EXAM_TYPES[type] || EXAM_TYPES[COLLEGE];
export const defaultExamType = (type) => examTypesFor(type)[0];

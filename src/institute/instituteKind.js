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
const TERMS = {
  [COLLEGE]: { semester: "Semester" },
  [SCHOOL]: { semester: "Class" },
};

export function term(type, key) {
  return (TERMS[type] || TERMS[COLLEGE])[key] ?? TERMS[COLLEGE][key] ?? key;
}

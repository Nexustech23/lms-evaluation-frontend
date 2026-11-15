// The kinds of institute the app supports. An institute with no type saved (every existing one) is a college.
export const DEFAULT_INSTITUTE_TYPE = "college";

export const INSTITUTE_TYPES = [
  { value: "college", label: "College / University" },
  { value: "school", label: "School" },
  { value: "coaching", label: "Coaching" },
];

export function instituteTypeLabel(value) {
  return (INSTITUTE_TYPES.find((type) => type.value === value) || INSTITUTE_TYPES[0]).label;
}

export const ROLES = {
  SUPER_ADMIN: 1,
  INSTITUTE_ADMIN: 2,
  FACULTY: 3,
  INSTITUTE_STUDENT: 4,
  TUTOR: 5,
  TUTOR_STUDENT: 6,
  SELF_LEARNER: 7,
};

export const ROLE_ROUTES = {
  [ROLES.SUPER_ADMIN]: "/super-admin",

  [ROLES.INSTITUTE_ADMIN]: "/admin",

  [ROLES.FACULTY]: "/faculty",

  [ROLES.INSTITUTE_STUDENT]: "/institute-student",

  [ROLES.TUTOR]: "/tutor",

  [ROLES.TUTOR_STUDENT]: "/tutor-student",

  [ROLES.SELF_LEARNER]: "/self-learner",
};
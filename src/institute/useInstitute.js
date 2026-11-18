"use client";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import { defaultExamType, examTypesFor, instituteTypeOf, isSchool, term } from "./instituteKind";

// For a component: which kind of institute am I in, and what do I call things?
//   const { isSchool, word } = useInstitute();   word("semester") -> "Class" in a school, "Semester" in a college
export default function useInstitute() {
  const auth = useContext(AuthContext);
  const type = instituteTypeOf(auth?.user);
  return {
    type,
    isSchool: isSchool(auth?.user),
    word: (key) => term(type, key),
    examTypes: examTypesFor(type),
    defaultExamType: defaultExamType(type),
    loading: !!auth?.loading,
  };
}

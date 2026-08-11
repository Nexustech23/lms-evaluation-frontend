"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useDocuments = (filters,isArchived) => {
  return useQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const res = await axios.get(`/api/newsaved-documents`, {
        withCredentials: true,
        params: {
          school: filters.selectedSchool,
          programme: filters.selectedProgramme,
          department: filters.selectedDepartment,
          batch: filters.selectedBatch,
          semester: filters.selectedSemester,
          subject: filters.selectedSubject,
          isArchived:isArchived?isArchived:false
        },
      });
      return res.data.documents || [];
    },
  });
};
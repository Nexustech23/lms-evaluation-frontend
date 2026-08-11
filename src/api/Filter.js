import axios from "axios";
import { useQuery } from "@tanstack/react-query";

/* =========================================================
   COMMON FETCHER
========================================================= */

const fetchFacultyFilterData = async (
  params = {}
) => {

  const res = await axios.get(
    `/api/faculty/filter-data`,
    {
      withCredentials: true,
      params,
    }
  );

  return res.data.filters || {};
};

/* =========================================================
   SCHOOLS QUERY
========================================================= */

export const useFacultySchools =
  () => {

    return useQuery({

      queryKey: [
        "faculty-schools",
      ],

      queryFn: () =>
        fetchFacultyFilterData(),

      staleTime:
        1000 * 60 * 10,
    });
  };

/* =========================================================
   PROGRAMMES QUERY
========================================================= */

export const useFacultyProgrammes =
  (school_id) => {

    return useQuery({

      queryKey: [
        "faculty-programmes",
        school_id,
      ],

      queryFn: () =>
        fetchFacultyFilterData({
          school_id,
        }),

      enabled:
        !!school_id,

      staleTime:
        1000 * 60 * 10,
    });
  };

/* =========================================================
   DEPARTMENTS QUERY
========================================================= */

export const useFacultyDepartments =
  ({
    school_id,
    programme_id,
  }) => {

    return useQuery({

      queryKey: [
        "faculty-departments",
        school_id,
        programme_id,
      ],

      queryFn: () =>
        fetchFacultyFilterData({
          school_id,
          programme_id,
        }),

      enabled:
        !!programme_id,

      staleTime:
        1000 * 60 * 10,
    });
  };

/* =========================================================
   BATCHES QUERY
========================================================= */

export const useFacultyBatches =
  ({
    school_id,
    programme_id,
    department_id,
  }) => {

    return useQuery({

      queryKey: [
        "faculty-batches",
        school_id,
        programme_id,
        department_id,
      ],

      queryFn: () =>
        fetchFacultyFilterData({
          school_id,
          programme_id,
          department_id,
        }),

      enabled:
        !!programme_id,

      staleTime:
        1000 * 60 * 10,
    });
  };

/* =========================================================
   SEMESTERS QUERY
========================================================= */

export const useFacultySemesters =
  ({
    school_id,
    programme_id,
    department_id,
    batch_id,
  }) => {

    return useQuery({

      queryKey: [
        "faculty-semesters",
        batch_id,
      ],

      queryFn: () =>
        fetchFacultyFilterData({
          school_id,
          programme_id,
          department_id,
          batch_id,
        }),

      enabled:
        !!batch_id,

      staleTime:
        1000 * 60 * 10,
    });
  };

/* =========================================================
   SUBJECTS QUERY
========================================================= */

export const useFacultySubjects =
  ({
    school_id,
    programme_id,
    department_id,
    batch_id,
    semester,
  }) => {

    return useQuery({

      queryKey: [
        "faculty-subjects",
        batch_id,
        semester,
      ],

      queryFn: () =>
        fetchFacultyFilterData({
          school_id,
          programme_id,
          department_id,
          batch_id,
          semester,
        }),

      enabled:
        !!semester,

      staleTime:
        1000 * 60 * 10,
    });
  };
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

/* =========================================================
   HELPERS
========================================================= */

function withAlpha(hex = "#ff7f10", alpha = 1) {
  const h = hex.replace("#", "");

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenColor(hex = "#ff7f10", amount = 0.35) {
  const h = hex.replace("#", "");

  const r = Math.max(
    0,
    Math.floor(parseInt(h.substring(0, 2), 16) * (1 - amount)),
  );

  const g = Math.max(
    0,
    Math.floor(parseInt(h.substring(2, 4), 16) * (1 - amount)),
  );

  const b = Math.max(
    0,
    Math.floor(parseInt(h.substring(4, 6), 16) * (1 - amount)),
  );

  return `rgb(${r}, ${g}, ${b})`;
}

/* =========================================================
   SELECT
========================================================= */

function ColoredSelect({ color, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        color: darkenColor(color),
        borderColor: withAlpha(color, 0.4),
        outline: "none",
        fontWeight: 700,
      }}
      className="p-2 border rounded bg-white"
    >
      {children}
    </select>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SavedResult() {
  const router = useRouter();

  const { user } = useContext(AuthContext);

  const color = user?.color || "#ff7f10";

  const t = useTranslations("courseOutcomePage");

  const ts = useTranslations("subjects");
const [search, setSearch] = useState("");

const [debouncedSearch, setDebouncedSearch] = useState("");
  /* =========================================================
     STATES
  ========================================================= */

  const [loading, setLoading] = useState(true);

  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [schools, setSchools] = useState([]);

  const [programmes, setProgrammes] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [batches, setBatches] = useState([]);

  const [subjects, setSubjects] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState(null);

  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [selectedSemester, setSelectedSemester] = useState("");

  const [hasDepartment, setHasDepartment] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
  });

  /* =========================================================
     FETCH SCHOOLS
  ========================================================= */

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`/api/schools`, {
        params: {
          page: 1,
          limit: 0,
        },
        withCredentials: true,
      });

      setSchools(res.data.schools || []);
    } catch {
      toast.error("Failed to load schools");
    }
  };
useEffect(() => {

  const timer = setTimeout(() => {

    setDebouncedSearch(search);

  }, 500);

  return () => clearTimeout(timer);

}, [search]);
  /* =========================================================
     FETCH PROGRAMMES
  ========================================================= */

  const fetchProgrammes = async (schoolId) => {
    if (!schoolId) return;

    try {
      const res = await axios.get(`/api/programmes/${schoolId}`, {
        params: {
          page: 1,
          limit: 0,
        },
        withCredentials: true,
      });

      setProgrammes(res.data.programmes || []);
    } catch {
      toast.error("Failed to load programmes");
    }
  };

  /* =========================================================
     FETCH DEPARTMENTS
  ========================================================= */

  const fetchDepartments = async (programmeId) => {
    if (!programmeId) return;

    try {
      const res = await axios.get(`/api/departments/${programmeId}`, {
        params: {
          page: 1,
          limit: 0,
        },
        withCredentials: true,
      });

      const data = res.data.departments || [];

      setDepartments(data);

      const realDepts = data.filter(
        (d) => d.id !== null && d.department_name !== null,
      );

      setHasDepartment(realDepts.length > 0);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  /* =========================================================
     FETCH BATCHES
  ========================================================= */

  const fetchBatches = async () => {
    try {
      const params = {
        page: 1,
        limit: 0,
      };

      if (hasDepartment && selectedDepartment) {
        params.department_id = selectedDepartment.id;
      } else if (selectedProgramme) {
        params.programme_id = selectedProgramme.id;
      }

      const res = await axios.get(`/api/batches`, {
        params,
        withCredentials: true,
      });

      setBatches(res.data.batches || []);
    } catch {
      toast.error("Failed to load batches");
    }
  };

  /* =========================================================
     FETCH SUBJECTS
  ========================================================= */

  const fetchSubjects = async (page = 1) => {
    try {
      setLoadingSubjects(true);
const params = {
  page,
  limit: pagination.limit,
  search: debouncedSearch,
};

      if (selectedSchool) {
        params.school_id = selectedSchool.id;
      }

      if (selectedProgramme) {
        params.programme_id = selectedProgramme.id;
      }

      if (selectedDepartment) {
        params.department_id = selectedDepartment.id;
      }

      if (selectedBatch) {
        params.batch_id = selectedBatch.id;
      }

      if (selectedSemester) {
        params.semester = selectedSemester;
      }

      const res = await axios.get(`/api/subjects/institute`, {
        params,
        withCredentials: true,
      });

      setSubjects(res.data.subjects || []);

      setPagination((prev) => ({
        ...prev,
        page: res.data.page || 1,
        total: res.data.total || 0,
      }));
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setLoadingSubjects(false);

      setLoading(false);
    }
  };

  /* =========================================================
     EFFECTS
  ========================================================= */

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchProgrammes(selectedSchool.id);
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedProgramme) {
      fetchDepartments(selectedProgramme.id);
    }
  }, [selectedProgramme]);

  useEffect(() => {
    if (selectedProgramme || selectedDepartment) {
      fetchBatches();
    }
  }, [selectedProgramme, selectedDepartment]);

useEffect(() => {

  fetchSubjects(
    pagination.page
  );

}, [
  pagination.page,
  debouncedSearch,
  selectedSchool,
  selectedProgramme,
  selectedDepartment,
  selectedBatch,
  selectedSemester,
]);
useEffect(() => {

  setPagination((prev) => ({
    ...prev,
    page: 1,
  }));

}, [
  debouncedSearch,
  selectedSchool,
  selectedProgramme,
  selectedDepartment,
  selectedBatch,
  selectedSemester,
]);

  /* =========================================================
     CLEAR
  ========================================================= */

  const handleClear = () => {
    setSelectedSchool(null);
setSearch("");
    setSelectedProgramme(null);

    setSelectedDepartment(null);

    setSelectedBatch(null);

    setSelectedSemester("");

    setProgrammes([]);

    setDepartments([]);

    setBatches([]);

    setPagination({
      page: 1,
      limit: 8,
      total: 0,
    });
  };

  /* =========================================================
     SEMESTERS
  ========================================================= */

  const semesters = [...new Set(batches.flatMap((b) => b.semesters || []))];

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil((pagination.total || 0) / pagination.limit);

  const handleNext = () => {
    if (pagination.page < totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  const handlePrev = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: withAlpha(color),
      }}
    >
      <Navbar title={t("title")} />

      <div className="p-6 bg-white mx-6 rounded-xl shadow-sm">
        {/* FILTERS */}

        <div className="mb-6">
          <div className="flex justify-between">
          <label className="font-medium block mb-3">{t("filterNote")}</label>

            <div className="mb-4 relative">

  <input
    type="text"
    value={search}
    placeholder="Search subjects..."
    onChange={(e) => {

      setSearch(
        e.target.value
      );
    }}
    className="w-full md:w-[320px] pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
  />

  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>

</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* SCHOOL */}

            <ColoredSelect
              color={color}
              value={selectedSchool?.id || ""}
              onChange={(e) => {
                const school = schools.find((s) => s.id === e.target.value);

                setSelectedSchool(school || null);

                setSelectedProgramme(null);

                setSelectedDepartment(null);

                setSelectedBatch(null);

                setSelectedSemester("");
              }}
            >
              <option value="">School</option>

              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.school_name}
                </option>
              ))}
            </ColoredSelect>

            {/* PROGRAMME */}

            <ColoredSelect
              color={color}
              disabled={!selectedSchool}
              value={selectedProgramme?.id || ""}
              onChange={(e) => {
                const programme = programmes.find(
                  (p) => p.id === e.target.value,
                );

                setSelectedProgramme(programme || null);

                setSelectedDepartment(null);

                setSelectedBatch(null);

                setSelectedSemester("");
              }}
            >
              <option value="">Programme</option>

              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.programme_name}
                </option>
              ))}
            </ColoredSelect>

            {/* DEPARTMENT */}

            {hasDepartment && (
              <ColoredSelect
                color={color}
                disabled={!selectedProgramme}
                value={selectedDepartment?.id || ""}
                onChange={(e) => {
                  const dept = departments.find((d) => d.id === e.target.value);

                  setSelectedDepartment(dept || null);

                  setSelectedBatch(null);

                  setSelectedSemester("");
                }}
              >
                <option value="">Department</option>

                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </ColoredSelect>
            )}

            {/* BATCH */}

            <ColoredSelect
              color={color}
              disabled={
                hasDepartment ? !selectedDepartment : !selectedProgramme
              }
              value={selectedBatch?.id || ""}
              onChange={(e) => {
                const batch = batches.find((b) => b.id === e.target.value);

                setSelectedBatch(batch || null);

                setSelectedSemester("");
              }}
            >
              <option value="">Batch</option>

              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_name}
                </option>
              ))}
            </ColoredSelect>

            {/* SEMESTER */}

            <ColoredSelect
              color={color}
              disabled={!selectedBatch}
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
              }}
            >
              <option value="">Semester</option>

              {semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </ColoredSelect>

            {/* CLEAR */}

            <button
              onClick={handleClear}
              className="p-2 rounded font-semibold text-sm transition-colors"
              style={{
                backgroundColor: withAlpha(color, 0.12),
                color: darkenColor(color),
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* CONTENT */}

        {loading || loadingSubjects ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {t("noSubjects")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subjects.map((sub) => (
                <FolderCard
                  key={sub._id}
                  sub={sub}
                  color={color}
                  onClick={() => router.push(`/admin/co/${sub._id}`)}
                  ts={ts}
                  t={t}
                />
              ))}
            </div>

            {/* PAGINATION */}

            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold" style={{ color }}>
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold" style={{ color }}>
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold" style={{ color }}>
                  {pagination.total}
                </span>{" "}
                subjects
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-xl border bg-white disabled:opacity-40"
                >
                  ← Previous
                </button>

                <div
                  className="min-w-[42px] h-[42px] flex items-center justify-center rounded-xl text-white font-semibold"
                  style={{
                    backgroundColor: color,
                  }}
                >
                  {pagination.page}
                </div>

                <button
                  onClick={handleNext}
                  disabled={pagination.page === totalPages}
                  className="px-4 py-2 rounded-xl border bg-white disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FOLDER CARD
========================================================= */

function FolderCard({ sub, color, onClick, ts, t }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer rounded-xl p-5 shadow-sm transition-all duration-200"
      style={{
        backgroundColor: hovered
          ? withAlpha(color, 0.18)
          : withAlpha(color, 0.08),

        border: `1px solid ${withAlpha(color, hovered ? 0.4 : 0.2)}`,
      }}
    >
      <div
        className="text-4xl mb-3 w-12 h-12 flex items-center justify-center rounded-lg"
        style={{
          backgroundColor: withAlpha(color, 0.15),
        }}
      >
        📁
      </div>

      <h3 className="font-semibold text-gray-800 text-lg">
        {sub.subject_name}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {sub.subject_code || t("noCode")}
      </p>

      <div className="flex justify-between mt-3">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: withAlpha(color, 0.12),
            color: darkenColor(color),
          }}
        >
          {ts("batch")} {sub.batch_name}
        </span>

        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: withAlpha(color, 0.12),
            color: darkenColor(color),
          }}
        >
          {ts("semester")} {sub.semester}
        </span>
      </div>
    </div>
  );
}

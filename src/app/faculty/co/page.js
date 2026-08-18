"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
} from "react";

import axios from "axios";

import { useRouter } from "next/navigation";

import Navbar from "@/components/ui/Navbar";

import Spinner from "@/components/ui/Spinner";

import toast from "react-hot-toast";

import { useTranslations } from "next-intl";

import { AuthContext } from "@/app/AuthContext";

import Filters from "@/components/Filters";

/** Convert hex + alpha → rgba */
function withAlpha(
  hex = "#ff7f10",
  alpha = 1
) {
  const h = hex.replace("#", "");

  const r = parseInt(
    h.substring(0, 2),
    16
  );

  const g = parseInt(
    h.substring(2, 4),
    16
  );

  const b = parseInt(
    h.substring(4, 6),
    16
  );

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Darken color */
function darkenColor(
  hex = "#ff7f10",
  amount = 0.35
) {
  const h = hex.replace("#", "");

  const r = Math.max(
    0,
    Math.floor(
      parseInt(
        h.substring(0, 2),
        16
      ) *
        (1 - amount)
    )
  );

  const g = Math.max(
    0,
    Math.floor(
      parseInt(
        h.substring(2, 4),
        16
      ) *
        (1 - amount)
    )
  );

  const b = Math.max(
    0,
    Math.floor(
      parseInt(
        h.substring(4, 6),
        16
      ) *
        (1 - amount)
    )
  );

  return `rgb(${r}, ${g}, ${b})`;
}

export default function SavedResult() {
  const router = useRouter();

  const { user } =
    useContext(AuthContext);

  const color =
    user?.color || "#ff7f10";

  const [
    allSubjects,
    setAllSubjects,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [filters, setFilters] =
    useState({
      selectedSchool: "",
      selectedProgramme: "",
      selectedDepartment: "",
      selectedBatch: "",
      selectedSemester: "",
      selectedSubject: "",
    });

  /* =========================================================
     PAGINATION
  ========================================================= */

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 8;

  const t = useTranslations(
    "courseOutcomePage"
  );

  const ts = useTranslations(
    "subjects"
  );

  /* =========================================================
     RESET PAGE ON FILTER CHANGE
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  /* =========================================================
     FETCH SUBJECTS
  ========================================================= */

  const fetchSubjects =
    async () => {

      try {

        setLoading(true);

        const res =
          await axios.get(
            `/api/subjects/faculty`,
            {
              withCredentials: true,
              // Default server-side limit is 10 — a faculty with subjects
              // across several batches/semesters can easily exceed that,
              // silently dropping older batches from this picker.
              params: { limit: 500 },
            }
          );

        setAllSubjects(
          res.data.subjects || []
        );

      } catch {

        toast.error(
          "Failed to load subjects"
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSubjects();
  }, []);

  /* =========================================================
     FILTERED SUBJECTS
  ========================================================= */

  const filteredSubjects =
    useMemo(() => {

      return allSubjects.filter(
        (s) => {

          if (
            filters.selectedSchool &&
            s.school_id !==
              filters.selectedSchool
          ) {
            return false;
          }

          if (
            filters.selectedProgramme &&
            s.programme_id !==
              filters.selectedProgramme
          ) {
            return false;
          }

          if (
            filters.selectedDepartment &&
            s.department_id !==
              filters.selectedDepartment
          ) {
            return false;
          }

          if (
            filters.selectedBatch &&
            s.batch_id !==
              filters.selectedBatch
          ) {
            return false;
          }

          if (
            filters.selectedSemester &&
            String(s.semester) !==
              filters.selectedSemester
          ) {
            return false;
          }

          if (
            filters.selectedSubject &&
            s._id !==
              filters.selectedSubject
          ) {
            return false;
          }

          return true;
        }
      );

    }, [allSubjects, filters]);

  /* =========================================================
     TOTAL PAGES
  ========================================================= */

  const totalPages =
    Math.ceil(
      filteredSubjects.length /
        itemsPerPage
    );

  /* =========================================================
     PAGINATED SUBJECTS
  ========================================================= */

  const tableSubjects =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        itemsPerPage;

      const end =
        start + itemsPerPage;

      return filteredSubjects.slice(
        start,
        end
      );

    }, [
      filteredSubjects,
      currentPage,
    ]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor:
          withAlpha(color),
      }}
    >
      <Navbar title={t("title")} />

      <div className="p-6 mx-6">

        {/* Filters */}
        <div className="mb-6">
          <Filters
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {/* Content */}
        {loading ? (

          <div className="flex bg-white p-4 rounded-xl justify-center py-10">
            <Spinner />
          </div>

        ) : filteredSubjects.length ===
          0 ? (

          <div className="text-center p-4 rounded-xl bg-white py-10 text-gray-400">
            {t("noSubjects")}
          </div>

        ) : (

          <>
            {/* Cards */}
            <div className="grid bg-white p-4 rounded-xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

              {tableSubjects.map(
                (sub) => (

                  <FolderCard
                    key={sub._id}
                    sub={sub}
                    color={color}
                    ts={ts}
                    t={t}
                    onClick={() =>
                      router.push(
                        `/faculty/co/${sub._id}`
                      )
                    }
                  />
                )
              )}
            </div>

            {/* Pagination */}
            {filteredSubjects.length > 0 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-xl p-4 shadow-sm">

                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) *
                      itemsPerPage +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(
                      currentPage *
                        itemsPerPage,
                      filteredSubjects.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {
                      filteredSubjects.length
                    }
                  </span>{" "}
                  subjects
                </div>

                <div className="flex items-center gap-2 flex-wrap">

                  {/* Prev */}
                  <button
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (p) => p - 1
                      )
                    }
                    className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
                  >
                    Prev
                  </button>

                  {/* Pages */}
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`px-4 py-2 border rounded-xl text-sm transition ${
                        currentPage === page
                          ? "text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      style={
                        currentPage === page
                          ? {
                              backgroundColor:
                                color,

                              borderColor:
                                color,
                            }
                          : {}
                      }
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (p) => p + 1
                      )
                    }
                    className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function FolderCard({
  sub,
  color,
  onClick,
  ts,
  t,
}) {

  const [hovered,
    setHovered] =
    useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() =>
        setHovered(true)
      }
      onMouseLeave={() =>
        setHovered(false)
      }
      className="cursor-pointer rounded-xl p-5 shadow-sm transition-all duration-200"
      style={{
        backgroundColor:
          hovered
            ? withAlpha(
                color,
                0.18
              )
            : withAlpha(
                color,
                0.08
              ),

        border: `1px solid ${withAlpha(
          color,
          hovered
            ? 0.4
            : 0.2
        )}`,

        boxShadow: hovered
          ? `0 4px 16px ${withAlpha(
              color,
              0.18
            )}`
          : undefined,
      }}
    >
      {/* Icon */}
      <div
        className="text-4xl mb-3 w-12 h-12 flex items-center justify-center rounded-lg"
        style={{
          backgroundColor:
            withAlpha(
              color,
              0.15
            ),
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-7 h-7"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L11.7071 6.70711C11.8946 6.89464 12.149 7 12.4142 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
            fill={withAlpha(
              color,
              0.35
            )}
            stroke={color}
            strokeWidth="1.5"
          />

          <path
            d="M3 11H21"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Subject */}
      <h3 className="font-semibold text-gray-800 text-lg">
        {sub.subject_name}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {sub.subject_code ||
          t("noCode")}
      </p>

      {/* Footer */}
      <div className="flex justify-between mt-3">

        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor:
              withAlpha(
                color,
                0.12
              ),

            color:
              darkenColor(
                color
              ),
          }}
        >
          {ts("batch")}{" "}
          {sub.batch_name}
        </span>

        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor:
              withAlpha(
                color,
                0.12
              ),

            color:
              darkenColor(
                color
              ),
          }}
        >
          {ts("semester")}{" "}
          {sub.semester}
        </span>
      </div>
    </div>
  );
}
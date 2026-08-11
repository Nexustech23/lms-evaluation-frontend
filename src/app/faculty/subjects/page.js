"use client";

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";
import { IconEye } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Filters from "@/components/Filters";

function withAlpha(hex = "#ff7f10", alpha = 1) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function SubjectsPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const color = user?.color || "#ff7f10";

  const [loading, setLoading] = useState(true);
  const [allSubjects, setAllSubjects] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubjects, setTotalSubjects] = useState(0);

  const itemsPerPage = 10;

  const t = useTranslations("subjects");

  const [filters, setFilters] = useState({
    selectedSchool: "",
    selectedProgramme: "",
    selectedDepartment: "",
    selectedBatch: "",
    selectedSemester: "",
    selectedSubject: "",
  });

  const handleAddViewCO = (subject) => {
    router.push(`/faculty/subjects/co?subject=${subject._id}`);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch paginated subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/api/subjects/faculty`, {
          withCredentials: true,
          params: {
            page: currentPage,
            limit: itemsPerPage,

            school_id: filters.selectedSchool || undefined,
            programme_id: filters.selectedProgramme || undefined,
            department_id: filters.selectedDepartment || undefined,
            batch_id: filters.selectedBatch || undefined,
            semester: filters.selectedSemester || undefined,
            subject_id: filters.selectedSubject || undefined,
          },
        });

        setAllSubjects(res.data?.subjects || []);
        setTotalPages(res.data?.total_pages|| 1);
        setTotalSubjects(res.data?.total || 0);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setAllSubjects([]);
        setTotalPages(1);
        setTotalSubjects(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [currentPage, filters]);

  // API already returns paginated data
  const tableSubjects = allSubjects;

  return (
    <div style={{ backgroundColor: withAlpha(color), minHeight: "100vh" }}>
      <Navbar title={t("title")} />

      <div className="px-6">
        {/* Filters */}
        <Filters filters={filters} setFilters={setFilters} />

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden rounded-xl mt-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr
                    style={{ backgroundColor: withAlpha(color, 0.12) }}
                    className="text-left"
                  >
                    <th className="px-4 py-3">{t("sno")}</th>
                    <th className="px-4 py-3">{t("subjectName")}</th>
                    <th className="px-4 py-3">{t("subjectCode")}</th>
                    <th className="px-4 py-3">{t("programme")}</th>
                    <th className="px-4 py-3">{t("department")}</th>
                    <th className="px-4 py-3">{t("batch")}</th>
                    <th className="px-4 py-3">{t("semester")}</th>

                    {user?.hasCOAccess && (
                      <th className="px-4 py-3">{t("action")}</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {tableSubjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-400 font-medium"
                      >
                        No subjects found.
                      </td>
                    </tr>
                  ) : (
                    tableSubjects.map((sub, index) => (
                      <tr
                        key={sub._id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-4 text-gray-400">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                          {sub.subject_name}
                        </td>

                        <td className="px-4 py-4">
                          {sub.subject_code ? (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: withAlpha(color, 0.12),
                                color: color,
                              }}
                            >
                              {sub.subject_code}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {sub.programme_name}
                        </td>

                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {sub.department_name}
                        </td>

                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {sub.batch_name}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: withAlpha(color, 0.08),
                              color: color,
                              borderColor: withAlpha(color, 0.3),
                            }}
                          >
                            {sub.semester}
                          </span>
                        </td>

                        {user?.hasCOAccess && (
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <div className="relative group">
                                <button
                                  onClick={() => handleAddViewCO(sub)}
                                  className="p-2 rounded-lg transition"
                                  style={{ color: color }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      withAlpha(color, 0.1);
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }}
                                >
                                  <IconEye size={18} />
                                </button>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                                  <div className="px-2 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap">
                                    View CO
                                  </div>

                                  <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1" />
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalSubjects > 0 && (
                <div className="flex items-center justify-between mt-4 bg-white px-4 py-3 rounded-xl shadow-sm">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        currentPage * itemsPerPage,
                        totalSubjects
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {totalSubjects}
                    </span>{" "}
                    subjects
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((p) => p - 1)
                      }
                      className="px-3 py-1 rounded-xl border disabled:opacity-50"
                    >
                      Prev
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-xl border text-sm ${
                          currentPage === page
                            ? "text-white"
                            : "bg-white text-gray-700"
                        }`}
                        style={
                          currentPage === page
                            ? {
                                backgroundColor: color,
                                borderColor: color,
                              }
                            : {}
                        }
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => p + 1)
                      }
                      className="px-3 py-1 rounded-xl border disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
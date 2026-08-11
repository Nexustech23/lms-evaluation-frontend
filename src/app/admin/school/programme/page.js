"use client";

import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { AuthContext } from "@/app/AuthContext";
import {
  IconBuilding,
  IconEdit,
  IconUsersGroup,
  IconEye,
  IconPlus,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function ProgrammePage() {
  const { user } = useContext(AuthContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolId = searchParams.get("schoolId");
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const t = useTranslations("schoolProgrammes");
  const ta = useTranslations("adminSchool");
  const ts = useTranslations("subjects");
  const tua = useTranslations("uploadedAnswerScripts");

  // THIS WAS MISSING — caused all add/edit failures
  const [programmeForm, setProgrammeForm] = useState({
    programme_name: "",
    programme_code: "",
    duration_years: "",
    total_semesters: "",
    has_department: false,
  });
  /* ================= FETCH PROGRAMMES ================= */

  const fetchProgrammes = async (page = 1, searchText = "") => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/programmes/${schoolId}`, {
        params: {
          page,
          limit: pagination.limit,
          search: searchText,
        },
        withCredentials: true,
      });

      setProgrammes(res.data.programmes || []);

      setPagination((prev) => ({
        ...prev,
        page: res.data.page || 1,
        limit: res.data.limit || 10,
        total: res.data.total || 0,
      }));
    } catch {
      toast.error("Failed to load programmes");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (schoolId) {
      fetchProgrammes(pagination.page, debouncedSearch);
    }
  }, [schoolId, pagination.page, debouncedSearch]);

  /* ================= OPEN MODALS ================= */

  const openAddProgramme = () => {
    setEditingProgramme(null);
    setProgrammeForm({
      programme_name: "",
      duration_years: "",
      programme_code: "",
      total_semesters: "",
      has_department: false,
    });
    setShowProgrammeModal(true);
  };

  const openEditProgramme = (programme) => {
    setEditingProgramme(programme);
    setProgrammeForm({
      programme_name: programme.programme_name || "",
      programme_code: programme.programme_code || "",
      duration_years: programme.duration_years || "",
      total_semesters: programme.total_semesters || "",
      has_department: programme.has_department || false,
    });
    setShowProgrammeModal(true);
  };

  /* ================= SAVE PROGRAMME ================= */

  const handleSaveProgramme = async () => {
    if (!programmeForm.programme_name.trim()) {
      toast.error("Programme name is required");
      return;
    }

    try {
      setSaving(true);

      if (editingProgramme) {
        const payload = {
          ...programmeForm,
          school_id: schoolId,
          duration_years: Number(programmeForm.duration_years || 0),
          total_semesters: Number(programmeForm.total_semesters || 0),
        };
        await axios.put(`/api/programmes/${editingProgramme.id}`, payload, {
          withCredentials: true,
        });
        toast.success("Programme updated successfully");
      } else {
        const payload = {
          ...programmeForm,
          school_id: schoolId,
          duration_years: Number(programmeForm.duration_years || 0),
          total_semesters: Number(programmeForm.total_semesters || 0),
        };

        await axios.post(`/api/programmes`, payload, {
          withCredentials: true,
        });
        toast.success("Programme created successfully");
      }

      setShowProgrammeModal(false);
      fetchProgrammes();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
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
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: user?.color || "#ff7f10" }}
    >
      <Navbar title={ta("programmes")} />

      <div className="p-6 mx-4">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* LEFT */}
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-1 transition"
            >
              ← {t("backSchool")}
            </button>

            <h2 className="text-white text-3xl font-bold">
              {ta("programmes")}
            </h2>

            <p className="text-orange-100 text-sm mt-1">{t("manage")}</p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <input
                type="text"
                value={search}
                placeholder="Search programmes..."
                onChange={(e) => {
                  setSearch(e.target.value);

                  setPagination((prev) => ({
                    ...prev,
                    page: 1,
                  }));
                }}
                className="w-full sm:w-[260px] pl-11 pr-4 py-2.5 rounded-xl border border-white/20 bg-white text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
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

            {/* ADD BUTTON */}
            <button
              onClick={openAddProgramme}
              className={`flex items-center gap-2 px-5 py-2.5 bg-white font-semibold rounded-xl shadow-lg ${user?.color ? "hover:bg-green-50" : "hover:bg-orange-50"
                } transition`}
              style={{
                color: user?.color || "#ff7f10",
              }}
            >
              {t("addProgrammes")}
            </button>
          </div>
        </div>
        {/* ===== TABLE CARD ===== */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Spinner />
            </div>
          ) : programmes.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-500 font-medium">{t("noProgramme")}</p>
              <p className="text-gray-400 text-sm mt-1">{t("clickAdd")}</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-5 py-3 text-gray-500 font-semibold">
                      {ts("sno")}
                    </th>
                    <th className="px-5 py-3 text-gray-500 font-semibold">
                      {ts("programme")}
                    </th>
                    <th className="px-5 py-3 text-gray-500 font-semibold">
                      {t("abbrevation")}
                    </th>
                    <th className="px-5 py-3 text-gray-500 font-semibold">
                      {t("duration")}
                    </th>
                    <th className="px-5 py-3 text-gray-500 font-semibold">
                      {ts("semester")}
                    </th>
                    <th className="px-5 py-3 text-gray-500 font-semibold">
                      {t("type")}
                    </th>

                    {user?.hasCOAccess && (
                      <th className="px-5 py-3 text-gray-500 font-semibold">
                        PO
                      </th>
                    )}

                    <th className="px-5 py-3 text-gray-500 font-semibold text-center">
                      {tua("actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {programmes.map((p, index) => (
                    <tr
                      key={p.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-5 py-4 text-gray-400">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {p.programme_name}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {p.programme_code}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {p.duration_years}{" "}
                        {p.duration_years === 1 ? "Year" : "Years"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {p.total_semesters} Sems
                      </td>

                      <td className="px-5 py-4">
                        <div className="relative group inline-block">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border
      ${p.has_department
                                ? "bg-purple-50 text-purple-600 border-purple-200"
                                : "bg-blue-50 text-blue-600 border-blue-200"
                              }`}
                          >
                            {p.has_department ? (
                              <>
                                <IconBuilding size={14} /> {ts("department")}
                              </>
                            ) : (
                              <>
                                <IconUsersGroup size={14} /> {ts("batch")}
                              </>
                            )}
                          </span>

                          {/* Tooltip */}
                          <div
                            className="absolute -top-11 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
      transition-all duration-200 ease-in-out pointer-events-none"
                          >
                            <div
                              className="px-3 py-1.5 text-xs text-white 
        bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap"
                            >
                              {p.has_department
                                ? "This is a Department"
                                : "This is a Batch"}
                            </div>

                            {/* Arrow */}
                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>
                      </td>

                      {user?.hasCOAccess && (
                        <td className="px-5 py-4">
                          <div className="relative group inline-block">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/school/programme/programmeOutcome?programmeId=${p.id}`,
                                )
                              }
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition
      ${p.po?.length
                                  ? "text-blue-600 hover:text-blue-800"
                                  : "text-[#ff7f10] hover:text-orange-700"
                                }`}
                            >
                              {p.po?.length ? (
                                <IconEye size={20} stroke={2} />
                              ) : (
                                <IconPlus size={20} stroke={2} />
                              )}
                            </button>

                            {/* Tooltip */}
                            <div
                              className="absolute -top-11 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
      transition-all duration-200 ease-in-out pointer-events-none"
                            >
                              <div
                                className="px-3 py-1.5 text-xs text-white 
        bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap"
                              >
                                {p.po?.length
                                  ? "View Programme Outcome"
                                  : "Add Programme Outcome"}
                              </div>

                              {/* Arrow */}
                              <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {/* Edit */}
                          <div className="relative group">
                            <button
                              onClick={() => openEditProgramme(p)}
                              className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition"
                            >
                              <IconEdit />
                            </button>

                            <div
                              className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none"
                            >
                              <div
                                className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap"
                              >
                                Edit Programme
                              </div>

                              <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                            </div>
                          </div>

                          {/* Department */}
                          {p.has_department && (
                            <div className="relative group">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/school/programme/department?programmeId=${p.id}`,
                                  )
                                }
                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-xl transition"
                              >
                                <IconBuilding />
                              </button>

                              <div
                                className="absolute -top-11 left-1/2 -translate-x-1/2
          opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
          transition-all duration-200 ease-in-out pointer-events-none"
                              >
                                <div
                                  className="px-3 py-1.5 text-xs text-white 
            bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap"
                                >
                                  View Departments
                                </div>

                                <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                              </div>
                            </div>
                          )}

                          {/* Batch */}
                          {!p.has_department && (
                            <div className="relative group">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/school/programme/batch?programmeId=${p.id}`,
                                  )
                                }
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                              >
                                <IconUsersGroup size={20} />
                              </button>

                              <div
                                className="absolute -top-11 left-1/2 -translate-x-1/2
          opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
          transition-all duration-200 ease-in-out pointer-events-none"
                              >
                                <div
                                  className="px-3 py-1.5 text-xs text-white 
            bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap"
                                >
                                  View Batches
                                </div>

                                <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* ================= PAGINATION ================= */}

              {programmes.length > 0 && (
                <div className="bg-white border-t px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl">
                  {/* LEFT */}
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-orange-600">
                      {programmes.length > 0
                        ? (pagination.page - 1) * pagination.limit + 1
                        : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-orange-600">
                      {Math.min(
                        pagination.page * pagination.limit,

                        pagination.total || 0,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-orange-600">
                      {pagination.total || 0}
                    </span>{" "}
                    programmes
                  </div>

                  {/* BUTTONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <div className="min-w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-orange-500 text-white font-semibold shadow-md">
                      {pagination.page}
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={
                        pagination.page === totalPages || totalPages === 0
                      }
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= PROGRAMME MODAL ================= */}

      {showProgrammeModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {editingProgramme ? t("editProgramme") : t("addProgramme")}
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  {editingProgramme ? t("updateDetails") : t("fillDetails")}
                </p>
              </div>
              <button
                onClick={() => setShowProgrammeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("programmeName")} <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. B.Tech Computer Science"
                  value={programmeForm.programme_name}
                  onChange={(e) =>
                    setProgrammeForm({
                      ...programmeForm,
                      programme_name: e.target.value,
                    })
                  }
                  className={`w-full p-2.5 border rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("shortName")}{" "}
                  <span className="text-gray-400 font-normal">
                    {t("abbreviation")}
                  </span>
                </label>
                <input
                  placeholder="e.g. B.Tech CS, MCA, MBA"
                  value={programmeForm.programme_code}
                  onChange={(e) =>
                    setProgrammeForm({
                      ...programmeForm,
                      programme_code: e.target.value,
                    })
                  }
                  className={`w-full p-2.5 border rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("durationYears")}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={programmeForm.duration_years}
                    onChange={(e) =>
                      setProgrammeForm({
                        ...programmeForm,
                        duration_years: e.target.value,
                      })
                    }
                    className={`w-full p-2.5 border rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("totalSemesters")}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={programmeForm.total_semesters}
                    onChange={(e) =>
                      setProgrammeForm({
                        ...programmeForm,
                        total_semesters: e.target.value,
                      })
                    }
                    className={`w-full p-2.5 border rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                  />
                </div>
              </div>

              <div
                onClick={() =>
                  setProgrammeForm({
                    ...programmeForm,
                    has_department: !programmeForm.has_department,
                  })
                }
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition
                                    ${programmeForm.has_department
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition
                                    ${programmeForm.has_department
                      ? "bg-purple-500 border-purple-500"
                      : "border-gray-300"
                    }`}
                >
                  {programmeForm.has_department && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {t("departmentBased")}
                  </p>
                  <p className="text-xs text-gray-400">{t("departmentDesc")}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowProgrammeModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
              >
                {t("cancel")}
              </button>
              <button
                disabled={saving}
                onClick={handleSaveProgramme}
                className={`px-5 py-2 text-white rounded-lg text-sm font-semibold ${user?.color ? "hover:bg-green-600" : "hover:bg-orange-600"} transition disabled:opacity-60`}
                style={{ backgroundColor: user?.color || "#ff7f10" }}
              >
                {saving
                  ? t("saving")
                  : editingProgramme
                    ? t("updateProgramme")
                    : t("createProgramme")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

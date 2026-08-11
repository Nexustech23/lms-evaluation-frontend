"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import { IconCopy, IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

export default function BatchPage() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const programmeId = searchParams.get("programmeId");
  const departmentId = searchParams.get("departmentId");
const [search, setSearch] = useState("");

const [debouncedSearch, setDebouncedSearch] = useState("");

const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
});
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [subjectsToBeDeleted, setSubjectsToBeDeleted] = useState([]);
  const { user ,isLoading} = useContext(AuthContext);
  const [showDeleteModal,setShowDeleteModal] = useState(false);

  const t = useTranslations("programmeBatch");
  const tc = useTranslations("common");

  const [batchData, setBatchData] = useState({
    batch_name: "",
    total_semesters: "",
    semesters: []
  });

  /* ================= FETCH ================= */

const fetchBatches = async (
  page = 1,
  searchText = ""
) => {

  try {

    setLoading(true);

    const params = {
      page,
      limit: pagination.limit,
      search: searchText,
    };

    if (departmentId) {
      params.department_id = departmentId;
    }

    if (programmeId) {
      params.programme_id = programmeId;
    }

    const res = await axios.get(
      `/api/batches`,
      {
        params,
        withCredentials: true,
      }
    );

    setBatches(
      res.data.batches || []
    );

    setPagination((prev) => ({
      ...prev,
      page: res.data.page || 1,
      limit: res.data.limit || 10,
      total: res.data.total || 0,
    }));

  } catch {

    toast.error(
      "Failed to load batches"
    );

  } finally {

    setLoading(false);

  }
};

const fetchFaculties = async () => {
  try {

    const res = await axios.get(
      `/api/faculty`,
      {
        params: {
          programmeId,
          limit: 0,
          page: 1,
        },
        withCredentials: true,
      }
    );

    setFacultyList(res.data.faculties || []);

  } catch {

    toast.error("Failed to load faculties");

  }
};
useEffect(() => {

  const timer = setTimeout(() => {

    setDebouncedSearch(search);

  }, 500);

  return () => clearTimeout(timer);

}, [search]);
useEffect(() => {

  fetchFaculties();

}, [programmeId]);

useEffect(() => {

  fetchBatches(
    pagination.page,
    debouncedSearch
  );

}, [
  programmeId,
  departmentId,
  pagination.page,
  debouncedSearch
]);

  /* ================= OPEN CREATE ================= */

  const openCreate = () => {
    setIsEdit(false);
    setIsDuplicate(false);
    setSelectedBatch(null);
    setSubjectsToBeDeleted([]);
    setBatchData({ batch_name: "", total_semesters: "", semesters: [] });
    setShowModal(true);
  };

  /* ================= OPEN EDIT ================= */

  const openEdit = async (batchId) => {
    try {
      const res = await axios.get(
        `/api/batches/${batchId}`,
        { withCredentials: true }
      );
      const batch = res.data.batch;
      const normalizedSemesters = batch.semesters_with_subjects.map((sem) => ({
        semester_number: sem.semester_number,
        subjects: sem.subjects.map((sub) => ({
          id: sub.id,
          subject_name: sub.subject_name || "",
          subject_code: sub.subject_code || "",
          credits: sub.credits || "",
          faculty_id: sub.faculty_id || ""
        }))
      }));
      setSelectedBatch(batch);
      setIsEdit(true);
      setIsDuplicate(false);
      setSubjectsToBeDeleted([]);
      setBatchData({
        batch_name: batch.batch_name,
        total_semesters: batch.total_semesters,
        semesters: normalizedSemesters
      });
      setShowModal(true);
    } catch {
      toast.error("Failed to load batch details");
    }
  };

  /* ================= OPEN DUPLICATE ================= */

  const openDuplicate = async (batchId) => {
    try {
      const res = await axios.get(
        `/api/batches/${batchId}`,
        { withCredentials: true }
      );
      const batch = res.data.batch;
      // Strip all subject IDs so they are created fresh
      const normalizedSemesters = batch.semesters_with_subjects.map((sem) => ({
        semester_number: sem.semester_number,
        subjects: sem.subjects.map((sub) => ({
          id: null,                                   // no id → will be created new
          subject_name: sub.subject_name || "",
          subject_code: sub.subject_code || "",
          credits: sub.credits || "",
          faculty_id: sub.faculty_id || ""
        }))
      }));
      setSelectedBatch(null);                         // no existing batch to update
      setIsEdit(false);
      setIsDuplicate(true);
      setSubjectsToBeDeleted([]);
      setBatchData({
        batch_name: `${batch.batch_name} (Copy)`,    // prompt user to rename
        total_semesters: batch.total_semesters,
        semesters: normalizedSemesters
      });
      setShowModal(true);
    } catch {
      toast.error("Failed to load batch for duplication");
    }
  };

  /* ================= SEMESTER / SUBJECT HELPERS ================= */

  const addSemester = () => {
    const nextNumber = batchData.semesters.length + 1;
    setBatchData({
      ...batchData,
      total_semesters: nextNumber,
      semesters: [
        ...batchData.semesters,
        {
          semester_number: nextNumber,
          subjects: [{ subject_name: "", subject_code: "", credits: "", faculty_id: "" }]
        }
      ]
    });
  };

  const removeSemester = (semIndex) => {
    const copy = [...batchData.semesters];
    copy[semIndex].subjects.forEach((sub) => {
      if (sub.id) setSubjectsToBeDeleted((prev) => [...prev, sub.id]);
    });
    copy.splice(semIndex, 1);
    const renumbered = copy.map((sem, i) => ({ ...sem, semester_number: i + 1 }));
    setBatchData({ ...batchData, total_semesters: renumbered.length, semesters: renumbered });
  };

  const removeSubject = (semIndex, subIndex) => {
    const copy = [...batchData.semesters];
    const removed = copy[semIndex].subjects[subIndex];
    if (removed.id) setSubjectsToBeDeleted((prev) => [...prev, removed.id]);
    copy[semIndex].subjects.splice(subIndex, 1);
    setBatchData({ ...batchData, semesters: copy });
  };

  const updateSubject = (semIndex, subIndex, field, value) => {
    const copy = [...batchData.semesters];
    copy[semIndex].subjects[subIndex][field] = value;
    setBatchData({ ...batchData, semesters: copy });
  };

  const addSubject = (semIndex) => {
    const copy = [...batchData.semesters];
    copy[semIndex].subjects.push({ subject_name: "", subject_code: "", credits: "", faculty_id: "" });
    setBatchData({ ...batchData, semesters: copy });
  };

  /* ================= DELETE ================= */

  const openDeleteModal = async(batch) => {
    setShowDeleteModal(true);
    setSelectedBatch(batch);
  }

  const deleteBatch = async (batchId) => {
    try {
      setDeleting(batchId);
      await axios.delete(
        `/api/batches/${batchId}`,
        { withCredentials: true }
      );
      toast.success("Batch deleted");
      fetchBatches();
    } catch {
      toast.error("Failed to delete batch");
    } finally {
      setDeleting(null);
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!batchData.batch_name.trim()) {
      toast.error("Batch name is required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        batch_name: batchData.batch_name,
        total_semesters: batchData.total_semesters,
        semesters: batchData.semesters.map((sem) => ({
          semester_number: sem.semester_number,
          subjects: sem.subjects.map((sub) => ({
            id: sub.id || null,
            subject_name: sub.subject_name,
            subject_code: sub.subject_code,
            credits: sub.credits,
            faculty_id: sub.faculty_id
          }))
        })),
        subjectsToBeDeleted
      };

      if (isEdit && selectedBatch) {
        await axios.put(
          `/api/batches/${selectedBatch.id}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Batch updated successfully");
      } else {
        // covers both create and duplicate
        await axios.post(
          `/api/batches`,
          { ...payload, programme_id: programmeId, department_id: departmentId || null },
          { withCredentials: true }
        );
        toast.success(isDuplicate ? "Batch duplicated successfully" : "Batch created successfully");
      }

      setShowModal(false);
      fetchBatches();
    } catch {
      toast.error("Failed to save batch");
    } finally {
      setSaving(false);
    }
  };

  /* ================= MODAL TITLE ================= */

  const modalTitle = isEdit ? t("batch_edit") : isDuplicate ? t("batch_duplicate") : t("batch_create");
  const modalSubtitle = isEdit
    ? t("batch_modal_update_details")
    : isDuplicate
      ? t("batch_modal_duplicate_note")
      : t("batch_modal_create_note");
  const saveLabel = saving ? t("batch_saving") : isEdit ? t("batch_update") : isDuplicate ? t("batch_save_new") : t("batch_create");

  /* ================= UI ================= */
const totalPages = Math.ceil(
  (pagination.total || 0) /
  pagination.limit
);

const handleNext = () => {

  if (
    pagination.page < totalPages
  ) {

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
    <div className="min-h-screen" style={{backgroundColor: user?.color || "#ff7f10"}}>
     <Navbar title={t("batch_management_title")}/>

      <div className="p-6 mx-4">

        {/* ===== HEADER ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

  {/* LEFT */}
  <div>

    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-1 transition"
    >
      ← {tc("back")}
    </button>

    <h2 className="text-white text-3xl font-bold">
      {t("batch_title")}
    </h2>

    <p className="text-orange-100 text-sm mt-1">
      {t("batch_subtitle")}
    </p>

  </div>

  {/* RIGHT */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

    {/* SEARCH */}
    <div className="relative">

      <input
        type="text"
        value={search}
        placeholder="Search batches..."
        onChange={(e) => {

          setSearch(
            e.target.value
          );

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
      onClick={openCreate}
      className={`flex items-center gap-2 px-5 py-2.5 bg-white font-semibold rounded-xl shadow-lg ${
        user?.color
          ? "hover:bg-green-50"
          : "hover:bg-orange-50"
      } transition`}
      style={{
        color:
          user?.color ||
          "#ff7f10"
      }}
    >
       {t("batch_add")}
    </button>

  </div>

</div>

        {/* ===== TABLE ===== */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center"><Spinner /></div>
          ) : batches.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 font-medium">{t("batch_no_data")}</p>
              <p className="text-gray-400 text-sm mt-1">{t("batch_no_data_hint")}</p>
            </div>
          ) : (
            <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-left">
                  <th className="px-5 py-3 text-gray-500 font-semibold">{t("batch_sno")}</th>
                  <th className="px-5 py-3 text-gray-500 font-semibold">{t("batch_name")}</th>
                  <th className="px-5 py-3 text-gray-500 font-semibold">{t("batch_semesters")}</th>
                  <th className="px-5 py-3 text-gray-500 font-semibold text-center">{t("batch_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b, index) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50 transition">
                   <td className="px-5 py-4 text-gray-400">
  {(pagination.page - 1) *
    pagination.limit +
    index +
    1}
</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{b.batch_name}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 border ${user?.color?"bg-green-50 border-green-200":"bg-orange-50 border-orange-200"} rounded-full text-xs font-semibold`}
                      style={{color: user?.color || "#ff7f10"}}>
                        {b.total_semesters} {t("semester")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-3">

                        {/* Edit */}
                        <div className="relative group">
                          <button
                            onClick={() => openEdit(b.id)}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition"
                          >
                            <IconEdit size={20} />
                          </button>

                          <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                              Edit Batch
                            </div>

                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>

                        {/* Duplicate */}
                        <div className="relative group">
                          <button
                            onClick={() => openDuplicate(b.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                          >
                            <IconCopy size={20} />
                          </button>

                          <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                              Duplicate Batch
                            </div>

                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>

                        {/* Delete */}
                        <div className="relative group">
                          <button
                            onClick={() => openDeleteModal(b.id)}
                            disabled={deleting === b.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition disabled:opacity-50"
                          >
                            {deleting === b.id ? "..." : <IconTrash size={20} />}
                          </button>

                          <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                              Delete Batch
                            </div>

                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* ================= PAGINATION ================= */}

{batches.length > 0 && (

  <div className="bg-white border-t px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl">

    {/* LEFT */}
    <div className="text-sm text-gray-600">

      Showing{" "}

      <span className="font-semibold text-orange-600">

        {batches.length > 0
          ? (
            (pagination.page - 1) *
            pagination.limit
          ) + 1
          : 0}

      </span>

      {" "}to{" "}

      <span className="font-semibold text-orange-600">

        {Math.min(
          pagination.page *
          pagination.limit,

          pagination.total || 0
        )}

      </span>

      {" "}of{" "}

      <span className="font-semibold text-orange-600">

        {pagination.total || 0}

      </span>

      {" "}batches

    </div>

    {/* BUTTONS */}
    <div className="flex items-center gap-2">

      <button
        onClick={handlePrev}
        disabled={
          pagination.page === 1
        }
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
          pagination.page === totalPages ||
          totalPages === 0
        }
        className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-40"
      >
        Next →
      </button>

    </div>

  </div>
)}
            </>
          )}
        </div>
      </div>
      {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-3">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
                        {/* HEADER */}
                        <div className="px-5 py-3 text-white flex items-center justify-between"
                        style={user?.color?{background: `linear-gradient(to right, ${user?.color}, #22c55e)`}:{background: "linear-gradient(to right, #ff7f10, #f97316)"}}>
                            <div>
                                <h2 className="text-base font-semibold">
                                    Delete Batch
                                </h2>
                                <p className="text-[11px] opacity-90">
                                    This action cannot be undone
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-white/80 hover:text-white text-sm"
                            >
                                ✕
                            </button>
                        </div>
                        {/* BODY */}
                        <div className="px-5 py-4">
                            <p className="text-xs text-gray-600 mb-3">
                                Are you sure you want to delete{" "}
                            </p>
                                    {/* WARNING */}
                                    <div className={`rounded-md p-2.5 mb-3 ${user?.color?"bg-green-50 border-green-200":"bg-orange-50 border-orange-200"}`}>
                                        <p className="text-[11px] text-orange-700 font-medium">
                                            ⚠️ Your data will be permanently deleted:
                                        </p>
                                    </div>
                        </div>

                        {/* FOOTER */}
                        <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2">

                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={`px-3 py-1.5 border rounded-md ${user?.color?"border-green-200 hover:bg-green-50":"border-orange-200 hover:bg-orange-50"} text-xs`}
                                style={{color: user?.color || "#ff7f10"}}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    deleteBatch(selectedBatch);
                                    setShowDeleteModal(false);
                                }}
                                className={`px-4 py-1.5 text-white rounded-md text-xs font-medium ${user?.color?"hover:bg-green-600":"hover:bg-orange-600"}`}
                                style={user?.color?{backgroundColor:user?.color}:{backgroundColor:"#ff7f10"}}
                            >
                                Confirm Delete
                            </button>

                        </div>
                    </div>
                </div>
            )}
      {/* ================= MODAL ================= */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-8 pb-8 overflow-auto z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">{modalTitle}</h3>
                  {isDuplicate && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                      {t("batch_modal_new_copy")}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{modalSubtitle}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">

              {/* Batch Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("batch_name")} <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. 2024-2028"
                  value={batchData.batch_name}
                  onChange={(e) => setBatchData({ ...batchData, batch_name: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"} ${isDuplicate ? "border-blue-300 bg-blue-50" : ""
                    }`}
                />
                {isDuplicate && (
                  <p className="text-xs text-blue-500 mt-1">
                    ✏️ {t("batch_rename_note")}
                  </p>
                )}
              </div>

              {/* Semesters */}
              {batchData.semesters.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl mb-4">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-gray-500 text-sm font-medium">{t("batch_no_semesters")}</p>
                  <p className="text-gray-400 text-xs mt-1">{t("batch_no_semesters_hint")}</p>
                </div>
              ) : (
                batchData.semesters.map((semester, semIndex) => (
                  <div key={semIndex} className="border border-gray-200 rounded-xl mb-4 overflow-hidden">

                    {/* Semester Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-bold" style={{backgroundColor: user?.color || "#ff7f10"}}>
                          {semester.semester_number}
                        </span>
                        <span className="font-semibold text-gray-700 text-sm">
                          {t("semester")} {semester.semester_number}
                        </span>
                        <span className="text-xs text-gray-400">
                          · {semester.subjects.length} subject{semester.subjects.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => removeSemester(semIndex)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                      >
                        {t("remove")}
                      </button>
                    </div>

                    {/* Subjects */}
                    <div className="p-4 space-y-2">

                      {/* Column Headers */}
                      {semester.subjects.length > 0 && (
                        <div className="grid grid-cols-12 gap-2 px-1 mb-1">
                          <div className="col-span-4 text-xs font-medium text-gray-400">{t("subject_name")}</div>
                          <div className="col-span-2 text-xs font-medium text-gray-400">{t("subject_code")}</div>
                          <div className="col-span-2 text-xs font-medium text-gray-400">{t("credits")}</div>
                          <div className="col-span-3 text-xs font-medium text-gray-400">{t("faculty")}</div>
                          <div className="col-span-1" />
                        </div>
                      )}

                      {semester.subjects.map((subject, subIndex) => (
                        <div key={subIndex} className="grid grid-cols-12 gap-2 items-center">

                          <input
                            placeholder="e.g. Data Structures"
                            value={subject.subject_name}
                            onChange={(e) => updateSubject(semIndex, subIndex, "subject_name", e.target.value)}
                            className={`col-span-4 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"}`}
                          />

                          <input
                            placeholder="e.g. CS301"
                            value={subject.subject_code}
                            onChange={(e) => updateSubject(semIndex, subIndex, "subject_code", e.target.value)}
                            className={`col-span-2 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"}`}
                          />

                          <input
                            type="number"
                            placeholder="4"
                            value={subject.credits}
                            onChange={(e) => updateSubject(semIndex, subIndex, "credits", e.target.value)}
                            className={`col-span-2 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"}`}
                          />

                          <select
                            value={subject.faculty_id}
                            onChange={(e) => updateSubject(semIndex, subIndex, "faculty_id", e.target.value)}
                            className={`col-span-3 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"} bg-white`}
                          >
                            <option value="">{t("select_faculty")}</option>
                            {facultyList.map((f) => (
                              <option key={f.id} value={f.id}>{f.fullName}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => removeSubject(semIndex, subIndex)}
                            className="col-span-1 flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addSubject(semIndex)}
                        className={`mt-2 text-xs border ${user?.color?"bg-green-50 border-green-200 hover:text-green-700 hover:bg-green-100":"bg-orange-50 border-orange-200 hover:text-orange-700 hover:bg-orange-100"} px-3 py-1.5 rounded-lg transition font-medium`}
                        style={{color: user?.color || "#ff7f10"}}
                      >
                        {t("add_subject")}
                      </button>
                    </div>

                  </div>
                ))
              )}

              <button
                onClick={addSemester}
                className={`w-full py-2.5 border-2 border-dashed ${user?.color?"border-green-300 text-green-600 hover:bg-green-50":"border-orange-300 text-orange-600 hover:bg-orange-50"} rounded-xl text-sm font-medium transition`}
              >
                {t("add_semester")}
              </button>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
              >
                {t("batch_cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-5 py-2 text-white rounded-lg text-sm font-semibold ${user?.color?"hover:bg-green-600":"hover:bg-orange-600"} transition disabled:opacity-60`}
                style={{backgroundColor: user?.color || "#ff7f10"}}
              >
                {saveLabel}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
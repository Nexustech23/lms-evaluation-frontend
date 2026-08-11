"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";

import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import toast from "react-hot-toast";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";

import { cn } from "@/lib/utils";

import { AuthContext } from "@/app/AuthContext";

import { useTranslations } from "next-intl";

import {
  useFacultySchools,
  useFacultyProgrammes,
  useFacultyDepartments,
  useFacultyBatches,
  useFacultySemesters,
  useFacultySubjects,
} from "@/api/Filter";

const EMPTY_FORM = {
  school: "",
  programme: "",
  department: "",
  batch: "",
  semester: "",
  subject_id: "",
  subjectname: "",
  subjectcode: "",
  examdetails: "",
  examtype: "",
  examdate: "",
  weightage: "",
  is_course_exit_summary: false,
};

/* ─────────────────────────────────────────────────────
   CO Multi Select
───────────────────────────────────────────────────── */
function COMultiSelect({ options = [], selected = [], onChange, disabled }) {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const t = useTranslations("examForm");
  const ts = useTranslations("subjects");

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (co) => {
    onChange(
      selected.includes(co) ? selected.filter((s) => s !== co) : [...selected, co]
    );
  };

  const label = selected.length === 0 ? "Select Covered COs" : selected.join(", ");

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between border rounded-xl p-2 bg-white text-left text-sm
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "cursor-pointer"}
          border-gray-300`}
        style={!disabled ? { borderColor: user?.color } : {}}
      >
        <span className={`truncate ${selected.length === 0 ? "text-gray-400" : "text-gray-800"}`}>
          {label}
        </span>
        <svg
          className={`w-4 h-4 ml-2 flex-shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {options.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No COs available</p>
          ) : (
            <>
              <div
                className="flex justify-between px-3 py-2 border-b border-gray-100"
                style={{ backgroundColor: user?.color + "20" }}
              >
                <button
                  type="button"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: user?.color }}
                  onClick={() => onChange([...options])}
                >
                  {t("selectAll")}
                </button>
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:underline"
                  onClick={() => onChange([])}
                >
                  {ts("clear")}
                </button>
              </div>
              {options.map((co) => (
                <label
                  key={co}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                  style={{
                    backgroundColor: selected.includes(co) ? user?.color + "20" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(co)}
                    onChange={() => toggle(co)}
                    style={{ accentColor: user?.color }}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-800">{co}</span>
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CO Tags
───────────────────────────────────────────────────── */
function COTags({ selected, onRemove }) {
  const { user } = useContext(AuthContext);
  if (selected.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {selected.map((co) => (
        <span
          key={co}
          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: user?.color + "20", color: user?.color }}
        >
          {co}
          <button
            type="button"
            onClick={() => onRemove(co)}
            className="ml-1 font-bold leading-none"
            style={{ color: user?.color }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}


/* ─────────────────────────────────────────────────────
   Custom Single Select
───────────────────────────────────────────────────── */
function CustomSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select…",
  disabled = false,
  error = false,
}) {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const color = user?.color || "#6366f1";
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm text-left transition-all duration-150 focus:outline-none"
        style={
          disabled
            ? { backgroundColor: "#f3f4f6", color: "#9ca3af", border: "1px solid #d1d5db", cursor: "not-allowed" }
            : {
                backgroundColor: value ? color + "15" : "#ffffff",
                border: `1.5px solid ${error ? "#ef4444" : value ? color : "#d1d5db"}`,
                color: value ? color : "#9ca3af",
                cursor: "pointer",
              }
        }
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: disabled ? "#9ca3af" : color }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && !disabled && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl shadow-lg overflow-hidden"
          style={{ border: `1.5px solid ${color}40`, backgroundColor: "#ffffff" }}
        >
          {/* Tinted header */}
          <div className="px-3 py-1.5" style={{ backgroundColor: color + "10" }}>
            <p className="text-xs font-semibold" style={{ color }}>{placeholder}</p>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {options.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No options available</p>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors duration-100"
                    style={{
                      backgroundColor: isSelected ? color + "20" : "transparent",
                      color: isSelected ? color : "#374151",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = color + "0d"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span className="w-4 h-4 flex-shrink-0">
                      {isSelected && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────── */
export function ExamDetailsForm() {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const folderId = params?.examId || null;
  const isEditMode = Boolean(folderId);
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loadingFolder, setLoadingFolder] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  // FIX 1: declare hasDepartment as state (was missing entirely)
  const [hasDepartment, setHasDepartment] = useState(true);

  const [availableCOs, setAvailableCOs] = useState([]);
  const [coveredCO, setCoveredCO] = useState([]);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const t = useTranslations("examForm");
  const ts = useTranslations("subjects");
  const tcq = useTranslations("createQuestionPaper-Prompt");
  const td = useTranslations("examDetails");
  const tc = useTranslations("common");

  /* =========================================================
     TANSTACK QUERY HOOKS
  ========================================================= */

  const { data: schoolData = {} } = useFacultySchools();

  const { data: programmeData = {} } = useFacultyProgrammes(selectedSchool?.id);

  const { data: departmentData = {} } = useFacultyDepartments({
    school_id: selectedSchool?.id,
    programme_id: selectedProgramme?.id,
  });

  const { data: batchData = {} } = useFacultyBatches({
    school_id: selectedSchool?.id,
    programme_id: selectedProgramme?.id,
    department_id: selectedDepartment?.id,
  });

  const { data: semesterData = {} } = useFacultySemesters({
    school_id: selectedSchool?.id,
    programme_id: selectedProgramme?.id,
    department_id: selectedDepartment?.id,
    batch_id: selectedBatch?.id,
  });

  // FIX 2: extract isLoading from the subjects hook (was referenced as loadingSubjects but never declared)
  const { data: subjectData = {}, isLoading: loadingSubjects } = useFacultySubjects({
    school_id: selectedSchool?.id,
    programme_id: selectedProgramme?.id,
    department_id: selectedDepartment?.id,
    batch_id: selectedBatch?.id,
    semester: selectedSemester,
  });

  /* =========================================================
     Normalize all dropdown arrays to a consistent { id, name } shape.
     Handles both `_id`/`school_name` style and `id`/`name` style
     responses so names always render correctly in the selects.
  ========================================================= */

  const normalise = (arr = [], idKey, nameKey) =>
    arr.map((item) => ({
      id:   item[idKey]   ?? item._id  ?? item.id  ?? "",
      name: item[nameKey] ?? item.name ?? "",
      // keep the original object so nothing downstream breaks
      _raw: item,
    }));

  const schools          = normalise(schoolData.schools,         "_id", "school_name");
  const programmes       = normalise(programmeData.programmes,   "_id", "programme_name");
  const departments      = normalise(departmentData.departments,  "_id", "department_name");
  const batches          = normalise(batchData.batches,           "_id", "batch_name");
  const semesters        = semesterData.semesters || [];
  const filteredSubjects = subjectData.subjects   || [];

  // FIX 4: use hasDepartments from hook response (if provided) to seed hasDepartment state
  const hasDepartmentsFromAPI = departmentData?.has_departments ?? true;

  const extractCoCodes = (cosArray) => {
    if (!Array.isArray(cosArray) || cosArray.length === 0) return [];
    return cosArray.map((c) => c.co_code).filter(Boolean);
  };

  /* =========================================================
     FETCH EDIT DATA
  ========================================================= */

  const fetchFolderDetails = useCallback(async () => {
    try {
      setLoadingFolder(true);
      const res = await axios.get(`/api/newsaved-documents/${folderId}`, {
        withCredentials: true,
      });
      return res.data.folder || res.data;
    } catch {
      toast.error("Failed to load exam details");
      return null;
    } finally {
      setLoadingFolder(false);
    }
  }, [folderId]);

  useEffect(() => {
    if (!isEditMode) return;
    const init = async () => {
      const folder = await fetchFolderDetails();
      if (!folder) return;
      setFormData({
        school: folder.school_id || "",
        programme: folder.programme_id || "",
        department: folder.department_id || "",
        batch: folder.batch_id || "",
        semester: String(folder.semester || ""),
        subject_id: folder.subject_id || "",
        subjectname: folder.subject_name || "",
        subjectcode: folder.subject_code || "",
        examdetails: folder.exam_title || "",
        examtype: folder.exam_type || "",
        examdate: folder.exam_date
          ? new Date(folder.exam_date).toISOString().slice(0, 16)
          : "",
        weightage: folder.weightage || "",
        is_course_exit_summary: folder.is_course_exit_summary ?? false,
      });
    };
    init();
  }, [isEditMode, fetchFolderDetails]);

  // FIX 5: sync hasDepartment from API response & from the departments list
  useEffect(() => {
    if (!selectedProgramme) return;
    const realDepartments = departments.filter((d) => d.id !== "null" && d.name !== null);
    if (realDepartments.length === 0 || !hasDepartmentsFromAPI) {
      setHasDepartment(false);
      setSelectedDepartment(null);
    } else {
      setHasDepartment(true);
    }
  }, [departments, selectedProgramme, hasDepartmentsFromAPI]);

  // ─── Progress bar ─────────────────────────────────────────────────────────
  useEffect(() => {
    const requiredFields = [
      "school", "programme", "batch", "semester",
      "subject_id", "examdetails", "examtype", "examdate",
    ];
    const filled = requiredFields.filter((f) => formData[f]?.toString().trim()).length;
    setProgress(Math.round((filled / requiredFields.length) * 100));
  }, [formData]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setTouchedFields((prev) => ({ ...prev, [id]: true }));
    if (value && fieldErrors[id])
      setFieldErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const validateForm = () => {
    const errors = {};
    ["school", "programme", "batch", "semester", "subject_id", "examdetails", "examtype", "examdate"].forEach((field) => {
      if (!formData[field]?.toString().trim()) errors[field] = "This field is required";
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) { toast.error("Please fill all required fields"); return; }
    setShowConfirm(true);
  };

  const confirmSubmission = async () => {
    setIsSubmitting(true);
    setShowConfirm(false);
    try {
      const payload = new FormData();
      payload.append("folderName", `${formData.subjectname || formData.subject_id}-${formData.examtype}`);
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null)
          payload.append(key, formData[key]);
      });
      payload.append("covered_cos", JSON.stringify(coveredCO));

      if (isEditMode) {
        await axios.put(`/api/update-exam/${folderId}`, payload, { withCredentials: true });
        toast.success("Exam details updated successfully");
        router.back(-1);
      } else {
        const response = await axios.post(`/api/createSaveFolder`, payload, { withCredentials: true });
        sessionStorage.setItem("folderId", response.data.folder_id);
        toast.success("Exam details saved successfully");
        setFormData(EMPTY_FORM);
        setSelectedSchool(null);
        setSelectedProgramme(null);
        setSelectedDepartment(null);
        setSelectedBatch(null);
        setSelectedSemester("");
        setSelectedSubject(null);
        setAvailableCOs([]);
        setCoveredCO([]);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
        `Failed to ${isEditMode ? "update" : "save"} exam details. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBelow = (level) => {
    if (level <= 1) setSelectedProgramme(null);
    if (level <= 2) setSelectedDepartment(null);
    if (level <= 3) setSelectedBatch(null);
    if (level <= 4) setSelectedSemester("");
    setSelectedSubject(null);
    setAvailableCOs([]);
    setCoveredCO([]);
  };

  const isLoading = loadingSubjects || loadingFolder;
  const pageTitle = isEditMode ? t("editTitle") : t("enterTitle");
  const submitLabel = isEditMode ? t("update") : t("submit");

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: user?.color }}>
      <div className="flex-1 p-6 h-full">
        <div className="bg-white rounded-xl shadow-md p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold" style={{ color: user?.color }}>{pageTitle}</h2>
            <span
              style={{ color: user?.color, backgroundColor: (user?.color || "#ff7f10") + "20" }}
              className="text-xs font-semibold px-2 py-1 rounded-full"
            >
              {isEditMode ? "Edit Mode" : "Create Mode"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: user?.color || "#ff7f10" }}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner />
              <p className="text-sm text-gray-500">
                {loadingFolder ? "Loading exam details…" : "Loading subjects…"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 h-[85%] flex flex-col justify-between">
              <div className="space-y-8">

                {/* Examination Details */}
                <LabelInputContainer error={fieldErrors.examdetails} touched={touchedFields.examdetails}>
                  <Label htmlFor="examdetails">{t("examDetailsLabel")} <span className="text-red-500">*</span></Label>
                  <Input
                    id="examdetails"
                    placeholder={t("examDetailsPlaceholder")}
                    type="text"
                    value={formData.examdetails}
                    onChange={handleInputChange}
                    className={`${fieldErrors.examdetails ? "border-red-500" : "border-gray-300"} bg-white`}
                  />
                  {fieldErrors.examdetails && <p className="text-sm text-red-500 mt-1">{fieldErrors.examdetails}</p>}
                </LabelInputContainer>

                {/* Academic Hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* School */}
                  <LabelInputContainer error={fieldErrors.school} touched={touchedFields.school}>
                    <Label>{ts("school")}<span className="text-red-500">*</span></Label>
                    <CustomSelect
                      placeholder={t("selectSchool")}
                      value={selectedSchool?.id || ""}
                      error={!!fieldErrors.school}
                      options={schools.map((s) => ({ value: s.id, label: s.name }))}
                      onChange={(val) => {
                        const found = schools.find((s) => s.id === val) || null;
                        setSelectedSchool(found);
                        resetBelow(1);
                        setTouchedFields((p) => ({ ...p, school: true }));
                        setFormData((p) => ({
                          ...p, school: found?.id || "", programme: "", department: "",
                          batch: "", semester: "", subject_id: "", subjectname: "", subjectcode: "", weightage: "",
                        }));
                      }}
                    />
                    {fieldErrors.school && <p className="text-sm text-red-500 mt-1">{fieldErrors.school}</p>}
                  </LabelInputContainer>

                  {/* Programme */}
                  <LabelInputContainer error={fieldErrors.programme} touched={touchedFields.programme}>
                    <Label>{ts("programme")} <span className="text-red-500">*</span></Label>
                    <CustomSelect
                      placeholder={t("selectProgramme")}
                      disabled={!selectedSchool}
                      value={selectedProgramme?.id || ""}
                      error={!!fieldErrors.programme}
                      options={programmes.map((p) => ({ value: p.id, label: p.name }))}
                      onChange={(val) => {
                        const found = programmes.find((p) => p.id === val) || null;
                        setSelectedProgramme(found);
                        resetBelow(2);
                        setTouchedFields((p) => ({ ...p, programme: true }));
                        setFormData((p) => ({
                          ...p, programme: found?.id || "", department: "",
                          batch: "", semester: "", subject_id: "", subjectname: "", subjectcode: "",
                        }));
                      }}
                    />
                    {fieldErrors.programme && <p className="text-sm text-red-500 mt-1">{fieldErrors.programme}</p>}
                  </LabelInputContainer>

                  {/* Department (conditional) */}
                  {hasDepartment && (
                    <LabelInputContainer error={fieldErrors.department} touched={touchedFields.department}>
                      <Label>{ts("department")} <span className="text-red-500">*</span></Label>
                      <CustomSelect
                        placeholder={t("selectDepartment")}
                        disabled={!selectedProgramme}
                        value={selectedDepartment?.id || ""}
                        error={!!fieldErrors.department}
                        options={departments
                          .filter((d) => d.id !== "null")
                          .map((d) => ({ value: d.id, label: d.name }))}
                        onChange={(val) => {
                          const found = departments.find((d) => d.id === val) || null;
                          setSelectedDepartment(found);
                          resetBelow(3);
                          setFormData((p) => ({
                            ...p, department: found?.id || "", batch: "", semester: "", subject_id: "",
                          }));
                        }}
                      />
                    </LabelInputContainer>
                  )}

                  {/* Batch */}
                  <LabelInputContainer error={fieldErrors.batch} touched={touchedFields.batch}>
                    <Label>{ts("batch")} <span className="text-red-500">*</span></Label>
                    <CustomSelect
                      placeholder={t("selectBatch")}
                      disabled={hasDepartment ? !selectedDepartment : !selectedProgramme}
                      value={selectedBatch?.id || ""}
                      error={!!fieldErrors.batch}
                      options={batches.map((b) => ({ value: b.id, label: b.name }))}
                      onChange={(val) => {
                        const found = batches.find((b) => b.id === val) || null;
                        setSelectedBatch(found);
                        resetBelow(4);
                        setTouchedFields((p) => ({ ...p, batch: true }));
                        setFormData((p) => ({
                          ...p, batch: found?.id || "", semester: "", subject_id: "", subjectname: "", subjectcode: "",
                        }));
                      }}
                    />
                    {fieldErrors.batch && <p className="text-sm text-red-500 mt-1">{fieldErrors.batch}</p>}
                  </LabelInputContainer>

                  {/* Semester */}
                  <LabelInputContainer error={fieldErrors.semester} touched={touchedFields.semester}>
                    <Label>{ts("semester")} <span className="text-red-500">*</span></Label>
                    <CustomSelect
                      placeholder={t("selectSemester")}
                      disabled={!selectedBatch}
                      value={selectedSemester}
                      error={!!fieldErrors.semester}
                      options={semesters.map((s) => ({ value: s, label: `Semester ${s}` }))}
                      onChange={(val) => {
                        setSelectedSemester(val);
                        setSelectedSubject(null);
                        setAvailableCOs([]);
                        setCoveredCO([]);
                        setTouchedFields((p) => ({ ...p, semester: true }));
                        setFormData((p) => ({ ...p, semester: val, subject_id: "", subjectname: "", subjectcode: "" }));
                      }}
                    />
                    {fieldErrors.semester && <p className="text-sm text-red-500 mt-1">{fieldErrors.semester}</p>}
                  </LabelInputContainer>

                  {/* Subject */}
                  <LabelInputContainer error={fieldErrors.subject_id} touched={touchedFields.subject_id}>
                    <Label>{ts("subject")} <span className="text-red-500">*</span></Label>
                    <CustomSelect
                      placeholder={t("selectSubject")}
                      disabled={!selectedSemester}
                      value={selectedSubject?._id || selectedSubject?.id || ""}
                      error={!!fieldErrors.subject_id}
                      options={filteredSubjects.map((s) => ({
                        value: s._id || s.id || "",
                        label: s.subject_name || s.name || "",
                      }))}
                      onChange={(val) => {
                        const sub = filteredSubjects.find(
                          (s) => (s._id || s.id) === val
                        ) || null;
                        setSelectedSubject(sub);
                        setAvailableCOs(extractCoCodes(sub?.co));
                        setCoveredCO([]);
                        setTouchedFields((p) => ({ ...p, subject_id: true }));
                        setFormData((p) => ({
                          ...p,
                          subject_id:  sub?._id  || sub?.id   || "",
                          subjectname: sub?.subject_name || sub?.name  || "",
                          subjectcode: sub?.subject_code || sub?.code  || "",
                        }));
                      }}
                    />
                    {fieldErrors.subject_id && <p className="text-sm text-red-500 mt-1">{fieldErrors.subject_id}</p>}
                  </LabelInputContainer>
                </div>

                {/* Exam Info + COs */}
                <div className={`grid ${user?.hasCOAccess ? "grid-cols-3" : "grid-cols-2"} gap-4`}>

                  {/* Left 2/3: exam fields */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">

                    <LabelInputContainer error={fieldErrors.examtype} touched={touchedFields.examtype}>
                      <Label htmlFor="examtype">{t("examType")} <span className="text-red-500">*</span></Label>
                      <Input
                        id="examtype"
                        placeholder={t("examTypePlaceholder")}
                        type="text"
                        value={formData.examtype}
                        onChange={handleInputChange}
                        className={`${fieldErrors.examtype ? "border-red-500" : "border-gray-300"} bg-white`}
                      />
                      {fieldErrors.examtype && <p className="text-sm text-red-500 mt-1">{fieldErrors.examtype}</p>}
                    </LabelInputContainer>

                    <LabelInputContainer error={fieldErrors.examdate} touched={touchedFields.examdate}>
                      <Label htmlFor="examdate">{td("examDate")} <span className="text-red-500">*</span></Label>
                      <Input
                        id="examdate"
                        type="datetime-local"
                        value={formData.examdate}
                        onChange={handleInputChange}
                        className={`${fieldErrors.examdate ? "border-red-500" : "border-gray-300"} bg-white`}
                      />
                      {fieldErrors.examdate && <p className="text-sm text-red-500 mt-1">{fieldErrors.examdate}</p>}
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="weightage">{t("weightage")}</Label>
                      <Input
                        id="weightage"
                        placeholder={t("weightagePlaceholder")}
                        type="number"
                        min="0"
                        max="100"
                        value={formData.weightage}
                        onChange={handleInputChange}
                        className="border-gray-300 bg-white"
                      />
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="subjectcode">{t("subjectCode")}</Label>
                      <Input
                        id="subjectcode"
                        placeholder={t("subjectCodePlaceholder")}
                        type="text"
                        value={formData.subjectcode}
                        readOnly
                        className="border-gray-300 bg-gray-50 cursor-not-allowed"
                      />
                    </LabelInputContainer>

                    {user?.hasCOAccess && (
                      <LabelInputContainer>
                        <Label>{t("courseExit")}</Label>
                        <div
                          className="flex items-center gap-3 mt-1 cursor-pointer select-none w-fit"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              is_course_exit_summary: !prev.is_course_exit_summary,
                            }))
                          }
                        >
                          <div
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${formData.is_course_exit_summary ? "bg-[#ff7f10]" : "bg-gray-300"}`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.is_course_exit_summary ? "translate-x-5" : "translate-x-0"}`}
                            />
                          </div>
                          <span className={`text-sm font-medium ${formData.is_course_exit_summary ? "text-[#ff7f10]" : "text-gray-400"}`}>
                            {formData.is_course_exit_summary ? "Yes" : "No"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{t("courseExitNote")}</p>
                      </LabelInputContainer>
                    )}
                  </div>

                  {/* Right 1/3: Covered COs */}
                  {user?.hasCOAccess ? (
                    <LabelInputContainer className="col-span-1">
                      <Label>
                        {t("coveredCO")}
                        {coveredCO.length > 0 && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                            {coveredCO.length} selected
                          </span>
                        )}
                      </Label>
                      <COMultiSelect
                        options={availableCOs}
                        selected={coveredCO}
                        onChange={setCoveredCO}
                        disabled={!selectedSubject}
                      />
                      <COTags
                        selected={coveredCO}
                        onRemove={(co) => setCoveredCO((prev) => prev.filter((c) => c !== co))}
                      />
                      {!selectedSubject && (
                        <p className="text-xs text-gray-400 mt-1">{t("selectSubjectFirst")}</p>
                      )}
                      {selectedSubject && availableCOs.length === 0 && (
                        <p className="text-xs text-amber-500 mt-1">{t("noCODefined")}</p>
                      )}
                    </LabelInputContainer>
                  ) : <></>}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: user?.color }}
                  className="px-6 py-2 text-white rounded-xl font-medium shadow-md transition-all duration-200 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4" />
                      {t("pleaseWait")}
                    </div>
                  ) : submitLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3
              className="text-lg font-bold p-2 rounded-xl mb-3 text-center"
              style={{ color: user?.color, backgroundColor: (user?.color || "#ff7f10") + "20" }}
            >
              {isEditMode ? "Confirm Update" : "Confirm Exam Details"}
            </h3>
            {isEditMode && (
              <p className="text-sm mb-4" style={{ color: user?.color }}>
                {t("confirmEditNote")}
              </p>
            )}
            <div className="space-y-2 mb-6 text-sm">
              <p><strong>{tcq("examDetails")}:</strong> {formData.examdetails}</p>
              <p><strong>{ts("school")}:</strong> {selectedSchool?.name}</p>
              <p><strong>{ts("programme")}:</strong> {selectedProgramme?.name}</p>
              <p><strong>{ts("department")}:</strong> {selectedDepartment?.name}</p>
              <p><strong>{ts("batch")}:</strong> {selectedBatch?.name}</p>
              <p><strong>{ts("semester")}:</strong> {formData.semester}</p>
              <p><strong>{ts("subject")}:</strong> {formData.subjectname}{formData.subjectcode ? ` (${formData.subjectcode})` : ""}</p>
              <p><strong>{tcq("examType")}:</strong> {formData.examtype}</p>
              <p><strong>{td("examDate")}:</strong> {formData.examdate ? new Date(formData.examdate).toLocaleString() : "—"}</p>
              {user?.hasCOAccess && (
                <p><strong>{t("coveredCO")}:</strong> {coveredCO.length > 0 ? coveredCO.join(", ") : "None"}</p>
              )}
              {formData.weightage && <p><strong>{t("weightage")}:</strong> {formData.weightage}%</p>}
              {user?.hasCOAccess && (
                <p>
                  <strong>{t("courseExit")}:</strong>{" "}
                  {formData.is_course_exit_summary ? "Yes" : "No"}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-gray-700 border border-gray-300 hover:bg-gray-100"
              >
                {tc("cancel")}
              </button>
              <button
                onClick={confirmSubmission}
                disabled={isSubmitting}
                style={{ backgroundColor: user?.color }}
                className="px-4 py-2 text-white rounded-xl disabled:opacity-70"
              >
                {isSubmitting
                  ? (isEditMode ? "Updating…" : "Confirming…")
                  : (isEditMode ? "Confirm Update" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const LabelInputContainer = ({ children, error, touched, className }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
    {children}
  </div>
);
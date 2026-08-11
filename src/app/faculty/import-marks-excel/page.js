"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  IconCircleCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconTable,
  IconUpload,
} from "@tabler/icons-react";
import * as XLSX from "xlsx";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";


function withAlpha(hex = "#ff7f10", alpha = 1) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}


function FilterSelect({ label, value, onChange, options, getLabel, getValue, disabled, color }) {
  return (
    <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-11 cursor-pointer rounded-lg border bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
        style={{ borderColor: withAlpha(color, 0.22), "--tw-ring-color": withAlpha(color, 0.18) }}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={getValue(option)} value={getValue(option)}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}


function ImportTypeCard({ active, title, description, icon: Icon, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-start gap-3 rounded-xl border p-4 text-left transition"
      style={{
        borderColor: active ? color : "#e5e7eb",
        backgroundColor: active ? withAlpha(color, 0.08) : "#fff",
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: withAlpha(color, active ? 0.16 : 0.08), color }}
      >
        <Icon size={21} />
      </span>
      <span>
        <span className="block text-sm font-bold text-gray-800">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
      </span>
    </button>
  );
}


export default function ImportMarksExcel() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const fileInputRef = useRef(null);

  const [importType, setImportType] = useState("overall");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [schools, setSchools] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hasDepartment, setHasDepartment] = useState(true);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selected, setSelected] = useState({
    school: "",
    programme: "",
    department: "",
    batch: "",
    semester: "",
  });

  const resetOutcome = () => {
    setPreview(null);
    setImportResult(null);
  };

  useEffect(() => {
    axios
      .get("/api/schools", { params: { page: 1, limit: 0 }, withCredentials: true })
      .then((response) => setSchools(response.data.schools || []))
      .catch(() => toast.error("Failed to load schools"));
  }, []);

  const handleImportType = (type) => {
    setImportType(type);
    setFile(null);
    setSelected((previous) => ({ ...previous, semester: "" }));
    resetOutcome();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectSchool = async (schoolId) => {
    setSelected({ school: schoolId, programme: "", department: "", batch: "", semester: "" });
    setProgrammes([]);
    setDepartments([]);
    setBatches([]);
    setSemesters([]);
    resetOutcome();
    if (!schoolId) return;
    try {
      const response = await axios.get(`/api/programmes/${schoolId}`, {
        params: { page: 1, limit: 0 },
        withCredentials: true,
      });
      setProgrammes(response.data.programmes || []);
    } catch {
      toast.error("Failed to load programmes");
    }
  };

  const handleSelectProgramme = async (programmeId) => {
    setSelected((previous) => ({
      ...previous,
      programme: programmeId,
      department: "",
      batch: "",
      semester: "",
    }));
    setDepartments([]);
    setBatches([]);
    setSemesters([]);
    resetOutcome();
    if (!programmeId) return;
    try {
      const response = await axios.get(`/api/departments/${programmeId}`, {
        params: { page: 1, limit: 0 },
        withCredentials: true,
      });
      const realDepartments = (response.data.departments || []).filter(
        (department) => department.id !== null && department.department_name !== null,
      );
      setHasDepartment(realDepartments.length > 0);
      if (realDepartments.length) {
        setDepartments(realDepartments);
      } else {
        const batchResponse = await axios.get("/api/batches", {
          params: { page: 1, limit: 0, programme_id: programmeId },
          withCredentials: true,
        });
        setBatches(batchResponse.data.batches || []);
      }
    } catch {
      toast.error("Failed to load departments");
    }
  };

  const handleSelectDepartment = async (departmentId) => {
    setSelected((previous) => ({ ...previous, department: departmentId, batch: "", semester: "" }));
    setBatches([]);
    setSemesters([]);
    resetOutcome();
    if (!departmentId) return;
    try {
      const response = await axios.get("/api/batches", {
        params: { page: 1, limit: 0, department_id: departmentId },
        withCredentials: true,
      });
      setBatches(response.data.batches || []);
    } catch {
      toast.error("Failed to load batches");
    }
  };

  const handleSelectBatch = (batchId) => {
    setSelected((previous) => ({ ...previous, batch: batchId, semester: "" }));
    resetOutcome();
    const batch = batches.find((item) => item.id === batchId);
    setSemesters([...(new Set(batch?.semesters || []))].sort((left, right) => left - right));
  };

  const handleSelectSemester = (semester) => {
    setSelected((previous) => ({ ...previous, semester }));
    resetOutcome();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const validExtension = importType === "transcript" ? /\.xlsx$/i : /\.(xlsx|xls)$/i;
    if (!validExtension.test(selectedFile.name)) {
      toast.error(importType === "transcript" ? "Please select an .xlsx file" : "Please select an Excel file");
      event.target.value = "";
      return;
    }
    setFile(selectedFile);
    resetOutcome();
  };

  const createFormData = () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("batch_id", selected.batch);
    return formData;
  };

  const handleOverallUpload = async () => {
    if (!selected.batch || !selected.semester || !file) {
      toast.error("Please select batch, semester and Excel file");
      return;
    }
    const formData = createFormData();
    formData.append("semester", selected.semester);
    setUploading(true);
    try {
      const response = await axios.post("/api/import-marks-excel", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const processedCount = response.data?.processed_count || 0;
      setImportResult({
        mode: "overall",
        processedCount,
        message: response.data?.message || `${processedCount} students processed successfully`,
      });
      toast.success(response.data?.message || "Marks imported successfully");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to import the Excel file");
      setImportResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleTranscriptPreview = async () => {
    if (!selected.batch || !file) {
      toast.error("Please select a batch and Excel file");
      return;
    }
    setValidating(true);
    try {
      const response = await axios.post("/api/transcript/import/preview", createFormData(), {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(response.data);
      setImportResult(null);
      toast.success("Workbook validated successfully");
    } catch (error) {
      setPreview(null);
      toast.error(error?.response?.data?.error || "Workbook validation failed");
    } finally {
      setValidating(false);
    }
  };

  const handleTranscriptConfirm = async () => {
    if (!preview || !file || !selected.batch) return;
    const shouldReplace = window.confirm(
      "This will replace existing transcript records for the selected batch after successful calculation. Continue?",
    );
    if (!shouldReplace) return;
    setUploading(true);
    try {
      const response = await axios.post("/api/transcript/import/confirm", createFormData(), {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult({
        mode: "transcript",
        processedCount: response.data?.summary?.student_count || 0,
        recordCount: response.data?.record_count || 0,
        message: response.data?.message,
      });
      toast.success("Transcript marks calculated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Transcript calculation failed");
      setImportResult(null);
    } finally {
      setUploading(false);
    }
  };

  const downloadTranscriptTemplate = () => {
    const studentIds = Array.from({ length: 60 }, (_, index) => `Student ${index + 1}`);
    const rows = [];
    for (let semester = 1; semester <= 6; semester += 1) {
      rows.push([`Semester ${semester}`]);
      rows.push(["Course", "Credits", ...studentIds]);
      rows.push(["Course 1", 4, ...studentIds.map(() => 0)]);
      rows.push(["Course 2", 3, ...studentIds.map(() => 0)]);
      rows.push([]);
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 24 }, { wch: 10 }, ...studentIds.map(() => ({ wch: 13 }))];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transcript Marks");
    XLSX.writeFile(workbook, "subject_wise_transcript_template.xlsx");
  };

  const isProcessing = validating || uploading;
  const canUsePrimary =
    file &&
    selected.batch &&
    !isProcessing &&
    (importType === "transcript" || selected.semester);

  return (
    <div className="min-h-screen" style={{ backgroundColor: color }}>
      <Navbar title="Import Marks Excel" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: withAlpha(color, 0.12), color }}
            >
              <IconFileSpreadsheet size={22} />
            </span>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Import Marks Excel</h1>
              <p className="mt-1 text-sm text-gray-500">
                Import one overall total or calculate subject-wise grades, TGPA, CGPA and transcripts.
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            <ImportTypeCard
              active={importType === "overall"}
              title="Overall Marks"
              description="Existing format: one student column and one total-marks column for a selected semester."
              icon={IconFileSpreadsheet}
              color={color}
              onClick={() => handleImportType("overall")}
            />
            <ImportTypeCard
              active={importType === "transcript"}
              title="Subject-wise Transcript Marks"
              description="Semester blocks containing subjects, credits and Student IDs as columns."
              icon={IconTable}
              color={color}
              onClick={() => handleImportType("transcript")}
            />
          </div>

          <div
            className="mb-6 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:flex-wrap sm:items-end"
            style={{ backgroundColor: withAlpha(color, 0.045), borderColor: withAlpha(color, 0.15) }}
          >
            <FilterSelect label="School" value={selected.school} onChange={handleSelectSchool} options={schools} getLabel={(item) => item.school_name} getValue={(item) => item.id} color={color} />
            <FilterSelect label="Programme" value={selected.programme} onChange={handleSelectProgramme} options={programmes} getLabel={(item) => item.programme_name} getValue={(item) => item.id} disabled={!selected.school} color={color} />
            {hasDepartment && (
              <FilterSelect label="Department" value={selected.department} onChange={handleSelectDepartment} options={departments} getLabel={(item) => item.department_name} getValue={(item) => item.id} disabled={!selected.programme} color={color} />
            )}
            <FilterSelect label="Batch" value={selected.batch} onChange={handleSelectBatch} options={batches} getLabel={(item) => item.batch_name} getValue={(item) => item.id} disabled={hasDepartment ? !selected.department : !selected.programme} color={color} />
            {importType === "overall" && (
              <FilterSelect label="Semester" value={selected.semester} onChange={handleSelectSemester} options={semesters.map((semester) => ({ id: semester, name: `Semester ${semester}` }))} getLabel={(item) => item.name} getValue={(item) => item.id} disabled={!selected.batch} color={color} />
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <span className="mb-2 block text-sm font-semibold text-gray-700">Relative Grading Configuration</span>
              <div className="flex min-h-11 items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700">
                Current institute configuration will be applied {importType === "transcript" ? "separately to every subject" : "to the overall total"}.
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold text-gray-700">Excel File</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={importType === "transcript" ? ".xlsx" : ".xlsx,.xls"}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-11 w-full items-center justify-between rounded-lg border border-dashed border-gray-300 px-3 text-left text-sm text-gray-600 transition hover:border-gray-400"
              >
                <span className="truncate">{file?.name || "Choose Excel file"}</span>
                <IconUpload size={18} style={{ color }} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {importType === "transcript" && (
              <button
                type="button"
                onClick={downloadTranscriptTemplate}
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
                style={{ borderColor: withAlpha(color, 0.35), color }}
              >
                <IconDownload size={17} /> Download Template
              </button>
            )}
            <button
              type="button"
              onClick={
                importType === "overall"
                  ? handleOverallUpload
                  : preview
                    ? handleTranscriptConfirm
                    : handleTranscriptPreview
              }
              disabled={!canUsePrimary}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {isProcessing ? <Spinner className="h-4 w-4" /> : <IconUpload size={17} />}
              {validating
                ? "Validating..."
                : uploading
                  ? "Calculating..."
                  : importType === "overall"
                    ? "Upload"
                    : preview
                      ? "Confirm and Calculate"
                      : "Validate and Preview"}
            </button>
          </div>
        </section>

        {preview && importType === "transcript" && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <IconCircleCheck size={23} className="text-green-600" />
              <div>
                <h2 className="font-bold text-gray-800">Workbook Preview</h2>
                <p className="text-sm text-gray-500">Validation passed. Review the detected structure before calculation.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Semesters", preview.summary.semester_count],
                ["Students", preview.summary.student_count],
                ["Subjects", preview.summary.subject_count],
                ["Marks", preview.summary.mark_count],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Semester</th>
                    <th className="px-4 py-3">Subjects</th>
                    <th className="px-4 py-3">Credits</th>
                    <th className="px-4 py-3">Detected Courses</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.summary.semesters.map((semester) => (
                    <tr key={semester.semester} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-semibold">Semester {semester.semester}</td>
                      <td className="px-4 py-3">{semester.subject_count}</td>
                      <td className="px-4 py-3">{semester.total_credits}</td>
                      <td className="px-4 py-3 text-gray-500">{semester.subjects.map((subject) => subject.subject).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {importResult && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div
              className="flex items-start gap-3 rounded-xl px-5 py-4"
              style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1.5px solid rgba(34,197,94,0.3)" }}
            >
              <IconCircleCheck size={23} className="mt-0.5 shrink-0 text-green-700" />
              <div>
                <p className="text-sm font-semibold text-green-800">{importResult.message}</p>
                <p className="mt-1 text-xs text-green-700">
                  {importResult.mode === "transcript"
                    ? `${importResult.processedCount} students and ${importResult.recordCount} semester records are ready. Institute Admin can view Combined Result and Academic Transcript.`
                    : `${importResult.processedCount} students processed. Institute Admin can view the Combined Result.`}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

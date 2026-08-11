"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useContext,
} from "react";

import axios from "axios";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { FaArrowLeft } from "react-icons/fa";

import { AuthContext } from "@/app/AuthContext";

import {
  withAlpha,
  darkenColor,
} from "@/lib/question-paper/colorHelpers";

import Navbar from "@/components/ui/Navbar";

export default function StudentEnrollment() {

  const { user } = useContext(AuthContext);

  const color = user?.color || "#ff7f10";

  const router = useRouter();

  const t = useTranslations("faculty");

  // =====================================================
  // STATES
  // =====================================================

  const [activeTab, setActiveTab] = useState("Manual Upload");

  const [schools, setSchools] = useState([]);

  const [programme, setProgramme] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [bulkTemplateDownloaded, setBulkTemplateDownloaded] =
    useState(false);

  const [bulkUploadFile, setBulkUploadFile] =
    useState(null);

  const bulkFileInputRef = useRef(null);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    email: "",
    phone: "",
    rollNo: "",
    enrollmentNo: "",
    address: "",
    dob: "",
    gender: "",
    school_id: "",
    programme_id: "",
  });

  // =====================================================
  // FETCH SCHOOLS
  // =====================================================

  const fetchSchools = async () => {
    try {

      const res = await axios.get(
        `/api/schools`,
        {
          withCredentials: true,
        }
      );

      setSchools(res.data.schools || []);

    } catch {

      toast.error("Failed to load schools");
    }
  };

  // =====================================================
  // FETCH PROGRAMMES
  // =====================================================

  const fetchProgramme = async () => {

    if (!formData.school_id) {
      setProgramme([]);
      return;
    }

    try {

      setLoading(true);

      const res = await axios.get(
        `/api/programmes/${formData.school_id}`,
        {
          withCredentials: true,
        }
      );

      setProgramme(res.data.programmes || []);

    } catch {

      toast.error("Failed to load programmes");

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchProgramme();
  }, [formData.school_id]);

  // =====================================================
  // MEMOS
  // =====================================================

  const selectedSchoolName = useMemo(
    () =>
      schools.find(
        (s) => s.id === formData.school_id
      )?.school_name || "",
    [schools, formData.school_id]
  );

  const selectedProgrammeName = useMemo(
    () =>
      programme.find(
        (p) => p.id === formData.programme_id
      )?.programme_name || "",
    [programme, formData.programme_id]
  );

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (field, value) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setFormData({
      fullName: "",
      fatherName: "",
      email: "",
      phone: "",
      rollNo: "",
      enrollmentNo: "",
      address: "",
      dob: "",
      gender: "",
      school_id: "",
      programme_id: "",
    });
  };

  // =====================================================
  // BULK TEMPLATE
  // =====================================================

  const handleBulkTemplateButton = () => {

    if (!bulkTemplateDownloaded) {
      downloadBulkTemplate();
      return;
    }

    bulkFileInputRef.current?.click();
  };

  const downloadBulkTemplate = () => {

    if (!formData.school_id) {
      toast.error("Please select a school first");
      return;
    }

    if (!formData.programme_id) {
      toast.error("Please select a programme first");
      return;
    }

    const headers = [
      "student_name",
      "father_name",
      "email",
      "phone",
      "gender",
      "roll_no",
      "enrollment_no",
      "dob",
      "address",
      "selected_school_name",
      "selected_programme_name",
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([
      headers,
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        selectedSchoolName,
        selectedProgrammeName,
      ],
    ]);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Students"
    );

    XLSX.writeFile(
      workbook,
      "student_enrollment_template.xlsx"
    );

    setBulkTemplateDownloaded(true);

    setBulkUploadFile(null);
  };

  // =====================================================
  // FILE CHANGE
  // =====================================================

  const handleBulkFileChange = (e) => {

    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    if (!isExcel) {

      toast.error("Please upload an Excel file only");

      return;
    }

    setBulkUploadFile(file);

    toast.success(`${file.name} selected`);
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {

    // =================================================
    // BULK UPLOAD
    // =================================================

  if (activeTab === "Bulk Upload") {

  if (!formData.school_id) {
    toast.error("Please select a school");
    return;
  }

  if (!formData.programme_id) {
    toast.error("Please select a programme");
    return;
  }

  if (!bulkUploadFile) {
    toast.error("Please upload the Excel file");
    return;
  }

  try {

    setSaving(true);

    // ============================================
    // READ EXCEL
    // ============================================

    const fileBuffer = await bulkUploadFile.arrayBuffer();

    const workbook = XLSX.read(fileBuffer, {
      type: "array",
    });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    const excelData = XLSX.utils.sheet_to_json(
      worksheet
    );

    if (!excelData.length) {
      toast.error("Excel file is empty");
      return;
    }

    // ============================================
    // PREPARE PAYLOAD
    // ============================================

    const students = excelData.map((row) => ({

      role: "institute_student",

      fullName:
        row.student_name || "",

      father_name:
        row.father_name || "",

      email:
        row.email || "",

      contact_no:
        String(row.phone || ""),

      gender:
        row.gender || "",

      roll_no:
        String(row.roll_no || ""),

      enrollment_no:
        String(row.enrollment_no || ""),

      dob:
        row.dob || "",

      address:
        row.address || "",

      school_id:
        formData.school_id,

      programme_id:
        formData.programme_id,

      programme_name:
        selectedProgrammeName,

      password:
        "Student@123",
    }));

    // ============================================
    // SEND TO BACKEND
    // ============================================

    const res = await axios.post(

      `/api/bulk-student-enrollment`,

      {
        students,
      },

      {
        withCredentials: true,
      }
    );

    toast.success(
      res?.data?.message ||
      "Students enrolled successfully"
    );

    setBulkUploadFile(null);

  } catch (err) {

    console.error(err);

    toast.error(
      err?.response?.data?.error ||
      "Bulk enrollment failed"
    );

  } finally {

    setSaving(false);
  }

  return;
}

    // =================================================
    // MANUAL ENROLLMENT
    // =================================================

    if (!formData.fullName.trim()) {
      toast.error("Student name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.school_id) {
      toast.error("Please select school");
      return;
    }

    if (!formData.programme_id) {
      toast.error("Please select programme");
      return;
    }

    if (!formData.rollNo.trim()) {
      toast.error("Roll number is required");
      return;
    }

    try {

      setSaving(true);

      const payload = {

        role: "institute_student",

        // user
        fullName:
          formData.fullName.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        password: "Student@123",

        // profile
        father_name:
          formData.fatherName.trim(),

        contact_no:
          formData.phone,

        dob:
          formData.dob,

        gender:
          formData.gender,

        address:
          formData.address,

        roll_no:
          formData.rollNo,

        enrollment_no:
          formData.enrollmentNo?.trim() || "",

        // relations
        school_id:
          formData.school_id,

        programme_id:
          formData.programme_id,

        programme_name:
          selectedProgrammeName,
      };

      const res = await axios.post(
        `/api/register`,
        payload,
        {
          withCredentials: true,
        }
      );

      toast.success(
        res?.data?.message ||
        "Student enrolled successfully"
      );

      if (res?.data?.college_email) {

        toast.success(
          `College Email: ${res.data.college_email}`,
          {
            duration: 5000,
          }
        );
      }

      resetForm();

    } catch (err) {

      toast.error(
        err?.response?.data?.error ||
        "Enrollment failed"
      );

    } finally {

      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: withAlpha(color) }}>
      <Navbar title={("Enroll")} />

      <div className="mb-4 mx-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 px-4 ml-4 py-2 text-sm bg-white rounded"
          style={{ color: darkenColor(color) }}
        >
          <FaArrowLeft />
          {("back")}
        </button>
      </div>

      <div className="bg-white min-h-screen p-4 mx-6 mb-6 rounded-xl" style={{ backgroundColor: color }}>
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-orange-100 rounded-2xl p-2 flex gap-2 shadow-lg">

            {["Manual Upload", "Bulk Upload"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all duration-300 ${activeTab === tab
                  ? "bg-[#ff7f10] text-white shadow-lg"
                  : "text-[#0d3b4a] hover:bg-orange-50"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Manual Upload" && (
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
            <div className="bg-white w-full max-w-full rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    Enroll Student
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Fill in the details to enroll a new student
                  </p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("account_info")}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("school")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.school_id}
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"} bg-white`}
                      onChange={(e) => {
                        handleChange("school_id", e.target.value);
                        handleChange("programme_id", "");
                      }}
                    >
                      <option value="">{t("select_school")}</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.school_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programme <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.programme_id || ""}
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"} bg-white`}
                      onChange={(e) => handleChange("programme_id", e.target.value)}
                    >
                      <option value="">Select Programme</option>
                      {programme.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.programme_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("full_name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.fullName}
                    placeholder="e.g. Prem Nath"
                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.fatherName}
                    placeholder="e.g. Prem Nath"
                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.email}
                    placeholder="e.g. prem@example.com"
                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      value={formData.phone}
                      placeholder="e.g. 9876543210"
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"} bg-white`}
                      onChange={(e) => handleChange("gender", e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll No.<span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData.rollNo}
                      placeholder=""
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                      onChange={(e) => handleChange("rollNo", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University No.</label>
                    <input
                      value={formData.enrollmentNo}
                      placeholder="xxxxECxxxxxx"
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                      onChange={(e) => handleChange("enrollmentNo", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DOB <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                      onChange={(e) => handleChange("dob", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      value={formData.address}
                      placeholder="e.g. 9876543210"
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"}`}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => { resetForm(); }}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
                >
                  {t("cancel")}
                </button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className={`px-5 py-2 text-white rounded-lg text-sm font-semibold ${user?.color ? "hover:bg-green-600" : "hover:bg-orange-600"} transition disabled:opacity-60`}
                  style={{ backgroundColor: user?.color || "#ff7f10" }}
                >
                  {saving ? "Saving..." : "Enroll Student"}
                </button>
              </div>

            </div>
          </div>
        )}

        {activeTab === "Bulk Upload" && (
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
            <div className="bg-white w-full max-w-full rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    Enroll Student
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Fill in the details of students in template files and then upload it
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Click on template button to download Template</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("school")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.school_id}
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"} bg-white`}
                      onChange={(e) => {
                        handleChange("school_id", e.target.value);
                        handleChange("programme_id", "");
                        setBulkTemplateDownloaded(false);
                        setBulkUploadFile(null);
                      }}
                    >
                      <option value="">{t("select_school")}</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.school_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programme <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.programme_id || ""}
                      className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"} bg-white`}
                      onChange={(e) => {
                        handleChange("programme_id", e.target.value);
                        setBulkTemplateDownloaded(false);
                        setBulkUploadFile(null);
                      }}
                    >
                      <option value="">Select Programme</option>
                      {programme.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.programme_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBulkTemplateButton}
                  className={`w-full py-4 border rounded-xl font-semibold text-gray-600 hover:bg-gray-100 text-sm font-medium transition`}
                  style={{ backgroundColor: color, color: color ? "white" : "gray" }}
                >
                  {bulkTemplateDownloaded ? "Upload File" : "Download Template File"}
                </button>
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleBulkFileChange}
                />
                {bulkUploadFile && (
                  <p className="text-sm text-gray-600">
                    Selected file: <span className="font-semibold">{bulkUploadFile.name}</span>
                  </p>
                )}
                
              </div>

              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => { resetForm(); }}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
                >
                  {t("cancel")}
                </button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className={`px-5 py-2 text-white rounded-lg text-sm font-semibold ${user?.color ? "hover:bg-green-600" : "hover:bg-orange-600"} transition disabled:opacity-60`}
                  style={{ backgroundColor: user?.color || "#ff7f10" }}
                >
                  {saving ? "Saving..." : "Enroll Student"}
                </button>
              </div>

            </div>
          </div>
        )}


      </div>
    </div>
  );
}

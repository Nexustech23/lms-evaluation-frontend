"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import { useTranslations } from "next-intl";

export default function SchoolsPage() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const fileInputRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [deleteSummary, setDeleteSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const { user, isLoading } = useContext(AuthContext);
    const [search, setSearch] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });
    const t = useTranslations("adminSchool");
    const ts = useTranslations("subjects");
    const tua = useTranslations("uploadedAnswerScripts");
    const ta = useTranslations("admindashboard");
    const tc = useTranslations("common");

    const router = useRouter();

    const [formData, setFormData] = useState({
        school_name: "",
        school_code: "",
        description: "",
        established_year: "",
        image_url: "",
    });

    /* ================= FETCH SCHOOLS ================= */

    const fetchSchools = async (
        page = 1,
        searchText = ""
    ) => {
        try {

            setLoading(true);

            const res = await axios.get(
                `/api/schools`,
                {
                    params: {
                        page,
                        limit: pagination.limit,
                        search: searchText,
                    },
                    withCredentials: true,
                }
            );

            setSchools(res.data.schools || []);

            setPagination((prev) => ({
                ...prev,
                page: res.data.page || 1,
                limit: res.data.limit || 10,
                total: res.data.total || 0,
            }));

        } catch {

            toast.error("Failed to load schools");

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

        fetchSchools(
            pagination.page,
            debouncedSearch
        );

    }, [pagination.page, debouncedSearch]);
    /* ================= OPEN ADD MODAL ================= */

    const openAddModal = () => {
        setEditingSchool(null);
        setFormData({
            school_name: "",
            school_code: "",
            description: "",
            established_year: "",
            image_url: "",
        });
        setShowModal(true);
    };

    /* ================= OPEN EDIT MODAL ================= */

    const openEditModal = (school) => {
        setEditingSchool(school);
        setFormData({
            school_name: school.school_name || "",
            school_code: school.school_code || "",
            description: school.description || "",
            established_year: school.established_year || "",
            image_url: school.image_url || "",
        });
        setShowModal(true);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    /* ================= IMAGEKIT UPLOAD ================= */

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate type & size
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG, or WEBP images allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        try {
            setUploading(true);

            // 1️⃣ Get auth params from your backend
            const authRes = await axios.get(
                `/api/imagekit-auth`,
                { withCredentials: true }
            );
            const { token, expire, signature } = authRes.data;

            // 2️⃣ Build FormData for ImageKit
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("fileName", `school_${Date.now()}_${file.name}`);
            uploadData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
            uploadData.append("signature", signature);
            uploadData.append("expire", expire);
            uploadData.append("token", token);
            uploadData.append("folder", "/schools");

            // 3️⃣ Upload directly to ImageKit
            const uploadRes = await axios.post(
                "https://upload.imagekit.io/api/v1/files/upload",
                uploadData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const uploadedUrl = uploadRes.data.url;
            handleChange("image_url", uploadedUrl);
            toast.success("Image uploaded successfully");

        } catch (err) {
            console.error(err);
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
            // Reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    /* ================= SAVE ================= */

    const handleSave = async () => {
        const errors = {};

        if (!formData.school_name.trim()) errors.school_name = true;
        if (!formData.school_code.trim()) errors.school_code = true;
        if (!formData.established_year) errors.established_year = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            const firstError = errors.school_name
                ? "School name is required"
                : errors.school_code
                    ? "School code is required"
                    : "Established year is required";
            toast.error(firstError);
            return;
        }

        setFormErrors({});
        try {
            setSaving(true);

            if (editingSchool) {
                await axios.put(
                    `/api/schools/${editingSchool.id}`,
                    formData,
                    { withCredentials: true }
                );
                toast.success("School updated successfully");
            } else {
                await axios.post(
                    `/api/schools`,
                    formData,
                    { withCredentials: true }
                );
                toast.success("School created successfully");
            }

            setShowModal(false);
            fetchSchools();

        } catch (err) {
            toast.error(err?.response?.data?.error || "Save failed");
        } finally {
            setSaving(false);
        }
    };


    const openDeleteModal = async (school) => {
        try {
            setSelectedSchool(school);
            setShowDeleteModal(true);
            setLoadingSummary(true);

            // 🔥 Call backend to get cascade delete summary
            const res = await axios.get(
                `/api/schools/${school}/delete-summary`,
                { withCredentials: true }
            );

            setDeleteSummary(res.data || {});
            console.log("SCHOOL VALUE:", school);
        } catch (err) {
            toast.error("Failed to load delete details");
            setDeleteSummary(null);
        } finally {
            setLoadingSummary(false);
        }
    };

    /* ================= DELETE SCHOOL ================= */

    const deleteSchool = async (id) => {

        try {
            setDeleting(id);

            const res = await axios.delete(
                `/api/schools/${id}`,
                { withCredentials: true }
            );

            // Extract deleted summary safely
            res?.data?.deleted || {};

            toast.success(
                "Deleted Successfully"
            );

            fetchSchools();

        } catch (err) {
            console.error("Delete Error FULL:", err);
            console.error("Response:", err?.response?.data);
            console.error("Status:", err?.response?.status);

            toast.error(
                err?.response?.data?.error || "Delete failed"
            );
        }
    };

    /* ================= UI ================= */
    const totalPages = Math.ceil(
        (pagination.total || 0) / pagination.limit
    );

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
        <div className="min-h-screen" style={{ backgroundColor: user.color || "#ff7f10" }}>
            <Navbar title={t("title")} />

            <div className="p-6 mx-4">

                {/* ===== HEADER ===== */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

                    {/* LEFT */}
                    <div>
                        <h2 className="text-white text-3xl font-bold">
                            {t("title")}
                        </h2>

                        <p className="text-orange-100 text-sm mt-1">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                        {/* SEARCH */}
                        <div className="relative">

                            <input
                                type="text"
                                value={search}
                                placeholder="Search schools..."
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
                            onClick={openAddModal}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-white font-semibold rounded-xl shadow-lg ${user?.color
                                ? "hover:bg-green-50"
                                : "hover:bg-orange-50"
                                } transition`}
                            style={{
                                color: user?.color || "#ff7f10"
                            }}
                        >
                            + {t("addSchool")}
                        </button>

                    </div>

                </div>

                {/* ===== TABLE CARD ===== */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <Spinner />
                        </div>
                    ) : schools.length === 0 ? (
                        <div className="p-16 text-center">
                            <p className="text-4xl mb-3">🏫</p>
                            <p className="text-gray-500 font-medium">{t("noSchool")}</p>
                            <p className="text-gray-400 text-sm mt-1">{t("note")}</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-left">
                                        <th className="px-5 py-3 text-gray-500 font-semibold">{ts("sno")}</th>
                                        <th className="px-5 py-3 text-gray-500 font-semibold">{ts("school")}</th>
                                        <th className="px-5 py-3 text-gray-500 font-semibold">{t("code")}</th>
                                        <th className="px-5 py-3 text-gray-500 font-semibold">{t("EstYear")}</th>
                                        <th className="px-5 py-3 text-gray-500 font-semibold text-center">{tua("actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.map((school, index) => (
                                        <tr key={school.id} className="border-t hover:bg-gray-50 transition">
                                            <td className="px-5 py-4 text-gray-400">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {school.image_url ? (
                                                        <img
                                                            src={school.image_url}
                                                            alt={school.school_name}
                                                            className="w-9 h-9 rounded-lg object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-[#ff7f10] font-bold text-sm">
                                                            {school.school_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{school.school_name}</p>
                                                        {school.description && (
                                                            <p className="text-xs text-gray-400 truncate max-w-xs">{school.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {school.school_code ? (
                                                    <span className={`px-2.5 py-1 border rounded-full text-xs font-semibold ${user?.color ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}
                                                        style={{ color: user?.color || "#ff7f10" }}
                                                    >
                                                        {school.school_code}
                                                    </span>
                                                ) : "—"}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {school.established_year || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-4">

                                                    {/* View */}
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => router.push(`/admin/school/programme?schoolId=${school.id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                                                        >
                                                            <IconEye size={20} />
                                                        </button>

                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                                Programmes
                                                            </div>

                                                            {/* Arrow */}
                                                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                                        </div>
                                                    </div>

                                                    {/* Edit */}
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => openEditModal(school)}
                                                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition"
                                                        >
                                                            <IconEdit size={20} />
                                                        </button>

                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                                Edit
                                                            </div>

                                                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                                        </div>
                                                    </div>

                                                    {/* Delete */}
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => openDeleteModal(school.id)}
                                                            disabled={deleting === school.id}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition"
                                                        >
                                                            {deleting === school.id ? "..." : <IconTrash size={20} />}
                                                        </button>

                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                                Delete
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

                            {schools.length > 0 && (
                                <div className="bg-white border-t px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl">

                                    {/* LEFT */}
                                    <div className="text-sm text-gray-600">

                                        Showing{" "}

                                        <span className="font-semibold text-orange-600">
                                            {schools.length > 0
                                                ? (pagination.page - 1) *
                                                pagination.limit +
                                                1
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

                                        {" "}schools

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
                        </>)}
                </div>
            </div>

            {/* Details of deleted data */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-3">

                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">

                        {/* HEADER */}
                        <div className="px-5 py-3 text-white flex items-center justify-between"
                            style={user?.color ? { background: `linear-gradient(to right, ${user?.color}, #22c55e)` } : { background: "linear-gradient(to right, #ff7f10, #f97316)" }}>
                            <div>
                                <h2 className="text-base font-semibold">
                                    {t("deleteSchool")}
                                </h2>
                                <p className="text-[11px] opacity-90">
                                    {t("warning")}
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
                                {t("confirmation")}{" "}
                                <span className="font-semibold text-[#ff7f10]">
                                    {selectedSchool?.school_name}
                                </span>?
                            </p>

                            {loadingSummary ? (
                                <div className="flex justify-center py-5">
                                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                                        style={{ borderColor: user?.color || "#ff7f10" }} />
                                </div>
                            ) : deleteSummary ? (
                                <>
                                    {/* WARNING */}
                                    <div className={`rounded-md p-2.5 mb-3 ${user?.color ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                                        <p className="text-[11px] text-orange-700 font-medium">
                                            ⚠️ {t("followingData")}
                                        </p>
                                    </div>

                                    {/* SUMMARY GRID */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">

                                        <div className={`rounded-md p-2 text-center ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            📚 <p className="font-semibold text-gray-800 ">{deleteSummary.programmes}</p>
                                            <p className="text-[10px] text-gray-800">{t("programmes")}</p>
                                        </div>

                                        <div className={`rounded-md p-2 text-center ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            🏢 <p className="font-semibold text-gray-800 ">{deleteSummary.departments}</p>
                                            <p className="text-[10px] text-gray-800">{t("departments")}</p>
                                        </div>

                                        <div className={`rounded-md p-2 text-center ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            🎓 <p className="font-semibold text-gray-800 ">{deleteSummary.batches}</p>
                                            <p className="text-[10px] text-gray-800">{t("batches")}</p>
                                        </div>

                                        <div className={`rounded-md p-2 text-center ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            📖 <p className="font-semibold text-gray-800 ">{deleteSummary.subjects}</p>
                                            <p className="text-[10px] text-gray-800">{t("subjects")}</p>
                                        </div>

                                        <div className={`rounded-md p-2 text-center ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            👨‍🏫 <p className="font-semibold text-gray-800 ">{deleteSummary.faculty}</p>
                                            <p className="text-[10px] text-gray-800">{ta("faculty")}</p>
                                        </div>


                                        <div className={`rounded-md p-2 text-center ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            📝 <p className="font-semibold text-gray-800 ">{deleteSummary.question_papers}</p>
                                            <p className="text-[10px] text-gray-800">{t("exams")}</p>
                                        </div>

                                        <div className={`rounded-md p-2 text-center ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            📄 <p className="font-semibold text-gray-800 ">{deleteSummary.answers}</p>
                                            <p className="text-[10px] text-gray-800">{t("answers")}</p>
                                        </div>

                                        <div className={`rounded-md p-2 text-center col-span-2 ${user?.color ? "bg-green-50" : "bg-orange-50"}`}>
                                            📊 <p className="font-semibold text-gray-800 ">{deleteSummary.evaluations}</p>
                                            <p className="text-[10px] text-gray-800">{t("evaluations")}</p>
                                        </div>

                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-red-500 text-xs">
                                    {t("failed")}
                                </p>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2">

                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={`px-3 py-1.5 border rounded-md ${user?.color ? "border-green-200 hover:bg-green-50" : "border-orange-200 hover:bg-orange-50"} text-xs`}
                                style={{ color: user?.color || "#ff7f10" }}
                            >
                                {tc("cancel")}
                            </button>

                            <button
                                onClick={() => {
                                    deleteSchool(selectedSchool);
                                    setShowDeleteModal(false);
                                }}
                                className={`px-4 py-1.5 text-white rounded-md text-xs font-medium ${user?.color ? "hover:bg-green-600" : "hover:bg-orange-600"}`}
                                style={user?.color ? { backgroundColor: user?.color } : { backgroundColor: "#ff7f10" }}
                            >
                                {t("confirmDelete")}
                            </button>

                        </div>
                    </div>
                </div>
            )}
            {/* ===== MODAL ===== */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                    {editingSchool ? t("editSchool") : t("addSchool")}
                                </h3>
                                <p className="text-gray-400 text-sm mt-0.5">
                                    {editingSchool ? t("updateSchoolDetails") : t("fillIN")}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-light"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("school_name")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formData.school_name}
                                    placeholder="e.g. School of Engineering"
                                    // className="w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    className={`w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 ${formErrors.school_name
                                        ? "border-red-400 focus:ring-red-300"
                                        : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                        }`}
                                    onChange={(e) => {
                                        handleChange("school_name", e.target.value);
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, school_name: false }));
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("school_code")}<span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formData.school_code}
                                    placeholder="e.g. SOE, SOM"
                                    // className="w-full p-2.5 border rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    className={`w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 ${formErrors.school_code
                                        ? "border-red-400 focus:ring-red-300"
                                        : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                        }`}
                                    onChange={(e) => {
                                        handleChange("school_code", e.target.value);
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, school_code: false }));
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("established_year")}<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.established_year}
                                    placeholder="e.g. 2005"
                                    min="1800"
                                    max={new Date().getFullYear()}
                                    // className="w-full p-2.5 border text-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    className={`w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 ${formErrors.established_year
                                        ? "border-red-400 focus:ring-red-300"
                                        : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                        }`}
                                    onChange={(e) => {
                                        handleChange("established_year", e.target.value);
                                        if (e.target.value) setFormErrors(prev => ({ ...prev, established_year: false }));
                                    }}
                                />
                            </div>

                            {/* ===== IMAGE UPLOAD ===== */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("image")}
                                </label>

                                {/* Upload Box */}
                                <div
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition
    ${uploading
                                            ? `${user?.color ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"} cursor-not-allowed`
                                            : formErrors.image_url
                                                ? "border-red-400 bg-red-50"
                                                : `border-gray-300 ${user?.color ? "hover:border-green-400 hover:bg-green-50" : "hover:border-orange-400 hover:bg-orange-50"}`
                                        }`}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-2 py-2">
                                            <div className="w-6 h-6 border-2 border-[#ff7f10] border-t-transparent rounded-full animate-spin" />
                                            <p className={`text-sm font-medium ${user?.color ? "text-green-500" : "text-orange-500"}`}>{t("UploaingImg")}</p>
                                        </div>
                                    ) : formData.image_url ? (
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={formData.image_url}
                                                alt="preview"
                                                className="w-16 h-16 rounded-lg object-cover border shadow-sm"
                                            />
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-700">{t("ImgUpload")}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{t("clickReplace")}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-2">
                                            <p className="text-2xl mb-1">📷</p>
                                            <p className="text-sm text-gray-500 font-medium">{t("clickUpload")}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{t("FileFormat")}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />

                                {/* Remove image */}
                                {formData.image_url && !uploading && (
                                    <button
                                        onClick={() => handleChange("image_url", "")}
                                        className="mt-2 text-xs text-red-500 hover:text-red-700 transition"
                                    >
                                        ✕ {t("removeImg")}
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("description")}
                                </label>
                                <textarea
                                    value={formData.description}
                                    placeholder="Brief description about the school..."
                                    rows={3}
                                    // className="w-full p-2.5 text-gray-600 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                                    className={`w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 resize-none ${formErrors.description
                                        ? "border-red-400 focus:ring-red-300"
                                        : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                        }`}
                                    onChange={(e) => {
                                        handleChange("description", e.target.value);
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, description: false }));
                                    }}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
                            >
                                {tc("cancel")}
                            </button>
                            <button
                                disabled={saving || uploading}
                                onClick={handleSave}
                                className={`px-5 py-2 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 ${user?.color ? "hover:bg-green-600" : "hover:bg-orange-600"}`}
                                style={{ backgroundColor: user?.color || "#ff7f10" }}
                            >
                                {saving ? tc("saving") : editingSchool ? t("updateSchool") : t("createSchool")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
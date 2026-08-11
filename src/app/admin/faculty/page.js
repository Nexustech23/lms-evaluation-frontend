"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import { useTranslations } from "next-intl";
import { IconTrash, IconEdit, IconEye, IconEyeOff } from "@tabler/icons-react";
export default function FacultyPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { user, isLoading } = useContext(AuthContext);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    });
    const t = useTranslations("faculty");

    const [formData, setFormData] = useState({
        fullName: "", email: "", password: "", role: 3,
        phone: "", school_id: "", designation: "", qualification: "",
        experience_years: "", specialization: "", bio: "",
        employee_code: "", joining_date: ""
    });

    // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    /* ================= FETCH ================= */

    const fetchFaculties = async (
        page = 1,
        searchText = ""
    ) => {
        try {

            setLoading(true);

            const res = await axios.get(
                `/api/faculty?page=${page}&limit=${pagination.limit}&search=${searchText}`,
                {
                    withCredentials: true,
                }
            );

            setFaculties(res.data.faculties || []);

            setPagination((prev) => ({
                ...prev,
                page: res.data.page || 1,
                limit: res.data.limit || 10,
                total: res.data.total || 0,
            }));

        } catch {

            toast.error("Failed to load faculties");

        } finally {

            setLoading(false);

        }
    };

    const fetchSchools = async () => {
        try {
            const res = await axios.get(`/api/schools`, { withCredentials: true });
            setSchools(res.data.schools || []);
        } catch { toast.error("Failed to load schools"); }
    };
    useEffect(() => {

        const timer = setTimeout(() => {

            setDebouncedSearch(search);

        }, 1000);

        return () => clearTimeout(timer);

    }, [search]);
    useEffect(() => {

        fetchFaculties(
            pagination.page,
            debouncedSearch
        );

    }, [pagination.page, debouncedSearch]);
    useEffect(() => {
        fetchSchools();
    }, [])
    /* ================= EDIT / DELETE ================= */

    const handleEdit = (faculty) => {
        setEditingId(faculty.id);
        setFormData({
            fullName: faculty.fullName || "", email: faculty.email || "",
            password: "", role: 3, phone: faculty.phone || "",
            school_id: faculty.school_id || "", designation: faculty.designation || "",
            qualification: faculty.qualification || "", experience_years: faculty.experience_years || "",
            specialization: faculty.specialization || "", bio: faculty.bio || "",
            employee_code: faculty.employee_code || "", joining_date: faculty.joining_date || ""
        });
        setShowModal(true);
    };

    const setOpenModal = (facultyId) => {
        setShowDeleteModal(true);
        setSelectedFaculty(facultyId);
    }

    const handleDelete = async (id) => {
        try {
            setDeleting(id);
            await axios.delete(`/api/faculty/${id}`, { withCredentials: true });
            toast.success("Faculty deleted successfully");
            fetchFaculties();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Delete failed");
        } finally { setDeleting(null); }
    };

    /* ================= SAVE ================= */

    const handleSave = async () => {
        const errors = {};

        if (!formData.fullName?.trim()) errors.fullName = true;
        if (!formData.email?.trim()) errors.email = true;
        if (!editingId && !formData.password?.trim()) errors.password = true;
        if (!formData.phone?.trim()) errors.phone = true;
        if (!formData.school_id) errors.school_id = true;
        if (!formData.designation?.trim()) errors.designation = true;
        if (!formData.qualification?.trim()) errors.qualification = true;
        if (!formData.specialization?.trim()) errors.specialization = true;
        if (!formData.experience_years) errors.experience_years = true;
        if (!formData.employee_code?.trim()) errors.employee_code = true;
        if (!formData.joining_date) errors.joining_date = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error("Please fill all required fields");
            return;
        }

        setFormErrors({});

        try {
            setSaving(true);
            if (editingId) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await axios.put(`/api/faculty/${editingId}`, payload, { withCredentials: true });
                toast.success("Faculty updated successfully");
            } else {
                await axios.post(`/api/register`, formData, { withCredentials: true });
                toast.success("Faculty created successfully");
            }
            setShowModal(false);
            resetForm();
            fetchFaculties();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Save failed");
        } finally { setSaving(false); }
    };
    const resetForm = () => {
        setEditingId(null);
        setFormErrors({});
        setFormData({
            fullName: "", email: "", password: "", role: "faculty",
            phone: "", school_id: "", designation: "", qualification: "",
            experience_years: "", specialization: "", bio: "",
            employee_code: "", joining_date: ""
        });
    };

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

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
        <div className="h-screen" style={{ backgroundColor: user.color || "#ff7f10" }}>
            <Navbar title={t("faculty_title")} />

            <div className="p-6 mx-4">

                {/* ===== HEADER ===== */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

                    {/* LEFT */}
                    <div>
                        <h2 className="text-white text-3xl font-bold">
                            {t("faculty_header")}
                        </h2>

                        <p className="text-orange-100 text-sm mt-1">
                            {t("faculty_subtitle")}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                        {/* SEARCH */}
                        <div className="relative">

                            <input
                                type="text"
                                value={search}
                                placeholder="Search faculty..."
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
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-white font-semibold rounded-xl shadow-lg ${user?.color
                                ? "hover:bg-green-50"
                                : "hover:bg-orange-50"
                                } transition`}
                            style={{
                                color: user?.color || "#ff7f10",
                            }}
                        >
                            {t("faculty_add")}
                        </button>

                    </div>

                </div>
                {/* ===== TABLE CARD ===== */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-10 flex justify-center"><Spinner /></div>
                    ) : faculties.length === 0 ? (
                        <div className="p-16 text-center">
                            <p className="text-4xl mb-3">👨‍🏫</p>
                            <p className="text-gray-500 font-medium">{t("faculty_no_data")}</p>
                            <p className="text-gray-400 text-sm mt-1">{t("faculty_empty_hint")}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto faculty-scroll">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-left">
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("sno")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("name")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("email")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("phone")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("school")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("designation")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("specialization")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold">{t("emp_code")}</th>
                                        <th className="px-4 py-3 text-gray-500 font-semibold text-center">{t("actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faculties.map((f, index) => (
                                        <tr key={f.id} className="border-t hover:bg-gray-50 transition">
                                            <td className="px-4 py-4 text-gray-400">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    index +
                                                    1}
                                            </td>

                                            {/* Name with avatar */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full ${user?.color ? "bg-green-100" : "bg-orange-100"} font-bold text-xs flex items-center justify-center flex-shrink-0`} style={{ color: user?.color || "#ff7f10" }}>
                                                        {f.fullName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-gray-800 whitespace-nowrap">{f.fullName}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-gray-600">{f.email}</td>
                                            <td className="px-4 py-4 text-gray-600">{f.phone || "—"}</td>
                                            <td className="px-4 py-4 text-gray-600">{f.school_code || "—"}</td>
                                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{f.designation || "—"}</td>

                                            <td className="px-4 py-4">
                                                {f.specialization ? (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium">
                                                        {f.specialization}
                                                    </span>
                                                ) : "—"}
                                            </td>

                                            <td className="px-4 py-4">
                                                {f.employee_code ? (
                                                    <span className={`px-2 py-1 ${user?.color ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"} border rounded-full text-xs font-semibold`} style={{ color: user?.color || "#ff7f10" }}>
                                                        {f.employee_code}
                                                    </span>
                                                ) : "—"}
                                            </td>


                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-3">

                                                    {/* Edit */}
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => handleEdit(f)}
                                                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl transition"
                                                        >
                                                            <IconEdit size={20} />
                                                        </button>

                                                        <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                                Edit Faculty
                                                            </div>

                                                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                                        </div>
                                                    </div>

                                                    {/* Delete */}
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => setOpenModal(f.id)}
                                                            disabled={deleting === f.id}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition disabled:opacity-50"
                                                        >
                                                            {deleting === f.id ? "..." : <IconTrash size={20} />}
                                                        </button>

                                                        <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                            <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                                Delete Faculty
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

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5 border-t bg-gray-50">

                                {/* LEFT INFO */}
                                <div className="text-sm text-gray-600">

                                    Showing{" "}

                                    <span className="font-semibold text-orange-600">
                                        {faculties.length > 0
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

                                    {" "}faculties

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
                        </div>
                    )}
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-3">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
                        {/* HEADER */}
                        <div className="px-5 py-3 text-white flex items-center justify-between"
                            style={user?.color ? { background: `linear-gradient(to right, ${user?.color}, #22c55e)` } : { background: "linear-gradient(to right, #ff7f10, #f97316)" }}>
                            <div>
                                <h2 className="text-base font-semibold">
                                    Delete Faculty
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
                            <div className={`rounded-md p-2.5 mb-3 ${user?.color ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                                <p className="text-[11px] text-orange-700 font-medium">
                                    ⚠️ Your data will be permanently deleted:
                                </p>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2">

                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={`px-3 py-1.5 border rounded-md ${user?.color ? "border-green-200 hover:bg-green-50" : "border-orange-200 hover:bg-orange-50"} text-xs`}
                                style={{ color: user?.color || "#ff7f10" }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    handleDelete(selectedFaculty);
                                    setShowDeleteModal(false);
                                }}
                                className={`px-4 py-1.5 text-white rounded-md text-xs font-medium ${user?.color ? "hover:bg-green-600" : "hover:bg-orange-600"}`}
                                style={user?.color ? { backgroundColor: user?.color } : { backgroundColor: "#ff7f10" }}
                            >
                                Confirm Delete
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL ================= */}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                    {editingId ? t("modal_edit_title") : t("modal_add_title")}
                                </h3>
                                <p className="text-gray-400 text-sm mt-0.5">
                                    {editingId ? t("modal_edit_subtitle") : t("modal_add_subtitle")}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600 text-xl font-light"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">

                            {/* ===== Section: Account Info ===== */}
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("account_info")}</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("full_name")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formData.fullName}
                                    placeholder="e.g. Prem Nath"
                                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.fullName ? "border-red-400 focus:ring-red-300"
                                        : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                        }`}
                                    onChange={(e) => {
                                        handleChange("fullName", e.target.value);
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, fullName: false }));
                                    }} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("email")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={formData.email}
                                        placeholder="e.g. prem@example.com"
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.email ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("email", e.target.value);
                                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, email: false }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone<span className="text-red-500"> *</span></label>
                                    <input
                                        value={formData.phone}
                                        placeholder="e.g. 9876543210"
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.phone ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("phone", e.target.value);
                                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, phone: false }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("password")}{" "}
                                    {editingId
                                        ? <span className="text-gray-400 font-normal">({t("password_hint")})</span>
                                        : <span className="text-red-500">*</span>}
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        placeholder={editingId ? t("password_hint") : t("entetPass")}
                                        className={`w-full p-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.password ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("password", e.target.value);
                                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, password: false }));
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("school")} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.school_id}
                                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white ${formErrors.school_id ? "border-red-400 focus:ring-red-300"
                                        : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                        }`}
                                    onChange={(e) => {
                                        handleChange("school_id", e.target.value);
                                        if (e.target.value) setFormErrors(prev => ({ ...prev, school_id: false }));
                                    }}
                                >
                                    <option value="">{t("select_school")}</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>{s.school_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ===== Section: Professional Info ===== */}
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">{t("professional_info")}</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("designation")}<span className="text-red-500"> *</span></label>
                                    <input
                                        value={formData.designation}
                                        placeholder="e.g. Assistant Professor"
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.designation ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("designation", e.target.value);
                                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, designation: false }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("qualification")}<span className="text-red-500"> *</span></label>
                                    <input
                                        value={formData.qualification}
                                        placeholder="e.g. PhD, M.Tech"
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.qualification ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("qualification", e.target.value);
                                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, qualification: false }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("specialization")}<span className="text-red-500">*</span></label>
                                    <input
                                        value={formData.specialization}
                                        placeholder="e.g. AI, ML"
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.specialization ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("specialization", e.target.value);
                                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, specialization: false }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("experience")}<span className="text-red-500"> *</span></label>
                                    <input
                                        type="number"
                                        value={formData.experience_years}
                                        placeholder="e.g. 5"
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.experience_years ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("experience_years", e.target.value);
                                            if (e.target.value) setFormErrors(prev => ({ ...prev, experience_years: false }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("emp_code")}<span className="text-red-500"> *</span></label>
                                    <input
                                        value={formData.employee_code}
                                        placeholder="e.g. EMP101"
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.employee_code ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("employee_code", e.target.value);
                                            if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, employee_code: false }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("joining_date")}<span className="text-red-500"> *</span></label>
                                    <input
                                        type="date"
                                        value={formData.joining_date}
                                        className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.joining_date ? "border-red-400 focus:ring-red-300"
                                            : user?.color ? "focus:ring-green-300" : "focus:ring-orange-300"
                                            }`}
                                        onChange={(e) => {
                                            handleChange("joining_date", e.target.value);
                                            if (e.target.value) setFormErrors(prev => ({ ...prev, joining_date: false }));
                                        }}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
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
                                {saving ? t("saving") : editingId ? t("update") : t("create")}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
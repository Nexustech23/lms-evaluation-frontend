"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { IconEdit, IconUsersGroup, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

export default function DepartmentPage() {

    const searchParams = useSearchParams();
    const router = useRouter();
    const programmeId = searchParams.get("programmeId");
const [search, setSearch] = useState("");

const [debouncedSearch, setDebouncedSearch] = useState("");

const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
});
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const { user ,isLoading} = useContext(AuthContext);
    const [showDeleteModal,setShowDeleteModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const t = useTranslations("programmeDept");

    const [formData, setFormData] = useState({
        department_name: "",
        code: "",
    });

    /* ================= FETCH DEPARTMENTS ================= */

 const fetchDepartments = async (
    page = 1,
    searchText = ""
) => {

    try {

        setLoading(true);

        const res = await axios.get(
            `/api/departments/${programmeId}`,
            {
                params: {
                    page,
                    limit: pagination.limit,
                    search: searchText,
                },
                withCredentials: true,
            }
        );

        setDepartments(
            res.data.departments || []
        );

        setPagination((prev) => ({
            ...prev,
            page: res.data.page || 1,
            limit: res.data.limit || 10,
            total: res.data.total || 0,
        }));

    } catch {

        toast.error(
            "Failed to load departments"
        );

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

    if (programmeId) {

        fetchDepartments(
            pagination.page,
            debouncedSearch
        );

    }

}, [
    programmeId,
    pagination.page,
    debouncedSearch
]);

    /* ================= OPEN ADD ================= */

    const openAddModal = () => {
        setEditingDepartment(null);
        setFormData({ department_name: "", code: "" });
        setShowModal(true);
    };

    /* ================= OPEN EDIT ================= */

    const openEditModal = (department) => {
        setEditingDepartment(department);
        setFormData({
            department_name: department.department_name || "",
            code: department.code || "",
        });
        setShowModal(true);
    };

    /* ================= SAVE ================= */

    const handleSave = async () => {
        if (!formData.department_name.trim()) {
            toast.error("Department name is required");
            return;
        }

        try {
            setSaving(true);

            if (editingDepartment) {
                await axios.put(
                    `/api/departments/${editingDepartment.id}`,
                    formData,
                    { withCredentials: true }
                );
                toast.success("Department updated successfully");
            } else {
                await axios.post(
                    `/api/departments`,
                    { ...formData, programme_id: programmeId },
                    { withCredentials: true }
                );
                toast.success("Department created successfully");
            }

            setShowModal(false);
            fetchDepartments();

        } catch (err) {
            toast.error(err?.response?.data?.error || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    /* ================= DELETE ================= */

    const openDeleteModal = async(department) => {
        setShowDeleteModal(true);
        setSelectedDepartment(department);
    }

    const deleteDepartment = async (id) => {
        if (!confirm("Delete this department permanently?")) return;
        try {
            setDeleting(id);
            await axios.delete(
                `/api/departments/${id}`,
                { withCredentials: true }
            );
            toast.success("Department deleted");
            fetchDepartments();
        } catch {
            toast.error("Delete failed");
        } finally {
            setDeleting(null);
        }
    };

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
            <Navbar title={t("dept_title")} />

            <div className="p-6 mx-4">

                {/* ===== HEADER ===== */}
             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

    {/* LEFT */}
    <div>
        <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-1 transition"
        >
            ← {t("dept_back")}
        </button>

        <h2 className="text-white text-3xl font-bold">
            {t("dept_title")}
        </h2>

        <p className="text-orange-100 text-sm mt-1">
            {t("dept_subtitle")}
        </p>
    </div>

    {/* RIGHT */}
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

        {/* SEARCH */}
        <div className="relative">

            <input
                type="text"
                value={search}
                placeholder="Search departments..."
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
            onClick={openAddModal}
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
             {t("dept_add")}
        </button>

    </div>

</div>

                {/* ===== TABLE CARD ===== */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <Spinner />
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="p-16 text-center">
                            <p className="text-4xl mb-3">🏢</p>
                            <p className="text-gray-500 font-medium">{t("dept_no_data")}</p>
                            <p className="text-gray-400 text-sm mt-1">{t("dept_no_data_hint")}</p>
                        </div>
                    ) : (
                        <div>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-left">
                                    <th className="px-5 py-3 text-gray-500 font-semibold">{t("dept_sno")}</th>
                                    <th className="px-5 py-3 text-gray-500 font-semibold">{t("dept_name")}</th>
                                    <th className="px-5 py-3 text-gray-500 font-semibold">{t("dept_code")}</th>
                                    <th className="px-5 py-3 text-gray-500 font-semibold text-center">{t("dept_actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((d, index) => (
                                    <tr key={d.id} className="border-t hover:bg-gray-50 transition">

                                       <td className="px-5 py-4 text-gray-400">
    {(pagination.page - 1) *
        pagination.limit +
        index +
        1}
</td>

                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-800">{d.department_name}</p>
                                        </td>

                                        <td className="px-5 py-4">
                                            {d.code ? (
                                                <span className={`px-2.5 py-1 ${user?.color?"bg-green-50 border border-green-200":"bg-orange-50 border border-orange-200"} rounded-full text-xs font-semibold`}
                                                style={{color: user?.color || "#ff7f10"}}>
                                                    {d.code}
                                                </span>
                                            ) : "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">

                                                {/* Edit */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => openEditModal(d)}
                                                        className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition"
                                                    >
                                                        <IconEdit size={20} />
                                                    </button>

                                                    <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                        <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                            Edit Department
                                                        </div>

                                                        <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                                    </div>
                                                </div>

                                                {/* Batches */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/school/programme/department/batch?departmentId=${d.id}`
                                                            )
                                                        }
                                                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-xl transition"
                                                    >
                                                        <IconUsersGroup size={20} />
                                                    </button>

                                                    <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                        <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                            View Batches
                                                        </div>

                                                        <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                                    </div>
                                                </div>

                                                {/* Delete */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => openDeleteModal(d.id)}
                                                        disabled={deleting === d.id}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition disabled:opacity-50"
                                                    >
                                                        {deleting === d.id ? "..." : <IconTrash size={20} />}
                                                    </button>

                                                    <div className="absolute -top-11 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 group-hover:-translate-y-1
        transition-all duration-200 ease-in-out pointer-events-none">

                                                        <div className="px-3 py-1.5 text-xs text-white 
          bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                                            Delete Department
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

{departments.length > 0 && (

    <div className="bg-white border-t px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl">

        {/* LEFT */}
        <div className="text-sm text-gray-600">

            Showing{" "}

            <span className="font-semibold text-orange-600">

                {departments.length > 0
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

            {" "}departments

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
</div>
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
                                    Delete Department
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
                                    deleteDepartment(selectedDepartment);
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
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                    {editingDepartment ? t("dept_edit") : t("dept_modal_add")}
                                </h3>
                                <p className="text-gray-400 text-sm mt-0.5">
                                    {editingDepartment ? t("dept_modal_edit_sub") : t("dept_modal_add_sub")}
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
                                    {t("dept_name_label")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="e.g. Computer Science & Engineering"
                                    value={formData.department_name}
                                    onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("dept_code")} <span className="text-gray-400 font-normal">(Abbreviation)</span>
                                </label>
                                <input
                                    placeholder="e.g. CSE, ECE, ME"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color?"focus:ring-green-300":"focus:ring-orange-300"}`}
                                />
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
                            >
                                {t("dept_cancel")}
                            </button>
                            <button
                                disabled={saving}
                                onClick={handleSave}
                                className={`px-5 py-2 text-white rounded-lg text-sm font-semibold ${user?.color?"hover:bg-green-600":"hover:bg-orange-600"} transition disabled:opacity-60`}
                                style={{backgroundColor: user?.color || "#ff7f10"}}
                            >
                                {saving ? t("dept_saving") : editingDepartment ? t("dept_update") : t("dept_create")}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
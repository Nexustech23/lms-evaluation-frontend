"use client";

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/ui/Navbar";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/app/AuthContext";
import {
    Award,
    BookOpen,
    Calculator,
    FileSpreadsheet,
    Printer,
    Search,
    Trophy,
    Users,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

function withAlpha(hex = "#ff7f10", alpha = 1) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenColor(hex = "#ff7f10", amount = 0.35) {
    const h = hex.replace("#", "");
    const r = Math.max(0, Math.floor(parseInt(h.substring(0, 2), 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(parseInt(h.substring(2, 4), 16) * (1 - amount)));
    const b = Math.max(0, Math.floor(parseInt(h.substring(4, 6), 16) * (1 - amount)));
    return `rgb(${r}, ${g}, ${b})`;
}

/* keys that are NOT subjects — everything else in a row is a subject column */
const FIXED_KEYS = [
    "student_id",
    "overall_total",
    "rank",
    "grade",
    "total_credits",
    "total_credit_points",
    "tgpa",
    "cgpa",
    "result_source",
    "_id",
];

function formatNumber(value, digits = 0) {
    if (value == null || value === "") return "—";
    const number = Number(value);
    if (!Number.isFinite(number)) return value;
    return number.toLocaleString("en-IN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

function toFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

/* =========================================================
   GRADE BADGE
========================================================= */

const GRADE_STYLES = {
    "A+": { bg: "rgba(34,197,94,0.14)", color: "#15803d" },
    A: { bg: "rgba(34,197,94,0.12)", color: "#16a34a" },
    "B+": { bg: "rgba(234,179,8,0.14)", color: "#a16207" },
    B: { bg: "rgba(234,179,8,0.12)", color: "#b45309" },
    "C+": { bg: "rgba(249,115,22,0.14)", color: "#c2410c" },
    C: { bg: "rgba(249,115,22,0.12)", color: "#ea580c" },
    D: { bg: "rgba(239,68,68,0.13)", color: "#b91c1c" },
    U: { bg: "rgba(239,68,68,0.13)", color: "#b91c1c" },
};

function GradeBadge({ grade }) {
    if (!grade) {
        return <span className="text-gray-300 text-xs">—</span>;
    }
    const style = GRADE_STYLES[grade] || { bg: "rgba(156,163,175,0.15)", color: "#4b5563" };
    return (
        <span
            className="inline-flex min-w-12 justify-center rounded-full px-4 py-1.5 text-sm font-extrabold shadow-sm"
            style={{ backgroundColor: style.bg, color: style.color }}
        >
            {grade}
        </span>
    );
}

function SummaryMetric({ label, value, icon: Icon, color = "#7f1d1d" }) {
    return (
        <div className="rounded-xl border border-rose-100 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-gray-900 tabular-nums">{value}</p>
                </div>
                <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: withAlpha(color, 0.1), color }}
                >
                    <Icon size={19} strokeWidth={2.2} />
                </span>
            </div>
        </div>
    );
}

function ExportActions({ color, batchId, semester }) {
    const [exporting, setExporting] = useState(false);
    const buttonClass =
        "inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60";

    const handleExportExcel = async () => {
        if (!batchId || !semester) {
            toast.error("Please select batch and semester");
            return;
        }

        setExporting(true);
        try {
            const response = await axios.get("/api/combined-result/export", {
                params: { batch_id: batchId, semester },
                responseType: "blob",
                withCredentials: true,
            });

            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `combined_result_semester_${semester}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Excel export downloaded");
        } catch (err) {
            const msg = err?.response?.data?.error || "Excel export failed";
            toast.error(msg);
        } finally {
            setExporting(false);
        }
    };

    const handlePrintResult = () => {
        if (!batchId || !semester) {
            toast.error("Please select batch and semester");
            return;
        }

        const params = new URLSearchParams({
            batch_id: batchId,
            semester: String(semester),
        });
        const printWindow = window.open(`/api/combined-result/print?${params.toString()}`, "_blank");

        if (!printWindow) {
            toast.error("Please allow popups to print result");
        }
    };

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting}
                className={buttonClass}
                style={{ borderColor: withAlpha(color, 0.24), color: darkenColor(color, 0.2) }}
            >
                <FileSpreadsheet size={16} />
                {exporting ? "Exporting..." : "Export Excel"}
            </button>
            <button
                type="button"
                onClick={handlePrintResult}
                className={buttonClass}
                style={{ borderColor: withAlpha(color, 0.24), color: darkenColor(color, 0.2) }}
            >
                <Printer size={16} />
                Print Result
            </button>
        </div>
    );
}

function RankBadge({ rank, color }) {
    const numericRank = Number(rank);
    const rankStyles = {
        1: {
            bg: "#fef3c7",
            text: "#92400e",
            border: "#f59e0b",
            Icon: Trophy,
        },
        2: {
            bg: "#f3f4f6",
            text: "#4b5563",
            border: "#9ca3af",
            Icon: Award,
        },
        3: {
            bg: "#ffedd5",
            text: "#9a3412",
            border: "#fb923c",
            Icon: Award,
        },
    };
    const style = rankStyles[numericRank];

    if (!style) {
        return (
            <span className="font-extrabold tabular-nums" style={{ color: darkenColor(color) }}>
                {rank ?? "—"}
            </span>
        );
    }

    const Icon = style.Icon;
    return (
        <span
            className="inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold tabular-nums"
            style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
        >
            <Icon size={13} />
            {rank}
        </span>
    );
}

function ResultSkeleton({ color }) {
    const skeletonRows = Array.from({ length: 7 });

    return (
        <div className="space-y-4">
            <div
                className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2 lg:grid-cols-4"
                style={{
                    backgroundColor: withAlpha(color, 0.035),
                    borderColor: withAlpha(color, 0.14),
                }}
            >
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="rounded-xl border border-rose-100 bg-white px-4 py-4 shadow-sm">
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="mt-4 h-7 w-20 animate-pulse rounded bg-gray-200" />
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-rose-100">
                <div className="h-12 bg-rose-50" />
                <div className="divide-y divide-gray-100 bg-white">
                    {skeletonRows.map((_, idx) => (
                        <div key={idx} className="grid min-w-[900px] grid-cols-9 gap-3 px-4 py-3">
                            {Array.from({ length: 9 }).map((__, cellIdx) => (
                                <div
                                    key={cellIdx}
                                    className="h-4 animate-pulse rounded bg-gray-200"
                                    style={{ width: cellIdx === 1 || cellIdx === 2 ? "80%" : "55%" }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   FILTER DROPDOWN
========================================================= */

function FilterSelect({ label, value, onChange, options, getLabel, getValue, disabled, color }) {
    return (
        <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="h-11 rounded-lg border bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:ring-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                style={{ borderColor: withAlpha(color, 0.22), "--tw-ring-color": withAlpha(color, 0.18) }}
            >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                    <option key={getValue(opt)} value={getValue(opt)}>
                        {getLabel(opt)}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* =========================================================
   FILTERS BAR
========================================================= */

function FiltersBar({
    schools,
    programmes,
    departments,
    hasDepartment,
    batches,
    semesters,
    selected,
    onSelectSchool,
    onSelectProgramme,
    onSelectDepartment,
    onSelectBatch,
    onSelectSemester,
    onSearch,
    searching,
    color,
}) {
    return (
        <div
            className="mb-6 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-end sm:flex-wrap"
            style={{
                backgroundColor: withAlpha(color, 0.045),
                borderColor: withAlpha(color, 0.15),
            }}
        >
            <FilterSelect
                label="School"
                value={selected.school}
                onChange={onSelectSchool}
                options={schools}
                getLabel={(s) => s.school_name}
                getValue={(s) => s.id}
                color={color}
            />

            <FilterSelect
                label="Programme"
                value={selected.programme}
                onChange={onSelectProgramme}
                options={programmes}
                getLabel={(p) => p.programme_name}
                getValue={(p) => p.id}
                disabled={!selected.school}
                color={color}
            />

            {hasDepartment && (
                <FilterSelect
                    label="Department"
                    value={selected.department}
                    onChange={onSelectDepartment}
                    options={departments}
                    getLabel={(d) => d.department_name}
                    getValue={(d) => d.id}
                    disabled={!selected.programme}
                    color={color}
                />
            )}

            <FilterSelect
                label="Batch"
                value={selected.batch}
                onChange={onSelectBatch}
                options={batches}
                getLabel={(b) => b.batch_name}
                getValue={(b) => b.id}
                disabled={hasDepartment ? !selected.department : !selected.programme}
                color={color}
            />

            <FilterSelect
                label="Semester"
                value={selected.semester}
                onChange={onSelectSemester}
                options={semesters.map((s) => ({ id: s, name: `Semester ${s}` }))}
                getLabel={(s) => s.name}
                getValue={(s) => s.id}
                disabled={!selected.batch}
                color={color}
            />

            <button
                onClick={onSearch}
                disabled={searching}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{
                    backgroundColor: color,
                    boxShadow: `0 10px 18px ${withAlpha(color, 0.18)}`,
                }}
            >
                <Search size={17} />
                {searching ? "Searching..." : "Search"}
            </button>
        </div>
    );
}

/* =========================================================
   RESULT TABLE
========================================================= */

function ResultTable({ rows, subjects, color, selected }) {
    if (!rows || rows.length === 0) {
        return (
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 py-20 text-center text-gray-500">
                <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm"
                    style={{ color: darkenColor(color, 0.2) }}
                >
                    <BookOpen size={26} />
                </div>
                <p className="text-base font-bold text-gray-700">No Result Found</p>
                <p className="mt-1 text-sm text-gray-400">
                    Try selecting different filters and search again.
                </p>
            </div>
        );
    }

    const totalStudents = rows.length;
    const semesterCredits = rows[0]?.total_credits;
    const overallScores = rows
        .map((row) => toFiniteNumber(row.overall_total))
        .filter((score) => score !== null);
    const tgpaValues = rows
        .map((row) => toFiniteNumber(row.tgpa))
        .filter((tgpa) => tgpa !== null);
    const highestOverallScore =
        overallScores.length > 0 ? Math.max(...overallScores) : null;
    const averageTgpa =
        tgpaValues.length > 0
            ? tgpaValues.reduce((sum, tgpa) => sum + tgpa, 0) / tgpaValues.length
            : null;
    const isTranscript = rows.some((row) => row.result_source === "transcript");

    return (
        <div className="space-y-4">
            <div
                className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2 lg:grid-cols-4"
                style={{
                    backgroundColor: withAlpha(color, 0.035),
                    borderColor: withAlpha(color, 0.14),
                }}
            >
                <SummaryMetric label="Total Students" value={formatNumber(totalStudents)} icon={Users} color="#7f1d1d" />
                <SummaryMetric label="Highest Overall Score" value={formatNumber(highestOverallScore)} icon={Trophy} color="#b45309" />
                {isTranscript && (
                    <SummaryMetric label="Semester Credits" value={formatNumber(semesterCredits)} icon={BookOpen} color="#1d4ed8" />
                )}
                {isTranscript && (
                    <SummaryMetric label="Average TGPA" value={formatNumber(averageTgpa, 2)} icon={Award} color="#15803d" />
                )}
            </div>

            <ExportActions color={color} batchId={selected.batch} semester={selected.semester} />

            <div
                className="overflow-x-auto rounded-xl border max-h-[70vh] overflow-y-auto bg-white shadow-sm"
                style={{ borderColor: withAlpha(color, 0.18) }}
            >
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-rose-100 bg-rose-50">
                            <th
                                className="px-4 py-3.5 text-center text-sm font-bold text-gray-700 sticky left-0 z-20 min-w-[70px] bg-rose-50"
                            >
                                Rank
                            </th>
                            <th
                                className="px-4 py-3.5 text-left text-sm font-bold text-gray-700 sticky left-[70px] z-20 min-w-[130px] bg-rose-50"
                            >
                                Student ID
                            </th>
                            {subjects.map((sub) => (
                                <th
                                    key={sub}
                                    className="px-4 py-3.5 text-center text-sm font-bold text-gray-700 min-w-[130px] whitespace-nowrap"
                                >
                                    {sub}
                                </th>
                            ))}
                            <th className="px-4 py-3.5 text-center text-sm font-bold text-gray-700 min-w-[135px] whitespace-nowrap">
                                Overall Total
                            </th>
                            {isTranscript ? (
                                <>
                                    <th className="px-4 py-3.5 text-center text-sm font-bold text-gray-700 min-w-[95px] whitespace-nowrap">
                                        TGPA
                                    </th>
                                    <th className="px-4 py-3.5 text-center text-sm font-bold text-gray-700 min-w-[95px] whitespace-nowrap">
                                        CGPA
                                    </th>
                                </>
                            ) : (
                                <th className="px-4 py-3.5 text-center text-sm font-bold text-gray-700 min-w-[95px] whitespace-nowrap">
                                    Grade
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, idx) => {
                            const numericRank = Number(row.rank);
                            const isTopThree = [1, 2, 3].includes(numericRank);
                            const rowBg = numericRank === 1
                                ? "#fffbeb"
                                : numericRank === 2
                                    ? "#f8fafc"
                                    : numericRank === 3
                                        ? "#fff7ed"
                                        : idx % 2 === 0
                                            ? "#fff"
                                            : "#f9fafb";
                            const rowClass =
                                numericRank === 1
                                    ? "bg-amber-50 hover:bg-amber-100"
                                    : numericRank === 2
                                        ? "bg-slate-50 hover:bg-slate-100"
                                        : numericRank === 3
                                            ? "bg-orange-50 hover:bg-orange-100"
                                            : idx % 2 === 0
                                                ? "bg-white hover:bg-gray-50"
                                                : "bg-gray-50 hover:bg-gray-100";
                            const rankAccent =
                                numericRank === 1
                                    ? "#d97706"
                                    : numericRank === 2
                                        ? "#9ca3af"
                                        : numericRank === 3
                                            ? "#c2410c"
                                            : "transparent";
                            return (
                                <tr
                                    key={row.student_id}
                                    className={`border-t transition-colors duration-150 ${rowClass}`}
                                    style={{
                                        borderColor: "#e5e7eb",
                                        boxShadow: isTopThree ? `inset 3px 0 0 ${rankAccent}` : "none",
                                    }}
                                >
                                    <td
                                        className="px-3 py-3 text-center font-extrabold sticky left-0 tabular-nums"
                                        style={{
                                            backgroundColor: rowBg,
                                        }}
                                    >
                                        <RankBadge rank={row.rank} color={color} />
                                    </td>
                                    <td
                                        className="px-4 py-3 font-semibold text-gray-800 sticky left-[70px]"
                                        style={{
                                            backgroundColor: rowBg,
                                            borderRight: "1px solid #e5e7eb",
                                        }}
                                    >
                                        {row.student_id}
                                    </td>

                                    {subjects.map((sub) => (
                                        <td key={sub} className="px-3 py-3 text-center font-medium text-gray-700 tabular-nums">
                                            {formatNumber(row[sub])}
                                        </td>
                                    ))}

                                    <td
                                        className="px-4 py-3 text-center font-extrabold text-red-950 tabular-nums"
                                    >
                                        {formatNumber(row.overall_total)}
                                    </td>

                                    {isTranscript ? (
                                        <>
                                            <td className="px-3 py-3 text-center font-bold text-gray-800 tabular-nums">
                                                {formatNumber(row.tgpa, 2)}
                                            </td>
                                            <td className="px-3 py-3 text-center font-bold text-gray-800 tabular-nums">
                                                {formatNumber(row.cgpa, 2)}
                                            </td>
                                        </>
                                    ) : (
                                        <td className="px-3 py-3 text-center">
                                            <GradeBadge grade={row.grade} />
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* =========================================================
   PAGE
========================================================= */

export default function CombinedResult() {
    const { user } = useContext(AuthContext);
    const color = user?.color || "#ff7f10";
    const t = useTranslations("combinedResult");

    /* ── dropdown data ── */
    const [schools, setSchools] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [hasDepartment, setHasDepartment] = useState(true);
    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);

    /* ── selections ── */
    const [selected, setSelected] = useState({
        school: "",
        programme: "",
        department: "",
        batch: "",
        semester: "",
    });

    /* ── results ── */
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);

    /* dynamic subject columns — anything in a row that isn't a fixed key */
    const subjects =
        rows.length > 0
            ? Object.keys(rows[0]).filter((key) => !FIXED_KEYS.includes(key))
            : [];

    /* ── load schools on mount ── */
    useEffect(() => {
        axios
            .get(`/api/schools`, { params: { page: 1, limit: 0 }, withCredentials: true })
            .then((res) => setSchools(res.data.schools || []))
            .catch(() => toast.error("Failed to load schools"));
    }, []);

    /* ── cascading handlers ── */

    const handleSelectSchool = async (schoolId) => {
        setSelected({ school: schoolId, programme: "", department: "", batch: "", semester: "" });
        setProgrammes([]);
        setDepartments([]);
        setBatches([]);
        setSemesters([]);
        setRows([]);
        setSearched(false);

        if (!schoolId) return;

        try {
            const res = await axios.get(`/api/programmes/${schoolId}`, {
                params: { page: 1, limit: 0 },
                withCredentials: true,
            });
            setProgrammes(res.data.programmes || []);
        } catch {
            toast.error("Failed to load programmes");
        }
    };

    const handleSelectProgramme = async (programmeId) => {
        setSelected((prev) => ({
            ...prev,
            programme: programmeId,
            department: "",
            batch: "",
            semester: "",
        }));
        setDepartments([]);
        setBatches([]);
        setSemesters([]);
        setRows([]);
        setSearched(false);

        if (!programmeId) return;

        try {
            const res = await axios.get(`/api/departments/${programmeId}`, {
                params: { page: 1, limit: 0 },
                withCredentials: true,
            });
            const data = res.data.departments || [];
            const realDepts = data.filter((d) => d.id !== null && d.department_name !== null);
            setHasDepartment(realDepts.length > 0);

            if (realDepts.length > 0) {
                setDepartments(realDepts);
            } else {
                const batchRes = await axios.get(`/api/batches`, {
                    params: { page: 1, limit: 0, programme_id: programmeId },
                    withCredentials: true,
                });
                setBatches(batchRes.data.batches || []);
            }
        } catch {
            toast.error("Failed to load departments");
        }
    };

    const handleSelectDepartment = async (departmentId) => {
        setSelected((prev) => ({ ...prev, department: departmentId, batch: "", semester: "" }));
        setBatches([]);
        setSemesters([]);
        setRows([]);
        setSearched(false);

        if (!departmentId) return;

        try {
            const res = await axios.get(`/api/batches`, {
                params: { page: 1, limit: 0, department_id: departmentId },
                withCredentials: true,
            });
            setBatches(res.data.batches || []);
        } catch {
            toast.error("Failed to load batches");
        }
    };

    const handleSelectBatch = (batchId) => {
        setSelected((prev) => ({ ...prev, batch: batchId, semester: "" }));
        setRows([]);
        setSearched(false);

        const batchObj = batches.find((b) => b.id === batchId);

        const allSemesters = [...new Set(batchObj?.semesters || [])].sort((a, b) => a - b);
        setSemesters(allSemesters);
    };

    const handleSelectSemester = (sem) => {
        setSelected((prev) => ({ ...prev, semester: sem }));
        setRows([]);
        setSearched(false);
    };

    /* ── search ── */

    const handleSearch = async () => {
        if (!selected.batch || !selected.semester) {
            toast.error("Please select batch and semester");
            return;
        }

        setSearching(true);
        setLoading(true);
        setSearched(true);

        try {
            const res = await axios.get(`/api/combined-result`, {
                params: { batch_id: selected.batch, semester: selected.semester },
                withCredentials: true,
            });
            setRows(res.data?.data || []);
        } catch (err) {
            const msg = err?.response?.data?.error || "Failed to load combined result";
            toast.error(msg);
            setRows([]);
        } finally {
            setSearching(false);
            setLoading(false);
        }
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="min-h-screen" style={{ backgroundColor: withAlpha(color, 1) }}>
            <Navbar title={t ? t("title") : "Combined Result"} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[500px]">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: color }} />
                        <h2 className="text-lg font-bold text-gray-800">Combined Result</h2>
                    </div>

                    {/* Filters */}
                    <FiltersBar
                        schools={schools}
                        programmes={programmes}
                        departments={departments}
                        hasDepartment={hasDepartment}
                        batches={batches}
                        semesters={semesters}
                        selected={selected}
                        onSelectSchool={handleSelectSchool}
                        onSelectProgramme={handleSelectProgramme}
                        onSelectDepartment={handleSelectDepartment}
                        onSelectBatch={handleSelectBatch}
                        onSelectSemester={handleSelectSemester}
                        onSearch={handleSearch}
                        searching={searching}
                        color={color}
                    />

                    {/* Content */}
                    {loading ? (
                        <ResultSkeleton color={color} />
                    ) : !searched ? (
                        <div className="rounded-xl border border-rose-100 bg-rose-50/30 py-20 text-center text-gray-500">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-base font-bold text-gray-700">Select filters and click Search</p>
                            <p className="mt-1 text-sm text-gray-400">
                                Combined results for the selected semester will appear here.
                            </p>
                        </div>
                    ) : (
                        <ResultTable rows={rows} subjects={subjects} color={color} selected={selected} />
                    )}
                </div>
            </div>
        </div>
    );
}

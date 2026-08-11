"use client";

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/app/AuthContext";

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

/* =========================================================
   GRADE FIELD CONFIG  (fixed grades, only % editable)
========================================================= */

const GRADE_FIELDS = [
    { key: "a_plus_percentage", label: "A+" },
    { key: "a_percentage", label: "A" },
    { key: "a_minus_percentage", label: "A-" },

    { key: "b_plus_percentage", label: "B+" },
    { key: "b_percentage", label: "B" },
    { key: "b_minus_percentage", label: "B-" },

    { key: "c_plus_percentage", label: "C+" },
    { key: "c_percentage", label: "C" },
    { key: "c_minus_percentage", label: "C-" },

    { key: "d_percentage", label: "D" },
    { key: "u_percentage", label: "U" },
];

const EMPTY_FORM = GRADE_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

/* =========================================================
   GRADE ROW
========================================================= */

function GradeRow({ label, value, onChange, color }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl"
            style={{
                backgroundColor: withAlpha(color, 0.06),
                border: `1px solid ${withAlpha(color, 0.15)}`,
            }}
        >
            <span
                className="font-bold text-sm w-14 flex-shrink-0"
                style={{ color: darkenColor(color) }}
            >
                {label}
            </span>
            <div className="flex items-center gap-2 flex-1 justify-end">
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="0"
                    className="w-24 text-right px-3 py-2 rounded-lg border outline-none text-sm font-semibold transition-colors focus:ring-2"
                    style={{
                        borderColor: withAlpha(color, 0.3),
                    }}
                />
                <span className="text-sm text-gray-500 font-medium">%</span>
            </div>
        </div>
    );
}

/* =========================================================
   PAGE
========================================================= */

export default function RelativeGrading() {
    const { user } = useContext(AuthContext);
    const color = user?.color || "#ff7f10";
    const t = useTranslations("relativeGrading");

    const [form, setForm] = useState(EMPTY_FORM);
    const [recordId, setRecordId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    const universityId = user?.institute_id || user?.id || user?._id;

    /* ── load existing config ── */
    useEffect(() => {
        if (!universityId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        axios
            .get(`/api/relative-grading/${universityId}`, { withCredentials: true })
            .then((res) => {
                const data = res.data?.data;
                if (data) {
                    setForm({
                        a_plus_percentage: data.a_plus_percentage ?? "",
                        a_percentage: data.a_percentage ?? "",
                        a_minus_percentage: data.a_minus_percentage ?? "",

                        b_plus_percentage: data.b_plus_percentage ?? "",
                        b_percentage: data.b_percentage ?? "",
                        b_minus_percentage: data.b_minus_percentage ?? "",

                        c_plus_percentage: data.c_plus_percentage ?? "",
                        c_percentage: data.c_percentage ?? "",
                        c_minus_percentage: data.c_minus_percentage ?? "",

                        d_percentage: data.d_percentage ?? "",
                        u_percentage: data.u_percentage ?? "",
                    });
                    setRecordId(data.id);
                    setIsExisting(true);
                } else {
                    setForm(EMPTY_FORM);
                    setRecordId(null);
                    setIsExisting(false);
                }
            })
            .catch(() => toast.error("Failed to load grading configuration"))
            .finally(() => setLoading(false));
    }, [universityId]);

    /* ── derived total ── */
    const total = GRADE_FIELDS.reduce(
        (sum, f) => sum + (parseFloat(form[f.key]) || 0),
        0
    );
    const roundedTotal = Math.round(total * 100) / 100;
    const isValidTotal = roundedTotal === 100;

    const handleChange = (key, value) => {
        // allow only valid numeric input
        if (value !== "" && (isNaN(value) || Number(value) < 0)) return;
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
    };

    const handleSubmit = async () => {
        if (!isValidTotal) {
            toast.error(`Total percentage must equal 100% (currently ${roundedTotal}%)`);
            return;
        }

        const payload = GRADE_FIELDS.reduce(
            (acc, f) => ({ ...acc, [f.key]: parseFloat(form[f.key]) || 0 }),
            {}
        );

        setSaving(true);
        try {
            if (isExisting && recordId) {
                await axios.put(`/api/relative-grading/${recordId}`, payload, {
                    withCredentials: true,
                });
                toast.success("Relative grading configuration updated");
            } else {
                const res = await axios.post(`/api/relative-grading`, payload, {
                    withCredentials: true,
                });
                setRecordId(res.data?.id);
                setIsExisting(true);
                toast.success("Relative grading configuration saved");
            }
        } catch (err) {
            const msg = err?.response?.data?.error || "Failed to save configuration";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="min-h-screen" style={{ backgroundColor: withAlpha(color, 1) }}>
            <Navbar title={t ? t("title") : "Relative Grading"} />

            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[400px]">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: color }} />
                        <h2 className="text-lg font-bold text-gray-800">
                            Relative Grading Configuration
                        </h2>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 ml-4">
                        Define the percentage of students who will receive each grade,
                        based on class ranking. Total must equal 100%.
                    </p>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            {/* Grade rows */}
                            <div className="flex flex-col gap-2 mb-6">
                                {GRADE_FIELDS.map((f) => (
                                    <GradeRow
                                        key={f.key}
                                        label={f.label}
                                        value={form[f.key]}
                                        onChange={(val) => handleChange(f.key, val)}
                                        color={color}
                                    />
                                ))}
                            </div>

                            {/* Total bar */}
                            <div
                                className="flex items-center justify-between px-4 py-3 rounded-xl mb-6 font-bold text-sm"
                                style={{
                                    backgroundColor: isValidTotal
                                        ? "rgba(34,197,94,0.1)"
                                        : "rgba(239,68,68,0.1)",
                                    color: isValidTotal ? "#15803d" : "#b91c1c",
                                    border: `1.5px solid ${isValidTotal ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"
                                        }`,
                                }}
                            >
                                <span>Total Percentage</span>
                                <span>{roundedTotal}%{!isValidTotal && " — must equal 100%"}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleReset}
                                    className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition"
                                >
                                    Reset
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!isValidTotal || saving}
                                    className="px-6 py-2.5 rounded-xl text-white font-semibold shadow transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                                    style={{ backgroundColor: color }}
                                >
                                    {saving
                                        ? "Saving..."
                                        : isExisting
                                            ? "Update Configuration"
                                            : "Save Configuration"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
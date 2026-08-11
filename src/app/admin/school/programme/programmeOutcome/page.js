"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import * as XLSX from "xlsx";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

const Page = () => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const programmeId = searchParams.get("programmeId");

    const [loading, setLoading] = useState(true);
    const [poSaving, setPoSaving] = useState(false);
    const [parsing, setParsing] = useState(false);

    const [poList, setPoList] = useState([]);
    const [targets, setTargets] = useState([
        { min_percentage: "", max_percentage: "", comparision_percentage: "", level: "1" },
        { min_percentage: "", max_percentage: "", comparision_percentage: "", level: "2" },
        { min_percentage: "", max_percentage: "", comparision_percentage: "", level: "3" }
    ]);
    const [percentage, setPercentage] = useState("");
    const { user ,isLoading} = useContext(AuthContext);

    const fileInputRef = useRef(null);

    const maxCOLevel = 3;

    const calculatedTarget =
        percentage !== ""
            ? ((parseFloat(percentage) / 100) * maxCOLevel).toFixed(2)
            : "";

    /* ================= FETCH PROGRAMME ================= */

    const fetchProgramme = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `/api/programme/${programmeId}`,
                { withCredentials: true }
            );
            const programme = res.data.programme;
            if (!programme) { toast.error("Programme not found"); return; }
            setPoList(programme.po || []);
            setPercentage((programme.coAttainmentTarget * 100) / 3);
            if (programme.targets && programme.targets.length === 3) {
                setTargets(programme.targets);
            }
        } catch {
            toast.error("Failed to load programme");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (programmeId) fetchProgramme();
    }, [programmeId]);

    /* ================= FILE IMPORT ================= */

    /**
     * Expected file format (CSV or Excel):
     *
     *  | po_code  | description              |
     *  |----------|--------------------------|
     *  | PO1      | Apply knowledge of...    |
     *  | PSO1     | Demonstrate ability to.. |
     *
     * Column name variants accepted (case-insensitive):
     *   code column  → po_code | pso_code | code
     *   description  → description | desc | po_description | pso_description
     */
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = ""; // allow re-upload of same file

        const isExcel = /\.(xlsx|xls)$/i.test(file.name);
        const isCsv   = /\.csv$/i.test(file.name);

        if (!isExcel && !isCsv) {
            toast.error("Please upload a .csv, .xlsx, or .xls file");
            return;
        }

        setParsing(true);

        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const workbook  = XLSX.read(evt.target.result, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet     = workbook.Sheets[sheetName];

                // header: 1  →  gives us an array-of-arrays so we control header mapping
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

                if (rows.length < 2) {
                    toast.error("File is empty or has no data rows.");
                    setParsing(false);
                    return;
                }

                const headerRow = rows[0].map((h) => String(h).trim().toLowerCase());

                const codeIdx = headerRow.findIndex((h) =>
                    ["po_code", "pso_code", "code"].includes(h)
                );
                const descIdx = headerRow.findIndex((h) =>
                    ["description", "desc", "po_description", "pso_description"].includes(h)
                );

                if (codeIdx === -1 || descIdx === -1) {
                    toast.error(
                        'Columns not found. Expected "po_code" (or "pso_code" / "code") and "description" (or "desc").'
                    );
                    setParsing(false);
                    return;
                }

                const imported = [];
                for (let r = 1; r < rows.length; r++) {
                    const row  = rows[r];
                    const code = String(row[codeIdx] ?? "").trim();
                    const desc = String(row[descIdx] ?? "").trim();
                    if (!code) continue;
                    imported.push({ po_code: code, description: desc });
                }

                if (imported.length === 0) {
                    toast.error("No valid rows found in the file.");
                    setParsing(false);
                    return;
                }

                // Replace existing list with imported data
                setPoList(imported);
                toast.success(`✅ Imported ${imported.length} PO / PSO entries`);

            } catch (err) {
                console.error(err);
                toast.error("Failed to parse file. Check the format and try again.");
            } finally {
                setParsing(false);
            }
        };

        reader.onerror = () => {
            toast.error("Could not read file.");
            setParsing(false);
        };

        reader.readAsBinaryString(file);
    };

    /* ================= PO HANDLERS ================= */

    const handlePoChange = (index, field, value) => {
        const updated = [...poList];
        updated[index][field] = value;
        setPoList(updated);
    };

    const addMorePo = () => {
        setPoList([...poList, { po_code: "", description: "" }]);
    };

    const removePo = (index) => {
        setPoList(poList.filter((_, i) => i !== index));
    };

    const handleTargetChange = (index, field, value) => {
        const updated = [...targets];
        updated[index][field] = value;
        setTargets(updated);
    };

    /* ================= SAVE ================= */

    const handleSave = async () => {
        const validPOs = poList.filter(
            (po) => po.po_code?.trim() && po.description?.trim()
        );
        if (validPOs.length === 0) {
            toast.error("Please add at least one valid PO");
            return;
        }
        try {
            setPoSaving(true);
            await axios.put(
                `/api/programmes/po`,
                { programme_id: programmeId, po_list: validPOs, targets, coAttainmentTarget: calculatedTarget },
                { withCredentials: true }
            );
            toast.success("Saved successfully");
            router.back();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to save");
        } finally {
            setPoSaving(false);
        }
    };

    /* ================= LEVEL CONFIG ================= */

    const levelConfig = {
        "3": { label: "Level 3", color: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-600", dot: "bg-green-400" },
        "2": { label: "Level 2", color: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-[#ff7f10]", dot: "bg-orange-400" },
        "1": { label: "Level 1", color: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-600", dot: "bg-red-400" },
    };

    /* ================= UI ================= */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#ff7f10]">
                <Navbar title="Manage PO" />
                <div className="p-10 flex justify-center"><Spinner /></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: user?.color || "#ff7f10"}}>
            <Navbar title="Manage Programme Outcomes" />

            <div className="p-6 mx-4 rounded-xl">

                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-1 transition"
                        >
                            ← Back to Programmes
                        </button>
                        <h2 className="text-white text-2xl font-bold">Programme Outcomes</h2>
                        <p className="text-orange-100 text-sm mt-0.5">
                            Define POs and attainment target levels
                        </p>
                    </div>
                </div>

                {/* ===== PO SECTION ===== */}
                <div className="bg-white rounded-xl shadow overflow-hidden mb-5">

                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 text-base">Programme Outcomes (POs &amp; PSOs)</h3>
                            <p className="text-gray-400 text-sm mt-0.5">Add manually or import from a CSV / Excel file</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-orange-50 text-[#ff7f10] border border-orange-200 rounded-full text-xs font-semibold">
                                {poList.length} entr{poList.length !== 1 ? "ies" : "y"}
                            </span>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            {/* Import button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={parsing}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg ${user?.color ? "hover:bg-green-600":"hover:bg-orange-600"} disabled:opacity-60 transition`}
                                style={{backgroundColor: user?.color || "#ff7f10"}}
                            >
                                {parsing ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Parsing…
                                    </>
                                ) : (
                                    <>📂 Import CSV / Excel</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Format hint */}
                    <div className="px-6 pt-3 pb-0 flex items-start gap-2">
                        <span className="text-gray-400 text-xs mt-0.5">ℹ️</span>
                        <p className="text-xs text-gray-800 leading-relaxed">
                            File must have columns&nbsp;
                            <code className="bg-gray-100 border border-gray-200 px-1 rounded text-orange-600">po_code</code>
                            &nbsp;(or&nbsp;
                            <code className="bg-gray-100 border border-gray-200 px-1 rounded text-orange-600">pso_code</code>
                            )&nbsp;and&nbsp;
                            <code className="bg-gray-100 border border-gray-200 px-1 rounded text-orange-600">description</code>.
                            &nbsp;Both PO and PSO rows are imported into the same list. Importing will replace the current list.
                        </p>
                    </div>

                    <div className="px-6 py-5 space-y-3">

                        {poList.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-3xl mb-2">🎯</p>
                                <p className="text-gray-500 text-sm font-medium">No POs added yet</p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Click &ldquo;Add PO&rdquo; below or import a file
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Column headers */}
                                <div className="grid grid-cols-12 gap-3 px-1">
                                    <div className="col-span-2 text-xs font-medium text-gray-800">PO / PSO Code</div>
                                    <div className="col-span-9 text-xs font-medium text-gray-800">Description</div>
                                </div>

                                {poList.map((po, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-3 items-start">
                                        <input
                                            placeholder="e.g. PO1 / PSO1"
                                            value={po.po_code}
                                            onChange={(e) => handlePoChange(index, "po_code", e.target.value)}
                                            className={`col-span-2 p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300":"focus:ring-orange-300"} text-gray-800`}
                                        />
                                        <textarea
                                            rows={2}
                                            placeholder="Describe what students will achieve..."
                                            value={po.description}
                                            onChange={(e) => handlePoChange(index, "description", e.target.value)}
                                            className={`col-span-9 p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300":"focus:ring-orange-300"}  resize-none text-gray-800`}
                                        />
                                        <button
                                            onClick={() => removePo(index)}
                                            disabled={poList.length === 1}
                                            className="col-span-1 flex items-center justify-center w-9 h-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed mt-0.5"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}

                        <button
                            onClick={addMorePo}
                            className={`w-full py-2.5 border-2 border-dashed ${user?.color ? "border-green-200 hover:bg-green-50" : "border-orange-200 hover:bg-orange-50"} rounded-xl text-sm font-medium transition mt-2`}
                            style={{color: user?.color || "#ff7f10"}}
                        >
                            + Add PO / PSO
                        </button>
                    </div>
                </div>

                {/* ===== TARGET LEVELS SECTION ===== */}
                <div className="bg-white rounded-xl shadow overflow-hidden mb-5">

                    <div className="px-6 py-4 border-b">
                        <h3 className="font-bold text-gray-800 text-base">Attainment Target Levels</h3>
                        <p className="text-gray-400 text-sm mt-0.5">
                            Define the percentage ranges for each attainment level
                        </p>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {targets.map((target, index) => {
                            const lvl = String(target.level || index + 1);
                            const config = levelConfig[lvl] || levelConfig["1"];

                            return (
                                <div key={index} className={`border-2 rounded-xl p-5 ${config.color}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${config.badge}`}>
                                            {config.label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Percentage (≥)</label>
                                            <div className="relative">
                                                <input type="number" placeholder="e.g. 60" value={target.min_percentage}
                                                    onChange={(e) => handleTargetChange(index, "min_percentage", e.target.value)}
                                                    className={`w-full p-2.5 pr-8 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300":"focus:ring-orange-300"} text-gray-800`} />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Percentage (&lt;)</label>
                                            <div className="relative">
                                                <input type="number" placeholder="e.g. 75" value={target.max_percentage}
                                                    onChange={(e) => handleTargetChange(index, "max_percentage", e.target.value)}
                                                    className={`w-full p-2.5 pr-8 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300":"focus:ring-orange-300"} text-gray-800`} />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Comparison Percentage</label>
                                            <div className="relative">
                                                <input type="number" placeholder="e.g. 70" value={target.comparision_percentage}
                                                    onChange={(e) => handleTargetChange(index, "comparision_percentage", e.target.value)}
                                                    className={`w-full p-2.5 pr-8 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-300":"focus:ring-orange-300"} text-gray-800`} />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ===== CO ATTAINMENT TARGET ===== */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-100">
                    <div className="px-6 py-4 border-b">
                        <h3 className="font-bold text-gray-800 text-base">CO Attainment Target Percentage</h3>
                        <p className="text-gray-500 text-sm mt-0.5">Define the target percentage for CO attainment</p>
                    </div>

                    <div className="px-6 py-6 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Enter Target Percentage (%)</label>
                            <input
                                type="number" min="0" max="100"
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                placeholder="Enter percentage (e.g., 70)"
                                className={`w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${user?.color ? "focus:ring-green-500 focus:border-green-500 hover:border-green-300":"focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300"}`}
                            />
                        </div>

                        {percentage !== "" && (
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl transition-all duration-300">
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-600 font-semibold">Entered Percentage</p>
                                    <span className="font-semibold text-gray-800">{percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-sm text-gray-600">Target for CO Attainment (Out of 3)</p>
                                    <span className="font-bold text-orange-600 text-lg">{calculatedTarget} / 3</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== ACTIONS ===== */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-white/40 rounded-lg text-white hover:bg-white/10 text-sm font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={poSaving}
                        onClick={handleSave}
                        className={`px-6 py-2 bg-white rounded-lg text-sm font-bold ${user?.color ? "hover:bg-green-50":"hover:bg-orange-50"} transition disabled:opacity-60 shadow`}
                        style={{color: user?.color || "#ff7f10"}}
                    >
                        {poSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Page;
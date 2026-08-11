"use client";

import React, { useEffect, useState, useRef,useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import * as XLSX from "xlsx";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/app/AuthContext";
const Page = () => {
  const { user } = useContext(AuthContext);

  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subject");

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [parsing, setParsing]   = useState(false);

  const [programmePOs, setProgrammePOs] = useState([]);
  const [showMatrix, setShowMatrix]     = useState(false);
  const [matrix, setMatrix]             = useState({});

  const t = useTranslations("subjectDetails");
  const tc = useTranslations("common");

  const [subjectForm, setSubjectForm] = useState({
    subject_name: "",
    subject_code: "",
    teaching_periods: "",
    credits: ""
  });

  const [coList, setCoList] = useState([
    { co_code: "", description: "" }
  ]);

  const excelInputRef = useRef(null);

  /* ================= FETCH SUBJECT ================= */

  const fetchSubject = async () => {
    try {
      const res = await axios.get(
        `/api/subject/${subjectId}`,
        { withCredentials: true }
      );

      const subject = res.data.subject;

      setSubjectForm({
        subject_name:     subject.subject_name     || "",
        subject_code:     subject.subject_code     || "",
        teaching_periods: subject.teaching_periods || "",
        credits:          subject.credits          || ""
      });

      if (subject.co?.length) setCoList(subject.co);

      if (subject.co_po_matrix && Object.keys(subject.co_po_matrix).length > 0) {
        setMatrix(subject.co_po_matrix);
        setShowMatrix(true);
      }

    } catch {
      toast.error("Failed to load subject");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH PROGRAMME PO ================= */

  const fetchProgrammePOs = async () => {
    try {
      const res = await axios.get(
        `/api/programmes_po_target/${subjectId}`,
        { withCredentials: true }
      );
      setProgrammePOs(res.data.po || []);
    } catch {
      toast.error("Failed to fetch programme POs");
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
      fetchProgrammePOs();
    }
  }, [subjectId]);

  /* ================= EXCEL UPLOAD ================= */

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-uploaded if needed
    e.target.value = "";

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook  = XLSX.read(evt.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet     = workbook.Sheets[sheetName];

        // Convert to array-of-arrays (raw) to inspect headers
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (rows.length < 2) {
          toast.error("Excel file is empty or has no data rows.");
          setParsing(false);
          return;
        }

        // ── Parse header row ─────────────────────────────────────────────────
        // Expected:  co_code | co_description | PO1 | PO2 | PO3 | ...
        // Column names are flexible — first col = CO code, second = description,
        // rest = PO columns whose headers must match po_code values.
        const headerRow = rows[0].map((h) => String(h).trim());

        // Find PO columns — any header that is not col-0 or col-1
        // We match them against programmePOs if available; otherwise use as-is.
        const poColumnsInExcel = headerRow.slice(2); // ["PO1","PO2","PO3",...]

        // ── Parse data rows ──────────────────────────────────────────────────
        const newCoList = [];
        const newMatrix = {};

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];

          const coCode = String(row[0] || "").trim();
          const coDesc = String(row[1] || "").trim();

          if (!coCode) continue; // skip empty rows

          newCoList.push({ co_code: coCode, description: coDesc, threshold: 0 });

          // Build matrix row for this CO
          newMatrix[coCode] = {};
          poColumnsInExcel.forEach((poHeader, colIdx) => {
            const cellVal  = row[2 + colIdx];
            const numVal   = Number(cellVal);
            const safeVal  = isNaN(numVal) ? 0 : Math.min(3, Math.max(0, numVal));
            newMatrix[coCode][poHeader] = safeVal;
          });
        }

        if (newCoList.length === 0) {
          toast.error("No valid CO rows found. Check your Excel format.");
          setParsing(false);
          return;
        }

        setCoList(newCoList);
        setMatrix(newMatrix);
        setShowMatrix(true);

        toast.success(
          `Imported ${newCoList.length} COs with ${poColumnsInExcel.length} PO columns.`
        );

      } catch (err) {
        console.error(err);
        toast.error("Failed to parse Excel file. Check the format and try again.");
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

  /* ================= CO HANDLERS ================= */

  const handleCoChange = (index, field, value) => {
    const updated = [...coList];
    updated[index][field] = value;
    setCoList(updated);
  };

  const addMoreCo = () => {
    setCoList([...coList, { co_code: "", description: "", threshold: 0 }]);
  };

  const removeCo = (index) => {
    const updated = coList.filter((_, i) => i !== index);
    setCoList(updated);
  };

  /* ================= CREATE MATRIX ================= */

  const generateMatrix = () => {
    const newMatrix = {};
    coList.forEach((co) => {
      if (!co.co_code?.trim()) return;
      newMatrix[co.co_code] = {};
      programmePOs.forEach((po) => {
        newMatrix[co.co_code][po.po_code] =
          matrix?.[co.co_code]?.[po.po_code] ?? 0;
      });
    });
    setMatrix(newMatrix);
    setShowMatrix(true);
  };

  const handleMatrixChange = (coCode, poCode, value) => {
    setMatrix((prev) => ({
      ...prev,
      [coCode]: {
        ...prev[coCode],
        [poCode]: Number(value),
      },
    }));
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    const validCOs = coList.filter(
      (co) => co.co_code?.trim() && co.description?.trim()
    );

    try {
      setSaving(true);
      await axios.put(
        `/api/subjects/${subjectId}`,
        { ...subjectForm, co_list: validCOs, co_po_matrix: matrix },
        { withCredentials: true }
      );
      toast.success("Subject saved successfully");
      router.back();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div>
        <Navbar title="Subject Details" />
        <Spinner />
      </div>
    );
  }

  // Determine which PO columns to show in the matrix table.
  // If we imported from Excel, use the keys from the first CO row.
  // Otherwise fall back to programmePOs from the API.
  const matrixPOKeys = (() => {
    const firstCoKey = Object.keys(matrix)[0];
    if (firstCoKey && Object.keys(matrix[firstCoKey] || {}).length > 0) {
      return Object.keys(matrix[firstCoKey]);
    }
    return programmePOs.map((po) => po.po_code);
  })();

  return (
    <div className="min-h-screen " style={{ backgroundColor: user?.color || "#cc6600", minHeight: "100vh" }}>
      <Navbar title={t("title")} />

      {/* Back Button */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-10 py-4">
        <button
          onClick={() => router.back()}
           style={{ color: user?.color || "#cc6600",}}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-orange-500 rounded hover:bg-orange-100"
        >
          <FaArrowLeft />
          {tc("back")}
        </button>
      </div>

      {/* Main Container */}
      <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow">

        {/* ── Excel Upload Banner ─────────────────────────────────────────── */}
        <div   style={{ backgroundColor: (user?.color)+"20",borderColor:user?.color }} className="mb-6 border-2 border-dashed  rounded-xl bg-orange-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">
                {t("importTitle")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {t("importNote")}
                &nbsp;
                <code className="bg-white border border-gray-200 px-1 rounded text-orange-600">
                  co_code
                </code>
                &nbsp;
                <code className="bg-white border border-gray-200 px-1 rounded text-orange-600">
                  co_description
                </code>
                &nbsp;
                <code className="bg-white border border-gray-200 px-1 rounded text-orange-600">
                  PO1&nbsp;PO2&nbsp;PO3&nbsp;…
                </code>
                &nbsp;{t("importNote2")}
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelUpload}
            />

            <button
              onClick={() => excelInputRef.current?.click()}
              disabled={parsing}
               style={{ backgroundColor: user?.color || "#cc6600",}}
              className="flex items-center rounded gap-2 px-4 py-2 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
            >
              {parsing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("parsing")}
                </>
              ) : (
                <>
                  <span>📂</span>
                  {t("uploadExcel")}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── CO Section ─────────────────────────────────────────────────── */}
        <h2 className="text-lg text-gray-500 font-semibold mb-4">{t("courseOutcomes")}</h2>

        <div className="space-y-3">
          {coList.map((co, index) => (
            <div key={index} className="border p-3 rounded bg-gray-50 relative">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  placeholder={t("coCode")}
                  value={co.co_code}
                  onChange={(e) => handleCoChange(index, "co_code", e.target.value)}
                  className="p-2 border rounded w-full"
                />
                <input
                  placeholder={t("coDescription")}
                  value={co.description}
                  onChange={(e) => handleCoChange(index, "description", e.target.value)}
                  className="md:col-span-4 p-2 border rounded w-full"
                />
              </div>
              {coList.length > 1 && (
                <button
                  onClick={() => removeCo(index)}
                  className="absolute top-2 right-2 text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add CO */}
        <button
          onClick={addMoreCo}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {t("addMoreCO")}
        </button>

        {/* Generate Matrix Button */}
        <div className="mt-8">
          <button
            onClick={generateMatrix}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
           {showMatrix ? t("regenerateMatrix") : t("createMatrix")}
          </button>
        </div>

        {/* ── Matrix Table ────────────────────────────────────────────────── */}
        {showMatrix && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-gray-400">CO \ PO</th>
                  {matrixPOKeys.map((poKey) => (
                    <th key={poKey} className="border p-2">{poKey}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coList
                  .filter((co) => co.co_code?.trim())
                  .map((co) => (
                    <tr key={co.co_code}>
                      <td className="border p-2 font-medium">{co.co_code}</td>
                      {matrixPOKeys.map((poKey) => (
                        <td key={poKey} className="border p-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={3}
                            value={matrix?.[co.co_code]?.[poKey] ?? 0}
                            onChange={(e) =>
                              handleMatrixChange(co.co_code, poKey, e.target.value)
                            }
                            className="w-16 p-1 border rounded text-center"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
            <p className="text-sm text-gray-500 mt-2">
             {t("mappingNote")}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded">
            {tc("cancel")}
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
              style={{ backgroundColor: user?.color || "#cc6600",}}
            className=" text-white px-6 py-2 rounded"
          >
            {saving ? tc("saving") : tc("save")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Page;
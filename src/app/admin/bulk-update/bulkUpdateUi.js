"use client";

import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

// Small helpers and a dialog shared by the two Bulk Update pages.

export const FIELD_LABELS = {
  name: "Name",
  father_name: "Father Name",
  dob: "Date of Birth",
  contact_no: "Contact No",
};

// The backend answers errors as {detail: "text"} or {detail: {message, rows}}.
export function errorText(err, fallback) {
  const data = err?.response?.data;
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg).filter(Boolean).join(" ") || fallback;
  return data?.error || data?.message || fallback;
}

// A 409 carries {message, rows}: the rows are the students that stopped the update.
export function conflictRows(err) {
  const rows = err?.response?.data?.detail?.rows;
  return Array.isArray(rows) ? rows : [];
}

export function show(value) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

export function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

// A centred dialog. Escape and a click on the dark background close it, unless it is busy.
export function Modal({ title, onClose, busy = false, children, footer }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>
        <div className="px-6 py-5 text-sm text-gray-700 space-y-3">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

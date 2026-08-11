"use client";

import { RichEditorPane } from "./RichEditorPane";
import { withAlpha, darkenColor } from "@/lib/question-paper/colorHelpers";
import { useState } from "react";

export default function EditorStage({
  color,
  editorContent,
  setEditorContent,
  previewHtml,
  previewMeta,
  docxBase64,
  generationMeta,
  docxFilename,
  isDownloading,
  isSaving,
  isSaved,
  onReset,
  onDownloadDocx,
  onSave,
  t,
}) {
  const hasDiagrams = editorContent.includes("<<<DIAGRAM>>>");
  const canDownload = !!(docxBase64 || generationMeta?.fileUrl);
    const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-3">
      {/* ── Toolbar ── */}
      <Toolbar
        color={color}
        previewMeta={previewMeta}
        canDownload={canDownload}
        isDownloading={isDownloading}
        isSaving={isSaving}
        isSaved={isSaved}
        onReset={onReset}
        onDownloadDocx={onDownloadDocx}
        onSave={onSave}
        t={t}
      />

      {/* ── Save info strip ── */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs"
        style={{
          backgroundColor: withAlpha(color, 0.07),
          border: `1px solid ${withAlpha(color, 0.2)}`,
          color: darkenColor(color),
        }}
      >
        <span>💡</span>
        <span>
          <strong>{t("save")}</strong> {t("saveInfo")}
          <strong className="ml-1">{t("mustSelectFilters")}</strong>
        </span>
      </div>

      {/* ── Diagram notice ── */}
      {hasDiagrams && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-700">
          <span>⚠️</span>
          <span>
            Diagram blocks are stripped from the text preview but will be rendered
            correctly in the downloaded DOCX.
          </span>
        </div>
      )}

      {/* ── Split pane ── */}
      <div className="grid grid-cols-1 gap-4" style={{ minHeight: 620 }}>
        {/* LEFT: Rich Text Editor */}
        <div className="flex flex-col rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
       <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 shrink-0">
  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-3.5 h-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 4h12M2 7h8M2 10h10M2 13h6"
      />
    </svg>

    <span>{t("editor")}</span>
  </div>

  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-500">
      Rich editor • Tables supported
    </span>

    <button
      onClick={() => setShowPreview((p) => !p)}
      className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700"
    >
      {showPreview ? "Hide Preview" : "Preview"}
    </button>
  </div>
</div>
        <RichEditorPane
  showPreview={showPreview}
  editorContent={editorContent}
  setEditorContent={setEditorContent}
  previewMeta={previewMeta}
/>
      {/* ↑↑ END OF CHANGE ↑↑ */}
        </div>

      
      </div>

      {/* ── Footer hint ── */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1 pb-2">
        <span>✏️ {t("editPreviewHint")}</span>
        <span>💾 {t("saveAutoConvert")} &amp; {t("uploads")}</span>
      </div>
    </div>
  );
}

// ── Toolbar ──────────────────────────────────────────────────────────────────
function Toolbar({
  color,
  previewMeta,
  canDownload,
  isDownloading,
  isSaving,
  isSaved,
  onReset,
  onDownloadDocx,
  onSave,
  t,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
      {/* Left: paper title + tags */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-gray-700 text-sm font-semibold">
          {previewMeta.subjectName || "Question Paper"}
        </span>
        {[
          previewMeta.examType,
          previewMeta.semester ? `Sem ${previewMeta.semester}` : null,
        ]
          .filter(Boolean)
          .map((label) => (
            <span
              key={label}
              className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full"
            >
              {label}
            </span>
          ))}
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2">
        {/* Regenerate */}
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 transition"
        >
          {t("regenerate")}
        </button>

        {/* Download DOCX */}
        <button
          onClick={onDownloadDocx}
          disabled={!canDownload || isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition"
        >
          {isDownloading ? (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 11.5l-4.5-4.5H6V2h4v5h2.5L8 11.5z" />
              <path d="M2 13.5h12V15H2z" />
            </svg>
          )}
          {t("downloadDocx")}
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-60"
          style={
            isSaved
              ? { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }
              : { backgroundColor: color, color: "#fff" }
          }
          onMouseEnter={(e) => {
            if (!isSaved) e.currentTarget.style.backgroundColor = darkenColor(color, 0.15);
          }}
          onMouseLeave={(e) => {
            if (!isSaved) e.currentTarget.style.backgroundColor = color;
          }}
        >
          {isSaving ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing…
            </>
          ) : isSaved ? (
            <>✓ {t("saved")}</>
          ) : (
            <>
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M2.5 1A1.5 1.5 0 001 2.5v11A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5V6.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 009.378 1H2.5zm7 1.5a.5.5 0 01.5.5V6h-6V3h5.5zm-5.5 7h7v2.5h-7V9.5z" />
              </svg>
              {t("save")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}


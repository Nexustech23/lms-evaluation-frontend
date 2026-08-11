"use client";
import { withAlpha } from "@/lib/question-paper/colorHelpers";

/**
 * Drag-and-drop / click-to-upload zone for the main question-bank file.
 *
 * Props:
 *   color         – brand hex
 *   file          – current File object (or null)
 *   isDragging    – boolean
 *   inputRef      – ref forwarded to hidden <input>
 *   accept        – string of accepted file types (e.g. ".pdf,.doc,.docx,…")
 *   onDragOver    – handler
 *   onDragLeave   – handler
 *   onDrop        – handler
 *   onFileChange  – handler for <input onChange>
 *   uploadLabel   – JSX shown when no file selected
 *   uploadSub     – sub-text shown when no file selected
 *   replaceLabel  – text shown when a file is already selected
 */
export default function DropZone({
  color,
  file,
  isDragging,
  inputRef,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.md,.odt",
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  uploadLabel,
  uploadSub,
  replaceLabel,
}) {
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer py-12 transition-all"
      style={{
        borderColor: isDragging ? color : file ? withAlpha(color, 0.6) : "#e5e7eb",
        background:  isDragging || file ? withAlpha(color, 0.05) : "white",
      }}
    >
      {file ? (
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg mx-auto mb-2"
            style={{ backgroundColor: withAlpha(color, 0.15), color }}
          >
            ✓
          </div>
          <p className="font-semibold text-gray-700 text-sm">{file.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {(file.size / 1024).toFixed(1)} KB · {replaceLabel}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-3xl mb-2">📤</div>
          <p className="text-sm text-gray-500">{uploadLabel}</p>
          <p className="text-xs text-gray-400 mt-0.5">{uploadSub}</p>
        </div>
      )}

      {/* accept is now dynamic — no longer hardcoded to ".pdf" */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
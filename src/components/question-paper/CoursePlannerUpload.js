"use client";
import { withAlpha } from "@/lib/question-paper/colorHelpers";

/**
 * Optional course-planner PDF upload strip (compact, inline).
 *
 * Props:
 *   color                      – brand hex
 *   coursePlannerFile          – File | null
 *   setCoursePlannerFile       – setter
 *   isCoursePlannerDragging    – boolean
 *   setIsCoursePlannerDragging – setter
 *   coursePlannerInputRef      – ref for hidden <input>
 *   handleCoursePlannerDrop    – drop handler
 */
export default function CoursePlannerUpload({
  color,
  coursePlannerFile,
  setCoursePlannerFile,
  isCoursePlannerDragging,
  setIsCoursePlannerDragging,
  coursePlannerInputRef,
  handleCoursePlannerDrop,
}) {
  return (
    <>
      <div
        onClick={() => coursePlannerInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsCoursePlannerDragging(true);
        }}
        onDragLeave={() => setIsCoursePlannerDragging(false)}
        onDrop={handleCoursePlannerDrop}
        className="flex items-center gap-3 rounded-xl border border-dashed cursor-pointer px-4 py-3.5 transition-all"
        style={{
          borderColor: isCoursePlannerDragging
            ? color
            : coursePlannerFile
              ? withAlpha(color, 0.6)
              : "#e5e7eb",
          background:
            isCoursePlannerDragging || coursePlannerFile
              ? withAlpha(color, 0.06)
              : "white",
        }}
      >
        {coursePlannerFile ? (
          <>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: withAlpha(color, 0.15), color }}
            >
              ✓
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {coursePlannerFile.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(coursePlannerFile.size / 1024).toFixed(1)} KB · Click to
                replace
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCoursePlannerFile(null);
                if (coursePlannerInputRef.current)
                  coursePlannerInputRef.current.value = "";
              }}
              className="text-gray-300 hover:text-red-400 transition text-xl leading-none px-1"
            >
              ×
            </button>
          </>
        ) : (
          <>
            <div className="text-2xl">📄</div>
            <div>
              <p className="text-sm text-gray-500">
                <span style={{ color }} className="font-medium">
                  Upload course planner
                </span>{" "}
                or drag &amp; drop
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                PDF, DOC, DOCX only · Max 10 MB
              </p>
            </div>
          </>
        )}

        <input
          ref={coursePlannerInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ];

              const allowedExtensions = [".pdf", ".doc", ".docx"];

              const fileName = file.name.toLowerCase();
              const hasValidExtension = allowedExtensions.some((ext) =>
                fileName.endsWith(ext),
              );

              if (allowedTypes.includes(file.type) || hasValidExtension) {
                setCoursePlannerFile(file);
              } else {
                alert("Please upload a PDF, DOC, or DOCX file.");
              }
            }
          }}
        />
      </div>

      {coursePlannerFile && (
        <p className="text-xs mt-2 flex items-center gap-1" style={{ color }}>
          <span>💡</span>
          AI will read this planner and map questions to covered topics &amp;
          units.
        </p>
      )}
    </>
  );
}

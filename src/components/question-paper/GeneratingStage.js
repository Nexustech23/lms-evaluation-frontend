"use client";
import { withAlpha } from "@/lib/question-paper/colorHelpers";
import { ALL_STEPS }  from "@/lib/question-paper/constants";

/**
 * Stage 3 — shown while the AI is generating the paper.
 *
 * Props:
 *   color             – brand hex
 *   inputMode         – "pdf" | "prompt"
 *   coursePlannerFile – File | null  (controls whether planner step shows)
 *   generationStep    – current step key from backend poll
 *   t                 – createQuestionPaper-Prompt i18n namespace
 */
export default function GeneratingStage({
  color,
  inputMode,
  coursePlannerFile,
  generationStep,
  t,
}) {
  // Filter steps relevant to this generation run
  const visibleSteps = ALL_STEPS.filter(({ key }) => {
    if (key === "extracting_question_bank"  && inputMode !== "pdf") return false;
    if (key === "extracting_course_planner" && !coursePlannerFile)  return false;
    return true;
  });

  const stepKeys   = visibleSteps.map((s) => s.key);
  const currentIdx = stepKeys.indexOf(generationStep);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      {/* Spinner ring */}
      <div className="relative w-20 h-20">
        <div
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: withAlpha(color, 0.15) }}
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent animate-spin"
          style={{
            borderRightColor: color,
            borderLeftColor:  withAlpha(color, 0.4),
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          📄
        </div>
      </div>

      {/* Heading */}
      <div className="text-center">
        <p className="text-lg font-bold text-gray-800 mb-1">{t("generating")}</p>
        <p className="text-gray-400 text-sm">
          {inputMode === "pdf" ? t("generatingPdf") : t("generatingPrompt")}
        </p>
        {coursePlannerFile && (
          <p className="text-xs font-medium mt-1" style={{ color }}>
            📘 Aligning with course planner…
          </p>
        )}
        <p className="text-xs font-medium mt-1" style={{ color }}>
          {t("wait")}
        </p>
      </div>

      {/* Step list */}
      <div className="w-full max-w-xs space-y-2">
        {visibleSteps.map(({ key, label }, idx) => {
          const isDone   = idx < currentIdx;
          const isActive = key === generationStep;

          return (
            <div key={key} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-all"
                style={
                  isDone
                    ? { backgroundColor: "#dcfce7", color: "#16a34a" }
                    : isActive
                      ? { backgroundColor: withAlpha(color, 0.15), color }
                      : { backgroundColor: "#f3f4f6", color: "#9ca3af" }
                }
              >
                {isDone ? "✓" : isActive ? "…" : "○"}
              </div>
              <span
                className="text-sm transition-all"
                style={
                  isDone
                    ? { color: "#16a34a" }
                    : isActive
                      ? { color, fontWeight: 600 }
                      : { color: "#d1d5db" }
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bounce dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: color, animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </div>
    </div>
  );
}
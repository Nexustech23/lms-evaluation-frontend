"use client";

import { useMemo, useState } from "react";
import { Eye, Headphones, BookOpen, Hand, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const STYLES = [
  { key: "visual", label: "Visual", desc: "Diagrams, structure, spatial layout", icon: Eye, color: "#6C63FF" },
  { key: "auditory", label: "Auditory", desc: "Narrated, conversational explanations", icon: Headphones, color: "#43C6AC" },
  { key: "reading", label: "Reading", desc: "Dense, reference-style text", icon: BookOpen, color: "#F7971E" },
  { key: "kinesthetic", label: "Kinesthetic", desc: "Hands-on, action-oriented practice", icon: Hand, color: "#FF6584" },
];

const DIFFICULTIES = [
  { key: "Easy", label: "Easy", desc: "Simple language, extra scaffolding" },
  { key: "Moderate", label: "Moderate", desc: "Balanced clarity and depth" },
  { key: "Difficult", label: "Difficult", desc: "Advanced, technical, terse" },
];

const DEFAULT_BLEND = { visual: 25, auditory: 25, reading: 25, kinesthetic: 25 };

/**
 * Full-screen 2-step picker: VARK % blend, then difficulty. Auto-fills the
 * deficit into the smallest other slider when the total drops under 100
 * (so a single drag always keeps the set balanced); blocks "Continue" with
 * a banner when the total exceeds 100 instead of auto-correcting, since
 * silently shrinking sliders the user didn't touch is more confusing than
 * asking them to fix it themselves.
 */
export default function VarkDifficultyPicker({ initialBlend, initialDifficulty, onComplete, completeLabel = "Start Studying" }) {
  const [step, setStep] = useState("vark"); // "vark" | "difficulty"
  const [blend, setBlend] = useState(initialBlend || DEFAULT_BLEND);
  const [difficulty, setDifficulty] = useState(initialDifficulty || "Moderate");

  const total = useMemo(
    () => blend.visual + blend.auditory + blend.reading + blend.kinesthetic,
    [blend]
  );
  const isOver = total > 100;

  const handleSlide = (key, value) => {
    const nextValue = Math.max(0, Math.min(100, value));
    const others = STYLES.map((s) => s.key).filter((k) => k !== key);
    const otherTotal = others.reduce((sum, k) => sum + blend[k], 0);
    const proposedTotal = nextValue + otherTotal;

    if (proposedTotal <= 100) {
      // Under (or exactly at) 100 — auto-fill the deficit into the smallest
      // other field so the set stays balanced without the user manually
      // topping it up every time.
      const deficit = 100 - proposedTotal;
      if (deficit > 0) {
        const smallestKey = others.reduce((a, b) => (blend[a] <= blend[b] ? a : b));
        setBlend({ ...blend, [key]: nextValue, [smallestKey]: blend[smallestKey] + deficit });
        return;
      }
      setBlend({ ...blend, [key]: nextValue });
      return;
    }

    // Over 100 — let it show as over-budget; the banner + blocked Continue
    // handles correction rather than silently shrinking sliders the user
    // didn't touch.
    setBlend({ ...blend, [key]: nextValue });
  };

  const handleContinue = () => {
    if (step === "vark") {
      if (isOver) return;
      setStep("difficulty");
      return;
    }
    onComplete({ ...blend, difficulty });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-auto">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-1.5 w-10 rounded-full ${step === "vark" ? "bg-[#6C63FF]" : "bg-[#43C6AC]"}`} />
          <div className={`h-1.5 w-10 rounded-full ${step === "difficulty" ? "bg-[#6C63FF]" : "bg-gray-200"}`} />
        </div>

        {step === "vark" ? (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-[#1E1B4B]">How do you learn best?</h2>
              <p className="text-xs font-semibold text-gray-500">
                Blend your learning style — we'll personalize your notes around whichever style dominates.
              </p>
            </div>

            <div className="space-y-5">
              {STYLES.map(({ key, label, desc, icon: Icon, color }) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}1A`, color }}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1E1B4B] block">{label}</span>
                        <span className="text-[10px] font-semibold text-gray-400">{desc}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black" style={{ color }}>{blend[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={blend[key]}
                    onChange={(e) => handleSlide(key, parseInt(e.target.value, 10))}
                    className="w-full accent-[#6C63FF]"
                  />
                </div>
              ))}
            </div>

            <div className={`rounded-xl p-3 text-center text-xs font-bold ${isOver ? "bg-[#FFF0F3] text-[#FF6584]" : "bg-[#FAFBFF] text-gray-500"}`}>
              {isOver
                ? `Total is ${total}% — reduce a slider to 100% or less to continue.`
                : `Total: ${total}%`}
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-[#1E1B4B]">Pick your difficulty</h2>
              <p className="text-xs font-semibold text-gray-500">
                How much should we assume you already know?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DIFFICULTIES.map(({ key, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDifficulty(key)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                    difficulty === key
                      ? "bg-[#F0EEFF] border-[#6C63FF] text-[#6C63FF]"
                      : "bg-[#FAFBFF] border-gray-200 text-gray-600 hover:border-[#6C63FF]/40"
                  }`}
                >
                  <span className="text-sm font-black block">{label}</span>
                  <span className="text-[10px] font-semibold block mt-1 opacity-80">{desc}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          {step === "difficulty" ? (
            <button
              onClick={() => setStep("vark")}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#6C63FF] transition-all"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={handleContinue}
            disabled={step === "vark" && isOver}
            className="flex items-center gap-1.5 bg-[#1E1B4B] hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-black shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === "vark" ? (
              <>Continue <ArrowRight size={14} /></>
            ) : (
              <><Sparkles size={14} /> {completeLabel}</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

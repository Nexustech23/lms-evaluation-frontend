"use client";
import { useState } from "react";
import { withAlpha } from "@/lib/question-paper/colorHelpers";

/**
 * A clickable card used on the "Choose input mode" screen.
 *
 * Props:
 *   mode    – "pdf" | "prompt"
 *   icon    – emoji
 *   title   – card heading
 *   desc    – short description
 *   color   – brand hex color
 *   onClick – called when the card is clicked
 */
export default function ChoiceCard({ mode, icon, title, desc, color, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all"
      style={{
        borderColor:     hovered ? color : "#f3f4f6",
        backgroundColor: hovered ? withAlpha(color, 0.05) : "white",
        boxShadow:       hovered ? `0 4px 16px ${withAlpha(color, 0.12)}` : undefined,
      }}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="font-bold text-gray-800 text-base mb-1">{title}</p>
        <p className="text-gray-400 text-sm leading-snug">{desc}</p>
      </div>
      <div
        className="ml-auto text-lg transition"
        style={{ color, opacity: hovered ? 1 : 0 }}
      >
        →
      </div>
    </button>
  );
}
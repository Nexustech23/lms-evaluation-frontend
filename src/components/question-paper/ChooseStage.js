"use client";
import ChoiceCard from "./ChoiceCard";

/**
 * Stage 1 — pick between "Upload PDF" and "Write a Prompt".
 *
 * Props:
 *   color       – brand hex
 *   chooseHint  – i18n subtitle string
 *   cards       – array of { mode, icon, title, desc }
 *   onChoose    – (mode: string) => void
 */
export default function ChooseStage({ color, chooseHint, cards, onChoose }) {
  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm">{chooseHint}</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {cards.map(({ mode, icon, title, desc }) => (
          <ChoiceCard
            key={mode}
            mode={mode}
            icon={icon}
            title={title}
            desc={desc}
            color={color}
            onClick={() => onChoose(mode)}
          />
        ))}
      </div>
    </div>
  );
}
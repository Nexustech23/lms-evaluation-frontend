"use client";

import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import { activityRegistry } from "./activityRegistry";
import StructuredVisualRenderer from "./StructuredVisualRenderer";

function initialProgress(storageKey, maxIndex) {
  if (typeof window === "undefined" || !storageKey) return { current: 0, completed: [], mastery: [] };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return {
      current: Math.min(Math.max(Number(stored?.current) || 0, 0), maxIndex),
      completed: Array.isArray(stored?.completed) ? stored.completed : [],
      mastery: Array.isArray(stored?.mastery) ? stored.mastery : [],
    };
  } catch {
    return { current: 0, completed: [], mastery: [] };
  }
}

function LessonStart({ lesson }) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#6C63FF]/20 bg-gradient-to-br from-white to-[#F3F1FF] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#6C63FF]">
            <Flag size={15} />
            <span className="text-[9px] font-black uppercase tracking-[0.18em]">Lesson mission</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-slate-500 shadow-sm">
            <Clock3 size={12} /> {lesson.mission.estimatedMinutes} minutes
          </span>
        </div>
        <h4 className="mt-3 text-base font-black leading-relaxed text-[#1E1B4B]">{lesson.mission.goal}</h4>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600"><span className="font-black text-[#6C63FF]">Why it matters: </span>{lesson.mission.whyItMatters}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {lesson.mission.successCriteria.map((criterion, index) => (
            <div key={index} className="flex items-start gap-2 rounded-xl border border-[#6C63FF]/10 bg-white p-3 text-xs font-semibold leading-relaxed text-slate-600">
              <Target size={13} className="mt-0.5 shrink-0 text-[#6C63FF]" /> {criterion}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Know this first</p>
          <ul className="mt-3 space-y-2">
            {lesson.prerequisites.map((item, index) => <li key={index} className="flex gap-2 text-xs font-semibold leading-relaxed text-slate-600"><span className="text-[#6C63FF]">•</span>{item}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">By the end, you can</p>
          <ul className="mt-3 space-y-2">
            {lesson.learningOutcomes.map((item, index) => <li key={index} className="flex gap-2 text-xs font-semibold leading-relaxed text-slate-700"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" />{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-2 text-blue-700"><BookOpenCheck size={15} /><span className="text-[9px] font-black uppercase tracking-widest">Important terms</span></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {lesson.keyTerms.map((item, index) => (
            <div key={index} className="rounded-xl border border-blue-100 bg-white p-3">
              <p className="text-xs font-black text-[#1E1B4B]">{item.term}</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">{item.meaning}</p>
              {item.example && <p className="mt-2 text-[10px] font-semibold leading-relaxed text-blue-700">Example: {item.example}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 text-amber-700"><Lightbulb size={15} /><span className="text-[9px] font-black uppercase tracking-widest">Our anchor example</span></div>
        <h4 className="mt-2 text-sm font-black text-[#1E1B4B]">{lesson.anchorExample.title}</h4>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700">{lesson.anchorExample.context}</p>
        <p className="mt-3 rounded-xl bg-white p-3 text-xs font-semibold leading-relaxed text-amber-900"><span className="font-black">Why this example: </span>{lesson.anchorExample.whyChosen}</p>
      </section>
    </div>
  );
}

function LessonFinish({ summary, mastery, onToggleMastery }) {
  const allMastered = summary.masteryChecklist.length > 0 && mastery.length === summary.masteryChecklist.length;
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#6C63FF]/20 bg-white p-5">
        <div className="flex items-center gap-2 text-[#6C63FF]"><GraduationCap size={16} /><span className="text-[9px] font-black uppercase tracking-widest">Lesson summary</span></div>
        <ul className="mt-4 space-y-2">
          {summary.keyTakeaways.map((item, index) => <li key={index} className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-slate-700"><span className="font-black text-[#6C63FF]">{index + 1}.</span>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Mastery checklist</p>
        <p className="mt-1 text-xs font-medium text-slate-600">Check an item only when you can do it without looking at the lesson.</p>
        <div className="mt-4 space-y-2">
          {summary.masteryChecklist.map((item, index) => {
            const checked = mastery.includes(index);
            return (
              <label key={index} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${checked ? "border-emerald-300 bg-white text-emerald-800" : "border-emerald-100 bg-white/70 text-slate-700"}`}>
                <input type="checkbox" checked={checked} onChange={() => onToggleMastery(index)} className="mt-0.5 accent-emerald-600" />
                <span className="text-xs font-semibold leading-relaxed">{item}</span>
              </label>
            );
          })}
        </div>
        {allMastered && <p className="mt-3 flex items-center gap-2 text-xs font-black text-emerald-700"><CheckCircle2 size={15} /> You have met this lesson&apos;s success criteria.</p>}
      </section>
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-700">Next step</p>
        <p className="mt-2 text-xs font-bold leading-relaxed text-slate-700">{summary.nextStep}</p>
      </section>
    </div>
  );
}

function ReadableFallbackBlock({ block }) {
  const readableText = block.simpleExplanation || block.scenario || block.purpose || block.explanation;
  if (!readableText) return null;
  return <section className="rounded-2xl border border-gray-200 bg-white p-5"><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Lesson section</p><h4 className="mt-1 text-sm font-black text-[#1E1B4B]">{block.title}</h4><p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{readableText}</p></section>;
}

export default function InteractiveLessonRenderer({ lesson, storageKey }) {
  const blocks = Array.isArray(lesson?.blocks) ? lesson.blocks : [];
  const hasStructuredVisual = lesson?.schemaVersion === 4 && Boolean(lesson?.visualAid);
  const maxIndex = blocks.length + (hasStructuredVisual ? 2 : 1);
  const progressKey = storageKey ? `guided-lesson-v${lesson?.schemaVersion || 4}:${storageKey}` : "";
  const [progress, setProgress] = useState(() => initialProgress(progressKey, maxIndex));

  const sections = [
    { title: "Start", type: "start" },
    ...(hasStructuredVisual ? [{ title: lesson.visualAid.title, type: "visual", visual: lesson.visualAid }] : []),
    ...blocks.map((block) => ({ title: block.title, type: block.type, block })),
    { title: "Mastery", type: "finish" },
  ];

  useEffect(() => {
    if (!progressKey) return;
    try {
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (error) {
      console.warn("Failed to store lesson progress", error);
    }
  }, [progress, progressKey]);

  const lessonIsRenderable = (
    (lesson?.schemaVersion === 3 || lesson?.schemaVersion === 4) &&
    lesson?.language === "English" &&
    lesson?.mission &&
    Array.isArray(lesson?.prerequisites) &&
    Array.isArray(lesson?.learningOutcomes) &&
    Array.isArray(lesson?.keyTerms) &&
    lesson?.anchorExample &&
    (lesson?.schemaVersion !== 4 || lesson?.visualAid) &&
    lesson?.summary &&
    blocks.length > 0
  );
  if (!lessonIsRenderable) return null;

  const current = Math.min(progress.current, sections.length - 1);
  const section = sections[current];
  const completedCount = progress.completed.filter((index) => index < sections.length).length;
  const percent = Math.round((completedCount / sections.length) * 100);

  const goTo = (index) => setProgress((value) => ({ ...value, current: index }));
  const completeAndGo = (nextIndex) => setProgress((value) => ({
    ...value,
    current: nextIndex,
    completed: value.completed.includes(current) ? value.completed : [...value.completed, current],
  }));
  const toggleMastery = (index) => setProgress((value) => ({
    ...value,
    mastery: value.mastery.includes(index) ? value.mastery.filter((item) => item !== index) : [...value.mastery, index],
  }));

  return (
    <div className="rounded-3xl border border-[#6C63FF]/20 bg-[#FAF9FF] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20"><Sparkles size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6C63FF]">Guided English lesson · {lesson.domain}</p>
            <h3 className="mt-1 text-base font-black text-[#1E1B4B]">{lesson.title}</h3>
          </div>
        </div>
        <span className="shrink-0 text-xs font-black text-[#6C63FF]">{percent}%</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8E5FF]"><div className="h-full rounded-full bg-[#6C63FF] transition-all" style={{ width: `${percent}%` }} /></div>

      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Lesson sections">
        {sections.map((item, index) => (
          <button type="button" key={`${item.type}-${index}`} onClick={() => goTo(index)} title={item.title} className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[10px] font-black transition ${index === current ? "border-[#6C63FF] bg-[#6C63FF] text-white" : progress.completed.includes(index) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-500"}`}>
            {progress.completed.includes(index) && index !== current ? <CheckCircle2 size={13} /> : index + 1}
          </button>
        ))}
      </nav>

      <div className="my-4 flex items-center justify-between gap-3 border-y border-[#6C63FF]/10 py-3">
        <div><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Section {current + 1} of {sections.length}</p><p className="mt-0.5 text-xs font-black text-[#1E1B4B]">{section.title}</p></div>
        <p className="hidden text-[10px] font-semibold text-slate-400 sm:block">Complete one focused section at a time.</p>
      </div>

      {section.type === "start" ? <LessonStart lesson={lesson} /> : section.type === "visual" ? (
        <StructuredVisualRenderer visual={section.visual} />
      ) : section.type === "finish" ? (
        <LessonFinish summary={lesson.summary} mastery={progress.mastery} onToggleMastery={toggleMastery} />
      ) : (() => {
        const BlockComponent = activityRegistry[section.type] || ReadableFallbackBlock;
        return <BlockComponent block={section.block} />;
      })()}

      <div className="mt-5 flex justify-between gap-3 border-t border-[#6C63FF]/10 pt-4">
        <button type="button" onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0} className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 disabled:opacity-40"><ChevronLeft size={14} /> Previous</button>
        {current < sections.length - 1 ? (
          <button type="button" onClick={() => completeAndGo(current + 1)} className="flex items-center gap-1 rounded-xl bg-[#1E1B4B] px-5 py-2.5 text-xs font-black text-white">Complete &amp; continue <ChevronRight size={14} /></button>
        ) : (
          <button type="button" onClick={() => completeAndGo(current)} className="flex items-center gap-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white"><CheckCircle2 size={14} /> Finish lesson</button>
        )}
      </div>
    </div>
  );
}

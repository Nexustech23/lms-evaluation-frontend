"use client";

import { PlayCircle, BookOpen, GraduationCap, ExternalLink, Loader2, Compass } from "lucide-react";

// Every url/title/source here was resolved server-side from a real search
// API response (app/services/rag/search_clients.py) — the model only ever
// picked an index, never wrote a link, so there's nothing to sanitize beyond
// React's normal text escaping.
const CATEGORIES = [
  { key: "video",   label: "Watch",     icon: PlayCircle,    accent: "text-[#FF6584]" },
  { key: "reading", label: "Read",      icon: BookOpen,      accent: "text-[#6C63FF]" },
  { key: "paper",   label: "Go Deeper", icon: GraduationCap, accent: "text-[#43C6AC]" },
];

export default function ResourcesPanel({ resources, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex items-center justify-center gap-3 text-gray-500">
        <Loader2 size={18} className="animate-spin text-[#6C63FF]" />
        <span className="text-xs font-bold">Finding real resources for this topic…</span>
      </div>
    );
  }

  // A resources failure is a nice-to-have miss, not a core failure — softer
  // amber styling than the notes error state, and silently unobtrusive
  // (no retry button) since it never blocks the actual study material.
  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-700 text-center">
        ⚠️ {error}
      </div>
    );
  }

  if (!resources) return null;

  const categoriesWithItems = CATEGORIES
    .map((cat) => ({ ...cat, items: resources[cat.key] || [] }))
    .filter((cat) => cat.items.length > 0);

  if (categoriesWithItems.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Compass size={13} className="text-[#6C63FF]" />
        <h4 className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider">
          Recommended Resources
        </h4>
      </div>

      <div className="space-y-4">
        {categoriesWithItems.map(({ key, label, icon: Icon, accent, items }) => (
          <div key={key}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={12} className={accent} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {label}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1E1B4B] truncate">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[9px] font-black text-gray-400 uppercase tracking-wide bg-gray-100 rounded-full px-2 py-0.5">
                        {item.source}
                      </span>
                    </div>
                    {item.blurb && (
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5 leading-relaxed">
                        {item.blurb}
                      </p>
                    )}
                  </div>
                  <ExternalLink
                    size={13}
                    className="text-gray-300 group-hover:text-[#6C63FF] transition shrink-0 mt-0.5"
                  />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Loader2, NotebookText, Trash2 } from "lucide-react";

// Presentational only — src/app/self-learner/self-review/notes-generate/page.js
// owns fetching/selecting/deleting and passes the results down, same split
// of responsibility as OutputPreview/LoadingState in this same directory.
export default function NotesHistory({
  notes,
  loading,
  activeNoteId,
  deletingId,
  disabled,
  onSelect,
  onDelete,
}) {
  if (loading || notes.length === 0) {
    // Quiet on purpose: an empty/loading history panel isn't something a
    // first-time user (or one still waiting on the list) needs to see —
    // the primary generate/preview flow above still works either way.
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-bold text-[#1E1B4B] mb-3">Recent Notes</h2>

      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {notes.map((note) => {
          const isActive = note.id === activeNoteId;
          const isDeleting = note.id === deletingId;

          return (
            <div
              key={note.id}
              onClick={() => !disabled && onSelect(note.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && !disabled && onSelect(note.id)}
              className={`w-full flex items-center gap-3 rounded-2xl border p-4 transition cursor-pointer ${
                isActive
                  ? "border-violet-400 bg-violet-50"
                  : "border-gray-200 bg-[#FAFBFF] hover:border-violet-200"
              } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <NotebookText size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E1B4B] truncate">
                  {note.title || "Untitled Notes"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {note.notes_type}
                  {note.created_at ? ` · ${new Date(note.created_at).toLocaleString()}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                disabled={isDeleting || disabled}
                title="Delete note"
                className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

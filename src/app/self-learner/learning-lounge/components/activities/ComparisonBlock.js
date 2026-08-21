import { Columns3 } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function ComparisonBlock({ block }) {
  const columns = Array.isArray(block.columns) ? block.columns : [];
  if (columns.length < 2) return null;

  return (
    <ActivityShell icon={<Columns3 size={17} />} eyebrow="Compare" title={block.title} tone="blue">
      <div className={`grid gap-3 ${columns.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {columns.map((column, index) => (
          <div key={index} className="bg-white border border-blue-100 rounded-xl p-4">
            <h5 className="text-xs font-black text-blue-700 border-b border-blue-100 pb-2">{column.heading}</h5>
            <ul className="space-y-2 mt-3">
              {(column.points || []).map((point, pointIndex) => (
                <li key={pointIndex} className="flex gap-2 text-xs font-medium text-slate-600 leading-relaxed">
                  <span className="text-blue-500 font-black" aria-hidden="true">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {block.conclusion && (
        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs font-bold leading-relaxed text-blue-900">
          Conclusion: {block.conclusion}
        </p>
      )}
    </ActivityShell>
  );
}

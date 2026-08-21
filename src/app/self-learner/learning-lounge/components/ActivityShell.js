export default function ActivityShell({ icon, eyebrow, title, children, tone = "violet" }) {
  const tones = {
    violet: "border-[#6C63FF]/20 bg-gradient-to-br from-white to-[#F7F6FF] text-[#6C63FF]",
    amber: "border-amber-200 bg-gradient-to-br from-white to-amber-50 text-amber-600",
    emerald: "border-emerald-200 bg-gradient-to-br from-white to-emerald-50 text-emerald-600",
    blue: "border-blue-200 bg-gradient-to-br from-white to-blue-50 text-blue-600",
  };

  return (
    <section className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${tones[tone] || tones.violet}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-white border border-current/15 flex items-center justify-center shrink-0 shadow-sm">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-75">{eyebrow}</p>
          <h4 className="text-sm font-black text-[#1E1B4B] mt-0.5">{title}</h4>
        </div>
      </div>
      {children}
    </section>
  );
}

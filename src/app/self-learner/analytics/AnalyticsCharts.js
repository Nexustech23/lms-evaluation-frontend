"use client";

// Split out of analytics/page.js so recharts (~150KB) loads via next/dynamic
// only when this page renders — not in the route's initial JS (Phase 5.3).
// The chart markup is unchanged from the inline versions; INDIGO and the
// tiny Empty placeholder are re-declared here to keep the module
// self-contained.

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const INDIGO = "#6C63FF";

function Empty({ text }) {
  return <div className="text-center py-8 text-gray-400 text-sm">{text}</div>;
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
      <p className="text-sm font-black text-[#1E1B4B]">{payload[0].value}%</p>
      <p className="text-[10px] font-semibold text-gray-400">{label}</p>
    </div>
  );
}

export function ScoreTrendChart({ trend }) {
  if (trend.length === 0) return <Empty text="Attempt a test or quiz to see your score trend." />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={trend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={INDIGO} stopOpacity={0.25} />
            <stop offset="95%" stopColor={INDIGO} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EEF0F5" strokeDasharray="0" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }} />
        <Area
          type="monotone" dataKey="score" stroke={INDIGO} strokeWidth={2} fill="url(#trendFill)"
          dot={{ r: 4, fill: INDIGO, stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: INDIGO, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function SubjectTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
      <p className="text-sm font-black text-[#1E1B4B]">{p.pct}%</p>
      <p className="text-[10px] font-semibold text-gray-400">{p.subject}</p>
    </div>
  );
}

export function SubjectPerformanceChart({ subjectPerf }) {
  if (subjectPerf.length === 0) return <Empty text="No subject data yet." />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, subjectPerf.length * 42)}>
      <BarChart data={subjectPerf} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="#EEF0F5" strokeDasharray="0" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category" dataKey="subject" width={96}
          tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false}
        />
        <Tooltip content={<SubjectTooltip />} cursor={{ fill: "#F5F7FB" }} />
        <Bar dataKey="pct" fill={INDIGO} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

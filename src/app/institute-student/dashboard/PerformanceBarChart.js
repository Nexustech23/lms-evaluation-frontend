"use client";

// Split out of dashboard/page.js so recharts (~150KB) is loaded via
// next/dynamic only when the dashboard actually renders — not in the
// route's initial JS (Phase 5.3). Markup is unchanged from the inline version.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function PerformanceBarChart({ data, barColor = "#6366f1" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />

        <XAxis
          dataKey="name"
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
        />

        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          contentStyle={{
            borderRadius: "20px",
            border: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        />

        <Bar
          dataKey="value"
          fill="url(#barGradient)"
          radius={[14, 14, 0, 0]}
          barSize={45}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

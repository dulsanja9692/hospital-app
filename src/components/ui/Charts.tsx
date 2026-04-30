"use client";
import { cn } from "@/lib/utils";

// ─── Simple Bar Chart (pure SVG) ──────────────────────────
export function BarChart({ data, color = "#3b82f6", height = 128 }: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height: `${height}px` }}>
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: `${height - 28}px` }}>
              <div
                className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
                style={{ height: `${h}%`, backgroundColor: color, minHeight: d.value > 0 ? "4px" : "0" }}
              />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                {d.value.toLocaleString()}
              </div>
            </div>
            <span className="text-[10px] text-gray-400 truncate w-full text-center leading-none mt-1">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut Chart (SVG) ────────────────────────────────────
export function DonutChart({ segments, size = 120 }: { 
  segments: { label: string; value: number; color: string }[],
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const r = size * 0.33; 
  const cx = size / 2; 
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap  = circumference - dash;
          const rotation = offset * 360 - 90;
          offset += pct;
          return (
            <circle key={i} r={r} cx={cx} cy={cy} fill="none"
              stroke={seg.color} strokeWidth={size * 0.13}
              strokeDasharray={`${dash} ${gap}`}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${cx} ${cy})`}
              className="transition-all duration-700"
            />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          className="fill-gray-900 font-bold text-sm">
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-3 text-xs">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-500 font-medium">{seg.label}</span>
            <span className="font-bold text-gray-900 ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress Bar Chart ───────────────────────────────────
export function ProgressList({ items }: { items: { label: string; value: number; total: number; color?: string }[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const pct = Math.round((item.value / item.total) * 100);
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-700">{item.label}</span>
              <span className="text-gray-400">{item.value} / {item.total} <span className="text-gray-900 font-bold">({pct}%)</span></span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-1000", item.color || "bg-blue-600")}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

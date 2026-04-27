"use client";
import { useState, useEffect } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Users, Stethoscope, Calendar, CreditCard,
  TrendingUp, TrendingDown, BarChart3, Loader2,
  Clock, CheckCircle2,
} from "lucide-react";
import dayjs from "dayjs";

// ─── Simple Bar Chart (pure SVG, no lib needed) ───────────
function BarChart({ data, color = "#3b82f6" }: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: "100px" }}>
              <div
                className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
                style={{ height: `${h}%`, backgroundColor: color, minHeight: d.value > 0 ? "4px" : "0" }}
              />
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                {d.value}
              </div>
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut Chart (SVG) ────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const r = 40; const cx = 60; const cy = 60;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap  = circumference - dash;
          const rotation = offset * 360 - 90;
          offset += pct;
          return (
            <circle key={i} r={r} cx={cx} cy={cy} fill="none"
              stroke={seg.color} strokeWidth="16"
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
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-600">{seg.label}</span>
            <span className="font-semibold text-gray-900 ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ icon, label, value, sub, trend, color }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; trend?: number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-xs font-semibold",
            trend >= 0 ? "text-green-600" : "text-red-500")}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
interface DashStats {
  total_patients: number;
  total_doctors: number;
  today_appointments: number;
  today_revenue: number;
  waiting_patients: number;
  completed_today: number;
  monthly_appointments: { label: string; value: number }[];
  monthly_revenue: { label: string; value: number }[];
  appointment_status: { label: string; value: number; color: string }[];
  top_doctors: { name: string; count: number; specialization: string }[];
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["Super Admin", "Hospital Admin", "Receptionist", "Doctor", "Accountant"]);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dashboard" | "appointments" | "financial">("dashboard");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get("/reports/dashboard").catch(() => null),
      api.get("/reports/appointments").catch(() => null),
      api.get("/reports/financial").catch(() => null),
    ]).then(([dash]) => {
      if (dash?.data?.data) {
        setStats(dash.data.data);
      } else {
        // Mock data when API not ready
        const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
        setStats({
          total_patients:      124,
          total_doctors:       18,
          today_appointments:  32,
          today_revenue:       64500,
          waiting_patients:    8,
          completed_today:     19,
          monthly_appointments: months.map((m, i) => ({ label: m, value: [45, 62, 58, 71, 83, 32][i] })),
          monthly_revenue:     months.map((m, i) => ({ label: m, value: [112000, 143000, 128000, 165000, 182000, 64500][i] })),
          appointment_status: [
            { label: "Completed", value: 19, color: "#10b981" },
            { label: "Booked",    value: 8,  color: "#3b82f6" },
            { label: "Arrived",   value: 3,  color: "#f59e0b" },
            { label: "Cancelled", value: 2,  color: "#ef4444" },
          ],
          top_doctors: [
            { name: "Dr. Amara Silva",  specialization: "Cardiology",    count: 12 },
            { name: "Dr. Ruwan Perera", specialization: "Neurology",     count: 9  },
            { name: "Dr. Nimal Herath", specialization: "Orthopedics",   count: 7  },
            { name: "Dr. Chamila Raj",  specialization: "Dermatology",   count: 4  },
          ],
        });
      }
    }).finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{dayjs().format("dddd, MMMM D YYYY")} · Welcome back, {user?.name}</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["dashboard", "appointments", "financial"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                tab === t ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* API Prober — Debugging Tool */}
      <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-sm font-semibold text-amber-900">API Route Finder</h3>
          <p className="text-xs text-amber-700 mt-0.5">Click probe to find working hospital/branch endpoints</p>
        </div>
        <button onClick={async () => {
          const routes = ["/hospitals", "/hospital", "/branches", "/branch", "/hospitals/1/branches", "/branches/1"];
          for (const r of routes) {
            try { 
              const res = await api.get(r);
              console.log(`✅ ${r}:`, res.status, res.data);
              toast.success(`${r} works! Status: ${res.status}`);
            } catch (e: any) { 
              console.log(`❌ ${r}:`, e.response?.status);
            }
          }
        }} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition shadow-sm">
          🚀 Probe API Routes
        </button>
      </div>

      {/* ── Tab: Dashboard ── */}
      {tab === "dashboard" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-5 h-5 text-blue-600" />}      label="Total Patients"       value={s.total_patients}              color="bg-blue-50"   trend={12} />
            <StatCard icon={<Stethoscope className="w-5 h-5 text-teal-600" />} label="Active Doctors"        value={s.total_doctors}               color="bg-teal-50"   />
            <StatCard icon={<Calendar className="w-5 h-5 text-purple-600" />}  label="Today's Appointments"  value={s.today_appointments}          color="bg-purple-50" />
            <StatCard icon={<CreditCard className="w-5 h-5 text-green-600" />} label="Today's Revenue"       value={`Rs ${s.today_revenue.toLocaleString()}`} color="bg-green-50" trend={8} />
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.waiting_patients}</div>
                <div className="text-sm text-gray-500">Waiting Now</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.completed_today}</div>
                <div className="text-sm text-gray-500">Completed Today</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {s.today_appointments > 0 ? Math.round((s.completed_today / s.today_appointments) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly appointments */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Monthly Appointments</h3>
                <span className="text-xs text-gray-400">Last 6 months</span>
              </div>
              <BarChart data={s.monthly_appointments} color="#3b82f6" />
            </div>
            {/* Appointment status donut */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Status</h3>
              <DonutChart segments={s.appointment_status} />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Appointments ── */}
      {tab === "appointments" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Appointment Trends</h3>
            <BarChart data={s.monthly_appointments} color="#8b5cf6" />
          </div>

          {/* Top doctors table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Top Performing Doctors</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Appointments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {s.top_doctors.map((doc, i) => (
                  <tr key={doc.name} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500")}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{doc.name}</td>
                    <td className="px-5 py-3.5 text-sm text-blue-600">{doc.specialization}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-gray-900">{doc.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Financial ── */}
      {tab === "financial" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={<CreditCard className="w-5 h-5 text-green-600" />} label="Today's Revenue"    value={`Rs ${s.today_revenue.toLocaleString()}`}     color="bg-green-50"  trend={8} />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-blue-600" />}  label="This Month"         value={`Rs ${(s.monthly_revenue.at(-1)?.value ?? 0).toLocaleString()}`} color="bg-blue-50" />
            <StatCard icon={<BarChart3 className="w-5 h-5 text-purple-600" />} label="Avg per Appointment"value={`Rs ${s.today_appointments > 0 ? Math.round(s.today_revenue / s.today_appointments).toLocaleString() : 0}`} color="bg-purple-50" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Monthly Revenue (Rs)</h3>
              <span className="text-xs text-gray-400">Last 6 months</span>
            </div>
            <BarChart data={s.monthly_revenue.map((d) => ({ ...d, value: Math.round(d.value / 1000) }))} color="#10b981" />
            <p className="text-xs text-gray-400 mt-2 text-center">Values in thousands (Rs K)</p>
          </div>
        </div>
      )}
    </div>
  );
}

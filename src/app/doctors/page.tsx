"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Plus, Search, ChevronLeft, ChevronRight, Loader2,
  Stethoscope, Phone, Mail, ChevronRight as Arrow,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage, cn } from "@/lib/utils";

interface Doctor {
  doctor_id: string;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  consultation_fee: number;
  status: "Active" | "Inactive";
}

export default function DoctorsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Inactive">("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/doctors", { params });
      setDoctors(res.data.data);
      setMeta(res.data.meta ?? { total: res.data.data.length, page: 1, limit: 20 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { if (user) fetchDoctors(); }, [user, fetchDoctors]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const totalPages = Math.ceil(meta.total / meta.limit);
  if (authLoading) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">{meta.total > 0 ? `${meta.total} doctors` : "Manage doctor profiles"}</p>
        </div>
        <button onClick={() => router.push("/doctors/add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                     text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                       placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | "Active" | "Inactive")}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-600
                     focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
          <option value="">All status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-56">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <Stethoscope className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No doctors found</p>
          {search && <button onClick={() => setSearch("")} className="text-xs text-blue-500 hover:underline mt-1">Clear search</button>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div key={doc.doctor_id}
                onClick={() => router.push(`/doctors/${doc.doctor_id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-teal-50 rounded-xl p-3">
                    <Stethoscope className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium",
                    doc.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {doc.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-0.5">{doc.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{doc.specialization}</p>
                {doc.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Phone className="w-3 h-3" />{doc.phone}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <span className="text-sm font-semibold text-gray-900">
                    Rs {doc.consultation_fee.toLocaleString()}
                  </span>
                  <Arrow className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 px-2">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
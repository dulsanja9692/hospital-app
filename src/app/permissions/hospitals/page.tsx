"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Building2, Plus, Search, Pencil, Phone, MapPin,
  Loader2, X, ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Hospital } from "@/types";
import { cn, getErrorMessage } from "@/lib/utils";
import dayjs from "dayjs";

function HospitalModal({ hospital, onClose, onSaved }: {
  hospital?: Hospital; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!hospital;
  const [form, setForm] = useState({
    name: hospital?.name ?? "",
    address: hospital?.address ?? "",
    phone: hospital?.phone ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/hospitals/${hospital!.hospital_id}`, form);
        toast.success("Hospital updated successfully");
      } else {
        await api.post("/hospitals", form);
        toast.success("Hospital created successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Hospital" : "Add New Hospital"}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{isEdit ? "Update hospital information" : "Register a new hospital"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital Name <span className="text-red-500">*</span></label>
            <input type="text" required minLength={2} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. City General Hospital"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input type="text" value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="e.g. 123 Main St, Colombo"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input type="tel" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. +94 11 234 5678"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Saving…" : "Creating…"}</> : (isEdit ? "Save Changes" : "Create Hospital")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HospitalCard({ hospital, onEdit }: { hospital: Hospital; onEdit: (h: Hospital) => void; }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div className="bg-blue-50 rounded-xl p-3"><Building2 className="w-5 h-5 text-blue-600" /></div>
        <button onClick={() => onEdit(hospital)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{hospital.name}</h3>
      {hospital.address && (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{hospital.address}</span>
        </div>
      )}
      {hospital.phone && (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" /><span>{hospital.phone}</span>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">Added {dayjs(hospital.created_at).format("MMM D, YYYY")}</span>
      </div>
    </div>
  );
}

export default function HospitalsPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["Super Admin"]);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Hospital | undefined>();

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/hospitals");
      setHospitals(res.data.data);
      setMeta(res.data.meta ?? { total: res.data.data.length, page: 1, limit: 12 });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { if (user) fetchHospitals(); }, [user, fetchHospitals]);
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.ceil(meta.total / meta.limit);
  if (authLoading) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all hospitals registered in the system</p>
        </div>
        <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Hospital
        </button>
      </div>


      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hospitals…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : hospitals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <Building2 className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No hospitals found</p>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-blue-500 hover:underline mt-1">Clear search</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hospitals.map((h) => (
              <HospitalCard key={h.hospital_id} hospital={h} onEdit={(h) => { setEditTarget(h); setModalOpen(true); }} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 font-medium px-3">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <HospitalModal hospital={editTarget} onClose={() => setModalOpen(false)} onSaved={fetchHospitals} />
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  MapPin, Plus, Search, Pencil, Loader2, X,
  ChevronLeft, ChevronRight, Building2, Phone, Trash2,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Hospital, Branch } from "@/types";
import { cn, getErrorMessage } from "@/lib/utils";
import dayjs from "dayjs";

function BranchModal({ hospitalId, editBranch, hospitals, onClose, onSaved }: {
  hospitalId?: string; editBranch?: Branch; hospitals: Hospital[];
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!editBranch;
  const [form, setForm] = useState({
    name: editBranch?.name ?? "",
    address: editBranch?.address ?? "",
    phone: editBranch?.phone ?? "",
    hospital_id: editBranch?.hospital_id ?? hospitalId ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hospital_id) { toast.error("Please select a hospital"); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/branches/${editBranch!.branch_id}`, form);
        toast.success("Branch updated successfully");
      } else {
        await api.post("/branches", form);
        toast.success("Branch created successfully");
      }
      onSaved(); onClose();
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Branch" : "Add New Branch"}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{isEdit ? "Update branch information" : "Register a new branch"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!hospitalId && !isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital <span className="text-red-500">*</span></label>
              <select required value={form.hospital_id} onChange={(e) => setForm((f) => ({ ...f, hospital_id: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="">Select Hospital</option>
                {hospitals.map((h) => <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Name <span className="text-red-500">*</span></label>
            <input type="text" required minLength={2} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Kandy Branch"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address <span className="text-red-500">*</span></label>
            <input type="text" required value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="e.g. 45 Peradeniya Rd, Kandy"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" required value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. +94 81 234 5678"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Saving…" : "Creating…"}</> : (isEdit ? "Save Changes" : "Create Branch")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BranchRow({ branch, onEdit, onDelete }: { branch: Branch; onEdit: (b: Branch) => void; onDelete: (id: string) => void; }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-gray-900">{branch.name}</div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="text-sm text-gray-600 truncate max-w-[200px]">{branch.address}</div>
      </td>
      <td className="px-5 py-3.5">
        <div className="text-sm text-gray-600 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gray-400" /> {branch.phone}
        </div>
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-400 font-mono uppercase tracking-tighter">
        {branch.hospital?.name ?? "—"}
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onEdit(branch)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(branch.branch_id)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

const ALLOWED = ["Super Admin", "Hospital Admin"];

export default function BranchesPage() {
  const { user: currentUser, isLoading: authLoading } = useRequireAuth(ALLOWED);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | undefined>();

  useEffect(() => {
    if (currentUser?.role === "Super Admin") {
      api.get("/hospitals", { params: { limit: 100 } })
        .then((r) => setHospitals(r.data.data))
        .catch(() => {});
    }
  }, [currentUser]);

  const fetchBranches = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 100 };
      if (search) params.search = search;
      if (hospitalFilter) params.hospital_id = hospitalFilter;
      else if (currentUser.role === "Hospital Admin") params.hospital_id = currentUser.hospital_id;

      // Fallback logic for branches endpoint
      const fetchCall = async () => {
        try {
          return await api.get("/branches", { params });
        } catch (e: any) {
          if (e?.response?.status === 404 && params.hospital_id) {
            return await api.get(`/hospitals/${params.hospital_id}/branches`);
          }
          throw e;
        }
      };

      const res = await fetchCall();
      setBranches(res.data.data);
      setMeta(res.data.meta ?? { total: res.data.data.length, page: 1, limit: 100 });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentUser, search, hospitalFilter, page]);

  useEffect(() => { if (currentUser) fetchBranches(); }, [currentUser, fetchBranches]);
  useEffect(() => { setPage(1); }, [search, hospitalFilter]);

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await api.delete(`/branches/${id}`);
      toast.success("Branch deleted successfully");
      fetchBranches();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const totalPages = Math.ceil(meta.total / meta.limit);
  if (authLoading || !currentUser) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage hospital branch locations and contact details
          </p>
        </div>
        <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        {currentUser.role === "Super Admin" && (
          <select value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
            <option value="">All hospitals</option>
            {hospitals.map((h) => <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Building2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No branches found</p>
            {(search || hospitalFilter) && (
              <button onClick={() => { setSearch(""); setHospitalFilter(""); }}
                className="text-xs text-blue-500 hover:underline mt-1">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {branches.map((b) => (
                  <BranchRow key={b.branch_id} branch={b}
                    onEdit={(b) => { setEditTarget(b); setModalOpen(true); }}
                    onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total} branches
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 font-medium px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <BranchModal
          hospitalId={currentUser.role === "Hospital Admin" ? currentUser.hospital_id : undefined}
          editBranch={editTarget}
          hospitals={hospitals}
          onClose={() => setModalOpen(false)}
          onSaved={fetchBranches}
        />
      )}
    </div>
  );
}

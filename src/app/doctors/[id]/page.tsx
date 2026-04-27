"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Loader2, Phone, Mail, Stethoscope, CreditCard,
  User, Pencil, X, Check, CheckCircle2, XCircle
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

// ── localStorage helpers for caching fees (backend workaround) ──
const FEE_CACHE_KEY = "doctor_fees_cache";

function getCachedFees(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(FEE_CACHE_KEY) || "{}");
  } catch { return {}; }
}

function cacheFee(doctorId: string, fee: number) {
  const cache = getCachedFees();
  cache[doctorId] = fee;
  localStorage.setItem(FEE_CACHE_KEY, JSON.stringify(cache));
}

export function getCachedFee(doctorId: string): number {
  return getCachedFees()[doctorId] ?? 0;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

export default function DoctorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const doctorId = params.id as string;
  const isEditingInitial = searchParams?.get("edit") === "true";
  
  const { isLoading: authLoading } = useRequireAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isEditingInitial);
  const [editForm, setEditForm] = useState<Partial<Doctor>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/doctors/${doctorId}`);
        const d = res.data.data;
        // Merge cached fee (since backend doesn't save it)
        const cachedFee = getCachedFee(doctorId);
        const merged = { ...d, consultation_fee: cachedFee || d.consultation_fee };
        setDoctor(merged);
        setEditForm(merged);
      } catch (err) {
        toast.error(getErrorMessage(err));
        router.push("/doctors");
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [doctorId, authLoading, router]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        consultation_fee: Number(editForm.consultation_fee)
      };
      const res = await api.put(`/doctors/${doctorId}`, payload);
      
      // Cache the fee in localStorage since backend doesn't save it
      cacheFee(doctorId, payload.consultation_fee);

      const returnedDoctor = res.data.data;
      setDoctor({ ...returnedDoctor, consultation_fee: payload.consultation_fee });
      
      setEditing(false);
      toast.success("Doctor profile updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">ID: {doctorId}</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
              <X className="w-4 h-4" />
            </button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                         text-white rounded-xl text-sm font-semibold transition">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Area */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
              <Stethoscope className="w-10 h-10" />
            </div>
            {!editing && (
              <span className={cn("text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5",
                doctor.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                {doctor.status === "Active" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {doctor.status}
              </span>
            )}
          </div>

          {/* Details Area */}
          <div className="flex-1">
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                  <input type="text" value={editForm.name ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Specialization</label>
                  <input type="text" value={editForm.specialization ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, specialization: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <select value={editForm.status ?? "Active"} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as "Active" | "Inactive" }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                  <input type="tel" value={editForm.phone ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Email</label>
                  <input type="email" value={editForm.email ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Consultation Fee (Rs)</label>
                  <input type="number" min={0} value={editForm.consultation_fee ?? 0} onChange={(e) => setEditForm((f) => ({ ...f, consultation_fee: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h2>
                <p className="text-blue-600 font-medium mb-6">{doctor.specialization}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={doctor.phone} />
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={doctor.email || "—"} />
                  <InfoRow
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Consultation Fee"
                    value={doctor.consultation_fee > 0 ? `Rs ${doctor.consultation_fee.toLocaleString()}` : "Not set"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

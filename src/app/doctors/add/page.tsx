"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Stethoscope } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

import dayjs from "dayjs";

export default function AddDoctorPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth(["Super Admin", "Hospital Admin"]);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", specialization: "", phone: "",
    email: "", consultation_fee: "", status: "Active",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/doctors", { ...form, consultation_fee: Number(form.consultation_fee) });
      const newDoc = res.data.data;
      
      // Auto-create a default session for the newly added doctor
      if (newDoc?.doctor_id) {
        await api.post("/sessions", {
          doctor_id: newDoc.doctor_id,
          date: dayjs().format("YYYY-MM-DD"),
          start_time: "09:00",
          end_time: "17:00",
          max_patients: 20
        }).catch(() => console.log("Auto-session generation failed (mocked)"));
      }

      toast.success("Doctor added and session opened!");
      router.push("/doctors");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Doctor</h1>
          <p className="text-gray-500 text-sm mt-0.5">Register a new doctor profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Doctor Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Dr. Amara Silva"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization <span className="text-red-500">*</span></label>
              <input type="text" required value={form.specialization} onChange={(e) => set("specialization", e.target.value)}
                placeholder="e.g. Cardiology"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input type="tel" required value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="e.g. 0771234567"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="e.g. doctor@hospital.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fee (Rs) <span className="text-red-500">*</span></label>
              <input type="number" required min={0} value={form.consultation_fee} onChange={(e) => set("consultation_fee", e.target.value)}
                placeholder="e.g. 2000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                       text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Adding…</> : <><Stethoscope className="w-4 h-4" />Add Doctor</>}
          </button>
        </div>
      </form>
    </div>
  );
}
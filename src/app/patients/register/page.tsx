"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export default function RegisterPatientPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nic: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, age: Number(form.age) };
      await api.post("/patients", payload);
      toast.success("Patient registered successfully!");
      router.push("/patients");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register Patient</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in the patient details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">

        {/* Personal Info Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required minLength={2}
                value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Kamal Perera"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* NIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                NIC / Passport <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required
                value={form.nic} onChange={(e) => set("nic", e.target.value)}
                placeholder="e.g. 199512345678"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number" required min={0} max={150}
                value={form.age} onChange={(e) => set("age", e.target.value)}
                placeholder="e.g. 35"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.gender} onChange={(e) => set("gender", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel" required
                value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="e.g. 0771234567"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="e.g. kamal@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text"
                value={form.address} onChange={(e) => set("address", e.target.value)}
                placeholder="e.g. 45/A, Galle Road, Colombo 03"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Emergency Contact */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Emergency Contact</label>
              <input
                type="tel"
                value={form.emergency_contact} onChange={(e) => set("emergency_contact", e.target.value)}
                placeholder="e.g. 0779876543"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button" onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium
                       text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                       text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Registering…</>
            ) : (
              <><UserPlus className="w-4 h-4" />Register Patient</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
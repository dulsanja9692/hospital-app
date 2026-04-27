"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Hospital, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AuthUser } from "@/types";
import { getErrorMessage } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, user } = res.data.data as {
        accessToken: string;
        user: AuthUser;
      };
      setUser(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      router.replace("/dashboard");
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes("429") || msg.toLowerCase().includes("many")) {
        toast.error("Too many login attempts. Please wait 15 minutes.");
      } else {
        toast.error("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-blue-600 p-10 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <Hospital className="w-6 h-6" />
          </div>
          <span className="font-semibold text-lg tracking-tight">MediCore HMS</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Streamline your hospital operations
          </h1>
          <p className="text-blue-100 text-base leading-relaxed">
            Manage appointments, doctors, patients, and billing — all in one
            centralized platform built for modern healthcare.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Patients managed", value: "10,000+" },
            { label: "Appointments daily", value: "500+" },
            { label: "Doctors onboarded", value: "150+" },
            { label: "Uptime", value: "99%" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="bg-blue-600 rounded-xl p-2">
              <Hospital className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">MediCore HMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="text-gray-500 mt-1 text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                           placeholder:text-gray-400 transition-all
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                             placeholder:text-gray-400 pr-11 transition-all
                             focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold py-2.5 rounded-xl text-sm transition-colors
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Hospital Appointment Booking &amp; Channeling Management System · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { 
  ArrowLeft, Loader2, Users, Play, CheckCircle2, 
  UserCheck, Timer, AlertCircle, RefreshCw, Volume2 
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage, cn } from "@/lib/utils";
import dayjs from "dayjs";

interface QueueItem {
  appointment_id: string;
  queue_number: number;
  status: "booked" | "confirmed" | "arrived" | "serving" | "completed" | "cancelled" | "no_show";
  patient: {
    patient_id: string;
    name: string;
    phone: string;
  };
}

interface Session {
  session_id: string;
  date: string;
  start_time: string;
  end_time: string;
  doctor: {
    name: string;
    specialization: string;
  };
  status: string;
}

export default function QueueBoardPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { isLoading: authLoading } = useRequireAuth(["Doctor", "Nurse", "Receptionist"]);

  const [session, setSession] = useState<Session | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [sessionRes, queueRes] = await Promise.all([
        api.get(`sessions/${sessionId}`),
        api.get(`sessions/${sessionId}/queue`)
      ]);
      setSession(sessionRes.data.data);
      setQueue(queueRes.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!authLoading) loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [authLoading, loadData]);

  async function handleCallNext() {
    setActionLoading("next");
    try {
      const res = await api.post(`sessions/${sessionId}/queue/next`);
      toast.success(`Calling Queue #${res.data.data.queue_number}`);
      loadData(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function updateStatus(appointmentId: string, status: string) {
    setActionLoading(appointmentId);
    try {
      await api.patch(`sessions/${sessionId}/queue/${appointmentId}`, { status });
      toast.success(`Updated to ${status}`);
      loadData(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) return null;

  const currentPatient = queue.find(q => q.status === "serving");
  const waitingList = queue.filter(q => ["booked", "confirmed", "arrived"].includes(q.status));
  const completedList = queue.filter(q => q.status === "completed");

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Queue Board</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
              <span className="font-semibold text-blue-600">{session.doctor.name}</span>
              <span>•</span>
              <span>{dayjs(session.date).format("MMM D, YYYY")}</span>
              <span>•</span>
              <span>{session.start_time} – {session.end_time}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => loadData(true)} disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
          </button>
          <button 
            onClick={handleCallNext}
            disabled={actionLoading === "next" || waitingList.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200">
            {actionLoading === "next" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
            Call Next Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Now Serving & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Now Serving Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold uppercase tracking-wider opacity-80">Now Serving</span>
              <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                <Timer className="w-5 h-5" />
              </div>
            </div>
            
            {currentPatient ? (
              <div className="space-y-6">
                <div>
                  <div className="text-6xl font-black mb-2">#{currentPatient.queue_number}</div>
                  <div className="text-xl font-bold truncate">{currentPatient.patient.name}</div>
                  <div className="text-blue-100 text-sm mt-1 opacity-80">{currentPatient.patient.phone}</div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => updateStatus(currentPatient.appointment_id, "completed")}
                    disabled={!!actionLoading}
                    className="flex-1 py-3 bg-white text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    {actionLoading === currentPatient.appointment_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Complete
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-blue-100 font-medium">No patient currently being served</p>
                <button 
                  onClick={handleCallNext}
                  disabled={waitingList.length === 0}
                  className="mt-6 text-sm font-bold underline underline-offset-4 decoration-2 hover:text-white transition-colors">
                  Call next in queue
                </button>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Session Progress</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-2xl">
                <div className="text-orange-600 font-black text-2xl">{waitingList.length}</div>
                <div className="text-orange-700/60 text-xs font-bold uppercase mt-1">Waiting</div>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl">
                <div className="text-green-600 font-black text-2xl">{completedList.length}</div>
                <div className="text-green-700/60 text-xs font-bold uppercase mt-1">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Queue List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                Upcoming Queue
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase">{waitingList.length} patients</span>
            </div>
            
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {waitingList.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">The queue is empty</p>
                </div>
              ) : (
                waitingList.map((item) => (
                  <div key={item.appointment_id} className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-black text-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        #{item.queue_number}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{item.patient.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400 font-medium">{item.patient.phone}</span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter", {
                            "bg-orange-100 text-orange-600": item.status === "booked",
                            "bg-blue-100 text-blue-600": item.status === "confirmed",
                            "bg-green-100 text-green-600": item.status === "arrived",
                          })}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status === "arrived" ? (
                        <button 
                          onClick={() => updateStatus(item.appointment_id, "serving")}
                          disabled={!!actionLoading}
                          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                          title="Start Serving">
                          {actionLoading === item.appointment_id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateStatus(item.appointment_id, "arrived")}
                          disabled={!!actionLoading}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors"
                          title="Mark as Arrived">
                          Mark Arrived
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

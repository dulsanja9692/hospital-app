"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { 
  ScrollText, Search, Filter, Loader2, Calendar, 
  User as UserIcon, Activity, ChevronLeft, ChevronRight, 
  AlertCircle, ShieldCheck, History
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage, cn } from "@/lib/utils";
import dayjs from "dayjs";

interface AuditLog {
  log_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const { user: currentUser, isLoading: authLoading } = useRequireAuth(["Super Admin"]);
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 20 });
  
  const [filters, setFilters] = useState({
    action: "",
    user_id: "",
    start_date: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    end_date: dayjs().format("YYYY-MM-DD"),
  });

  const [users, setUsers] = useState<{user_id: string, name: string}[]>([]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        ...filters,
        page,
        limit: 20
      };
      // As per §13.1, it's a POST request for searching logs
      const res = await api.post("admin/audit-logs", payload);
      setLogs(res.data.data || []);
      setMeta(res.data.meta || { total: (res.data.data || []).length, limit: 20 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (currentUser) {
      loadLogs();
      // Fetch users for dropdown
      api.get("admin/users/", { params: { limit: 100 } }).then(res => {
        setUsers(res.data.data.map((u: any) => ({ user_id: u.user_id, name: u.name })));
      }).catch(() => {});
    }
  }, [currentUser, loadLogs]);

  if (authLoading || !currentUser) return null;

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-100">
            <ScrollText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track all administrative actions and security events</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5" />
          Super Admin Restricted Access
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">User</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <select 
                value={filters.user_id} 
                onChange={(e) => setFilters(f => ({ ...f, user_id: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="">All Users</option>
                {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Action Type</label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input 
                type="text" 
                value={filters.action} 
                onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                placeholder="e.g. LOGIN, UPDATE"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input 
                type="date" 
                value={filters.start_date} 
                onChange={(e) => setFilters(f => ({ ...f, start_date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input 
                type="date" 
                value={filters.end_date} 
                onChange={(e) => setFilters(f => ({ ...f, end_date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end">
          <button onClick={() => { setPage(1); loadLogs(); }}
            className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2">
            <Search className="w-4 h-4" /> Run Search
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-400">Fetching audit records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 text-gray-400">
            <History className="w-12 h-12 opacity-10" />
            <p className="text-sm font-medium">No logs found for the selected criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{dayjs(log.created_at).format("HH:mm:ss")}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{dayjs(log.created_at).format("MMM D, YYYY")}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                          {log.user?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{log.user?.name || "System"}</div>
                          <div className="text-[10px] text-gray-400">{log.user?.role || "SYSTEM"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                        log.action.includes("DELETE") ? "bg-red-50 text-red-600" :
                        log.action.includes("UPDATE") || log.action.includes("EDIT") ? "bg-orange-50 text-orange-600" :
                        log.action.includes("CREATE") || log.action.includes("ADD") ? "bg-green-50 text-green-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-gray-700">{log.entity_type}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {log.entity_id?.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-medium text-gray-600 font-mono">{log.ip_address || "127.0.0.1"}</div>
                      <button className="mt-1 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {logs.length} records</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-black text-gray-900">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

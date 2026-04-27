"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Users, Plus, Search, Pencil, Loader2, X,
  ChevronLeft, ChevronRight, ShieldCheck, UserCircle, AlertCircle,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { User, Role, Hospital, CREATABLE_ROLES } from "@/types";
import { cn, getErrorMessage } from "@/lib/utils";
import dayjs from "dayjs";

const ROLE_STYLES: Record<Role, string> = {
  "Super Admin":    "bg-purple-100 text-purple-700 border-purple-200",
  "Hospital Admin": "bg-blue-100 text-blue-700 border-blue-200",
  "Manager":        "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Receptionist":   "bg-green-100 text-green-700 border-green-200",
  "Doctor":         "bg-teal-100 text-teal-700 border-teal-200",
  "Accountant":     "bg-orange-100 text-orange-700 border-orange-200",
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", ROLE_STYLES[role])}>
      {role}
    </span>
  );
}

function UserModal({ currentUser, editUser, hospitals, onClose, onSaved }: {
  currentUser: AuthUser; editUser?: User; hospitals: Hospital[];
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!editUser;
  const currentUserRole = currentUser.role;
  const creatableRoles = CREATABLE_ROLES[currentUserRole];
  const [form, setForm] = useState({
    name: editUser?.name ?? "",
    email: editUser?.email ?? "",
    password: "",
    role: (editUser?.role ?? creatableRoles[0] ?? "") as Role | "",
    hospital_id: editUser?.hospital_id ?? (currentUser.role !== "Super Admin" ? currentUser.hospital_id : ""),
    branch_id: editUser?.branch_id ?? "",
  });
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.hospital_id) {
      api.get("branches", { params: { hospital_id: form.hospital_id, limit: 100 } })
        .then(r => setBranches(r.data.data))
        .catch(() => {
          api.get(`hospitals/${form.hospital_id}/branches/`)
            .then(r => setBranches(r.data.data))
            .catch(() => setBranches([]));
        });
    } else {
      setBranches([]);
    }
  }, [form.hospital_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role) { toast.error("Please select a role"); return; }
    setLoading(true);
    try {
      const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (!isEdit) payload.password = form.password;
      if (form.hospital_id) payload.hospital_id = form.hospital_id;
      if (form.branch_id) payload.branch_id = form.branch_id;
      if (isEdit) {
        await api.put(`users/${editUser!.user_id}/`, payload);
        toast.success("User updated successfully");
      } else {
        await api.post("users/", payload);
        toast.success("User created successfully");
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit User" : "Add New User"}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{isEdit ? "Update user information" : "Create a new user account"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input type="text" required minLength={2} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Kamal Perera"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="user@hospital.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
            <select required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
              <option value="">Select a role</option>
              {creatableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">As {currentUserRole}, you can create: {creatableRoles.join(", ") || "none"}</p>
          </div>
          {currentUserRole === "Super Admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital</label>
              <select value={form.hospital_id} onChange={(e) => setForm((f) => ({ ...f, hospital_id: e.target.value, branch_id: "" }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="">— No specific hospital —</option>
                {hospitals.map((h) => <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>)}
              </select>
            </div>
          )}
          {(form.hospital_id || (currentUserRole !== "Super Admin" && currentUserRole !== "Manager")) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
              <select value={form.branch_id} onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="">— No specific branch —</option>
                {branches.map((b) => <option key={b.branch_id} value={b.branch_id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Saving…" : "Creating…"}</> : (isEdit ? "Save Changes" : "Create User")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserRow({ user, currentUserRole, onEdit }: { user: User; currentUserRole: Role; onEdit: (u: User) => void; }) {
  const canEdit = CREATABLE_ROLES[currentUserRole].includes(user.role);
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
      <td className="px-5 py-3.5 text-sm text-gray-500">{user.branch?.name ?? "—"}</td>
      <td className="px-5 py-3.5 text-xs text-gray-400">{dayjs(user.created_at).format("MMM D, YYYY")}</td>
      <td className="px-5 py-3.5 text-right">
        {canEdit && (
          <button onClick={() => onEdit(user)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

const ALLOWED: Role[] = ["Super Admin", "Hospital Admin", "Receptionist"];
const ALL_ROLES: Role[] = ["Super Admin", "Hospital Admin", "Receptionist", "Doctor", "Accountant"];

export default function UsersPage() {
  const { user: currentUser, isLoading: authLoading } = useRequireAuth(ALLOWED);

  const [users, setUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [hospitalFilter, setHospitalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | undefined>();

  const canCreateUsers = currentUser ? CREATABLE_ROLES[currentUser.role].length > 0 : false;

  const fetchHospitals = useCallback(() => {
    if (currentUser.role === "Super Admin") {
      api.get("hospitals/", { params: { limit: 100 } })
        .then(r => setHospitals(r.data.data))
        .catch(() => setHospitals([]));
    }
  }, [currentUser.role]);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await api.get("users/", { params: { search, role: roleFilter, hospital_id: hospitalFilter, page } });
      setUsers(res.data.data);
      setMeta(res.data.meta ?? { total: res.data.data.length, page: 1, limit: 10 });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentUser, search, roleFilter, hospitalFilter, page]);

  useEffect(() => { if (currentUser) fetchUsers(); }, [currentUser, fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter, hospitalFilter]);

  const viewableRoles = currentUser?.role === "Super Admin" ? ALL_ROLES
    : currentUser?.role === "Hospital Admin" ? ALL_ROLES.filter((r) => r !== "Super Admin")
    : ALL_ROLES.filter((r) => !["Super Admin", "Hospital Admin"].includes(r));

  const totalPages = Math.ceil(meta.total / meta.limit);
  if (authLoading || !currentUser) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform users and their access levels</p>
        </div>
        {canCreateUsers && (
          <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | "")}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
          <option value="">All roles</option>
          {viewableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {currentUser.role === "Super Admin" && (
          <select value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
            <option value="">All hospitals</option>
            {hospitals.map((h) => <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>)}
          </select>
        )}
      </div>


      {/* Permissions info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Your role ({currentUser.role}):</span>{" "}
          {CREATABLE_ROLES[currentUser.role].length > 0
            ? `You can create and edit: ${CREATABLE_ROLES[currentUser.role].join(", ")}`
            : "You do not have permission to create or edit users."}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <UserCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No users found</p>
            {(search || roleFilter || hospitalFilter) && (
              <button onClick={() => { setSearch(""); setRoleFilter(""); setHospitalFilter(""); }}
                className="text-xs text-blue-500 hover:underline mt-1">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <UserRow key={u.user_id} user={u} currentUserRole={currentUser.role}
                    onEdit={(u) => { setEditTarget(u); setModalOpen(true); }} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total} users
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
        <UserModal currentUser={currentUser} editUser={editTarget} hospitals={hospitals}
          onClose={() => setModalOpen(false)} onSaved={fetchUsers} />
      )}
    </div>
  );
}
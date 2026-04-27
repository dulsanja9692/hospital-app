// ─── Auth ───────────────────────────────────────────────
export type Role =
  | "Super Admin"
  | "Hospital Admin"
  | "Manager"
  | "Receptionist"
  | "Doctor"
  | "Accountant";

export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  hospital_id: string;
  branch_id?: string;
}

// ─── Hospital ────────────────────────────────────────────
export interface Hospital {
  hospital_id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at: string;
}

export interface Branch {
  branch_id: string;
  hospital_id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at?: string;
}

// ─── User ────────────────────────────────────────────────
export interface User {
  user_id: string;
  hospital_id: string;
  branch_id?: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  branch?: Branch;
}

// ─── API Response Wrappers ───────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  message: string;
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: { path: string; message: string }[];
}

// ─── Permissions matrix ──────────────────────────────────
// Which roles each role can CREATE
export const CREATABLE_ROLES: Record<Role, Role[]> = {
  "Super Admin":    ["Super Admin", "Hospital Admin", "Manager", "Receptionist", "Doctor", "Accountant"],
  "Hospital Admin": ["Hospital Admin", "Manager", "Receptionist", "Doctor", "Accountant"],
  "Manager":        ["Manager", "Receptionist", "Doctor", "Accountant"],
  "Receptionist":   ["Receptionist", "Doctor", "Accountant"],
  "Doctor":         [],
  "Accountant":     [],
};

// Which roles can access the Permissions interface
export const CAN_ACCESS_PERMISSIONS: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Manager",
  "Receptionist",
];

// Which roles can access Hospital management
export const CAN_ACCESS_HOSPITALS: Role[] = ["Super Admin"];

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { AuthUser, Role, CAN_ACCESS_PERMISSIONS } from "@/types";

export function useAuth() {
  const { user, isLoading, setUser, logout } = useAuthStore();
  return { user, isLoading, setUser, logout };
}

/** Restores session on page refresh — checks sessionStorage first, then refresh cookie */
export function useInitAuth() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    (async () => {
      // 1. Try restoring from sessionStorage (survives page refresh in same tab)
      if (typeof window !== "undefined") {
        try {
          const u = sessionStorage.getItem("hms_user");
          const t = sessionStorage.getItem("hms_token");
          if (u && t) {
            const user = JSON.parse(u) as AuthUser;
            setUser(user, t);
            return; // restored successfully — done
          }
        } catch {
          // sessionStorage read failed, fall through to refresh
        }
      }

      // 2. Try refresh cookie (works when backend CORS is configured for cookies)
      try {
        const refreshRes = await api.post("/auth/refresh");
        const token = refreshRes.data.data.accessToken;
        const meRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(meRes.data.data.user as AuthUser, token);
      } catch {
        // No valid session — go to login
        setUser(null, null);
      }
    })();
  }, [setUser]);
}

/** Guard: redirect to login if not authenticated */
export function useRequireAuth(allowedRoles?: Role[]) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, allowedRoles]);

  return { user, isLoading };
}

export function canAccessPermissions(role: Role) {
  return CAN_ACCESS_PERMISSIONS.includes(role);
}

import { create } from "zustand";
import { AuthUser } from "@/types";
import { setAccessToken } from "@/lib/api";

const SESSION_KEY = "hms_user";
const TOKEN_KEY   = "hms_token";

// Persist user + token in sessionStorage so page refresh doesn't log out
function saveSession(user: AuthUser | null, token: string | null) {
  if (typeof window === "undefined") return;
  if (user && token) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

function loadSession(): { user: AuthUser | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const u = sessionStorage.getItem(SESSION_KEY);
    const t = sessionStorage.getItem(TOKEN_KEY);
    return { user: u ? (JSON.parse(u) as AuthUser) : null, token: t };
  } catch {
    return { user: null, token: null };
  }
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user, token) => {
    setAccessToken(token);
    saveSession(user, token);
    set({ user, isLoading: false });
  },

  logout: () => {
    setAccessToken(null);
    saveSession(null, null);
    set({ user: null, isLoading: false });
  },
}));

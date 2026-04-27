import { create } from "zustand";

interface ThemeStore {
  dark: boolean;
  toggle: () => void;
  init: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: false,

  init: () => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.remove("dark");
    localStorage.setItem("hms_theme", "light");
    set({ dark: false });
  },

  toggle: () => {
    // Disabled, always light mode
  },
}));
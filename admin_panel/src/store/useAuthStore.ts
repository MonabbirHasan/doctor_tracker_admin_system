"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuthSession: (payload: { user: AuthUser; token: string }) => void;
  clearAuthSession: () => void;
  markHydrated: () => void;
}

const AUTH_COOKIE_NAME = "dt_auth_token";
//========================================
// AFTER LOGIIN SET THE COOKIE
//========================================
function writeAuthCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
      token,
    )}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuthSession: ({ user, token }) => {
        writeAuthCookie(token);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      clearAuthSession: () => {
        writeAuthCookie(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      markHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: "doctor-tracker-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          writeAuthCookie(state.token);
        }
        state?.markHydrated();
      },
    },
  ),
);

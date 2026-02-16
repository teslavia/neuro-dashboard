import { create } from "zustand";

export type UserRole = "admin" | "operator" | "viewer";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  operator: 2,
  viewer: 1,
};

const loadFromStorage = (): { user: User | null; token: string | null } => {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const stored = localStorage.getItem("neuro-auth");
    if (stored) return JSON.parse(stored);
  } catch {}
  return { user: null, token: null };
};

export const useAuthStore = create<AuthState>((set, get) => {
  const initial = loadFromStorage();
  return {
    user: initial.user,
    token: initial.token,
    isAuthenticated: !!initial.token,
    login: (user, token) => {
      localStorage.setItem("neuro-auth", JSON.stringify({ user, token }));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem("neuro-auth");
      set({ user: null, token: null, isAuthenticated: false });
    },
    hasPermission: (requiredRole) => {
      const { user } = get();
      if (!user) return false;
      return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
    },
  };
});

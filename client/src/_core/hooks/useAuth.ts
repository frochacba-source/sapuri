import { useMemo } from "react";

// Mocked admin user - no authentication required
const MOCK_USER = {
  id: 1,
  openId: "admin",
  name: "Admin",
  email: "admin@sapuri.local",
  role: "admin" as const,
  loginMethod: "direct",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export function useAuth() {
  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(MOCK_USER)
    );
    return {
      user: MOCK_USER,
      loading: false,
      error: null,
      isAuthenticated: true,
    };
  }, []);

  return {
    ...state,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  };
}

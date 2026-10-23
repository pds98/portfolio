import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api";
import type { CurrentUser } from "../types/portfolio";

/**
 * État d'authentification global.
 * Le jeton de session est dans un cookie httpOnly : le JavaScript ne peut pas
 * le lire. Au chargement, on demande donc à l'API « qui suis-je ? » (/api/auth/me).
 */
interface AuthValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser((await authApi.me()).user);
    } catch {
      setUser(null); // 401 : pas de session
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      refresh,
      login: async (email, password) => setUser((await authApi.login(email, password)).user),
      register: async (fullName, email, password) => setUser((await authApi.register(fullName, email, password)).user),
      logout: async () => {
        await authApi.logout().catch(() => undefined);
        setUser(null);
      },
    }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

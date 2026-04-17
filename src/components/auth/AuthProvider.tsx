"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "USER" | "ADMIN" | null;

type AuthContextValue = {
  user: User | null;
  role: Role;
  fullName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (uid: string) => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setRole("USER");
      return;
    }
    const { data } = await supabase.from("profiles").select("role, full_name").eq("id", uid).maybeSingle();
    if (data?.role === "ADMIN" || data?.role === "USER") setRole(data.role);
    else setRole("USER");
    setFullName(data?.full_name ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setLoading(false);
      return;
    }

    async function init() {
      try {
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        setUser(u);
        if (u) await refreshProfile(u.id);
        else {
          setRole(null);
          setFullName(null);
        }
      } catch {
        setUser(null);
        setRole(null);
        setFullName(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await refreshProfile(u.id);
      else {
        setRole(null);
        setFullName(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
    setRole(null);
    setFullName(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      fullName,
      loading,
      signOut,
    }),
    [user, role, fullName, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}

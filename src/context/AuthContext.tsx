"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: (opts?: { redirectUrl?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isLoaded: false,
  isSignedIn: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

function mapSupabaseUser(supabaseUser: User | null): AuthUser | null {
  if (!supabaseUser) return null;
  return {
    userId: supabaseUser.id,
    email: supabaseUser.email ?? "",
    role: (supabaseUser.user_metadata?.role as string) ?? "employee",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const refreshUser = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setUser(null);
      setAccessToken(null);
      setIsLoaded(true);
      return;
    }

    try {
      const [
        {
          data: { user: supabaseUser },
        },
        {
          data: { session },
        },
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);
      setUser(mapSupabaseUser(supabaseUser));
      setAccessToken(session?.access_token ?? null);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoaded(true);
    }
  }, [supabase]);

  useEffect(() => {
    // Load initial session
    refreshUser();

    const refreshWhenOnline = () => {
      void refreshUser();
    };
    window.addEventListener("online", refreshWhenOnline);

    // Listen to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null));
      setAccessToken(session?.access_token ?? null);
      setIsLoaded(true);
    });

    return () => {
      window.removeEventListener("online", refreshWhenOnline);
      subscription.unsubscribe();
    };
  }, [supabase, refreshUser]);

  const signOut = useCallback(
    async (opts?: { redirectUrl?: string }) => {
      await Promise.all([
        supabase.auth.signOut(),
        fetch("/api/auth/logout", { method: "POST", credentials: "include" }),
      ]);
      setUser(null);
      setAccessToken(null);
      router.push(opts?.redirectUrl || "/login");
    },
    [supabase, router],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoaded,
        isSignedIn: !!user,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: (opts?: { redirectUrl?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
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
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const supabaseRef = useRef(createSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      setUser(mapSupabaseUser(supabaseUser));
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, [supabase]);

  useEffect(() => {
    // Load initial session
    refreshUser();

    // Listen to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(mapSupabaseUser(session?.user ?? null));
        setIsLoaded(true);
      }
    );

    return () => {
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
      router.push(opts?.redirectUrl || "/login");
    },
    [supabase, router]
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoaded, isSignedIn: !!user, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

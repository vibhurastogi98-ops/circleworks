"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { shouldSyncAuthOnRoute } from "@/lib/platform-routes";
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

function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  const storageKeys = new Set<string>();
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split(".")[0] : "";
    if (projectRef) storageKeys.add(`sb-${projectRef}-auth-token`);
  } catch {
    // Fall back to scanning storage keys below.
  }

  [window.localStorage, window.sessionStorage].forEach((storage) => {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
        storageKeys.add(key);
      }
    }
    storageKeys.forEach((key) => storage.removeItem(key));
  });
}

function isInvalidRefreshTokenError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /invalid refresh token|refresh token not found/i.test(message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const shouldSyncAuth = shouldSyncAuthOnRoute(pathname);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const refreshUser = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setUser(null);
      setAccessToken(null);
      setIsLoaded(true);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(mapSupabaseUser(session?.user ?? null));
      setAccessToken(session?.access_token ?? null);
    } catch (error) {
      if (isInvalidRefreshTokenError(error)) {
        clearSupabaseAuthStorage();
      }
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoaded(true);
    }
  }, [supabase]);

  useEffect(() => {
    if (!shouldSyncAuth) {
      setUser(null);
      setAccessToken(null);
      setIsLoaded(true);
      return;
    }

    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;
    setIsLoaded(false);

    const refreshWhenOnline = () => {
      void refreshUser();
    };
    window.addEventListener("online", refreshWhenOnline);

    const loadSessionAndSubscribe = async () => {
      await refreshUser();
      if (cancelled) return;

      // Listen after stale-session cleanup so invalid refresh tokens do not
      // surface as noisy development overlay errors on public pages.
      const response = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(mapSupabaseUser(session?.user ?? null));
        setAccessToken(session?.access_token ?? null);
        setIsLoaded(true);
      });
      subscription = response.data.subscription;
      if (cancelled) subscription.unsubscribe();
    };

    void loadSessionAndSubscribe();

    return () => {
      cancelled = true;
      window.removeEventListener("online", refreshWhenOnline);
      subscription?.unsubscribe();
    };
  }, [supabase, refreshUser, shouldSyncAuth]);

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

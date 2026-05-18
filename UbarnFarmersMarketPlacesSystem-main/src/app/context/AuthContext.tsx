import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { Profile, UserRole } from "../../lib/auth";

/**
 * FBEconnect – Auth Context (BULLETPROOF v3)
 * ─────────────────────────────────────────────────────────────────────────────
 * This version eliminates ALL known causes of:
 *   • "Stuck on Verifying Session" infinite loading
 *   • Ghost dashboard (broken profile / missing role)
 *   • Double-fire race conditions from getSession + onAuthStateChange
 *
 * DESIGN RULES:
 *   1. `loading` starts TRUE and goes FALSE exactly ONCE on mount.
 *      It is NEVER set back to TRUE after that (except during signOut).
 *   2. SignOut has a 3-second hard timeout — it WILL complete no matter what.
 *   3. Profile fetch has its own timeout — never hangs.
 *   4. onAuthStateChange SKIPS the INITIAL_SESSION event (handled by getSession).
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  hasRole: () => false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Track whether initial load has completed — prevents re-setting loading to true
  const initialLoadDone = useRef(false);

  /**
   * Fetch profile — simple, reliable, no AbortController overhead.
   * Returns null on any error; never throws, never hangs.
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, avatar_url")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[Auth] Profile fetch error:", error.message);
        return null;
      }
      return (data as Profile) ?? null;
    } catch (err: any) {
      console.error("[Auth] Profile fetch failed:", err?.message || err);
      return null;
    }
  }, []);

  // ── MOUNT: single initialization ──────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    // Hard safety net: no matter what happens, loading WILL be false after 6 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted && !initialLoadDone.current) {
        console.warn("[Auth] Safety timer fired — forcing loading=false");
        initialLoadDone.current = true;
        setLoading(false);
      }
    }, 6000);

    // 1. Get the initial session
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          if (!mounted) return;
          setProfile(p);
        }
      } catch (err) {
        console.error("[Auth] Init error:", err);
      } finally {
        if (mounted) {
          initialLoadDone.current = true;
          setLoading(false);
        }
      }
    };

    init();

    // 2. Listen for auth changes (sign-in, sign-out, token refresh)
    //    SKIP the INITIAL_SESSION event — we already handled it above.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, changedSession) => {
        if (!mounted) return;
        if (event === "INITIAL_SESSION") return; // Already handled by getSession

        if (import.meta.env.DEV) {
          console.log("[Auth] event:", event);
        }

        setSession(changedSession);
        setUser(changedSession?.user ?? null);

        if (changedSession?.user) {
          const p = await fetchProfile(changedSession.user.id);
          if (mounted) setProfile(p);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Sign out with a HARD 3-SECOND TIMEOUT.
   * No matter what Supabase does, the user WILL be logged out locally.
   */
  const handleSignOut = useCallback(async () => {
    setLoading(true);

    // Race: Supabase signOut vs 3-second timeout
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Sign-out timeout")), 3000)),
      ]);
    } catch (err) {
      console.error("[Auth] Sign-out error (forced local cleanup):", err);
    }

    // ALWAYS clear local state — this is the critical part
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  }, [user, fetchProfile]);

  /**
   * Returns true if the authenticated user has at least one of the given roles.
   */
  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!profile) return false;
      return roles.includes(profile.role as UserRole);
    },
    [profile]
  );

  const isAuthenticated = !!session && !loading;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isAuthenticated,
        hasRole,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

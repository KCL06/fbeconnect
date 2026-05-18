import { Navigate, Outlet, useLocation } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../../lib/auth";
import Loading from "./Loading";
import { useEffect, useRef } from "react";

interface RoleGuardProps {
  /**
   * Roles allowed to access this route.
   * If the authenticated user's role is NOT in this list, they are redirected.
   */
  allowedRoles: UserRole[];
}

/**
 * FBEconnect – Role-Based Access Control (RBAC) Guard
 * ─────────────────────────────────────────────────────────────────────────────
 * Must be placed INSIDE ProtectedRoute (which already verifies authentication).
 *
 * Behaviour:
 *   1. While profile is loading → Shows a spinner (should be brief since
 *      ProtectedRoute waits for session + profile fetch).
 *   2. If the user's role is NOT in allowedRoles:
 *      → Shows a "no permission" toast and redirects to /app (dashboard).
 *   3. If the role IS allowed → Renders the child route.
 *
 * Usage in routes.tsx:
 *   { element: <RoleGuard allowedRoles={["admin"]} />, children: [...] }
 *
 * ⚠️ IMPORTANT: This is a UI guard only. Server-side RLS must enforce the
 * same rules so that a role-mismatch user cannot read data via the API directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { profile, loading, profileLoaded } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false); // Prevent duplicate toasts on re-render

  // Still fetching the profile (or auth state)
  if (loading || !profileLoaded) {
    return <Loading fullScreen message="Checking permissions..." />;
  }

  const userRole = profile?.role as UserRole | undefined;
  const hasAccess = userRole && allowedRoles.includes(userRole);

  // ── Role mismatch → redirect to dashboard ─────────────────────────────────
  if (!hasAccess) {
    // Show the toast once per navigation attempt
    if (!toastShown.current) {
      toastShown.current = true;
      // We use a short timeout so the toast fires after the redirect render
      setTimeout(() => {
        toast.error("You don't have permission to access that page.");
      }, 100);
    }
    return (
      <Navigate
        to="/app"
        replace
        state={{ blockedFrom: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

/**
 * Inline component variant for use in JSX where Outlet is not needed.
 * Renders children or null, no redirect.
 *
 * @example
 * <RoleGate roles={["admin"]}>
 *   <AdminPanel />
 * </RoleGate>
 */
export function RoleGate({
  roles,
  children,
  fallback = null,
}: {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  return hasRole(roles) ? <>{children}</> : <>{fallback}</>;
}

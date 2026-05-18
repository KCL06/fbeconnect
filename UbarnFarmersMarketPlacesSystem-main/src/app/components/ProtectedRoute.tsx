import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * FBEconnect – Protected Route Guard
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps all routes under /app/* to enforce authentication.
 *
 *   1. While auth is being verified → Shows a full-screen loading spinner.
 *   2. If no valid session → Redirects to /login.
 *   3. If authenticated → Renders the child route via <Outlet />.
 *
 * NOTE: We only check for a valid SESSION here, not for a complete profile.
 * Checking for profile caused an infinite redirect loop:
 *   safety-timer fires → profile not yet loaded → redirect /login →
 *   auth resolves → login redirects /app → profile still null → loop.
 * Individual pages receive profile from AuthContext and handle null gracefully.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Wait for auth verification to complete (only once on mount)
  if (loading) {
    return <Loading fullScreen message="Verifying session..." />;
  }

  // No valid session → redirect to login
  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated — render the protected page
  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * FBEconnect – Protected Route Guard
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps all routes under /app/* to enforce authentication.
 *
 *   1. While auth is being verified → Shows a full-screen loading spinner.
 *   2. If not authenticated → Redirects to /login.
 *   3. If authenticated → Renders the child route via <Outlet />.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Wait for auth verification to complete (only once on mount)
  if (loading) {
    return <Loading fullScreen message="Verifying session..." />;
  }

  // Redirect unauthenticated users to login
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

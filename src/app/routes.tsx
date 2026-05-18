import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import Loading from "./components/Loading";

/**
 * FBEconnect – Application Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * SECURITY:
 *   - All /app/* routes are wrapped in <ProtectedRoute> which enforces login.
 *   - Role-sensitive routes are additionally wrapped in <RoleGuard>.
 *
 * PERFORMANCE:
 *   - All page components are lazy-loaded (React.lazy + dynamic import).
 *   - Each page chunk is code-split at the route level, reducing initial bundle.
 *   - A <Suspense> fallback spinner shows while chunks load.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Error Boundary for Lazy Loading ──────────────────────────────────────────
import { useRouteError } from "react-router";

function GlobalErrorBoundary() {
  const error = useRouteError() as Error;
  
  // Catch Vite chunk load errors (happens when deploying new versions)
  if (error?.message?.includes("Failed to fetch dynamically imported module")) {
    // Auto-reload once to pick up the new deployment chunk hashes.
    // Prevents an infinite reload loop by only reloading if we haven't just done so.
    const reloadKey = "app_chunk_reload";
    const lastReload = Number(sessionStorage.getItem(reloadKey) ?? 0);
    if (Date.now() - lastReload > 10_000) {
      sessionStorage.setItem(reloadKey, String(Date.now()));
      window.location.reload();
    }
    // Show a brief loader while the reload is happening
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-900">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-emerald-200 text-sm">Updating FBEconnect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-900 text-white p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Application Error</h1>
      <p className="text-red-200 mb-6">{error?.message || "An unexpected error occurred."}</p>
      <button onClick={() => window.location.href = '/'} className="bg-white text-red-900 px-6 py-2 rounded-lg font-bold">Return Home</button>
    </div>
  );
}

// ── Public Pages (no auth required) ──────────────────────────────────────────
const Landing           = lazy(() => import("./pages/Landing"));
const Login             = lazy(() => import("./pages/Login"));
const Register          = lazy(() => import("./pages/Register"));
const RegisterFarmer    = lazy(() => import("./pages/RegisterFarmer"));
const RegisterBuyer     = lazy(() => import("./pages/RegisterBuyer"));
const RegisterExpert    = lazy(() => import("./pages/RegisterExpert"));
const ForgotPassword    = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword    = lazy(() => import("./pages/UpdatePassword"));
const Privacy           = lazy(() => import("./pages/Privacy"));
const Terms             = lazy(() => import("./pages/Terms"));
const NotFound          = lazy(() => import("./pages/NotFound"));

// ── Protected Pages (auth required) ──────────────────────────────────────────
const Layout            = lazy(() => import("./components/Layout"));
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const MyFarmRecords     = lazy(() => import("./pages/MyFarmRecords"));
const Products          = lazy(() => import("./pages/Products"));
const MarketPrices      = lazy(() => import("./pages/MarketPrices"));
const Consultations     = lazy(() => import("./pages/Consultations"));
const Messages          = lazy(() => import("./pages/Messages"));
const MarketPlace       = lazy(() => import("./pages/MarketPlace"));
const Transaction       = lazy(() => import("./pages/Transaction"));
const Notification      = lazy(() => import("./pages/Notification"));
const ReviewsRatings    = lazy(() => import("./pages/ReviewsRatings"));
const OrderTracking     = lazy(() => import("./pages/OrderTracking"));
const ExpertKnowledge   = lazy(() => import("./pages/ExpertKnowledge"));
const ExpertConsultations = lazy(() => import("./pages/ExpertConsultations"));
const Cart              = lazy(() => import("./pages/Cart"));
const Settings          = lazy(() => import("./pages/Settings"));
const Profile           = lazy(() => import("./pages/Profile"));
const VideoCall         = lazy(() => import("./pages/VideoCall"));

// ── Admin-Only Pages ──────────────────────────────────────────────────────────
const AdminDashboard    = lazy(() => import("./pages/AdminDashboard"));
const UserFeedback      = lazy(() => import("./pages/UserFeedback"));

// ── Suspense Wrapper ──────────────────────────────────────────────────────────
/** Wraps lazy-loaded pages with a consistent loading fallback. */
function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading fullScreen message="Loading page..." />}>
      {children}
    </Suspense>
  );
}



// ── Router Definition ─────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // ── Public Routes ───────────────────────────────────────────────────────
  {
    path: "/",
    element: <PageSuspense><Landing /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/privacy",
    element: <PageSuspense><Privacy /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/terms",
    element: <PageSuspense><Terms /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/login",
    element: <PageSuspense><Login /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/register",
    element: <PageSuspense><Register /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/forgot-password",
    element: <PageSuspense><ForgotPassword /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/update-password",
    element: <PageSuspense><UpdatePassword /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/register/farmer",
    element: <PageSuspense><RegisterFarmer /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/register/buyer",
    element: <PageSuspense><RegisterBuyer /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/register/expert",
    element: <PageSuspense><RegisterExpert /></PageSuspense>,
    errorElement: <GlobalErrorBoundary />,
  },

  // ── Protected Routes (requires authentication) ───────────────────────────
  {
    element: <ProtectedRoute />,                       // 🔐 Auth gate
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: "/app",
        element: (
          <PageSuspense>
            <Layout />
          </PageSuspense>
        ),
        errorElement: <GlobalErrorBoundary />,
        children: [
          // ── Available to all authenticated roles ────────────────────────
          { index: true,                   element: <PageSuspense><Dashboard /></PageSuspense> },
          { path: "market-prices",         element: <PageSuspense><MarketPrices /></PageSuspense> },
          { path: "messages",              element: <PageSuspense><Messages /></PageSuspense> },
          { path: "call/:roomId",          element: <PageSuspense><VideoCall /></PageSuspense> },
          { path: "notification",          element: <PageSuspense><Notification /></PageSuspense> },
          { path: "reviews",               element: <PageSuspense><ReviewsRatings /></PageSuspense> },
          { path: "expert-knowledge",      element: <PageSuspense><ExpertKnowledge /></PageSuspense> },
          { path: "settings",              element: <PageSuspense><Settings /></PageSuspense> },
          { path: "profile",               element: <PageSuspense><Profile /></PageSuspense> },

          // ── Farmer-only routes ──────────────────────────────────────────
          {
            element: <RoleGuard allowedRoles={["farmer"]} />,    // 🎭 Role gate
            children: [
              { path: "farm-records",      element: <PageSuspense><MyFarmRecords /></PageSuspense> },
              { path: "products",          element: <PageSuspense><Products /></PageSuspense> },
              { path: "consultations",     element: <PageSuspense><Consultations /></PageSuspense> },
            ],
          },

          // ── Farmer + Buyer routes ───────────────────────────────────────
          {
            element: <RoleGuard allowedRoles={["farmer", "buyer"]} />,
            children: [
              { path: "marketplace",       element: <PageSuspense><MarketPlace /></PageSuspense> },
              { path: "order-tracking",    element: <PageSuspense><OrderTracking /></PageSuspense> },
            ],
          },

          // ── Farmer + Buyer + Admin routes ───────────────────────────────
          {
            element: <RoleGuard allowedRoles={["farmer", "buyer", "admin"]} />,
            children: [
              { path: "transaction",       element: <PageSuspense><Transaction /></PageSuspense> },
            ],
          },

          // ── Buyer + Farmer routes (shopping) ────────────────────────────
          {
            element: <RoleGuard allowedRoles={["farmer", "buyer"]} />,
            children: [
              { path: "cart",              element: <PageSuspense><Cart /></PageSuspense> },
            ],
          },

          // ── Expert-only routes ──────────────────────────────────────────
          {
            element: <RoleGuard allowedRoles={["expert"]} />,
            children: [
              { path: "expert-consultations", element: <PageSuspense><ExpertConsultations /></PageSuspense> },
            ],
          },

          // ── Admin-only routes ───────────────────────────────────────────
          {
            element: <RoleGuard allowedRoles={["admin"]} />,     // 🔴 Admin gate
            children: [
              { path: "admin",             element: <PageSuspense><AdminDashboard /></PageSuspense> },
              { path: "user-feedback",     element: <PageSuspense><UserFeedback /></PageSuspense> },
            ],
          },

          // ── Catch-all within /app ───────────────────────────────────────
          {
            path: "*",
            element: <PageSuspense><NotFound /></PageSuspense>,
          },
        ],
      },
    ],
  },

  // ── Global 404 ───────────────────────────────────────────────────────────
  {
    path: "*",
    element: <PageSuspense><NotFound /></PageSuspense>,
  },
]);

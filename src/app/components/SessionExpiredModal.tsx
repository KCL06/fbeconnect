import { useEffect, useState, useRef } from "react";
import { LogIn, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";

/**
 * FBEconnect – Session Expired Modal
 * ─────────────────────────────────────────────────────────────────────────────
 * Listens for Supabase TOKEN_REFRESHED failures and SIGNED_OUT events that
 * occur while the user is actively using the app.
 *
 * NOTE: This component lives OUTSIDE <RouterProvider> in App.tsx, so it
 * cannot use React Router hooks. We use window.location.href instead,
 * which is actually better for session expiry — a full reload clears
 * any stale in-memory state.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);
  const isExplicitSignOut = useRef(false);

  useEffect(() => {
    // We only want to show the modal if the token refresh failed.
    // Supabase emits 'SIGNED_OUT' when a token fails to refresh OR when signOut() is called.
    
    // Intercept explicit sign out to prevent the modal from showing
    const originalSignOut = supabase.auth.signOut.bind(supabase.auth);
    supabase.auth.signOut = async (options) => {
      isExplicitSignOut.current = true;
      return originalSignOut(options);
    };

    let hadSession = false;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      hadSession = !!session;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        hadSession = !!session;
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        hadSession = true;
        setVisible(false);
        isExplicitSignOut.current = false;
      } else if (event === "SIGNED_OUT") {
        // Show modal ONLY if we previously had a session AND it wasn't an explicit sign out
        if (hadSession && !isExplicitSignOut.current) {
          setVisible(true);
        }
        hadSession = false;
      }
    });

    return () => {
      subscription.unsubscribe();
      supabase.auth.signOut = originalSignOut;
    };
  }, []);

  const handleLogin = () => {
    setVisible(false);
    window.location.href = "/login";
  };

  if (!visible) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center ring-2 ring-amber-500/40">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Content */}
        <h2
          id="session-expired-title"
          className="text-xl font-bold text-white mb-2"
        >
          Session Expired
        </h2>
        <p className="text-emerald-200 text-sm mb-6 leading-relaxed">
          Your session has expired for security reasons. Please log in again to
          continue where you left off.
        </p>

        {/* CTA */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
          autoFocus
        >
          <LogIn className="w-4 h-4" />
          Log In Again
        </button>
      </div>
    </div>
  );
}

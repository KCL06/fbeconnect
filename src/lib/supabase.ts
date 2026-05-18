import { createClient } from "@supabase/supabase-js";

/**
 * FBEconnect – Supabase Client
 * ─────────────────────────────────────────────────────────────────────────────
 * PUBLIC variables (safe to expose in the browser bundle):
 *   VITE_SUPABASE_URL       – Your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY  – Supabase "anon/public" key (row-level security
 *                              must be configured to restrict data access)
 *
 * PRIVATE / SERVER-SIDE secrets (NEVER prefix with VITE_):
 *   SUPABASE_SERVICE_ROLE_KEY – Full admin access; only used in Edge Functions
 *   DATABASE_URL              – Direct DB connection; only used server-side
 *   Any third-party API keys  – Payment, SMS, email; server-side only
 *
 * ⚠️ SECURITY: The anon key is NOT a secret. It is safe to expose in the
 * browser. Security is enforced by Supabase Row-Level Security (RLS) policies
 * on your database tables. Never use the service_role key on the frontend.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Throw in development so the error is immediately visible.
  // In production builds, Vite replaces import.meta.env at build time — if
  // the env vars are missing the build itself will produce undefined values.
  if (import.meta.env.DEV) {
    throw new Error(
      "[FBEconnect] Missing Supabase environment variables.\n" +
      "Create a .env file based on .env.example and restart the dev server."
    );
  } else {
    // In production, log a warning without crashing (guards against edge cases)
    console.warn("[FBEconnect] Supabase env vars not found – check Vercel environment settings.");
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage (default) for returning users
    persistSession: true,
    // Automatically refresh the JWT token before it expires
    autoRefreshToken: true,
    // Detect session from URL hash (required for password reset flow)
    detectSessionInUrl: true,
  },
});

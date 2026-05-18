import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Sprout, ShoppingBag, GraduationCap, Shield, Lock, Clock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useRateLimit } from "../../hooks/useRateLimit";
import { validateEmail } from "../../utils/validation";
import { supabase } from "../../lib/supabase";
import { getErrorMessage } from "../../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading } = useAuth();

  const [formData, setFormData]   = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMfa, setShowMfa]     = useState(false);
  const [mfaCode, setMfaCode]     = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");

  // ── Rate limiting (max 5 failed attempts within 5 min → 30 s lock) ──────
  const { isThrottled, remainingSeconds, attemptsLeft, recordAttempt, reset } =
    useRateLimit({ storageKey: "login_attempts" });

  // ── Redirect already-authenticated users away from login ─────────────────
  useEffect(() => {
    if (!loading && session) {
      // Return them to the page they originally tried to visit, or /app
      const from = (location.state as any)?.from?.pathname ?? "/app";
      navigate(from, { replace: true });
    }
  }, [session, loading, navigate, location]);

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side throttle
    if (isThrottled) {
      toast.error(`Too many attempts. Please wait ${remainingSeconds}s.`);
      return;
    }

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        // Record failure for rate limiting
        recordAttempt();
        throw error;
      }

      // ── MFA check ──────────────────────────────────────────────────────
      if (data.user?.factors && data.user.factors.length > 0) {
        const factor = data.user.factors.find(
          (f: any) => f.factor_type === "totp" && f.status === "verified"
        );
        if (factor) {
          setMfaFactorId(factor.id);
          setShowMfa(true);
          setIsLoading(false);
          return;
        }
      }

      // ── Success ────────────────────────────────────────────────────────
      reset(); // Clear rate limit on success
      toast.success("Welcome back to FBEconnect!");
      // Navigate to the originally-requested page or dashboard
      const from = (location.state as any)?.from?.pathname ?? "/app";
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
        const left = attemptsLeft - 1;
        toast.error(
          left > 0
            ? `Wrong email or password. ${left} attempt${left !== 1 ? "s" : ""} remaining.`
            : "Wrong email or password. You will be locked out on the next failed attempt."
        );
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Please verify your email address first. Check your inbox.");
      } else {
        // ⚠️ Use classified error — never expose raw Supabase messages in production
        toast.error(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── MFA verification ──────────────────────────────────────────────────────
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaCode,
      });
      if (error) throw error;
      reset();
      toast.success("Welcome back to FBEconnect!");
      const from = (location.state as any)?.from?.pathname ?? "/app";
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error("Invalid authentication code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // While auth is initializing, show a minimal full-screen loader.
  // Returning null caused a blank-screen flicker on every page load.
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-emerald-300 text-sm font-medium">Checking session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" id="main-content">
          <div className="w-full max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-10 items-center">

              {/* Left – Branding */}
              <div className="text-white hidden lg:block">
                <div className="flex items-center gap-3 mb-6">
                  <Logo size="lg" />
                </div>
                <h1 className="text-3xl font-bold mb-4 leading-tight">
                  Welcome Back to Your Agricultural Hub
                </h1>
                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                  Access your farm records, connect with buyers, track market prices, and consult with experts — all in one place.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Sprout, label: "Manage farm records & activities" },
                    { icon: ShoppingBag, label: "Buy & sell agricultural products" },
                    { icon: GraduationCap, label: "Access expert knowledge library" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-700/60 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Icon className="w-4 h-4 text-emerald-300" />
                      </div>
                      <span className="text-emerald-100">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right – Login Form */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-3">
                    <Logo size="sm" className="lg:hidden" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                  <p className="text-emerald-200 text-sm">Login to your FBEconnect account</p>
                </div>

                {/* ── Rate-limit lockout banner ── */}
                {isThrottled && (
                  <div className="mb-5 flex items-center gap-3 bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3" role="alert">
                    <Clock className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                    <p className="text-red-200 text-sm font-medium">
                      Too many failed attempts. Please wait{" "}
                      <span className="font-bold text-red-100">{remainingSeconds}s</span> before trying again.
                    </p>
                  </div>
                )}

                {showMfa ? (
                  /* ── MFA Form ── */
                  <form onSubmit={handleVerifyMfa} className="space-y-5" noValidate>
                    <div>
                      <label htmlFor="mfa-code" className="block text-sm font-medium text-emerald-100 mb-2">
                        Two-Factor Authentication Code
                      </label>
                      <input
                        id="mfa-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all tracking-widest text-center font-mono text-xl"
                        required
                        aria-label="6-digit authentication code"
                      />
                      <p className="text-emerald-300 text-xs mt-2 text-center">Open your authenticator app to get the code.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || mfaCode.length < 6}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
                    >
                      {isLoading ? "Verifying..." : "Verify & Login"}
                      {!isLoading && <ArrowRight className="w-5 h-5" aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowMfa(false); setMfaCode(""); }}
                      className="w-full text-emerald-300 hover:text-white transition-colors text-sm font-medium mt-2"
                    >
                      Cancel and go back
                    </button>
                  </form>
                ) : (
                  /* ── Login Form ── */
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-emerald-100 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                        required
                        disabled={isThrottled}
                        aria-describedby={isThrottled ? "rate-limit-msg" : undefined}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-emerald-100 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter your password"
                          className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/60 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                          required
                          disabled={isThrottled}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-emerald-200 cursor-pointer">
                        <input
                          type="checkbox"
                          id="remember"
                          className="h-4 w-4 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-500"
                        />
                        Remember me
                      </label>
                      <Link to="/forgot-password" className="text-emerald-300 hover:text-white transition-colors font-medium">
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || isThrottled}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
                      aria-busy={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                          Signing in...
                        </>
                      ) : isThrottled ? (
                        <>
                          <Lock className="w-4 h-4" aria-hidden="true" />
                          Locked ({remainingSeconds}s)
                        </>
                      ) : (
                        <>
                          Login to FBEconnect
                          <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-6 pt-5 border-t border-white/20">
                  <div className="bg-emerald-900/40 rounded-xl p-4 mb-5 border border-emerald-500/20 text-center shadow-inner">
                    <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-emerald-50 text-sm font-bold mb-1 tracking-wide">Secure Login</p>
                    <p className="text-emerald-200/80 text-xs leading-relaxed max-w-xs mx-auto">
                      Your connection is protected by enterprise-grade security and end-to-end encryption.
                    </p>
                  </div>
                  <p className="text-center text-emerald-200 text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-white font-semibold hover:text-emerald-300 transition-colors">
                      Register here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

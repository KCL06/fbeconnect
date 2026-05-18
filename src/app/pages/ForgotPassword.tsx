import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, Leaf, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { validateEmail } from "../../utils/validation";
import {
  PASSWORD_RESET_COOLDOWN_SECONDS,
  PASSWORD_RESET_MAX_RESENDS,
  PASSWORD_RESET_EXTENDED_COOLDOWN_SECONDS,
} from "../../utils/constants";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const resendCount = useRef(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) { setEmailError("Email is required"); return; }
    if (!validateEmail(email)) { setEmailError("Please enter a valid email"); return; }
    if (countdown > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/update-password` }
      );
      if (error) throw error;

      resendCount.current += 1;
      setIsSent(true);
      const cooldown = resendCount.current >= PASSWORD_RESET_MAX_RESENDS
        ? PASSWORD_RESET_EXTENDED_COOLDOWN_SECONDS
        : PASSWORD_RESET_COOLDOWN_SECONDS;
      setCountdown(cooldown);
      toast.success("Password reset link sent to your email.");
    } catch {
      // ⚠️ BACKEND: Never reveal whether the email exists (prevents enumeration)
      toast.error("If that email is registered, a reset link has been sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 relative overflow-hidden items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1724531281596-cfae90d5a082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }} aria-hidden="true" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 mb-4 shadow-lg" aria-hidden="true">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-emerald-200">{isSent ? "Check your inbox for the reset link" : "Enter your email to receive a password reset link"}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {isSent ? (
            <div className="text-center">
              <p className="mb-6 text-emerald-100">We've sent a reset link to <strong className="text-white">{email}</strong>. Check spam if you don't see it.</p>
              <div className="space-y-3">
                <button onClick={() => handleSubmit()} disabled={isSubmitting || countdown > 0} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all border border-white/20">
                  {countdown > 0 ? (<><Clock className="w-4 h-4" /> Resend in {countdown}s</>) : isSubmitting ? "Sending..." : "Resend Email"}
                </button>
                <Link to="/login" className="inline-block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-center">Return to Login</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-emerald-100 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" aria-hidden="true" />
                  <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} onBlur={handleEmailBlur} className={`w-full bg-white/10 border text-white placeholder-emerald-300/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${emailError ? "border-red-400" : "border-white/20"}`} placeholder="Enter your registered email" aria-invalid={!!emailError} />
                </div>
                {emailError && <p className="text-red-300 text-xs mt-1" role="alert">{emailError}</p>}
              </div>
              <button type="submit" disabled={isSubmitting || !!emailError} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-emerald-300 hover:text-white transition-colors text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

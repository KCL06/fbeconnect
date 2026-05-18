import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Key, Eye, EyeOff, Leaf, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { validatePassword, passwordsMatch } from "../../utils/validation";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pwResult = validatePassword(password);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Invalid or expired password reset link.");
        navigate("/login");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwResult.valid) { toast.error(pwResult.errors[0]); return; }
    if (!passwordsMatch(password, confirmPassword)) { toast.error("Passwords do not match."); return; }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthColors = { weak: "bg-red-500", medium: "bg-yellow-500", strong: "bg-emerald-500" };
  const strengthWidths = { weak: "w-1/4", medium: "w-2/4", strong: "w-full" };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 relative overflow-hidden items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1724531281596-cfae90d5a082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }} aria-hidden="true" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 mb-4 shadow-lg" aria-hidden="true"><Leaf className="w-8 h-8 text-white" /></div>
          <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-emerald-200">Please enter your new secure password below.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-emerald-100 mb-2">New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" aria-hidden="true" />
                <input id="new-password" type={showPassword ? "text" : "password"} required value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColors[pwResult.strength]} ${strengthWidths[pwResult.strength]}`} />
                  </div>
                  <p className={`text-xs font-medium capitalize ${pwResult.strength === "strong" ? "text-emerald-400" : pwResult.strength === "medium" ? "text-yellow-400" : "text-red-400"}`}>
                    Strength: {pwResult.strength}
                  </p>
                  <ul className="space-y-1">
                    {[
                      { check: password.length >= 8, label: "At least 8 characters" },
                      { check: /[A-Z]/.test(password), label: "One uppercase letter" },
                      { check: /\d/.test(password), label: "One number" },
                      { check: /[^a-zA-Z0-9]/.test(password), label: "One special character (recommended)" },
                    ].map((rule) => (
                      <li key={rule.label} className="flex items-center gap-2 text-xs">
                        {rule.check ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-white/30" />}
                        <span className={rule.check ? "text-emerald-300" : "text-white/40"}>{rule.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-emerald-100 mb-2">Confirm New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" aria-hidden="true" />
                <input id="confirm-password" type={showPassword ? "text" : "password"} required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-white/10 border text-white placeholder-emerald-300/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${confirmPassword && !passwordsMatch(password, confirmPassword) ? "border-red-400" : "border-white/20"}`} placeholder="Confirm your password" />
              </div>
              {confirmPassword && !passwordsMatch(password, confirmPassword) && (
                <p className="text-red-300 text-xs mt-1" role="alert">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting || !pwResult.valid || !passwordsMatch(password, confirmPassword)} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

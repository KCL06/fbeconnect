import { useState, useEffect } from "react";
import { Key, EyeOff, Eye, Shield } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

export default function SecurityTab() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [mfaData, setMfaData] = useState<{ qrCode: string; factorId: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactor = data.totp.find((factor) => factor.status === "verified");
      setIsMfaEnabled(!!totpFactor);
    } catch (err: any) {
      console.error("Error checking MFA status:", err.message);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error("Failed to update password: " + err.message);
    }
  };

  const handleEnableMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setMfaData({ qrCode: data.totp.uri, factorId: data.id });
    } catch (err: any) {
      toast.error("Failed to start MFA enrollment: " + err.message);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaData || mfaCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaData.factorId,
        code: mfaCode,
      });
      if (error) throw error;
      toast.success("Two-Factor Authentication successfully enabled!");
      setMfaData(null);
      setMfaCode("");
      setIsMfaEnabled(true);
    } catch (err: any) {
      toast.error("Invalid code: " + err.message);
    }
  };

  const handleDisableMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactor = data.totp.find((factor) => factor.status === "verified");
      if (totpFactor) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
        if (unenrollError) throw unenrollError;
        toast.success("Two-Factor Authentication disabled.");
        setIsMfaEnabled(false);
      }
    } catch (err: any) {
      toast.error("Failed to disable MFA: " + err.message);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-emerald-200 text-sm mb-2">Current Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              placeholder="Enter current password"
              className="w-full bg-white/10 text-white pl-10 pr-12 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-emerald-200 text-sm mb-2">New Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showNewPassword ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              placeholder="Enter new password"
              className="w-full bg-white/10 text-white pl-10 pr-12 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-emerald-200 text-sm mb-2">Confirm New Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              placeholder="Confirm new password"
              className="w-full bg-white/10 text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Update Password
        </button>

        <div className="border-t border-white/10 pt-6 mt-6">
          <h3 className="text-lg font-bold text-white mb-4">Two-Factor Authentication</h3>
          <p className="text-gray-400 text-sm mb-4">Add an extra layer of security to your account</p>
          
          {isMfaEnabled ? (
            <div>
              <p className="text-emerald-400 font-medium mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> 2FA is Currently Enabled
              </p>
              <button 
                onClick={handleDisableMfa}
                className="bg-red-600/80 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
              >
                Disable 2FA
              </button>
            </div>
          ) : mfaData ? (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-white font-medium mb-4">Scan this QR Code with your Authenticator App</p>
              <div className="bg-white p-4 inline-block rounded-xl mb-4">
                <QRCodeSVG value={mfaData.qrCode} size={150} />
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-2">Enter 6-digit code</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    className="w-32 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest font-mono"
                    placeholder="000000"
                  />
                  <button
                    onClick={handleVerifyMfa}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Verify & Enable
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleEnableMfa}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-semibold transition-all border border-white/20"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

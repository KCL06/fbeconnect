import { User, Bell, Lock, CreditCard, Globe, Shield } from "lucide-react";
import { useState } from "react";
import ProfileTab from "./settings-tabs/ProfileTab";
import NotificationsTab from "./settings-tabs/NotificationsTab";
import SecurityTab from "./settings-tabs/SecurityTab";
import PaymentTab from "./settings-tabs/PaymentTab";
import LanguageTab from "./settings-tabs/LanguageTab";
import PrivacyTab from "./settings-tabs/PrivacyTab";

type SettingsTab = "profile" | "notifications" | "security" | "payment" | "language" | "privacy";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-emerald-200">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sticky top-8">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "profile" ? "bg-emerald-700 text-white" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Edit Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "notifications" ? "bg-emerald-700 text-white" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "security" ? "bg-emerald-700 text-white" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "payment" ? "bg-emerald-700 text-white" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Payment Methods</span>
              </button>
              <button
                onClick={() => setActiveTab("language")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "language" ? "bg-emerald-700 text-white" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">Language & Region</span>
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "privacy" ? "bg-emerald-700 text-white" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Privacy</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "payment" && <PaymentTab />}
          {activeTab === "language" && <LanguageTab />}
          {activeTab === "privacy" && <PrivacyTab />}
        </div>
      </div>
    </div>
  );
}
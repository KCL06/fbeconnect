import { toast } from "sonner";

export default function PrivacyTab() {
  const handleDeleteAccount = () => {
    toast.error("Please contact support to delete your account.");
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Profile Visibility</p>
            <p className="text-gray-400 text-sm">Make your profile visible to other users</p>
          </div>
          <button className="relative w-12 h-6 rounded-full transition-colors bg-emerald-600">
            <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform translate-x-6" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Show Online Status</p>
            <p className="text-gray-400 text-sm">Let others see when you're online</p>
          </div>
          <button className="relative w-12 h-6 rounded-full transition-colors bg-gray-600">
            <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5" />
          </button>
        </div>

        <div className="border-t border-white/10 pt-6 mt-6">
          <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
          <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back.</p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

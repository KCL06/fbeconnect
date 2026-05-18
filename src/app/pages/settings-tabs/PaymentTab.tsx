import { CreditCard, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentTab() {
  const handleAddPaymentMethod = () => {
    toast.info("Payment method feature coming soon!");
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Payment Methods</h2>

      <div className="space-y-4 mb-6">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Visa ending in 4242</p>
              <p className="text-gray-400 text-sm">Expires 12/2027</p>
            </div>
          </div>
          <span className="bg-emerald-900/50 text-emerald-300 text-xs px-3 py-1 rounded-full">Default</span>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Mastercard ending in 8888</p>
              <p className="text-gray-400 text-sm">Expires 06/2026</p>
            </div>
          </div>
          <button className="text-red-400 hover:text-red-300 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddPaymentMethod}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
      >
        <CreditCard className="w-5 h-5" />
        Add Payment Method
      </button>
    </div>
  );
}

import { useState } from "react";
import { toast } from "sonner";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    orders: true,
    messages: true,
    prices: false,
    marketing: false,
  });

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Order Updates</p>
            <p className="text-gray-400 text-sm">Get notified about new orders and order status</p>
          </div>
          <button
            onClick={() => {
              setNotifications({ ...notifications, orders: !notifications.orders });
              toast.success(!notifications.orders ? "Order notifications enabled" : "Order notifications disabled");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications.orders ? "bg-emerald-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                notifications.orders ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Messages</p>
            <p className="text-gray-400 text-sm">Receive notifications for new messages</p>
          </div>
          <button
            onClick={() => {
              setNotifications({ ...notifications, messages: !notifications.messages });
              toast.success(!notifications.messages ? "Message notifications enabled" : "Message notifications disabled");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications.messages ? "bg-emerald-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                notifications.messages ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Price Alerts</p>
            <p className="text-gray-400 text-sm">Get updates on market price changes</p>
          </div>
          <button
            onClick={() => {
              setNotifications({ ...notifications, prices: !notifications.prices });
              toast.success(!notifications.prices ? "Price alerts enabled" : "Price alerts disabled");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications.prices ? "bg-emerald-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                notifications.prices ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Marketing Updates</p>
            <p className="text-gray-400 text-sm">Receive news and promotional content</p>
          </div>
          <button
            onClick={() => {
              setNotifications({ ...notifications, marketing: !notifications.marketing });
              toast.success(!notifications.marketing ? "Marketing updates enabled" : "Marketing updates disabled");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications.marketing ? "bg-emerald-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                notifications.marketing ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

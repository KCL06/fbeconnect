import { useState } from "react";
import { Bell, CheckCheck, Trash2, Package, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type NotifType = "order" | "message" | "price" | "alert";
type FilterTab = "All" | "Unread" | "Orders" | "Messages";

type Notification = {
  id: number;
  type: NotifType;
  icon: typeof Package;
  title: string;
  message: string;
  time: string;
  read: boolean;
  color: string;
};

const initialNotifications: Notification[] = [
  { id: 1, type: "order", icon: Package, title: "New Order Received", message: "John Mwangi placed an order for 100kg of maize", time: "2 hours ago", read: false, color: "text-emerald-400" },
  { id: 2, type: "message", icon: MessageSquare, title: "New Message", message: "Sarah Wanjiru sent you a message about tomatoes", time: "5 hours ago", read: false, color: "text-blue-400" },
  { id: 3, type: "price", icon: TrendingUp, title: "Price Alert", message: "Maize prices increased by 8% in your region", time: "1 day ago", read: true, color: "text-amber-400" },
  { id: 4, type: "alert", icon: AlertCircle, title: "Low Stock Alert", message: "Sweet potatoes stock is running low (45kg remaining)", time: "1 day ago", read: true, color: "text-orange-400" },
  { id: 5, type: "order", icon: Package, title: "Order Completed", message: "Your order of fertilizer has been delivered", time: "2 days ago", read: true, color: "text-emerald-400" },
  { id: 6, type: "message", icon: MessageSquare, title: "Review Received", message: "David Ochieng left a 5-star review on your cabbage", time: "2 days ago", read: true, color: "text-blue-400" },
  { id: 7, type: "price", icon: TrendingUp, title: "Market Update", message: "Weekly market prices report is now available", time: "3 days ago", read: true, color: "text-amber-400" },
  { id: 8, type: "order", icon: Package, title: "Order In Transit", message: "ORD-001 is now on the way to Nairobi", time: "3 days ago", read: false, color: "text-emerald-400" },
];

const filterTabs: FilterTab[] = ["All", "Unread", "Orders", "Messages"];

export default function Notification() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const filtered = notifications.filter(n => {
    if (activeFilter === "Unread") return !n.read;
    if (activeFilter === "Orders") return n.type === "order";
    if (activeFilter === "Messages") return n.type === "message";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    if (activeFilter === "All") {
      setNotifications([]);
      toast.info("All notifications cleared");
    } else {
      const toRemove = new Set(filtered.map(n => n.id));
      setNotifications(prev => prev.filter(n => !toRemove.has(n.id)));
      toast.info(`${filtered.length} notifications cleared`);
    }
  };

  const markOneRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast.success("Notification marked as read");
  };

  const deleteOne = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const counts = {
    All: notifications.length,
    Unread: notifications.filter(n => !n.read).length,
    Orders: notifications.filter(n => n.type === "order").length,
    Messages: notifications.filter(n => n.type === "message").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-emerald-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <p className="text-emerald-200">Stay updated with your farm activities</p>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all"
        >
          <CheckCheck className="w-5 h-5" />
          Mark All as Read
        </button>
        <button
          onClick={clearAll}
          disabled={filtered.length === 0}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all border border-white/20"
        >
          <Trash2 className="w-5 h-5" />
          Clear {activeFilter !== "All" ? activeFilter : "All"}
        </button>

        {/* Filter tabs */}
        <div className="flex gap-2 ml-auto flex-wrap">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFilter === tab
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white/10 text-emerald-200 hover:bg-white/20"
              }`}
            >
              {tab}
              <span className="ml-2 text-xs opacity-70">({counts[tab]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-gray-400">
              {activeFilter === "All" ? "You're all caught up!" : `No ${activeFilter.toLowerCase()} notifications`}
            </p>
          </div>
        )}
        {filtered.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`rounded-xl p-5 border transition-all hover:border-emerald-500/50 group ${
                notification.read
                  ? "bg-white/5 border-white/10"
                  : "bg-emerald-900/20 border-emerald-700/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg flex-shrink-0 ${notification.read ? "bg-white/10" : "bg-emerald-800/50"}`}>
                  <Icon className={`w-6 h-6 ${notification.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-semibold">{notification.title}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{notification.time}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{notification.message}</p>
                  {!notification.read && (
                    <button
                      onClick={() => markOneRead(notification.id)}
                      className="mt-2 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!notification.read && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                  <button
                    onClick={() => deleteOne(notification.id)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

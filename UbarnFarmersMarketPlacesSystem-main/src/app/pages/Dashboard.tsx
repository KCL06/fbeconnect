import { useEffect, useState } from "react";
import { TrendingUp, Package, ShoppingBag, FileText, MessageSquare, ArrowRight, DollarSign, TrendingDown, Loader2, InboxIcon } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

interface DashboardStats {
  totalRevenue: number;
  activeProducts: number;
  pendingOrders: number;
  farmRecords: number;
}

interface RecentMessage {
  id: string;
  content: string;
  created_at: string;
  sender_name: string;
}

const quickActionKeys = [
  { key: "record_farm_activity" as const, path: "/app/farm-records", color: "from-amber-700 to-amber-800", icon: FileText },
  { key: "add_new_product" as const, path: "/app/products", color: "from-purple-700 to-purple-800", icon: Package },
  { key: "view_market_prices" as const, path: "/app/market-prices", color: "from-blue-700 to-blue-800", icon: TrendingUp },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, activeProducts: 0, pendingOrders: 0, farmRecords: 0 });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile?.role) return;
    fetchDashboardData();
  }, [user?.id, profile?.role]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const role = profile?.role;

      // ── Revenue: sum of orders placed by buyer OR fulfilled by farmer ──
      let revenue = 0;
      if (role === "buyer") {
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("buyer_id", user.id);
        revenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 0;
      } else if (role === "farmer") {
        // Sum revenue from order_items for this farmer's products
        const { data: items } = await supabase
          .from("order_items")
          .select("quantity, price_at_purchase, products!inner(farmer_id)")
          .eq("products.farmer_id", user.id);
        revenue = items?.reduce((sum, i) => sum + (i.quantity * i.price_at_purchase || 0), 0) ?? 0;
      }

      // ── Active Products (farmers only) ──
      let activeProducts = 0;
      if (role === "farmer") {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("farmer_id", user.id)
          .eq("in_stock", true);
        activeProducts = count ?? 0;
      }

      // ── Pending Orders ──
      let pendingOrders = 0;
      if (role === "buyer") {
        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("buyer_id", user.id)
          .eq("status", "pending");
        pendingOrders = count ?? 0;
      }

      // ── Farm Records (farmers only) ──
      let farmRecords = 0;
      if (role === "farmer") {
        const { count } = await supabase
          .from("farm_records")
          .select("*", { count: "exact", head: true })
          .eq("farmer_id", user.id);
        farmRecords = count ?? 0;
      }

      setStats({ totalRevenue: revenue, activeProducts, pendingOrders, farmRecords });

      // ── Recent Messages ──
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, content, created_at, profiles!sender_id(full_name)")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(4);

      setRecentMessages(
        (msgs ?? []).map((m: any) => ({
          id: m.id,
          content: m.content,
          created_at: m.created_at,
          sender_name: m.profiles?.full_name ?? "Unknown",
        }))
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const role = profile?.role;

  const statCards = [
    {
      label: role === "buyer" ? t("total_spent") : t("total_revenue"),
      value: stats.totalRevenue > 0 ? `KES ${stats.totalRevenue.toLocaleString()}` : "KES 0",
      icon: DollarSign,
      color: "from-emerald-600 to-emerald-700",
      show: true,
    },
    {
      label: t("active_products"),
      value: stats.activeProducts.toString(),
      icon: Package,
      color: "from-blue-600 to-blue-700",
      show: role === "farmer",
    },
    {
      label: t("pending_orders"),
      value: stats.pendingOrders.toString(),
      icon: ShoppingBag,
      color: "from-amber-600 to-amber-700",
      show: role === "buyer" || role === "farmer",
    },
    {
      label: t("farm_records"),
      value: stats.farmRecords.toString(),
      icon: FileText,
      color: "from-purple-600 to-purple-700",
      show: role === "farmer",
    },
  ].filter((s) => s.show);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const { signOut } = useAuth();

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-emerald-800/80 to-emerald-700/80 backdrop-blur-sm">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1706685137907-7cdbc2bb7e48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }}
        />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t("dashboard").toUpperCase()}</h1>
          <p className="text-emerald-200">
            {t("welcome_back_user")} {profile?.full_name || "User"}!{" "}
            <span className="capitalize text-emerald-300 text-sm">({role})</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16 gap-3 text-emerald-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{t("loading_dashboard")}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const isEmpty = stat.value === "0" || stat.value === "KES 0";
              return (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 opacity-80" />
                    {isEmpty && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{t("no_data_yet")}</span>
                    )}
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                  {isEmpty && (
                    <p className="text-white/50 text-xs mt-2">{t("will_update")}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          {role === "farmer" && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{t("quick_actions")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActionKeys.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.path}
                      to={action.path}
                      className={`bg-gradient-to-br ${action.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex flex-col items-center justify-center text-center min-h-[160px] group`}
                    >
                      <Icon className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-lg">{t(action.key)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Messages */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{t("recent_messages")}</h2>
              <Link to="/app/messages" className="text-emerald-300 hover:text-white transition-colors flex items-center gap-2">
                <span className="text-sm">{t("view_all")}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            {recentMessages.length === 0 ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-10 flex flex-col items-center text-center">
                <InboxIcon className="w-12 h-12 text-emerald-600 mb-3" />
                <p className="text-white font-semibold text-lg">{t("no_messages_yet")}</p>
                <p className="text-emerald-400 text-sm mt-1">{t("messages_will_appear")}</p>
                <Link to="/app/messages" className="mt-4 bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all">
                  {t("start_conversation")}
                </Link>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentMessages.map((msg) => (
                    <Link
                      to="/app/messages"
                      key={msg.id}
                      className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer block"
                    >
                      <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center mb-3">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white text-sm font-medium mb-1 line-clamp-2">{msg.content}</p>
                      <p className="text-emerald-400 text-xs">From {msg.sender_name} · {formatTimeAgo(msg.created_at)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Getting Started card — shown when everything is zero */}
          {stats.totalRevenue === 0 && stats.activeProducts === 0 && stats.pendingOrders === 0 && (
            <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-800/60 border border-emerald-700/40 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-white mb-2">{t("welcome_fbeconnect")}</h3>
              <p className="text-emerald-300 mb-6 max-w-md mx-auto">
                {role === "farmer" && t("dashboard_empty_farmer") || "Your dashboard will come to life as you add products, receive orders, and record farm activities."}
                {role === "buyer" && t("dashboard_empty_buyer") || "Your dashboard will come to life as you browse the marketplace and place orders."}
                {role === "expert" && t("dashboard_empty_expert") || "Your dashboard will come to life as you start receiving consultation requests."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {role === "farmer" && (
                  <>
                    <Link to="/app/products" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all">
                      {t("add_first_product")}
                    </Link>
                    <Link to="/app/farm-records" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all">
                      {t("record_farm_activity")}
                    </Link>
                  </>
                )}
                {role === "buyer" && (
                  <Link to="/app/marketplace" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all">
                     {t("browse_marketplace")}
                  </Link>
                )}
                {role === "expert" && (
                  <Link to="/app/expert-consultations" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all">
                     {t("view_consultation_requests")}
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
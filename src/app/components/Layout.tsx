import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Home, Sprout, Package, TrendingUp, MessageSquare, ShoppingCart, Receipt, Bell, LayoutDashboard, Star, MapPin, MessageCircle, Settings, Menu, X, User, BookOpen, ChevronRight, ChevronLeft, Leaf, LogOut, CalendarCheck } from "lucide-react";
import svgPaths from "../../imports/svg-ld7y1c2a9i";
import { supabase } from "../../lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { useLanguage } from "../context/LanguageContext";
import { prewarm } from "../../lib/useAppCache";

const menuItems = [
  { path: "/app", tKey: "dashboard", label: "Dashboard", icon: Home, roles: ["farmer", "buyer", "expert", "admin"] },
  { path: "/app/farm-records", tKey: "farm_records", label: "My Farm Records", icon: Sprout, roles: ["farmer"] },
  { path: "/app/products", tKey: "products", label: "Products", icon: Package, roles: ["farmer"] },
  { path: "/app/market-prices", tKey: "price", label: "Market Prices", icon: TrendingUp, roles: ["farmer", "buyer"] },
  // Farmers book consultations; experts manage them on their dedicated page
  { path: "/app/consultations", tKey: "consultations", label: "Consultations", icon: MessageSquare, roles: ["farmer"] },
  { path: "/app/expert-consultations", label: "My Consultations", icon: CalendarCheck, roles: ["expert"] },
  { path: "/app/messages", tKey: "messages", label: "Messages", icon: MessageCircle, roles: ["farmer", "buyer", "expert", "admin"] },
  { path: "/app/marketplace", tKey: "marketplace", label: "Market Place", icon: ShoppingCart, roles: ["farmer", "buyer"] },
  { path: "/app/transaction", label: "Transaction", icon: Receipt, roles: ["farmer", "buyer", "admin"] },
  { path: "/app/notification", label: "Notifications", icon: Bell, roles: ["farmer", "buyer", "expert", "admin"] },
  { path: "/app/admin", label: "Admin Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { path: "/app/reviews", tKey: "reviews", label: "Reviews & Ratings", icon: Star, roles: ["farmer", "buyer", "expert", "admin"] },
  { path: "/app/order-tracking", tKey: "orders", label: "Order Tracking", icon: MapPin, roles: ["farmer", "buyer"] },
  { path: "/app/user-feedback", label: "User Feedback", icon: MessageCircle, roles: ["admin"] },
  { path: "/app/expert-knowledge", label: "Expert Knowledge", icon: BookOpen, roles: ["farmer", "buyer", "expert", "admin"] },
  { path: "/app/cart", label: "My Cart", icon: ShoppingCart, roles: ["farmer", "buyer"] },
  { path: "/app/profile", label: "My Profile", icon: User, roles: ["farmer", "buyer", "expert", "admin"] },
];

function FarmerIcon() {
  return (
    <div className="relative w-16 h-16 overflow-hidden">
      <div className="absolute inset-[62.57%_23.48%_18%_23.57%]">
        <svg className="absolute block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168.385 61.8024">
          <path d={svgPaths.p1d9cba00} fill="#B1CC33" />
        </svg>
      </div>
      <div className="absolute inset-[62.57%_37.45%_25.09%_37.55%]">
        <svg className="absolute block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 79.5 39.2509">
          <path d={svgPaths.p643df80} fill="#5C9E31" />
        </svg>
      </div>
      <div className="absolute inset-[22.6%_32.11%_57.38%_31.39%]">
        <svg className="absolute block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 116.049 63.6618">
          <path d={svgPaths.p1324a080} fill="#6A462F" />
        </svg>
      </div>
      <div className="absolute inset-[22.6%_34.67%_40.93%_33.89%]">
        <svg className="absolute block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 99.9801 115.977">
          <path d={svgPaths.p3eb08a00} fill="#C19A65" />
        </svg>
      </div>
      <div className="absolute inset-[11.21%_37.84%_77.4%_37.76%]">
        <svg className="absolute block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 77.6008 36.2255">
          <path d={svgPaths.p38d36000} fill="#F4AA41" />
        </svg>
      </div>
    </div>
  );
}

function CartBadge() {
  const { totalItems } = useCart();
  return (
    <Link to="/app/cart" className="relative text-white p-1" title="My Cart">
      <ShoppingCart className="w-5 h-5" />
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { profile, signOut, loading } = useAuth();
  const { t } = useLanguage();
  const prewarmFiredRef = useRef(false);

  // ── Notification count ────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false)
      .then(({ count }) => setNotifCount(count || 0));
  }, [profile?.id]);

  // ── Background cache pre-warming ──────────────────────────────────────────
  // After the user's profile resolves, silently pre-fetch all role-specific
  // data so that navigating to any tab is instantaneous.
  useEffect(() => {
    if (!profile?.id || prewarmFiredRef.current) return;
    prewarmFiredRef.current = true;

    const uid = profile.id;
    const role = profile.role;

    // Dashboard stats (all roles)
    prewarm(`dashboard_${uid}_${role}`, async () => {
      const results = await Promise.allSettled([
        role === "buyer"
          ? supabase.from("orders").select("total_amount").eq("buyer_id", uid)
          : role === "farmer"
          ? supabase.from("order_items").select("quantity, price_at_purchase, products!inner(farmer_id)").eq("products.farmer_id", uid)
          : Promise.resolve({ data: [] }),
        supabase.from("messages").select("id, content, created_at, profiles:sender_id(full_name)").eq("receiver_id", uid).order("created_at", { ascending: false }).limit(4),
      ]);
      // Minimal — Dashboard will re-use this cache key and render instantly
      return results;
    });

    // Products (farmers)
    if (role === "farmer") {
      prewarm(`products_${uid}`, () =>
        supabase.from("products").select("*").eq("farmer_id", uid).order("created_at", { ascending: false }).then(r => r.data ?? [])
      );
      prewarm(`farm_records_${uid}`, () =>
        supabase.from("farm_records").select("*").eq("farmer_id", uid).order("date", { ascending: false }).then(r => r.data ?? [])
      );
    }

    // Profile data (all roles)
    prewarm(`profile_${uid}`, () =>
      supabase.from("profiles").select(`*, farmer_profiles(*), expert_profiles(*), buyer_profiles(*)`).eq("id", uid).single().then(r => r.data)
    );
  }, [profile?.id, profile?.role]);

  const getPageTitle = (pathname: string): string => {
    const found = menuItems.find((item) => item.path === pathname);
    if (found && found.tKey) return t(found.tKey as any);
    if (found) return found.label;
    if (pathname === "/app/settings") return t("settings");
    return "FBEconnect";
  };

  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
      // Force clear local storage if Supabase fails
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      // Force reload to completely wipe memory state and send to login
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 relative">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')" }}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static bg-emerald-900/70 backdrop-blur-md border-r border-emerald-700/50 flex flex-col z-30 h-full transition-all duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64`}>
        {/* Logo + Collapse Toggle */}
        <div className="p-4 border-b border-emerald-700/50 flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/" className="flex items-center">
              <Logo size="sm" />
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <Logo size="sm" />
            </div>
          )}
          <button onClick={() => setIsCollapsed(c => !c)} className="hidden lg:flex text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-700/40 transition-all" title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-4 border-b border-emerald-700/50">
            <Link to="/app/profile" className="flex items-start gap-3 hover:bg-emerald-800/40 rounded-xl p-2 transition-all group">
              <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-emerald-500/50">
                <FarmerIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{profile?.full_name || ""}</p>
                <p className="text-xs text-emerald-300 truncate">{profile?.email || ""}</p>
                {profile?.role && (
                  <span className="inline-block mt-1 text-xs bg-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded-full capitalize">{profile.role}</span>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {!isCollapsed && <p className="text-emerald-500 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Main Menu</p>}
          <ul className="space-y-0.5">
            {loading ? (
              <li className="px-3 py-4 text-emerald-400/60 text-sm text-center animate-pulse">Loading menu...</li>
            ) : menuItems.filter(item => profile?.role && item.roles.includes(profile.role)).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const label = item.tKey ? t(item.tKey as any) : item.label;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    title={isCollapsed ? label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? "bg-emerald-600/90 text-white shadow-lg ring-1 ring-emerald-400/50" : "text-emerald-200 hover:bg-emerald-700/40 hover:text-white"} ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-emerald-400 group-hover:text-white"}`} />
                    {!isCollapsed && <span className="text-sm font-medium truncate">{label}</span>}
                    {!isCollapsed && isActive && <ChevronRight className="w-3 h-3 ml-auto text-emerald-200" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom: Settings */}
        <div className="p-2 border-t border-emerald-700/50">
          <Link
            to="/app/settings"
            onClick={() => setIsSidebarOpen(false)}
            title={isCollapsed ? t('settings') : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${location.pathname === "/app/settings" ? "bg-emerald-600/90 text-white shadow-lg ring-1 ring-emerald-400/50" : "text-emerald-200 hover:bg-emerald-700/40 hover:text-white"} ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{t('settings')}</span>}
          </Link>
          {!isCollapsed && (
            <div className="flex justify-center mt-3 pt-3 border-t border-emerald-700/30">
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs transition-colors font-medium">
                <LogOut className="w-4 h-4" />{t('log_out')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto relative z-10 flex flex-col min-h-screen">

        {/* Desktop Top Header */}
        <div className="hidden lg:flex sticky top-0 bg-emerald-900/80 backdrop-blur-md border-b border-emerald-700/50 px-8 py-3 z-10 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-white text-lg font-bold tracking-tight">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1">
              {[
                { path: "/app", tKey: "dashboard", label: "Dashboard", icon: Home, roles: ["farmer", "buyer", "expert", "admin"] },
                { path: "/app/marketplace", tKey: "marketplace", label: "Market", icon: ShoppingCart, roles: ["farmer", "buyer"] },
                { path: "/app/expert-consultations", label: "My Consultations", icon: CalendarCheck, roles: ["expert"] },
                { path: "/app/expert-knowledge", label: "Knowledge", icon: BookOpen, roles: ["farmer", "buyer", "expert", "admin"] },
                { path: "/app/market-prices", tKey: "price", label: "Prices", icon: TrendingUp, roles: ["farmer", "buyer"] },
              ].filter(item => profile?.role && item.roles.includes(profile.role)).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const label = item.tKey ? t(item.tKey as any) : item.label;
                return (
                  <Link key={item.path} to={item.path} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? "bg-emerald-700 text-white" : "text-emerald-300 hover:bg-emerald-800/60 hover:text-white"}`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </Link>
                );
              })}
            </nav>
            <div className="w-px h-6 bg-emerald-700" />
            <Link to="/app/notification" className="relative text-emerald-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-emerald-800/60">
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">{notifCount > 9 ? "9+" : notifCount}</span>
              )}
            </Link>
            <Link to="/app/settings" className="text-emerald-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-emerald-800/60">
              <Settings className="w-5 h-5" />
            </Link>
            <Link to="/app/profile" className="flex items-center gap-2 text-emerald-200 hover:text-white transition-all hover:bg-emerald-800/60 px-2 py-1.5 rounded-lg">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center ring-2 ring-emerald-500/50">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-medium">Account</span>
            </Link>
          </div>
        </div>

        {/* Mobile Top Header */}
        <div className="lg:hidden sticky top-0 bg-emerald-900/90 backdrop-blur-md border-b border-emerald-700/50 p-4 z-10">
          <div className="flex items-center justify-between">
            <button className="text-white p-1" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar">
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              <Link to="/app/notification" className="relative text-white p-1">
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">{notifCount > 9 ? "9+" : notifCount}</span>
                )}
              </Link>
              <CartBadge />
              <Link to="/app/profile" className="text-white p-1"><User className="w-5 h-5" /></Link>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-emerald-300 text-xs">
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium">{pageTitle}</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>

        {/* App Footer — clean, no duplicate nav links */}
        <footer className="bg-emerald-950/80 backdrop-blur-sm border-t border-emerald-700/50 text-white py-5 mt-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <Logo size="sm" />
              <p className="text-emerald-400 text-sm text-center">&copy; {new Date().getFullYear()} FBEconnect. Empowering agricultural communities.</p>
              <div className="flex gap-4">
                <Link to="/privacy" className="text-emerald-400 hover:text-white text-xs transition-colors">Privacy</Link>
                <Link to="/terms" className="text-emerald-400 hover:text-white text-xs transition-colors">Terms</Link>
                <a href="mailto:support@fbeconnect.com" className="text-emerald-400 hover:text-white text-xs transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
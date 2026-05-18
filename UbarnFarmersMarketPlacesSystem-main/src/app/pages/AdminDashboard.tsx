import { useState, useEffect } from "react";
import { Users, Package, TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

type AdminTab = "overview" | "users" | "products" | "transactions";

const salesData = [
  { month: "Jan", sales: 45000 },
  { month: "Feb", sales: 52000 },
  { month: "Mar", sales: 48000 },
  { month: "Apr", sales: 61000 },
  { month: "May", sales: 55000 },
  { month: "Jun", sales: 67000 },
];

const userGrowthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 145 },
  { month: "Mar", users: 168 },
  { month: "Apr", users: 192 },
  { month: "May", users: 215 },
  { month: "Jun", users: 243 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch live user count for overview tab
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => setTotalUserCount(count));
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "transactions") fetchTransactions();
  }, [activeTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error("Failed to load users: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast.error("Failed to load products: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles!buyer_id(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      console.warn("Orders fetch issue:", err.message);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      toast.success("User removed successfully.");
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err: any) {
      toast.error("Failed to delete user: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Product deleted successfully.");
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error("Failed to delete product: " + err.message);
    }
  };

  const handleToggleProductStock = async (id: string, currentStock: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ in_stock: !currentStock })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Product marked as ${!currentStock ? "in stock" : "out of stock"}.`);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock: !currentStock } : p));
    } catch (err: any) {
      toast.error("Failed to update product: " + err.message);
    }
  };

  const roleBadgeColor: Record<string, string> = {
    farmer: "bg-emerald-800/50 text-emerald-300",
    buyer: "bg-blue-800/50 text-blue-300",
    expert: "bg-purple-800/50 text-purple-300",
    admin: "bg-red-800/50 text-red-300",
  };

  return (
    <div className="p-8">
      {/* Header & Tabs */}
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-4xl font-bold text-white mb-6">Admin Dashboard</h1>
        <div className="flex gap-3 overflow-x-auto">
          {(["overview", "users", "products", "transactions"] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white/5 text-emerald-200 hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && !isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-xs bg-emerald-800 px-2 py-1 rounded">Live</span>
              </div>
              <p className="text-sm opacity-80 mb-1">Platform Users</p>
              <p className="text-4xl font-bold">{totalUserCount ?? "—"}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <Package className="w-8 h-8 opacity-80" />
                <span className="text-xs bg-blue-800 px-2 py-1 rounded">+8%</span>
              </div>
              <p className="text-sm opacity-80 mb-1">Active Products</p>
              <p className="text-4xl font-bold">1,847</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <ShoppingCart className="w-8 h-8 opacity-80" />
                <span className="text-xs bg-purple-800 px-2 py-1 rounded">+15%</span>
              </div>
              <p className="text-sm opacity-80 mb-1">Total Orders</p>
              <p className="text-4xl font-bold">892</p>
            </div>
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-xs bg-amber-800 px-2 py-1 rounded">+22%</span>
              </div>
              <p className="text-sm opacity-80 mb-1">Platform Revenue</p>
              <p className="text-4xl font-bold">KES 67K</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg">
              <h3 className="text-white font-bold text-lg mb-4">Monthly Sales Activity</h3>
            <div className="w-full" style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#a7f3d0" />
                  <YAxis stroke="#a7f3d0" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }} />
                  <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg">
              <h3 className="text-white font-bold text-lg mb-4">Platform User Growth</h3>
            <div className="w-full" style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#a7f3d0" />
                  <YAxis stroke="#a7f3d0" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            </div>
          </div>
        </>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "users" && !isLoading && (
        <div className="flex gap-6">
          {/* Users Table */}
          <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-900/50 border-b border-white/10">
                  <th className="p-4 text-emerald-200 font-semibold">Name</th>
                  <th className="p-4 text-emerald-200 font-semibold">Email</th>
                  <th className="p-4 text-emerald-200 font-semibold">Role</th>
                  <th className="p-4 text-emerald-200 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedUser?.id === u.id ? "bg-emerald-900/20" : ""}`}
                  >
                    <td className="p-4 text-white font-medium">{u.full_name || "Unknown User"}</td>
                    <td className="p-4 text-emerald-100/80 text-sm">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize font-medium ${roleBadgeColor[u.role] || "bg-gray-800/50 text-gray-300"}`}>
                        {u.role || "no role"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                          className="text-emerald-400 hover:text-emerald-300 p-2 bg-emerald-900/20 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-400 hover:text-red-300 p-2 bg-red-900/20 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-emerald-200/60">No users found in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* User Detail Panel */}
          {selectedUser && (
            <div className="w-72 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 flex-shrink-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-2xl mx-auto mb-4">
                {selectedUser.avatar_url
                  ? <img src={selectedUser.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                  : "👤"}
              </div>
              <div className="space-y-3 text-sm">
                <div><p className="text-emerald-400 text-xs">Full Name</p><p className="text-white font-medium">{selectedUser.full_name || "—"}</p></div>
                <div><p className="text-emerald-400 text-xs">Email</p><p className="text-white break-all">{selectedUser.email || "—"}</p></div>
                <div><p className="text-emerald-400 text-xs">Phone</p><p className="text-white">{selectedUser.phone || "—"}</p></div>
                <div><p className="text-emerald-400 text-xs">Role</p>
                  <span className={`px-2 py-1 rounded text-xs capitalize font-medium ${roleBadgeColor[selectedUser.role] || "bg-gray-800/50 text-gray-300"}`}>
                    {selectedUser.role || "no role"}
                  </span>
                </div>
                <div><p className="text-emerald-400 text-xs">Joined</p><p className="text-white">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "—"}</p></div>
              </div>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-2 rounded-lg transition-all text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Remove User
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {activeTab === "products" && !isLoading && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-900/50 border-b border-white/10">
                <th className="p-4 text-emerald-200 font-semibold">Product</th>
                <th className="p-4 text-emerald-200 font-semibold">Category</th>
                <th className="p-4 text-emerald-200 font-semibold">Price</th>
                <th className="p-4 text-emerald-200 font-semibold">Farmer</th>
                <th className="p-4 text-emerald-200 font-semibold">Status</th>
                <th className="p-4 text-emerald-200 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{p.name}</td>
                  <td className="p-4 text-emerald-100/80">{p.category}</td>
                  <td className="p-4 text-emerald-300 font-medium">KES {p.price?.toLocaleString()}</td>
                  <td className="p-4 text-emerald-100/60">{p.profiles?.full_name || "Unknown"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${p.in_stock ? "bg-emerald-800/40 text-emerald-300" : "bg-red-800/40 text-red-300"}`}>
                      {p.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleToggleProductStock(p.id, p.in_stock)}
                        className={`p-2 rounded-lg transition-colors ${p.in_stock ? "text-amber-400 bg-amber-900/20 hover:bg-amber-900/40" : "text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40"}`}
                        title={p.in_stock ? "Mark Out of Stock" : "Mark In Stock"}
                      >
                        {p.in_stock ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-red-400 hover:text-red-300 p-2 bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-emerald-200/60">No products found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {activeTab === "transactions" && !isLoading && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-xl">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No Transactions Yet</h2>
              <p className="text-amber-200/80 max-w-md mx-auto">
                Once buyers begin checking out, all orders will appear here for review.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-900/50 border-b border-white/10">
                  <th className="p-4 text-emerald-200 font-semibold">Order ID</th>
                  <th className="p-4 text-emerald-200 font-semibold">Buyer</th>
                  <th className="p-4 text-emerald-200 font-semibold">Amount</th>
                  <th className="p-4 text-emerald-200 font-semibold">Status</th>
                  <th className="p-4 text-emerald-200 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-mono text-xs font-bold">{t.id?.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-white">{t.profiles?.full_name || "Unknown"}</td>
                    <td className="p-4 text-emerald-300 font-medium">KES {t.total_amount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize font-medium ${t.status === "completed" ? "bg-emerald-800/40 text-emerald-300" : t.status === "pending" ? "bg-amber-800/40 text-amber-300" : "bg-red-800/40 text-red-300"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-100/60 text-sm">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

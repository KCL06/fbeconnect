import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

type FilterType = "All" | "up" | "down" | "stable";

export default function MarketPrices() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [lastUpdated, setLastUpdated] = useState("April 15, 2026 - 09:30 AM");

  const filtered = activeFilter === "All"
    ? marketPrices
    : marketPrices.filter(p => p.trend === activeFilter);

  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('market_prices').select('*').order('product');
      if (error) throw error;
      
      const formatted = data.map((item: any) => {
        let changePercent = 0;
        if (item.previous_price_kes > 0) {
          changePercent = ((item.current_price_kes - item.previous_price_kes) / item.previous_price_kes) * 100;
        }
        const changeStr = changePercent > 0 ? `+${changePercent.toFixed(1)}%` : `${changePercent.toFixed(1)}%`;
        
        return {
          id: item.id,
          product: item.product,
          currentPrice: `KES ${item.current_price_kes}/kg`,
          previousPrice: `KES ${item.previous_price_kes}/kg`,
          change: changeStr,
          trend: item.trend,
          image: item.image_url,
          category: item.category,
        };
      });
      setMarketPrices(formatted);
      setLastUpdated(new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load market prices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleRefresh = () => {
    fetchPrices();
    toast.success("Market prices refreshed successfully!");
  };

  const upCount = marketPrices.filter(p => p.trend === "up").length;
  const downCount = marketPrices.filter(p => p.trend === "down").length;
  const stableCount = marketPrices.filter(p => p.trend === "stable").length;

  if (isLoading) {
    return <div className="p-8 text-white">Loading market prices...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Market Prices</h1>
          <p className="text-emerald-200">Real-time agricultural commodity prices</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => setActiveFilter(activeFilter === "up" ? "All" : "up")}
          className={`rounded-xl p-6 text-white text-left transition-all hover:scale-105 ${
            activeFilter === "up"
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 ring-2 ring-emerald-300"
              : "bg-gradient-to-br from-emerald-600 to-emerald-700"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Trending Up</h3>
          </div>
          <p className="text-4xl font-bold">{upCount}</p>
          <p className="text-emerald-100 text-sm mt-1">Products increasing in price</p>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === "down" ? "All" : "down")}
          className={`rounded-xl p-6 text-white text-left transition-all hover:scale-105 ${
            activeFilter === "down"
              ? "bg-gradient-to-br from-orange-500 to-orange-600 ring-2 ring-orange-300"
              : "bg-gradient-to-br from-orange-600 to-orange-700"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Trending Down</h3>
          </div>
          <p className="text-4xl font-bold">{downCount}</p>
          <p className="text-orange-100 text-sm mt-1">Products decreasing in price</p>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === "stable" ? "All" : "stable")}
          className={`rounded-xl p-6 text-white text-left transition-all hover:scale-105 ${
            activeFilter === "stable"
              ? "bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-300"
              : "bg-gradient-to-br from-blue-600 to-blue-700"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Minus className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Stable</h3>
          </div>
          <p className="text-4xl font-bold">{stableCount}</p>
          <p className="text-blue-100 text-sm mt-1">Products with no change</p>
        </button>
      </div>

      {/* Last Updated */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 mb-6 border border-white/10 flex items-center justify-between">
        <p className="text-emerald-200 text-sm">
          Last Updated: <span className="text-white font-semibold">{lastUpdated}</span>
        </p>
        {activeFilter !== "All" && (
          <button
            onClick={() => setActiveFilter("All")}
            className="text-emerald-300 hover:text-white text-sm underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Prices Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-900/50 border-b border-white/10">
                <th className="text-left p-4 text-emerald-200 font-semibold">Product</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Category</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Current Price</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Previous Price</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Change</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0 border border-white/10"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <span className="text-white font-medium">{item.product}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-white font-bold text-lg">{item.currentPrice}</td>
                  <td className="p-4 text-gray-400">{item.previousPrice}</td>
                  <td className="p-4">
                    <span
                      className={`font-semibold ${
                        item.trend === "up"
                          ? "text-emerald-400"
                          : item.trend === "down"
                          ? "text-orange-400"
                          : "text-gray-400"
                      }`}
                    >
                      {item.change}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.trend === "up" && (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Rising</span>
                      </div>
                    )}
                    {item.trend === "down" && (
                      <div className="flex items-center gap-2 text-orange-400">
                        <TrendingDown className="w-5 h-5" />
                        <span className="font-medium">Falling</span>
                      </div>
                    )}
                    {item.trend === "stable" && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Minus className="w-5 h-5" />
                        <span className="font-medium">Stable</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400">No items match the selected filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

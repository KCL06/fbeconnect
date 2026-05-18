import { Calendar, Sprout, Droplets, Bug, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface FarmRecord {
  id: string;
  date: string;
  activity: string;
  type: string;
  area: string;
}

const typeIcons: Record<string, any> = {
  Planting: Sprout,
  Fertilization: Droplets,
  "Pest Control": Bug,
  Maintenance: Droplets,
  Harvesting: Sprout,
  Analysis: Calendar,
};

const typeColors: Record<string, string> = {
  Planting: "bg-emerald-600",
  Fertilization: "bg-blue-600",
  "Pest Control": "bg-orange-600",
  Maintenance: "bg-cyan-600",
  Harvesting: "bg-green-700",
  Analysis: "bg-purple-600",
};

export default function MyFarmRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    activity: "",
    type: "Planting",
    area: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchRecords();
  }, [user?.id]);

  const fetchRecords = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("farm_records")
        .select("*")
        .eq("farmer_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      toast.error("Failed to load records: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("farm_records").insert({
        farmer_id: user.id,
        date: formData.date,
        activity: formData.activity,
        type: formData.type,
        area: formData.area,
      });

      if (error) throw error;
      toast.success("Record added successfully!");
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        activity: "",
        type: "Planting",
        area: "",
      });
      fetchRecords();
    } catch (err: any) {
      toast.error("Failed to add record: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = filter === "all" 
    ? records 
    : records.filter(record => record.type.toLowerCase() === filter.toLowerCase());

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-emerald-800/80 to-emerald-700/80 backdrop-blur-sm">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1695566775365-0a2fb08ee4e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFjdG9yJTIwZmFybWluZyUyMGZpZWxkfGVufDF8fHx8MTc3MzI0MzQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')"
          }}
        />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Farm Records</h1>
          <p className="text-emerald-200">Track all your farming activities</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add New Record</span>
        </button>
        
        <div className="flex gap-2 overflow-x-auto pb-2 whitespace-nowrap">
          {["all", "planting", "fertilization", "pest control", "harvesting"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === type
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-white/10 text-emerald-200 hover:bg-white/20"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Records Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecords.map((record) => {
              const Icon = typeIcons[record.type] || Sprout;
              const color = typeColors[record.type] || "bg-emerald-600";
              return (
                <div
                  key={record.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all border border-white/10 hover:border-emerald-500/50"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-lg">{record.activity}</h3>
                        <span className="text-xs text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded">
                          {record.type}
                        </span>
                      </div>
                      <p className="text-emerald-200 text-sm mb-2">{record.area}</p>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Sprout className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
              <p className="text-emerald-300 text-lg font-medium">No records found</p>
              <p className="text-emerald-400/60 text-sm mt-1">Click 'Add New Record' to start tracking your farm.</p>
            </div>
          )}
        </>
      )}

      {/* Add Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-emerald-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Farm Record</h2>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Activity Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Planted 2 acres of Maize"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-emerald-200/40 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Activity Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-emerald-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(typeIcons).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-emerald-200 text-sm mb-1">Area / Field</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Field A, Greenhouse 2"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-emerald-200/40 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all mt-4 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarCheck, Clock, Video, Phone, CheckCircle2, XCircle,
  Calendar, User, Star, MessageSquare, ChevronDown, ChevronUp,
  Briefcase, Award, TrendingUp, AlertCircle, FileText, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

type RequestStatus = "pending" | "accepted" | "rejected" | "completed" | "rescheduled";
type CallType = "Video Call" | "Phone Call";

interface ConsultationRequest {
  id: number;
  farmer: string;
  farmerLocation: string;
  farmerAvatar: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  type: CallType;
  status: RequestStatus;
  notes?: string;
  rating?: number;
}

// Start with empty data — consultations will be fetched from Supabase
const initialRequests: ConsultationRequest[] = [];

const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string; label: string }> = {
  pending:     { bg: "bg-amber-900/40",   text: "text-amber-300",   label: "Pending" },
  accepted:    { bg: "bg-emerald-900/40", text: "text-emerald-300", label: "Accepted" },
  rejected:    { bg: "bg-red-900/40",     text: "text-red-300",     label: "Declined" },
  completed:   { bg: "bg-blue-900/40",    text: "text-blue-300",    label: "Completed" },
  rescheduled: { bg: "bg-purple-900/40",  text: "text-purple-300",  label: "Rescheduled" },
};

export default function ExpertConsultations() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConsultationRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<"pending" | "upcoming" | "completed">("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const pending   = requests.filter(r => r.status === "pending");
  const upcoming  = requests.filter(r => r.status === "accepted" || r.status === "rescheduled");
  const completed = requests.filter(r => r.status === "completed" || r.status === "rejected");

  const totalRating = requests
    .filter(r => r.rating)
    .reduce((sum, r) => sum + (r.rating ?? 0), 0);
  const ratingCount = requests.filter(r => r.rating).length;
  const avgRating = ratingCount ? (totalRating / ratingCount).toFixed(1) : "—";

  const updateStatus = (id: number, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleAccept = (req: ConsultationRequest) => {
    updateStatus(req.id, "accepted");
    toast.success(`Consultation with ${req.farmer} accepted! They will be notified.`);
  };

  const handleDecline = (req: ConsultationRequest) => {
    updateStatus(req.id, "rejected");
    toast.info(`Consultation with ${req.farmer} declined.`);
  };

  const handleReschedule = (id: number) => {
    if (!newDate || !newTime) {
      toast.error("Please select a new date and time.");
      return;
    }
    setRequests(prev => prev.map(r =>
      r.id === id
        ? {
            ...r,
            status: "rescheduled",
            date: new Date(newDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            time: newTime,
          }
        : r
    ));
    toast.success("Session rescheduled. The farmer has been notified.");
    setRescheduleId(null);
    setNewDate("");
    setNewTime("");
  };

  const tabs: { key: "pending" | "upcoming" | "completed"; label: string; count: number }[] = [
    { key: "pending",   label: "Pending Requests", count: pending.length },
    { key: "upcoming",  label: "Upcoming Sessions", count: upcoming.length },
    { key: "completed", label: "History",            count: completed.length },
  ];

  const displayList =
    activeTab === "pending"   ? pending  :
    activeTab === "upcoming"  ? upcoming :
    completed;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">My Consultations</h1>
        <p className="text-emerald-300 text-sm">Manage incoming requests and upcoming sessions from farmers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: AlertCircle,  label: "Pending",    value: pending.length,   color: "from-amber-600 to-amber-700" },
          { icon: CalendarCheck,label: "Upcoming",   value: upcoming.length,  color: "from-emerald-600 to-emerald-700" },
          { icon: CheckCircle2, label: "Completed",  value: completed.filter(r => r.status === "completed").length, color: "from-blue-600 to-blue-700" },
          { icon: Star,         label: "Avg Rating", value: avgRating,        color: "from-purple-600 to-purple-700" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Expert Profile Summary */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="text-5xl">👨🏾‍🔬</div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">Your Expert Profile</h2>
          <p className="text-emerald-300 text-sm">Agricultural Expert · Crop Disease Management</p>
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-yellow-400 text-sm">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span className="font-bold">{avgRating}</span>
              <span className="text-emerald-400">({ratingCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 text-sm">
              <Briefcase className="w-4 h-4" />
              <span>{requests.filter(r => r.status === "completed").length} sessions done</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 text-sm">
              <Award className="w-4 h-4" />
              <span>Verified Expert</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{pending.length} pending requests</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-right text-xs text-emerald-400">
          <span className="bg-emerald-900/50 border border-emerald-700/40 px-3 py-1 rounded-full">KES 500 / 30 min</span>
          <span className="bg-emerald-900/50 border border-emerald-700/40 px-3 py-1 rounded-full">KES 900 / 60 min</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 border border-white/10 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-emerald-700 text-white shadow-lg"
                : "text-emerald-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? "bg-white/20" : "bg-emerald-800/80 text-emerald-300"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {displayList.length === 0 ? (
        <div className="text-center py-16 text-emerald-400">
          <CalendarCheck className="w-14 h-14 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-semibold text-white">No sessions here yet</p>
          <p className="text-sm mt-1">New booking requests from farmers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map(req => {
            const style = STATUS_STYLES[req.status];
            const isExpanded = expandedId === req.id;
            const isReschedule = rescheduleId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-all"
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar + Name */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-4xl flex-shrink-0">{req.farmerAvatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-base">{req.farmer}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-emerald-400 text-xs mb-2">{req.farmerLocation}</p>
                        <p className="text-emerald-100 text-sm font-medium">"{req.topic}"</p>
                      </div>
                    </div>

                    {/* Session Meta */}
                    <div className="flex flex-col gap-1.5 text-xs text-emerald-300 flex-shrink-0 sm:text-right">
                      <span className="flex items-center gap-1.5 sm:justify-end">
                        <Calendar className="w-3.5 h-3.5" />{req.date}
                      </span>
                      <span className="flex items-center gap-1.5 sm:justify-end">
                        <Clock className="w-3.5 h-3.5" />{req.time} · {req.duration}
                      </span>
                      <span className="flex items-center gap-1.5 sm:justify-end">
                        {req.type === "Video Call"
                          ? <Video className="w-3.5 h-3.5" />
                          : <Phone className="w-3.5 h-3.5" />}
                        {req.type}
                      </span>
                      {req.rating && (
                        <span className="flex items-center gap-1 sm:justify-end text-yellow-400">
                          {"★".repeat(req.rating)}{"☆".repeat(5 - req.rating)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(req)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={() => setRescheduleId(isReschedule ? null : req.id)}
                          className="flex items-center gap-1.5 bg-amber-700/60 hover:bg-amber-600/70 text-amber-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          <RefreshCw className="w-4 h-4" /> Reschedule
                        </button>
                        <button
                          onClick={() => handleDecline(req)}
                          className="flex items-center gap-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </>
                    )}

                    {(req.status === "accepted" || req.status === "rescheduled") && (
                      <>
                        <button
                          onClick={() => navigate(`/app/call/consultation-${req.id}`)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          <Video className="w-4 h-4" /> Join Session
                        </button>
                        <button
                          onClick={() => setRescheduleId(isReschedule ? null : req.id)}
                          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          <RefreshCw className="w-4 h-4" /> Reschedule
                        </button>
                        <button
                          onClick={() => { updateStatus(req.id, "completed"); toast.success("Session marked as completed!"); }}
                          className="flex items-center gap-1.5 bg-blue-800/50 hover:bg-blue-700/60 text-blue-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Mark Complete
                        </button>
                      </>
                    )}

                    {req.status === "completed" && (
                      <button
                        onClick={() => toast.info("Session notes feature coming soon!")}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      >
                        <FileText className="w-4 h-4" /> View Notes
                      </button>
                    )}

                    {/* Toggle notes */}
                    {req.notes && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-white text-sm ml-auto transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {isExpanded ? <><ChevronUp className="w-3 h-3" /> Hide Notes</> : <><ChevronDown className="w-3 h-3" /> View Notes</>}
                      </button>
                    )}
                  </div>

                  {/* Expanded Notes */}
                  {isExpanded && req.notes && (
                    <div className="mt-4 bg-emerald-950/60 border border-emerald-800/40 rounded-xl p-4 text-sm text-emerald-200 leading-relaxed">
                      <div className="flex items-center gap-2 mb-2 text-emerald-400">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Farmer's Notes</span>
                      </div>
                      {req.notes}
                    </div>
                  )}

                  {/* Reschedule Form */}
                  {isReschedule && (
                    <div className="mt-4 bg-amber-950/40 border border-amber-700/40 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-amber-200 text-sm font-semibold">Propose New Time</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-emerald-200 text-xs mb-1">New Date</label>
                          <input
                            type="date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-emerald-200 text-xs mb-1">New Time</label>
                          <select
                            value={newTime}
                            onChange={e => setNewTime(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="">Select time</option>
                            {["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReschedule(req.id)}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Confirm New Time
                        </button>
                        <button
                          onClick={() => { setRescheduleId(null); setNewDate(""); setNewTime(""); }}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, Clock, X, Send } from "lucide-react";
import { toast } from "sonner";

type FeedbackType = "Suggestion" | "Bug Report" | "Complaint" | "Compliment";
type FeedbackStatus = "Under Review" | "In Progress" | "Resolved";
type FilterTab = "All Feedback" | FeedbackType;

type FeedbackItem = {
  id: number;
  user: string;
  type: FeedbackType;
  category: string;
  subject: string;
  message: string;
  date: string;
  status: FeedbackStatus;
  priority: "High" | "Medium" | "Low";
  votes: number;
  downvotes: number;
  userVoted: "up" | "down" | null;
  avatar: string;
  replies: string[];
};

const initialFeedback: FeedbackItem[] = [
  {
    id: 1, user: "John Mwangi", type: "Suggestion", category: "Feature Request",
    subject: "Mobile App Development",
    message: "It would be great to have a mobile app for easier access on the go. The website works fine but an app would be more convenient.",
    date: "April 9, 2026", status: "Under Review", priority: "Medium", votes: 24, downvotes: 2, userVoted: null, avatar: "👨🏾‍🌾", replies: [],
  },
  {
    id: 2, user: "Sarah Wanjiru", type: "Bug Report", category: "Technical Issue",
    subject: "Payment Processing Delay",
    message: "Experiencing delays in payment processing. Transactions take longer than expected to reflect.",
    date: "April 8, 2026", status: "In Progress", priority: "High", votes: 12, downvotes: 1, userVoted: null, avatar: "👩🏾", replies: ["We're looking into this — our team has been notified."],
  },
  {
    id: 3, user: "David Ochieng", type: "Compliment", category: "User Experience",
    subject: "Excellent Platform",
    message: "The platform is very user-friendly and has helped me connect with quality buyers. Great job!",
    date: "April 7, 2026", status: "Resolved", priority: "Low", votes: 45, downvotes: 0, userVoted: null, avatar: "👨🏿‍💼", replies: ["Thank you for the kind words, David!"],
  },
  {
    id: 4, user: "Grace Akinyi", type: "Suggestion", category: "Feature Request",
    subject: "Bulk Upload Feature",
    message: "Would love to see a feature for bulk product uploads. Currently adding products one by one is time-consuming.",
    date: "April 6, 2026", status: "Under Review", priority: "Medium", votes: 18, downvotes: 3, userVoted: null, avatar: "👩🏾‍💼", replies: [],
  },
  {
    id: 5, user: "Peter Kamau", type: "Complaint", category: "Customer Service",
    subject: "Slow Response Time",
    message: "Customer support response time could be improved. Waited 2 days for a reply to my inquiry.",
    date: "April 5, 2026", status: "Resolved", priority: "High", votes: 8, downvotes: 1, userVoted: null, avatar: "👨🏾", replies: ["We apologize for the delay. We've improved our response time."],
  },
];

const stats = [
  { label: "Total Feedback", value: "127", icon: MessageSquare, color: "from-blue-600 to-blue-700" },
  { label: "Under Review", value: "23", icon: Clock, color: "from-amber-600 to-amber-700" },
  { label: "In Progress", value: "15", icon: AlertCircle, color: "from-purple-600 to-purple-700" },
  { label: "Resolved", value: "89", icon: CheckCircle, color: "from-emerald-600 to-emerald-700" },
];

const filterTabs: FilterTab[] = ["All Feedback", "Suggestion", "Bug Report", "Complaint", "Compliment"];

export default function UserFeedback() {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Feedback");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // Submit form state
  const [submitForm, setSubmitForm] = useState({
    type: "Suggestion" as FeedbackType,
    subject: "",
    message: "",
    category: "",
  });

  const filtered = activeFilter === "All Feedback"
    ? feedback
    : feedback.filter(f => f.type === activeFilter);

  const counts: Record<FilterTab, number> = {
    "All Feedback": feedback.length,
    "Suggestion": feedback.filter(f => f.type === "Suggestion").length,
    "Bug Report": feedback.filter(f => f.type === "Bug Report").length,
    "Complaint": feedback.filter(f => f.type === "Complaint").length,
    "Compliment": feedback.filter(f => f.type === "Compliment").length,
  };

  const handleVote = (id: number, direction: "up" | "down") => {
    setFeedback(prev =>
      prev.map(f => {
        if (f.id !== id) return f;
        if (f.userVoted === direction) {
          // Undo vote
          return {
            ...f,
            votes: direction === "up" ? f.votes - 1 : f.votes,
            downvotes: direction === "down" ? f.downvotes - 1 : f.downvotes,
            userVoted: null,
          };
        }
        const wasUp = f.userVoted === "up";
        const wasDown = f.userVoted === "down";
        return {
          ...f,
          votes: direction === "up" ? f.votes + 1 : wasUp ? f.votes - 1 : f.votes,
          downvotes: direction === "down" ? f.downvotes + 1 : wasDown ? f.downvotes - 1 : f.downvotes,
          userVoted: direction,
        };
      })
    );
  };

  const handleReply = (id: number) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    setFeedback(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, replies: [...f.replies, replyText.trim()] }
          : f
      )
    );
    toast.success("Reply posted!");
    setReplyText("");
    setReplyingTo(null);
  };

  const handleSubmitFeedback = () => {
    if (!submitForm.subject.trim() || !submitForm.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newItem: FeedbackItem = {
      id: Date.now(),
      user: "You",
      type: submitForm.type,
      category: submitForm.category || submitForm.type,
      subject: submitForm.subject,
      message: submitForm.message,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      status: "Under Review",
      priority: "Medium",
      votes: 0,
      downvotes: 0,
      userVoted: null,
      avatar: "🧑🏾‍🌾",
      replies: [],
    };
    setFeedback(prev => [newItem, ...prev]);
    toast.success("Feedback submitted successfully! Thank you.");
    setShowSubmitModal(false);
    setSubmitForm({ type: "Suggestion", subject: "", message: "", category: "" });
  };

  const typeColors: Record<FeedbackType, string> = {
    "Suggestion": "bg-blue-900/40 text-blue-300",
    "Bug Report": "bg-red-900/40 text-red-300",
    "Complaint": "bg-orange-900/40 text-orange-300",
    "Compliment": "bg-emerald-900/40 text-emerald-300",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">User Feedback</h1>
        <p className="text-emerald-200">Listen to your users and improve the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white`}>
              <Icon className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-80 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
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

      {/* Feedback List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white/5 rounded-xl p-12 text-center text-gray-400 border border-white/10">
            No feedback items for this category.
          </div>
        )}
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">{item.avatar}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{item.user}</h4>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-emerald-300 text-sm">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Resolved"
                          ? "bg-emerald-900/50 text-emerald-300"
                          : item.status === "In Progress"
                          ? "bg-purple-900/50 text-purple-300"
                          : "bg-amber-900/50 text-amber-300"
                      }`}
                    >
                      {item.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  </div>
                </div>

                <h5 className="text-white font-medium mb-2">{item.subject}</h5>
                <p className="text-gray-300 text-sm mb-4">{item.message}</p>

                {/* Replies */}
                {item.replies.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {item.replies.map((reply, ri) => (
                      <div key={ri} className="bg-emerald-900/20 border border-emerald-800/40 rounded-lg p-3">
                        <p className="text-emerald-300 text-xs font-semibold mb-1">Admin Response</p>
                        <p className="text-gray-200 text-sm">{reply}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === item.id && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleReply(item.id)}
                      placeholder="Type your reply..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleReply(item.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote(item.id, "up")}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        item.userVoted === "up" ? "text-emerald-400" : "text-gray-400 hover:text-emerald-400"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${item.userVoted === "up" ? "fill-emerald-400" : ""}`} />
                      <span>{item.votes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(item.id, "down")}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        item.userVoted === "down" ? "text-red-400" : "text-gray-400 hover:text-red-400"
                      }`}
                    >
                      <ThumbsDown className={`w-4 h-4 ${item.userVoted === "down" ? "fill-red-400" : ""}`} />
                      <span>{item.downvotes}</span>
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === item.id ? null : item.id);
                        setReplyText("");
                      }}
                      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      item.priority === "High" ? "text-red-400" :
                      item.priority === "Medium" ? "text-amber-400" : "text-gray-400"
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Feedback Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-all shadow-lg hover:shadow-xl"
        >
          <MessageSquare className="w-5 h-5" />
          Submit Feedback
        </button>
      </div>

      {/* Submit Feedback Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Submit Feedback</h2>
              <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">Feedback Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Suggestion", "Bug Report", "Complaint", "Compliment"] as FeedbackType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setSubmitForm(f => ({ ...f, type }))}
                      className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all border ${
                        submitForm.type === type
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={submitForm.category}
                  onChange={e => setSubmitForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Feature Request, Technical Issue..."
                />
              </div>
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={submitForm.subject}
                  onChange={e => setSubmitForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Brief title for your feedback"
                />
              </div>
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">Message *</label>
                <textarea
                  value={submitForm.message}
                  onChange={e => setSubmitForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Describe your feedback in detail..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmitFeedback}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit
                </button>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

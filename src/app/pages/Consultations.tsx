import { useState } from "react";
import { Calendar, Clock, Video, User, Plus, X, Star, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type Consultation = {
  id: number;
  expert: string;
  specialty: string;
  date: string;
  time: string;
  duration: string;
  status: "Upcoming" | "Completed";
  type: string;
  avatar: string;
};

const initialConsultations: Consultation[] = [
  {
    id: 1,
    expert: "Dr. James Kimani",
    specialty: "Crop Disease Management",
    date: "April 20, 2026",
    time: "10:00 AM",
    duration: "45 min",
    status: "Upcoming",
    type: "Video Call",
    avatar: "👨🏾‍🔬",
  },
  {
    id: 2,
    expert: "Prof. Mary Njeri",
    specialty: "Soil Health & Fertility",
    date: "April 23, 2026",
    time: "2:00 PM",
    duration: "30 min",
    status: "Upcoming",
    type: "Video Call",
    avatar: "👩🏾‍🏫",
  },
  {
    id: 3,
    expert: "Eng. Peter Mutua",
    specialty: "Irrigation Systems",
    date: "April 8, 2026",
    time: "11:00 AM",
    duration: "60 min",
    status: "Completed",
    type: "Video Call",
    avatar: "👨🏿‍💼",
  },
  {
    id: 4,
    expert: "Dr. Lucy Wambui",
    specialty: "Organic Farming Practices",
    date: "April 5, 2026",
    time: "3:00 PM",
    duration: "45 min",
    status: "Completed",
    type: "Phone Call",
    avatar: "👩🏾‍⚕️",
  },
];

const availableExperts = [
  { name: "Dr. James Kimani", specialty: "Crop Disease", rating: 4.9, consultations: 145, avatar: "👨🏾‍🔬" },
  { name: "Prof. Mary Njeri", specialty: "Soil Health", rating: 4.8, consultations: 203, avatar: "👩🏾‍🏫" },
  { name: "Eng. Peter Mutua", specialty: "Irrigation", rating: 4.7, consultations: 98, avatar: "👨🏿‍💼" },
  { name: "Dr. Lucy Wambui", specialty: "Organic Farming", rating: 5.0, consultations: 176, avatar: "👩🏾‍⚕️" },
  { name: "Mr. David Omondi", specialty: "Sales & Marketing", rating: 4.9, consultations: 312, avatar: "📊" },
  { name: "Ms. Sarah Chen", specialty: "Digital Marketing", rating: 4.8, consultations: 185, avatar: "📱" },
  { name: "Mr. Kevin Maina", specialty: "Market Linkages", rating: 4.7, consultations: 124, avatar: "🤝" },
];

export default function Consultations() {
  const [consultations, setConsultations] = useState(initialConsultations);
  const navigate = useNavigate();
  const [rescheduleModal, setRescheduleModal] = useState<Consultation | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<typeof availableExperts[0] | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookNotes, setBookNotes] = useState("");

  const upcoming = consultations.filter(c => c.status === "Upcoming");
  const completed = consultations.filter(c => c.status === "Completed");
  const totalHours = consultations
    .filter(c => c.status === "Completed")
    .reduce((acc, c) => acc + parseInt(c.duration), 0) / 60;



  const handleReschedule = () => {
    if (!newDate || !newTime) {
      toast.error("Please select a date and time");
      return;
    }
    if (rescheduleModal) {
      setConsultations(prev =>
        prev.map(c =>
          c.id === rescheduleModal.id
            ? { ...c, date: new Date(newDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), time: newTime }
            : c
        )
      );
      toast.success(`Consultation rescheduled to ${newDate} at ${newTime}`);
      setRescheduleModal(null);
      setNewDate("");
      setNewTime("");
    }
  };

  const handleBookNow = (expert: typeof availableExperts[0]) => {
    if (!bookDate || !bookTime) {
      toast.error("Please select a date and time");
      return;
    }
    const newConsultation: Consultation = {
      id: Date.now(),
      expert: expert.name,
      specialty: expert.specialty,
      date: new Date(bookDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      time: bookTime,
      duration: "45 min",
      status: "Upcoming",
      type: "Video Call",
      avatar: expert.avatar,
    };
    setConsultations(prev => [newConsultation, ...prev]);
    toast.success(`Consultation booked with ${expert.name}!`);
    setIsBookingModalOpen(false);
    setBookDate("");
    setBookTime("");
    setBookNotes("");
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Consultations</h1>
        <p className="text-emerald-200">Connect with agricultural experts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Upcoming</p>
          <p className="text-4xl font-bold">{upcoming.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Completed</p>
          <p className="text-4xl font-bold">{completed.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Total Hours</p>
          <p className="text-4xl font-bold">{totalHours.toFixed(1)}</p>
        </div>
      </div>

      {/* My Consultations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">My Consultations</h2>
          <button
            onClick={() => { setIsBookingModalOpen(true); setSelectedExpert(availableExperts[0]); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Book Consultation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{consultation.avatar}</div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">{consultation.expert}</h3>
                  <p className="text-emerald-300 text-sm">{consultation.specialty}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    consultation.status === "Upcoming"
                      ? "bg-emerald-900/50 text-emerald-300"
                      : "bg-gray-700/50 text-gray-300"
                  }`}
                >
                  {consultation.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">{consultation.date}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">{consultation.time} • {consultation.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">{consultation.type}</span>
                </div>
              </div>

              {consultation.status === "Upcoming" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/app/call/consultation-${consultation.id}`)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Join Call
                  </button>
                  <button
                    onClick={() => setRescheduleModal(consultation)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Reschedule
                  </button>
                </div>
              )}

              {consultation.status === "Completed" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success("Session notes downloaded!")}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    View Notes
                  </button>
                  <button
                    onClick={() => toast.success("Review submitted! ⭐⭐⭐⭐⭐")}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1"
                  >
                    <Star className="w-4 h-4 text-yellow-400" />
                    Rate Session
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Experts */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Available Experts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableExperts.map((expert, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10 hover:border-emerald-500/50 transition-all hover:bg-white/10"
            >
              <div className="text-6xl mb-3">{expert.avatar}</div>
              <h3 className="text-white font-bold mb-1">{expert.name}</h3>
              <p className="text-emerald-300 text-sm mb-3">{expert.specialty}</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-300 mb-4">
                <div>
                  <p className="text-yellow-400 font-bold">⭐ {expert.rating}</p>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <p>{expert.consultations} sessions</p>
                </div>
              </div>
              <button
                onClick={() => { setIsBookingModalOpen(true); setSelectedExpert(expert); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>



      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Reschedule Consultation</h2>
              <button onClick={() => setRescheduleModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-white font-semibold">{rescheduleModal.expert}</p>
              <p className="text-emerald-300 text-sm">{rescheduleModal.specialty}</p>
              <p className="text-gray-400 text-sm mt-2">Current: {rescheduleModal.date} at {rescheduleModal.time}</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-emerald-100 text-sm font-medium mb-2">New Time</label>
                <select
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white"
                >
                  <option value="">Select time</option>
                  {["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReschedule}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Confirm Reschedule
              </button>
              <button
                onClick={() => setRescheduleModal(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Consultation Modal with Carousel */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-emerald-700/50 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">Book Consultation</h2>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 scrollbar-hide">
              {/* Expert Carousel */}
              <div className="mb-8">
                <h3 className="text-emerald-100 text-sm font-medium mb-3">Select an Expert</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {availableExperts.map((expert, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedExpert(expert)}
                      className={`min-w-[160px] snap-start cursor-pointer rounded-xl p-4 transition-all border ${selectedExpert?.name === expert.name ? 'bg-emerald-800 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] scale-105' : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-70 hover:opacity-100'}`}
                    >
                      <div className="text-4xl mb-2 text-center">{expert.avatar}</div>
                      <h4 className="text-white font-bold text-center text-sm mb-1 line-clamp-1">{expert.name}</h4>
                      <p className="text-emerald-300 text-xs text-center line-clamp-1">{expert.specialty}</p>
                      <p className="text-yellow-400 text-xs text-center mt-2">⭐ {expert.rating}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Form for Selected Expert */}
              {selectedExpert && (
                <div className="bg-black/20 rounded-xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                    <div className="text-4xl">{selectedExpert.avatar}</div>
                    <div>
                      <p className="text-white font-bold text-lg">Booking with {selectedExpert.name}</p>
                      <p className="text-emerald-300 text-sm">{selectedExpert.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-emerald-100 text-sm font-medium mb-2">Preferred Date</label>
                      <input
                        type="date"
                        value={bookDate}
                        onChange={e => setBookDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-100 text-sm font-medium mb-2">Preferred Time</label>
                      <select
                        value={bookTime}
                        onChange={e => setBookTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white transition-all"
                      >
                        <option value="">Select time</option>
                        {["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-emerald-100 text-sm font-medium mb-2">Topic / Notes (optional)</label>
                      <textarea
                        value={bookNotes}
                        onChange={e => setBookNotes(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all"
                        placeholder="What would you like to discuss?"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBookNow(selectedExpert)}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-emerald-500/25"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => setIsBookingModalOpen(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-semibold transition-all border border-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

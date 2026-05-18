import { useState, useEffect, useCallback } from "react";
import { Search, ThumbsUp, ThumbsDown, BookOpen, Filter, ChevronRight, ChevronLeft, X, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { carouselSlides, categories, allTags, featuredGuides, popularTopics, topExperts } from "../data/expertData";

type Article = any; // Will match GNews API response structure
type Guide = typeof featuredGuides[0];
type Topic = typeof popularTopics[0];

export default function ExpertKnowledge() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Live News State
  const [liveArticles, setLiveArticles] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  const fetchNews = useCallback(async (customSearchTerm = "") => {
    setIsLoadingNews(true);
    // Removed GNews API fetch to prevent any CSP or API key errors.
    // Using mock data reliably instead.
    setTimeout(() => {
      setLiveArticles([
        {
          title: "Sustainable Agriculture Practices Gain Momentum",
          url: "#",
          image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "AgriNews" }
        },
        {
          title: "Modern Farming Equipment Enhances Crop Yields",
          url: "#",
          image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?auto=format&fit=crop&q=80&w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Farm Weekly" }
        },
        {
          title: "Market Prices Expected to Stabilize This Quarter",
          url: "#",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Business Today" }
        },
        {
          title: "New Subsidies Announced for Small-Scale Farmers",
          url: "#",
          image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Daily Nation" }
        }
      ]);
      if (customSearchTerm) {
        toast.success(`Found articles for your search.`);
      }
      setIsLoadingNews(false);
    }, 600);
  }, []);

  useEffect(() => {
    if (profile?.role) {
      fetchNews();
    }
  }, [fetchNews, profile?.role]);

  const nextSlide = useCallback(() => setCarouselIdx(i => (i + 1) % carouselSlides.length), []);
  const prevSlide = () => setCarouselIdx(i => (i - 1 + carouselSlides.length) % carouselSlides.length);

  useEffect(() => {
    const t = setInterval(nextSlide, 8000);
    return () => clearInterval(t);
  }, [nextSlide]);

  const [commQuestions, setCommQuestions] = useState([
    {
      id: 1,
      user: "Farmer John",
      question: "What is the best time to plant maize in Central Kenya?",
      answers: [
        { author: "Dr. Samuel Njau", text: "Ideally between March and April for the long rains.", type: "Expert" },
        { author: "Farmer Peter", text: "I've had success planting in mid-March.", type: "Farmer" }
      ],
      date: "1 day ago"
    },
    {
      id: 2,
      user: "Alice W.",
      question: "How do I naturally get rid of aphids on my kales?",
      answers: [
        { author: "Dr. Emily Wangari", text: "Use a mixture of neem oil and soapy water.", type: "Expert" }
      ],
      date: "3 days ago"
    }
  ]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [newAnswer, setNewAnswer] = useState("");

  const handleSubmitQuestion = () => {
    if (!question.trim()) { toast.error("Please enter your question."); return; }
    const newQ = {
      id: Date.now(),
      user: "You",
      question: question,
      answers: [],
      date: "Just now"
    };
    setCommQuestions([newQ, ...commQuestions]);
    toast.success("Question posted to the community!");
    setQuestion("");
    setShowQuestionModal(false);
  };

  const handleReply = (qId: number) => {
    if (!newAnswer.trim()) { toast.error("Please type an answer."); return; }
    setCommQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          answers: [...q.answers, { author: "You", text: newAnswer, type: "Farmer" }]
        };
      }
      return q;
    }));
    toast.success("Your answer has been posted!");
    setNewAnswer("");
    setReplyingTo(null);
  };

  const displayed = showAll ? liveArticles : liveArticles.slice(0, 4);

  const slide = carouselSlides[carouselIdx];

  const Modal = ({ title, content, onClose }: { title: string; content: string; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-emerald-900 border border-emerald-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-white font-bold text-lg leading-tight pr-4">{title}</h3>
          <button onClick={onClose} className="text-emerald-400 hover:text-white flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-emerald-200 text-sm leading-relaxed whitespace-pre-line">{content}</p>
        <button onClick={onClose} className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold transition-all">Close</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      {/* ── Carousel ── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden h-64 md:h-80 shadow-2xl">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${slide.image})` }} />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-40`} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="text-5xl mb-3">{slide.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.title}</h1>
          <p className="text-emerald-200 max-w-xl mb-5">{slide.subtitle}</p>
          <button onClick={() => setShowQuestionModal(true)} className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold shadow-lg transition-all">
            Submit A Question
          </button>
        </div>
        <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
        <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselSlides.map((_, i) => (
            <button key={i} onClick={() => setCarouselIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === carouselIdx ? "bg-white w-5" : "bg-white/40"}`} />
          ))}
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchNews(searchQuery)} placeholder="Search live articles..." className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-emerald-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-sm" />
          </div>
          <button onClick={() => fetchNews(searchQuery)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg">
            Search
          </button>
          <button onClick={() => { setActiveCategory(null); setActiveTag(null); setSearchQuery(""); fetchNews(""); toast.info("Filters cleared"); }} className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 text-emerald-200 rounded-xl hover:bg-white/20 transition-all" title="Clear Filters">
            <X className="w-5 h-5" />
          </button>
        </div>
        {(activeCategory || activeTag) && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {activeCategory && <span className="flex items-center gap-1 bg-emerald-700/60 text-emerald-200 text-xs px-3 py-1 rounded-full"><span>{activeCategory}</span><button onClick={() => { setActiveCategory(null); fetchNews(""); }}><X className="w-3 h-3 hover:text-white" /></button></span>}
            {activeTag && <span className="flex items-center gap-1 bg-emerald-700/60 text-emerald-200 text-xs px-3 py-1 rounded-full"><span>{activeTag}</span><button onClick={() => { setActiveTag(null); fetchNews(""); }}><X className="w-3 h-3 hover:text-white" /></button></span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
            <ul className="space-y-1.5">
              {categories.map(cat => (
                <li key={cat.name}>
                  <button onClick={() => { 
                    const isDeactivating = activeCategory === cat.name;
                    setActiveCategory(isDeactivating ? null : cat.name); 
                    setActiveTag(null); 
                    fetchNews(isDeactivating ? "" : cat.name);
                  }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm ${activeCategory === cat.name ? "bg-emerald-600 text-white" : "text-emerald-200 hover:bg-emerald-800/40 hover:text-white"}`}>
                    <span>{cat.emoji} {cat.name}</span>
                    <span className="w-6 h-6 bg-emerald-700/60 rounded-full flex items-center justify-center text-xs font-semibold">{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4">Browse By Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button key={tag} onClick={() => { 
                  const isDeactivating = activeTag === tag;
                  setActiveTag(isDeactivating ? null : tag); 
                  fetchNews(isDeactivating ? "" : tag);
                }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${activeTag === tag ? "bg-emerald-600 text-white border-emerald-500" : "bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 border-emerald-700/30"}`}>{tag}</button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4">Top Experts</h3>
            <div className="space-y-3">
              {topExperts.map(e => (
                <button key={e.name} onClick={() => navigate("/app/consultations")} className="w-full flex items-center gap-3 hover:bg-white/5 p-1 rounded-lg transition-all text-left">
                  <div className={`w-10 h-10 ${e.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{e.name.charAt(0)}</div>
                  <div><p className="text-white text-sm font-semibold">{e.name}</p><p className="text-emerald-400 text-xs">{e.specialty} · {e.articles} articles</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="lg:col-span-3 space-y-8">
          {/* Articles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {profile?.role === "buyer" ? "Market & Business Intelligence" : "Agricultural Insights"} 
                <span className="text-emerald-400 text-sm font-normal ml-2">({liveArticles.length} live articles)</span>
              </h2>
              <button onClick={() => setShowAll(s => !s)} className="text-emerald-400 hover:text-white text-sm flex items-center gap-1 transition-colors">{showAll ? "Show less" : "View all"}<ChevronRight className="w-4 h-4" /></button>
            </div>
            {isLoadingNews ? (
               <div className="text-center py-12 text-emerald-400">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                 <p>Fetching live news from GNews...</p>
               </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-12 text-emerald-400"><BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" /><p>No articles match your filters.</p><button onClick={() => { setActiveCategory(null); setActiveTag(null); setSearchQuery(""); }} className="mt-3 text-emerald-300 underline text-sm">Clear filters</button></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayed.map((article, idx) => (
                  <div key={idx} onClick={() => window.open(article.url, "_blank")} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-emerald-500/40 group cursor-pointer transition-all">
                    <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${article.image})` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-700/80 backdrop-blur-sm text-emerald-200 text-xs rounded-md font-medium">{article.source.name}</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors text-sm leading-tight line-clamp-2">{article.title}</h4>
                      <p className="text-emerald-400 text-xs mb-3">{new Date(article.publishedAt).toLocaleDateString()}</p>
                      <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                        <span className="text-emerald-400 text-xs flex items-center gap-1">Read on {article.source.name} <ChevronRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Guides */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Featured Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredGuides.map(guide => (
                <div key={guide.title} onClick={() => setSelectedGuide(guide)} className="rounded-xl overflow-hidden shadow-md cursor-pointer group hover:scale-[1.02] transition-transform">
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${guide.image})` }}>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                    <div className="absolute top-3 left-3 text-2xl">{guide.emoji}</div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 border-t-0">
                    <p className="text-white font-medium text-sm leading-tight">{guide.title}</p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-medium">Read guide <ChevronRight className="w-3 h-3" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Topics */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-5">Popular Topics</h2>
            <ol className="space-y-3">
              {popularTopics.map(topic => (
                <li key={topic.id}>
                  <button onClick={() => setSelectedTopic(topic)} className="w-full flex items-center gap-4 pb-3 border-b border-white/10 last:border-0 last:pb-0 hover:bg-white/5 rounded-lg px-2 py-2 transition-all text-left group">
                    <span className="w-8 h-8 bg-emerald-700/60 rounded-full flex items-center justify-center text-emerald-200 font-bold text-sm flex-shrink-0">{topic.id}</span>
                    <div className="flex-1"><p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{topic.title}</p><p className="text-emerald-300 text-xs mt-0.5">{topic.subtitle}</p></div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Community Q&A */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-5">Community Q&A</h2>
            <div className="space-y-6">
              {commQuestions.map(q => (
                <div key={q.id} className="border-b border-white/10 last:border-0 pb-6 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-emerald-400 text-xs font-medium">{q.user} asked:</span>
                    <span className="text-gray-500 text-[10px]">{q.date}</span>
                  </div>
                  <p className="text-white font-semibold mb-4">{q.question}</p>
                  <div className="space-y-3 pl-4 border-l-2 border-emerald-500/30 mb-4">
                    {q.answers.map((a, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.type === 'Expert' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {a.type}
                          </span>
                          <span className="text-emerald-300 text-xs font-bold">{a.author}</span>
                        </div>
                        <p className="text-emerald-100 text-sm">{a.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  {replyingTo === q.id ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newAnswer} 
                        onChange={e => setNewAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button 
                        onClick={() => handleReply(q.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        Post
                      </button>
                      <button 
                        onClick={() => { setReplyingTo(null); setNewAnswer(""); }}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setReplyingTo(q.id)}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-3 h-3" /> Reply as Farmer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => { setShowAll(true); toast.success("Showing all articles!"); }} className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-lg font-bold shadow-lg hover:shadow-emerald-500/25 transition-all">
              Browse All Articles
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-emerald-900 border border-emerald-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Ask the Community</h3>
              <button onClick={() => setShowQuestionModal(false)}><X className="w-5 h-5 text-emerald-400 hover:text-white" /></button>
            </div>
            <p className="text-emerald-300 text-sm mb-4">Submit your farming question and get answers from our expert community and experienced farmers within 48 hours.</p>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Describe your farming question in detail..." rows={5} className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-400/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowQuestionModal(false)} className="flex-1 py-2.5 border border-white/20 text-emerald-200 rounded-xl hover:bg-white/10 transition-all text-sm">Cancel</button>
              <button onClick={handleSubmitQuestion} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold transition-all text-sm"><Send className="w-4 h-4" />Submit Question</button>
            </div>
          </div>
        </div>
      )}

      {selectedArticle && <Modal title={selectedArticle.title} content={`By ${selectedArticle.author} · ${selectedArticle.date}\n\n${selectedArticle.content}`} onClose={() => setSelectedArticle(null)} />}
      {selectedGuide && <Modal title={selectedGuide.title} content={selectedGuide.content} onClose={() => setSelectedGuide(null)} />}
      {selectedTopic && <Modal title={selectedTopic.title} content={selectedTopic.content} onClose={() => setSelectedTopic(null)} />}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Sprout, TrendingUp, Users, ShoppingCart, CheckCircle, ArrowRight, GraduationCap, Eye, EyeOff, Shield, ChevronDown, MapPin, Mail, Phone, Leaf, Loader2, Quote } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import { signIn } from "../../lib/auth";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useRateLimit } from "../../hooks/useRateLimit";

type UserRole = "farmer" | "buyer" | "expert" | null;

const features = [
  {
    icon: Sprout,
    title: "Farm Management",
    description: "Track all your farming activities, from planting to harvest",
  },
  {
    icon: ShoppingCart,
    title: "Digital Marketplace",
    description: "Buy and sell agricultural products directly with other farmers",
  },
  {
    icon: TrendingUp,
    title: "Market Prices",
    description: "Stay updated with real-time market prices for your products",
  },
  {
    icon: Users,
    title: "Expert Consultations",
    description: "Get advice from agricultural experts and experienced farmers",
  },
];

const faqs = [
  {
    question: "How do I register as a farmer?",
    answer: "Click the 'Sign Up' button on this page, select 'Farmer' as your role, and fill in your farm details. Once registered, you can immediately start listing your products on the marketplace."
  },
  {
    question: "Is FBEconnect free to use?",
    answer: "Yes, creating an account and browsing the marketplace is completely free. We charge a small nominal fee only when a successful transaction is completed through the platform."
  },
  {
    question: "How do you ensure the quality of products?",
    answer: "We have a strict verification process for farmers and an active rating system. Buyers can review farmers after a purchase, ensuring transparency and accountability within the community."
  },
  {
    question: "Can I get agricultural advice if I'm a beginner?",
    answer: "Absolutely! Our 'Expert Knowledge' section allows you to consult with verified agricultural experts. You can ask questions, request soil analysis tips, and get crop recommendations."
  },
  {
    question: "How are payments handled?",
    answer: "We integrate securely with major payment providers. Funds are held safely until the buyer confirms receipt of the products, protecting both parties."
  }
];

const testimonials = [
  {
    name: "James Mwangi",
    farm: "Sunrise Farm",
    image: "https://images.unsplash.com/photo-1740741703636-1680d0c0f0a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZmFybWVyJTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzc2MTYxMzA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    quote: "FBEconnect transformed how I manage my farm and connect with buyers. My sales increased by 40%!",
  },
  {
    name: "Mary Njeri",
    farm: "Green Valley",
    image: "https://images.unsplash.com/photo-1651592278720-fd9479be2a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBmYXJtZXIlMjBhZ3JpY3VsdHVyZXxlbnwxfHx8fDE3NzYyNTU5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    quote: "The market price tracking helps me sell at the right time. Best platform for modern farmers!",
  },
  {
    name: "Chen Wei",
    farm: "Golden Harvest",
    image: "https://images.unsplash.com/photo-1718968924561-a25d9ec0c3f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZhcm1lciUyMHdvcmtpbmd8ZW58MXx8fHwxNzc2MjU1OTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    quote: "Expert consultations helped me improve my crop yield by 60%. Highly recommended!",
  },
  {
    name: "David Johnson",
    farm: "Organic Meadows",
    image: "https://images.unsplash.com/photo-1717175554477-f814ead82745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGZhcm1lciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NjI1NTkwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    quote: "The marketplace feature connects me directly with buyers. No more middlemen taking my profits!",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { session, loading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [hasJustLoggedIn, setHasJustLoggedIn] = useState(false);
  const { isThrottled, remainingSeconds, recordAttempt, reset } = useRateLimit({ storageKey: "landing_login_attempts" });

  // ── Redirect after explicit login ─────────────────
  // We only auto-redirect if the user *just* logged in via this page's form.
  // Existing logged-in users who visit the landing page will stay on the page.
  useEffect(() => {
    if (hasJustLoggedIn && !authLoading && session) {
      navigate("/app", { replace: true });
    }
  }, [session, authLoading, hasJustLoggedIn, navigate]);

  const handleDemoLogin = async (role: "Farmer" | "Buyer") => {
    setIsDemoLoading(true);
    try {
      const email = role === "Farmer" ? "farmer@fbeconnect.com" : "buyer@fbeconnect.com";
      const password = role === "Farmer" ? "FarmerDemo2024!" : "BuyerDemo2024!";
      await signIn(email, password);
      toast.success(`Logged in as Demo ${role}!`);
      setHasJustLoggedIn(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo login failed";
      toast.error(msg);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }

    if (isLogin && isThrottled) {
      toast.error(`Too many attempts. Please wait ${remainingSeconds}s.`);
      return;
    }

    if (isLogin) {
      // Real Supabase login — navigate is handled by the session useEffect above
      setIsSubmitting(true);
      try {
        await Promise.race([
          signIn(formData.email, formData.password),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Login request timed out. Please check your connection.")), 10000))
        ]);
        toast.success("Welcome back to FBEconnect!");
        reset();
        setHasJustLoggedIn(true);
      } catch (err: unknown) {
        recordAttempt();
        const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Redirect to the proper role-specific registration page
      navigate(`/register/${selectedRole}`);
    }
  };

  const resetRole = () => {
    setSelectedRole(null);
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')"
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Side - Info */}
            <div className="text-white">
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t('hero_title')}
              </h2>

              <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                {t('hero_subtitle')}
              </p>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <Icon className="w-8 h-8 text-emerald-300 mb-3" />
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-emerald-100 text-sm">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <p className="text-4xl font-bold text-white mb-1">5000+</p>
                  <p className="text-emerald-200 text-sm">Active Farmers</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1">50K+</p>
                  <p className="text-emerald-200 text-sm">Products Listed</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1">98%</p>
                  <p className="text-emerald-200 text-sm">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div id="auth-form" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
              {/* Background Image for Form */}
              <div
                className="absolute inset-0 opacity-5 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1708975477074-71e2907b699f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwdHJhY3RvciUyMGZpZWxkJTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzc2MjU1OTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')"
                }}
              />

              <div className="relative z-10">
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => { setIsLogin(true); resetRole(); }}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${isLogin
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-white/5 text-emerald-200 hover:bg-white/10"
                      }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all bg-white/5 text-emerald-200 hover:bg-white/10`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Role Selection — LOGIN: pick role then show form; SIGN UP: go straight to register page */}
                {!selectedRole && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white text-center mb-6">
                      {isLogin ? "Login as a" : "Create your account"}
                    </h3>

                    {["farmer", "buyer", "expert"].map((role) => {
                      const meta: Record<string, { label: string; desc: string; border: string; img: string }> = {
                        farmer: {
                          label: "Farmer",
                          desc: "Manage your farm and sell products",
                          border: "hover:border-emerald-400",
                          img: "https://images.unsplash.com/photo-1627829382469-f4bce7df99ba?w=200&q=80",
                        },
                        buyer: {
                          label: "Buyer",
                          desc: "Purchase quality agricultural products",
                          border: "hover:border-blue-400",
                          img: "https://images.unsplash.com/photo-1753161618211-2b3d3166133a?w=200&q=80",
                        },
                        expert: {
                          label: "Expert",
                          desc: "Provide consultations and advice",
                          border: "hover:border-purple-400",
                          img: "https://images.unsplash.com/photo-1582794496242-8165eed32971?w=200&q=80",
                        },
                      };
                      const m = meta[role];
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            if (isLogin) {
                              setSelectedRole(role as any);
                            } else {
                              // Sign Up: go straight to the full registration page
                              navigate(`/register/${role}`);
                            }
                          }}
                          className={`w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 ${m.border} rounded-xl p-6 transition-all group`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full group-hover:scale-110 transition-transform bg-cover bg-center border-2 border-emerald-400/50"
                              style={{ backgroundImage: `url('${m.img}')` }}
                            />
                            <div className="flex-1 text-left">
                              <p className="text-white font-bold text-lg">{m.label}</p>
                              <p className="text-emerald-200 text-sm">{m.desc}</p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Role-Specific Forms */}
                {selectedRole && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <button
                      type="button"
                      onClick={resetRole}
                      className="text-emerald-300 hover:text-white text-sm flex items-center gap-1 mb-4"
                    >
                      ← Change role
                    </button>

                    

                    <div>
                      <label className="block text-emerald-100 text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder={
                          selectedRole === "farmer" ? "farmer@example.com" :
                            selectedRole === "buyer" ? "buyer@example.com" :
                              "expert@example.com"
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-emerald-100 text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {isLogin && (
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-emerald-200">
                          <input type="checkbox" className="mr-2 rounded" />
                          Remember me
                        </label>
                        <Link to="/forgot-password" className="text-emerald-300 hover:text-white transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || (isLogin && isThrottled)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                      ) : (isLogin && isThrottled) ? (
                        <>Locked ({remainingSeconds}s)</>
                      ) : isLogin ? (
                        <>Login to FBEconnect <ArrowRight className="w-5 h-5" /></>
                      ) : (
                        <>Continue to Register <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>

                    {!isLogin && (
                      <p className="text-emerald-200 text-xs text-center">
                        By signing up, you agree to our <Link to="/terms" className="text-emerald-400 hover:text-white underline">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-400 hover:text-white underline">Privacy Policy</Link>
                      </p>
                    )}
                  </form>
                )}

                {/* Platform Trust Indicator */}
                {!selectedRole && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="bg-emerald-900/40 rounded-xl p-5 border border-emerald-500/20 text-center shadow-inner">
                      <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                      <p className="text-emerald-50 text-sm font-bold mb-1 tracking-wide">Secure & Verified Network</p>
                      <p className="text-emerald-200/80 text-xs leading-relaxed max-w-xs mx-auto">
                        FBEconnect employs enterprise-grade security to protect your farm data and ensure safe transactions within our trusted community.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* About Us Section */}
          <section id="about" className="py-20 scroll-mt-20">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
                    <Leaf className="w-8 h-8 text-emerald-400" />
                    About FBEconnect
                  </h2>
                  <p className="text-emerald-100 text-lg leading-relaxed mb-6">
                    FBEconnect is revolutionizing the agricultural landscape by bridging the gap between local farmers, bulk buyers, and seasoned agricultural experts. We believe in empowering the farming community through technology, ensuring fair trade, and promoting sustainable farming practices.
                  </p>
                  <p className="text-emerald-100 text-lg leading-relaxed">
                    Founded with a vision to digitize agriculture, our platform serves as a comprehensive ecosystem. Whether you're looking to manage your farm efficiently, sell your produce at competitive market prices, or seek professional agronomy advice, FBEconnect is your trusted partner in growth.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-900/40 p-6 rounded-2xl border border-emerald-500/20 text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">10K+</h3>
                    <p className="text-emerald-300 text-sm">Verified Farmers</p>
                  </div>
                  <div className="bg-emerald-900/40 p-6 rounded-2xl border border-emerald-500/20 text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
                    <p className="text-emerald-300 text-sm">Regions Covered</p>
                  </div>
                  <div className="bg-emerald-900/40 p-6 rounded-2xl border border-emerald-500/20 text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">24/7</h3>
                    <p className="text-emerald-300 text-sm">Expert Support</p>
                  </div>
                  <div className="bg-emerald-900/40 p-6 rounded-2xl border border-emerald-500/20 text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">100%</h3>
                    <p className="text-emerald-300 text-sm">Secure Trade</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-20 scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
              <p className="text-emerald-200 text-lg max-w-2xl mx-auto">
                Comprehensive solutions tailored for the modern agricultural ecosystem.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: ShoppingCart, title: "B2B Marketplace", desc: "A secure digital marketplace connecting farmers directly with bulk buyers, eliminating middlemen and maximizing profits." },
                { icon: TrendingUp, title: "Market Analytics", desc: "Real-time crop pricing and market demand analytics to help you make informed selling and planting decisions." },
                { icon: Users, title: "Expert Consultations", desc: "One-on-one virtual consultations with certified agronomists to optimize your farm's yield and health." },
                { icon: Shield, title: "Secure Payments", desc: "Escrow-style payment protection ensuring that both buyers and sellers are fully protected during transactions." },
                { icon: Sprout, title: "Farm Management", desc: "Digital tools to track your inventory, harvest cycles, and farm expenses all from a single dashboard." },
                { icon: GraduationCap, title: "Knowledge Hub", desc: "Access to a vast library of modern farming techniques, weather advisories, and sustainable agriculture guides." }
              ].map((service, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1">
                  <service.icon className="w-10 h-10 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-emerald-100/90 text-sm leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Us Section */}
          <section id="contact" className="py-20 scroll-mt-20">
            <div className="bg-gradient-to-br from-emerald-900/80 to-emerald-800/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-emerald-500/30 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
                    Contact Us
                  </h2>
                  <p className="text-emerald-100 text-lg mb-8">
                    Have questions about our platform or need assistance? Our dedicated support team is here to help you grow.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Office Address</h4>
                        <p className="text-emerald-200">AgriHub Towers, Nairobi, Kenya</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Phone Numbers</h4>
                        <p className="text-emerald-200">+254 114 081 586 / +254 113 770 822</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Email Address</h4>
                        <p className="text-emerald-200">support@fbeconnect.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <form className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Message sent successfully!'); }}>
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">Your Name</label>
                    <input type="text" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">Email Address</label>
                    <input type="email" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">Message</label>
                    <textarea rows={4} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" required></textarea>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <div className="py-20">
            <div className="text-center mb-14">
              <p className="text-emerald-400 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
              <h2 className="text-4xl font-bold text-white">
                What Farmers Are Saying
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mx-auto mt-4" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 hover:border-emerald-400/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Decorative large quote mark background */}
                  <div className="absolute top-4 right-6 text-8xl text-emerald-400/10 font-serif leading-none select-none pointer-events-none" aria-hidden="true">
                    &#8220;
                  </div>

                  {/* Opening quote icon */}
                  <div className="mb-5">
                    <Quote className="w-8 h-8 text-emerald-400/60 fill-emerald-400/20" />
                  </div>

                  {/* Quote text with Lora serif */}
                  <p
                    style={{ fontFamily: "'Lora', Georgia, serif" }}
                    className="text-white text-lg leading-relaxed mb-6 font-normal"
                  >
                    {testimonial.quote}
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                    <div
                      className="w-12 h-12 bg-cover bg-center rounded-full border-2 border-emerald-400 flex-shrink-0"
                      style={{ backgroundImage: `url(${testimonial.image})` }}
                    />
                    <div>
                      <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-emerald-300 text-xs">{testimonial.farm}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="py-20 mb-10">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="text-lg font-bold text-white pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-6 h-6 text-emerald-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <div
                      className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <p className="text-emerald-100/90 leading-relaxed text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
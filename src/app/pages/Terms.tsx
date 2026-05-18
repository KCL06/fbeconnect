import { Shield, ScrollText, Scale, Lock, Users, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import Logo from "../components/Logo";
import { useState } from "react";

export default function Terms() {
  const [activeSection, setActiveSection] = useState("acceptance");
  const [agreed, setAgreed] = useState(false);

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", icon: CheckCircle2 },
    { id: "accounts", title: "2. User Accounts & Security", icon: Shield },
    { id: "marketplace", title: "3. Marketplace Rules", icon: ScrollText },
    { id: "payments", title: "4. Payments & Fees", icon: Scale },
    { id: "privacy", title: "5. Data & Privacy", icon: Lock },
    { id: "conduct", title: "6. User Conduct", icon: Users },
    { id: "liability", title: "7. Limitations of Liability", icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-[#061e11] text-white selection:bg-emerald-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#061e11]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/privacy" className="text-emerald-300 hover:text-white text-sm font-medium transition-colors">
              Privacy Policy
            </Link>
            <Link to="/login" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
          <ScrollText className="w-4 h-4" />
          <span>Last Updated: May 2026</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-xl text-emerald-200 max-w-2xl leading-relaxed">
          Welcome to FBEconnect. We believe in transparency, fairness, and empowering the agricultural community. Please read these terms carefully.
        </p>
      </div>

      {/* Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32 flex flex-col lg:flex-row gap-12">
        
        {/* Table of Contents (Sticky Sidebar) */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-32 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    isActive 
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                    : "text-emerald-200/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-500/50"}`} />
                  <span className="font-medium">{section.title}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal Text Area */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
          <div className="prose prose-invert prose-emerald max-w-none space-y-16">
            
            <section id="acceptance" onMouseEnter={() => setActiveSection("acceptance")} className="scroll-mt-32">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                1. Acceptance of Terms
              </h2>
              <div className="text-emerald-100/80 leading-relaxed space-y-4">
                <p>By accessing and using FBEconnect, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
                <p>ANY PARTICIPATION IN THIS SITE WILL CONSTITUTE ACCEPTANCE OF THIS AGREEMENT. IF YOU DO NOT AGREE TO ABIDE BY THE ABOVE, PLEASE DO NOT USE THIS SITE.</p>
              </div>
            </section>

            <section id="accounts" onMouseEnter={() => setActiveSection("accounts")} className="scroll-mt-32 pt-8 border-t border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-400" />
                2. User Accounts & Security
              </h2>
              <div className="text-emerald-100/80 leading-relaxed space-y-4">
                <p>To use certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
                <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
                  <li>You are responsible for safeguarding your password.</li>
                  <li>You agree not to disclose your password to any third party.</li>
                  <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                </ul>
              </div>
            </section>

            <section id="marketplace" onMouseEnter={() => setActiveSection("marketplace")} className="scroll-mt-32 pt-8 border-t border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <ScrollText className="w-8 h-8 text-emerald-400" />
                3. Marketplace Rules
              </h2>
              <div className="text-emerald-100/80 leading-relaxed space-y-4">
                <p>As a Farmer or Buyer on our platform, you agree to conduct business fairly and transparently. All produce listed must accurately reflect its real-world condition, quantity, and quality.</p>
                <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-6 my-6">
                  <h4 className="text-emerald-300 font-bold mb-2">Anti-Circumvention Policy</h4>
                  <p className="text-sm">To maintain the platform, all transactions initiated through FBEconnect must be completed through FBEconnect. Sharing direct contact details to bypass the platform's ordering system is strictly prohibited and may result in account suspension.</p>
                </div>
              </div>
            </section>

            <section id="payments" onMouseEnter={() => setActiveSection("payments")} className="scroll-mt-32 pt-8 border-t border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Scale className="w-8 h-8 text-emerald-400" />
                4. Payments & Fees
              </h2>
              <div className="text-emerald-100/80 leading-relaxed space-y-4">
                <p>FBEconnect acts as a secure intermediary for transactions. When a Buyer places an order, funds are held securely until the Farmer confirms the shipment and the Buyer acknowledges receipt.</p>
                <p>We charge a nominal platform fee of 2.5% on all successful transactions to maintain our servers, secure payment gateways, and expert consultation features.</p>
              </div>
            </section>

            <section id="privacy" onMouseEnter={() => setActiveSection("privacy")} className="scroll-mt-32 pt-8 border-t border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Lock className="w-8 h-8 text-emerald-400" />
                5. Data & Privacy
              </h2>
              <div className="text-emerald-100/80 leading-relaxed space-y-4">
                <p>Your privacy is critically important to us. We do not sell your personal data to third parties. We use industry-standard encryption to protect your communications and payment details.</p>
                <p>For complete details, please refer to our <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">Privacy Policy</Link>.</p>
              </div>
            </section>

            <section id="conduct" onMouseEnter={() => setActiveSection("conduct")} className="scroll-mt-32 pt-8 border-t border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-emerald-400" />
                6. User Conduct
              </h2>
              <div className="text-emerald-100/80 leading-relaxed space-y-4">
                <p>We strive to maintain a professional, respectful community. Any form of harassment, hate speech, or fraudulent behavior will result in immediate termination of your account.</p>
              </div>
            </section>

            <section id="liability" onMouseEnter={() => setActiveSection("liability")} className="scroll-mt-32 pt-8 border-t border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-emerald-400" />
                7. Limitations of Liability
              </h2>
              <div className="text-emerald-100/80 leading-relaxed space-y-4">
                <p>FBEconnect is provided "as is" without any guarantees. While we vet our Experts and monitor the marketplace, we are not liable for crop failures resulting from consultation advice, or disputes arising from delayed shipments.</p>
              </div>
            </section>

          </div>

          {/* Interactive Agreement Area */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center">
            <button 
              onClick={() => setAgreed(!agreed)}
              className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 ${
                agreed 
                ? "bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-105" 
                : "bg-white/5 border border-white/10 text-emerald-200 hover:bg-white/10 hover:border-emerald-500/50"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${agreed ? "border-white bg-white" : "border-emerald-500/50 group-hover:border-emerald-400"}`}>
                {agreed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              {agreed ? "I Agree to the Terms of Service" : "Click to Agree"}
            </button>
            {agreed && (
              <p className="mt-4 text-emerald-400 text-sm font-medium animate-fade-in">
                Thank you! You are ready to use FBEconnect.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

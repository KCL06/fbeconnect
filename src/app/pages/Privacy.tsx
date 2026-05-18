import { Shield, Eye, Database, Server, Smartphone, Globe, LockKeyhole, FileKey } from "lucide-react";
import { Link } from "react-router";
import Logo from "../components/Logo";

export default function Privacy() {
  const policies = [
    {
      icon: Eye,
      title: "Data We Collect",
      content: "We collect minimal data required to provide our services. This includes your name, email, phone number, and transaction history. We never track your browsing outside of FBEconnect.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Database,
      title: "How We Use Data",
      content: "Your data is strictly used to match buyers with farmers, facilitate secure payments, and schedule expert consultations. We do not sell your data to marketers.",
      color: "from-emerald-500 to-teal-400"
    },
    {
      icon: Shield,
      title: "Data Protection",
      content: "All sensitive data, including passwords and direct messages, are encrypted at rest and in transit using military-grade AES-256 encryption.",
      color: "from-purple-500 to-pink-400"
    },
    {
      icon: Smartphone,
      title: "Device Information",
      content: "We collect basic device information (like OS and browser type) solely to optimize your experience and ensure the platform is responsive on your screen.",
      color: "from-amber-500 to-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-[#040f09] text-white selection:bg-emerald-500/30 font-sans overflow-hidden">
      
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-900/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[150px] mix-blend-screen" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBMMjAgNDBNNDAgMjBMNjAgME0wIDBMMjAgMjBNNDAgNDBMNjAgNjAiLz48L2c+PC9zdmc+')] opacity-20" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </Link>
        <Link to="/terms" className="text-emerald-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-2 bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-500/20">
          <FileKey className="w-4 h-4" />
          Terms of Service
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-[2px] mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
          <div className="w-full h-full bg-[#040f09] rounded-full flex items-center justify-center">
            <LockKeyhole className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Your Privacy is <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Our Priority.
          </span>
        </h1>
        <p className="text-xl text-emerald-100/70 max-w-2xl mx-auto leading-relaxed">
          We believe that your data belongs to you. FBEconnect is built from the ground up with privacy and security in mind, ensuring your agricultural business remains confidential.
        </p>
      </div>

      {/* Policy Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {policies.map((policy, idx) => {
            const Icon = policy.icon;
            return (
              <div 
                key={idx}
                className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 overflow-hidden"
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${policy.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${policy.color} bg-opacity-10 mb-6 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-emerald-200 transition-all">
                  {policy.title}
                </h3>
                
                <p className="text-emerald-100/60 leading-relaxed group-hover:text-emerald-100/80 transition-colors">
                  {policy.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Infrastructure Banner */}
      <div className="relative z-10 border-y border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <Server className="w-8 h-8 text-cyan-400" />
              Secure Infrastructure
            </h2>
            <p className="text-emerald-100/70 leading-relaxed text-lg">
              Our servers are hosted in highly secure, SOC2 compliant data centers. We employ continuous monitoring and automated threat detection to keep your data safe 24/7/365.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Globe className="w-48 h-48 text-emerald-900/50 animate-[spin_60s_linear_infinite]" />
          </div>
        </div>
      </div>

      {/* Footer / Contact */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Questions about your privacy?</h2>
        <p className="text-emerald-100/70 mb-8">
          If you have any questions about how we handle your data, or if you would like to request account deletion, please contact our Data Protection Officer.
        </p>
        <a href="mailto:privacy@fbeconnect.com" className="inline-flex items-center gap-2 bg-white text-emerald-950 px-8 py-4 rounded-full font-bold hover:bg-emerald-100 transition-colors shadow-xl">
          <Shield className="w-5 h-5" />
          Contact Privacy Team
        </a>
      </div>

    </div>
  );
}

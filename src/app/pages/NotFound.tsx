import { Link, useNavigate } from "react-router";
import { Home, ArrowLeft, Search } from "lucide-react";
import Logo from "../components/Logo";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1724531281596-cfae90d5a082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }}
      />

      <div className="relative z-10 text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo size="lg" />
        </div>

        {/* 404 Display */}
        <div className="relative mb-6">
          <p className="text-[8rem] font-black text-emerald-700/50 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-20 h-20 text-emerald-400 opacity-80" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>

        <p className="text-emerald-400/60 text-sm mt-10">
          © {new Date().getFullYear()} FBEconnect — Empowering agricultural communities
        </p>
      </div>
    </div>
  );
}

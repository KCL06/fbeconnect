import { Link } from "react-router";
import { Users, ShoppingBag, GraduationCap, Leaf, ArrowRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const roles = [
  {
    to: "/register/farmer",
    icon: Users,
    title: "Register as Farmer",
    description: "List your products, connect with buyers, and access expert agricultural advice",
    color: "from-emerald-500 to-emerald-700",
    border: "hover:border-emerald-400",
    badge: "Most Popular",
  },
  {
    to: "/register/buyer",
    icon: ShoppingBag,
    title: "Register as Buyer",
    description: "Access fresh produce directly from farmers and track your purchases",
    color: "from-blue-500 to-blue-700",
    border: "hover:border-blue-400",
    badge: null,
  },
  {
    to: "/register/expert",
    icon: GraduationCap,
    title: "Register as Expert",
    description: "Share your agricultural expertise and help farmers grow better",
    color: "from-purple-500 to-purple-700",
    border: "hover:border-purple-400",
    badge: null,
  },
];

export default function Register() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1724531281596-cfae90d5a082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Create Your Account</h1>
              <p className="text-emerald-200 text-lg">Choose your account type to get started on FBEconnect</p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Link
                    key={role.to}
                    to={role.to}
                    className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 ${role.border} hover:bg-white/15 transition-all hover:scale-105 hover:shadow-2xl group`}
                  >
                    {role.badge && (
                      <span className="absolute top-4 right-4 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">
                        {role.badge}
                      </span>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{role.title}</h3>
                      <p className="text-emerald-200 text-sm leading-relaxed mb-5">{role.description}</p>
                      <div className="flex items-center gap-2 text-emerald-300 group-hover:text-white transition-colors font-medium text-sm">
                        Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <p className="text-emerald-200 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-white font-semibold hover:text-emerald-300 transition-colors underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

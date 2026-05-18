import {
  Camera, Mail, Phone, MapPin, Star, ShoppingBag,
  Award, Shield, ExternalLink, TrendingUp, Users, Leaf,
  GraduationCap, Briefcase
} from "lucide-react";
import { useState } from "react";
import { useAppCache } from "../../lib/useAppCache";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  farmName: string;
  location: string;
  bio: string;
  avatarUrl: string;
  role: string;
  memberSince: string;
  // Role-specific
  specialization?: string;
  businessName?: string;
}

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  farmer: { label: "Verified Farmer", icon: Leaf, color: "text-emerald-400", bgColor: "bg-emerald-400/20" },
  buyer: { label: "Buyer", icon: ShoppingBag, color: "text-blue-400", bgColor: "bg-blue-400/20" },
  expert: { label: "Agricultural Expert", icon: GraduationCap, color: "text-purple-400", bgColor: "bg-purple-400/20" },
  admin: { label: "Platform Admin", icon: Shield, color: "text-amber-400", bgColor: "bg-amber-400/20" },
};

export default function Profile() {
  const { user, profile: authProfile } = useAuth();
  const fetchProfileData = async (): Promise<ProfileData | null> => {
    if (!user) throw new Error("User required");
    const { data, error } = await supabase
      .from("profiles")
      .select(`*, farmer_profiles(*), expert_profiles(*), buyer_profiles(*)`)
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!data) return null;

    return {
      fullName: data.full_name || "",
      email: data.email || "",
      phone: data.phone || "",
      farmName: data.farmer_profiles?.farm_name || "",
      location: data.farmer_profiles?.farm_location || data.buyer_profiles?.location || "",
      bio: data.farmer_profiles?.bio || data.expert_profiles?.bio || "",
      avatarUrl: data.avatar_url || "",
      role: data.role || "farmer",
      memberSince: data.created_at ? new Date(data.created_at).getFullYear().toString() : new Date().getFullYear().toString(),
      specialization: data.expert_profiles?.specialization || "",
      businessName: data.buyer_profiles?.business_name || "",
    };
  };

  const { data, isLoading } = useAppCache<ProfileData | null>(
    user?.id ? `profile_${user.id}` : null,
    fetchProfileData,
    [user?.id]
  );

  const profileData = data || {
    fullName: "",
    email: "",
    phone: "",
    farmName: "",
    location: "",
    bio: "",
    avatarUrl: "",
    role: "farmer",
    memberSince: "",
  };

  const role = roleConfig[profileData.role] || roleConfig.farmer;
  const RoleIcon = role.icon;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-emerald-300 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1622676566956-b42b50c84c31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-emerald-900/80 to-emerald-950/95" />

        <div className="relative z-10 p-8 pb-0">
          {/* Top bar */}
          <div className="flex items-start justify-between mb-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${role.bgColor} ${role.color} border border-current/20`}>
              <RoleIcon className="w-4 h-4" />
              {role.label}
            </div>
            <Link
              to="/app/settings"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20 transition-all hover:border-emerald-400/50"
            >
              <Camera className="w-4 h-4" />
              Edit Profile
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-end gap-6 pb-8">
            <div className="relative flex-shrink-0">
              <div
                className="w-28 h-28 rounded-2xl border-4 border-emerald-400/60 bg-emerald-800 bg-cover bg-center shadow-xl overflow-hidden flex items-center justify-center"
                style={profileData.avatarUrl ? { backgroundImage: `url('${profileData.avatarUrl}')` } : {}}
              >
                {!profileData.avatarUrl && (
                  <span className="text-5xl select-none">
                    {profileData.role === "expert" ? "👨‍🏫" : profileData.role === "buyer" ? "🛒" : "👨🏾‍🌾"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-emerald-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            <div className="pb-2">
              <h1 className="text-3xl font-bold text-white mb-1">
                {profileData.fullName || "Your Name"}
              </h1>
              <p className="text-emerald-300 font-medium">
                {profileData.farmName || profileData.businessName || profileData.specialization || "FBEconnect Member"}
              </p>
              {profileData.location && (
                <div className="flex items-center gap-1.5 text-emerald-400/80 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profileData.location}
                </div>
              )}
              <p className="text-emerald-500 text-xs mt-1">Member since {profileData.memberSince}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Stats */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider opacity-70">Activity</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "125", label: "Products", icon: ShoppingBag, color: "text-emerald-400" },
                { value: "450", label: "Sales", icon: TrendingUp, color: "text-blue-400" },
                { value: "4.8", label: "Rating", icon: Star, color: "text-yellow-400" },
                { value: "98%", label: "Verified", icon: Shield, color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1.5`} />
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider opacity-70">Contact</h2>
            <div className="space-y-3">
              {profileData.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 text-sm truncate">{profileData.email}</span>
                </div>
              )}
              {profileData.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300 text-sm">+254 {profileData.phone}</span>
                </div>
              )}
              {!profileData.email && !profileData.phone && (
                <p className="text-gray-500 text-sm italic">No contact info yet.</p>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider opacity-70">Achievements</h2>
            <div className="space-y-2.5">
              {[
                { icon: "🏆", label: "Top Seller", color: "bg-yellow-500/20 border-yellow-500/30" },
                { icon: "✅", label: "Verified Member", color: "bg-emerald-500/20 border-emerald-500/30" },
                { icon: "⭐", label: "Quality Products", color: "bg-blue-500/20 border-blue-500/30" },
              ].map((a) => (
                <div key={a.label} className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${a.color}`}>
                  <span className="text-base">{a.icon}</span>
                  <span className="text-white text-sm font-medium">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Bio */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-70">About</h2>
              <Link
                to="/app/settings"
                className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors"
              >
                Edit <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {profileData.bio ? (
              <p className="text-gray-300 leading-relaxed">{profileData.bio}</p>
            ) : (
              <div className="text-center py-6">
                <Leaf className="w-10 h-10 text-emerald-600/40 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">Tell the community about yourself and your farm.</p>
                <Link
                  to="/app/settings"
                  className="inline-flex items-center gap-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-sm px-4 py-2 rounded-lg border border-emerald-500/30 transition-all"
                >
                  Add Bio in Settings <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Role-specific detail card */}
          {profileData.role === "farmer" && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-70 mb-4">Farm Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Farm Name", value: profileData.farmName || "—" },
                  { label: "Location", value: profileData.location || "—" },
                ].map((f) => (
                  <div key={f.label} className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                    <p className="text-white font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileData.role === "expert" && profileData.specialization && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-70 mb-4">Expertise</h2>
              <div className="flex items-center gap-3 bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                <Briefcase className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p className="text-white font-medium capitalize">{profileData.specialization}</p>
                </div>
              </div>
            </div>
          )}

          {profileData.role === "buyer" && profileData.businessName && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-70 mb-4">Business</h2>
              <div className="flex items-center gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <ShoppingBag className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Business Name</p>
                  <p className="text-white font-medium">{profileData.businessName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Edit CTA Banner */}
          <div className="bg-gradient-to-br from-emerald-800/60 to-emerald-700/40 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold mb-1">Keep your profile up to date</p>
              <p className="text-emerald-300 text-sm">Update your info, photo, password and more in Settings.</p>
            </div>
            <Link
              to="/app/settings"
              className="flex-shrink-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 ml-4"
            >
              <Users className="w-4 h-4" />
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { User, Camera, Mail, Smartphone, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function ProfileTab() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    farmName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatarUrl: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*, farmer_profiles(*)`)
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfileData({
        fullName: data.full_name || "",
        farmName: data.farmer_profiles?.farm_name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.farmer_profiles?.farm_location || "",
        bio: "", // Add bio if it exists in schema
        avatarUrl: data.avatar_url || ""
      });
    } catch (err: any) {
      console.error("Error fetching profile:", err.message);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      if (profileData.farmName || profileData.location) {
        const { error: farmerError } = await supabase
          .from("farmer_profiles")
          .upsert({
            id: user.id,
            farm_name: profileData.farmName,
            farm_location: profileData.location,
          });

        if (farmerError) console.warn("Farmer profile update skipped:", farmerError.message);
      }

      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error("Failed to save changes: " + err.message);
    }
  };

  const handlePhotoChange = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files && input.files[0] && user) {
        const file = input.files[0];
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

          if (updateError) throw updateError;

          setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }));
          toast.success("Profile photo updated successfully!");
        } catch (err: any) {
          toast.error("Upload failed: " + err.message);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          <User className="w-3.5 h-3.5" />
          All profile edits happen here
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-4xl relative group overflow-hidden">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              "👨🏾‍🌾"
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <button
              onClick={handlePhotoChange}
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm mb-2 transition-all disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Change Photo"}
            </button>
            <p className="text-gray-400 text-sm">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-200 text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
              className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-emerald-200 text-sm mb-2">Farm Name</label>
            <input
              type="text"
              value={profileData.farmName}
              onChange={(e) => setProfileData({...profileData, farmName: e.target.value})}
              className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-emerald-200 text-sm mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full bg-white/10 text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-emerald-200 text-sm font-medium mb-2">Phone Number</label>
          <div className="relative flex shadow-sm rounded-lg overflow-hidden border border-white/20 focus-within:ring-2 focus-within:ring-emerald-500">
            <span className="inline-flex items-center px-4 bg-white/5 text-emerald-300 border-r border-white/20 font-medium">
              +254
            </span>
            <div className="relative flex-1">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                placeholder="712 345 678"
                className="w-full bg-white/10 text-white pl-10 pr-4 py-2.5 focus:outline-none transition-all"
              />
            </div>
          </div>
          <p className="text-emerald-400/60 text-xs mt-1.5">Enter without the country code</p>
        </div>

        <div>
          <label className="block text-emerald-200 text-sm font-medium mb-2">Location / Address</label>
          <div className="relative shadow-sm rounded-lg overflow-hidden border border-white/20 focus-within:ring-2 focus-within:ring-emerald-500">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({...profileData, location: e.target.value})}
              placeholder="e.g., Nairobi, Kenya"
              className="w-full bg-white/10 text-white pl-10 pr-4 py-2.5 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-emerald-200 text-sm font-medium">About You (Bio)</label>
            <span className={`text-xs ${(profileData.bio || "").length > 400 ? 'text-red-400' : 'text-emerald-400/60'}`}>
              {(profileData.bio || "").length} / 500
            </span>
          </div>
          <div className="relative shadow-sm rounded-lg overflow-hidden border border-white/20 focus-within:ring-2 focus-within:ring-emerald-500 bg-white/10">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              rows={4}
              maxLength={500}
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              placeholder="Tell us a bit about your farm, what you grow, or your experience..."
              className="w-full bg-transparent text-white pl-10 pr-4 py-2.5 focus:outline-none resize-none transition-all"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/10 flex gap-4">
          <button
            onClick={handleSaveChanges}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Save Changes
          </button>
          <button 
            onClick={() => fetchProfile()} // Reset to fetched state
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all border border-white/20"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

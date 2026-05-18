import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, ChevronLeft, CheckCircle, Upload, Camera } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { signUp, saveFarmerProfile, saveFarmerVerification } from "../../lib/auth";
import {
  validateEmail,
  validatePassword,
  passwordsMatch,
  validatePhone,
  validateName,
  validateNationalId,
  validateYearsExperience,
} from "../../utils/validation";
import { validateDocumentUpload, validateImageUpload } from "../../utils/fileValidation";

// ⚠️ BACKEND: All user inputs must ALSO be validated server-side via:
//   - Supabase Row-Level Security (RLS) policies
//   - Supabase Edge Functions / Database Functions
//   - Supabase Auth password policies (min length in project settings)

export default function RegisterFarmer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    nationalId: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2
    farmName: "",
    farmLocation: "",
    farmingTypes: [] as string[],
    yearsExperience: "",
    // Step 3
    idDocument: null as File | null,
    selfie: null as File | null,
    reference: "",
    agreement: false,
  });

  const updateField = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // ── Step 1: Identity Validation ────────────────────────────────
    if (currentStep === 1) {
      const nameResult = validateName(formData.fullName);
      if (!nameResult.valid) { toast.error(nameResult.error!); return; }

      const idResult = validateNationalId(formData.nationalId);
      if (!idResult.valid) { toast.error(idResult.error!); return; }

      if (!validatePhone(formData.phone)) {
        toast.error("Please enter a valid phone number (e.g. 0712345678 or +254712345678)");
        return;
      }
      if (!validateEmail(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const pwResult = validatePassword(formData.password);
      if (!pwResult.valid) { toast.error(pwResult.errors[0]); return; }

      if (!passwordsMatch(formData.password, formData.confirmPassword)) {
        toast.error("Passwords do not match");
        return;
      }
    }

    // ── Step 2: Farm Details Validation ────────────────────────────
    if (currentStep === 2) {
      if (!formData.farmName.trim()) { toast.error("Farm name is required"); return; }
      if (!formData.farmLocation.trim()) { toast.error("Farm location is required"); return; }
      if (formData.farmingTypes.length === 0) {
        toast.error("Please select at least one farming type");
        return;
      }
      const yearsResult = validateYearsExperience(formData.yearsExperience);
      if (!yearsResult.valid) { toast.error(yearsResult.error!); return; }
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreement) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    // ── File upload validation (MIME via magic bytes + size check) ─────
    if (formData.idDocument) {
      const docResult = await validateDocumentUpload(formData.idDocument);
      if (!docResult.valid) { toast.error(docResult.error!); return; }
    }
    if (formData.selfie) {
      const selfieResult = await validateImageUpload(formData.selfie);
      if (!selfieResult.valid) { toast.error(selfieResult.error!); return; }
    }
    // ⚠️ BACKEND: Re-validate file MIME and size in Supabase Storage policies
    setIsSubmitting(true);
    try {
      const data = await signUp(formData.email, formData.password, formData.fullName, "farmer");
      if (data.user) {
        // Explicitly upsert the profile row in case the DB trigger hasn't fired yet
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: formData.fullName,
          email: formData.email.trim().toLowerCase(),
          role: "farmer",
        }, { onConflict: "id" });

        await saveFarmerProfile(data.user.id, {
          farm_name: formData.farmName,
          farm_location: formData.farmLocation,
          farming_type: formData.farmingTypes.join(", "),
          years_experience: parseInt(formData.yearsExperience) || 0,
        });
        await saveFarmerVerification(data.user.id, {
          national_id: formData.nationalId,
        });
      }
      // Sign out AFTER all saves are done, then redirect to login
      await supabase.auth.signOut();
      toast.success("Account created! Please log in with your credentials.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      if (msg.includes("already registered")) toast.error("Email already in use. Try logging in.");
      else toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1724531281596-cfae90d5a082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Farmer Registration</h1>
              <p className="text-emerald-300">Step {currentStep} of 3</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step <= currentStep ? "bg-emerald-500 text-white shadow-lg" : "bg-white/10 text-emerald-300 border border-white/20"
                        }`}
                    >
                      {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full ${step < currentStep ? "bg-emerald-500" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-emerald-300 px-1">
                <span>Basic Identity</span>
                <span>Farm Details</span>
                <span>Verification</span>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Identity */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    {[{ label: "Full Name", field: "fullName", type: "text" }, { label: "National ID", field: "nationalId", type: "text" }, { label: "Phone Number", field: "phone", type: "tel" }, { label: "Email", field: "email", type: "email" }, { label: "Password", field: "password", type: "password" }, { label: "Confirm Password", field: "confirmPassword", type: "password" }].map(({ label, field, type }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-emerald-100 mb-1">{label} *</label>
                        <input
                          type={type}
                          value={(formData as any)[field]}
                          onChange={(e) => updateField(field, e.target.value)}
                          className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2: Farm Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Farm Name *</label>
                      <input type="text" value={formData.farmName} onChange={(e) => updateField("farmName", e.target.value)} className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Farm Location *</label>
                      <input type="text" value={formData.farmLocation} onChange={(e) => updateField("farmLocation", e.target.value)} placeholder="GPS coordinates or address" className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-2">What do you farm? (select all that apply) *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Vegetables", "Fruits", "Grains", "Dairy", "Poultry", "Tubers", "Herbs", "Flowers", "Livestock", "Fish", "Tea/Coffee", "Mixed Farming"].map((item) => (
                          <label
                            key={item}
                            className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all ${
                              formData.farmingTypes.includes(item)
                                ? "bg-emerald-600/30 border-emerald-400 text-white"
                                : "bg-white/5 border-white/10 text-emerald-200 hover:bg-white/10"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.farmingTypes.includes(item)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({ ...prev, farmingTypes: [...prev.farmingTypes, item] }));
                                } else {
                                  setFormData(prev => ({ ...prev, farmingTypes: prev.farmingTypes.filter(t => t !== item) }));
                                }
                              }}
                              className="w-4 h-4 accent-emerald-500"
                            />
                            <span className="text-sm">{item}</span>
                          </label>
                        ))}
                      </div>
                      {formData.farmingTypes.length > 0 && (
                        <p className="text-emerald-400 text-xs mt-2">Selected: {formData.farmingTypes.join(", ")}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Years of Experience *</label>
                      <input type="number" value={formData.yearsExperience} onChange={(e) => updateField("yearsExperience", e.target.value)} min="0" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Upload Farm Images</label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-white/5">
                        <Upload className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                        <p className="text-sm text-emerald-300">Click to upload farm images</p>
                        <input type="file" accept="image/*" multiple className="hidden" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Verification */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Upload ID Document *</label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-white/5">
                        <Upload className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                        <p className="text-sm text-emerald-300">Upload your National ID or Government ID</p>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => updateField("idDocument", e.target.files?.[0] || null)} className="hidden" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Live Selfie Verification *</label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-white/5">
                        <Camera className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                        <p className="text-sm text-emerald-300">Take a live selfie for verification</p>
                        <input type="file" accept="image/*" capture="user" onChange={(e) => updateField("selfie", e.target.files?.[0] || null)} className="hidden" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Reference (Optional)</label>
                      <input type="text" value={formData.reference} onChange={(e) => updateField("reference", e.target.value)} placeholder="Cooperative name or group reference" className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <input type="checkbox" id="agreement" checked={formData.agreement} onChange={(e) => updateField("agreement", e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-500" required />
                      <label htmlFor="agreement" className="text-sm text-emerald-200 cursor-pointer">
                        I agree to the terms and conditions and declare that all information provided is authentic
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {currentStep > 1 && (
                    <button type="button" onClick={handleBack} className="flex items-center gap-2 px-6 py-2.5 border border-white/20 text-emerald-200 rounded-xl hover:bg-white/10 transition-all">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  {currentStep < 3 ? (
                    <button type="button" onClick={handleNext} className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-semibold">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-auto px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl font-semibold transition-all"
                    >
                      {isSubmitting ? "Submitting..." : "Complete Registration"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

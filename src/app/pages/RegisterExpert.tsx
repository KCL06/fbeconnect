import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, ChevronLeft, CheckCircle, Upload, Camera } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "sonner";
import { signUp, saveExpertProfile } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { validateEmail, validatePassword, passwordsMatch, validatePhone, validateName, validateYearsExperience } from "../../utils/validation";
import { validateDocumentUpload, validateImageUpload } from "../../utils/fileValidation";

// ⚠️ BACKEND: All inputs must also be validated server-side via RLS/Edge Functions

export default function RegisterExpert() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    expertise: "",
    yearsExperience: "",
    certifications: null as File | null,
    institution: "",
    idDocument: null as File | null,
    selfie: null as File | null,
    portfolio: "",
    agreement: false,
  });

  const updateField = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const nameResult = validateName(formData.fullName);
      if (!nameResult.valid) { toast.error(nameResult.error!); return; }
      if (!validateEmail(formData.email)) { toast.error("Please enter a valid email address"); return; }
      if (!validatePhone(formData.phone)) { toast.error("Please enter a valid phone number (e.g. 0712345678)"); return; }
      const pwResult = validatePassword(formData.password);
      if (!pwResult.valid) { toast.error(pwResult.errors[0]); return; }
      if (!passwordsMatch(formData.password, formData.confirmPassword)) { toast.error("Passwords do not match"); return; }
    }
    if (currentStep === 2) {
      if (!formData.expertise.trim()) { toast.error("Area of expertise is required"); return; }
      const yearsResult = validateYearsExperience(formData.yearsExperience);
      if (!yearsResult.valid) { toast.error(yearsResult.error!); return; }
      if (!formData.institution.trim()) { toast.error("Institution is required"); return; }
    }
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
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
    if (formData.certifications) {
      const certResult = await validateDocumentUpload(formData.certifications);
      if (!certResult.valid) { toast.error(certResult.error!); return; }
    }
    // ⚠️ BACKEND: Re-validate file MIME and size in Supabase Storage policies
    setIsSubmitting(true);
    try {
      const data = await signUp(formData.email, formData.password, formData.fullName, "expert");
      if (data.user) {
        // Explicitly upsert the profile row to guarantee role is saved
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: formData.fullName,
          email: formData.email.trim().toLowerCase(),
          role: "expert",
        }, { onConflict: "id" });

        await saveExpertProfile(data.user.id, {
          expertise: formData.expertise,
          years_experience: parseInt(formData.yearsExperience) || 0,
          institution: formData.institution,
          portfolio: formData.portfolio,
        });
      }
      // Sign out AFTER all saves, then redirect to login
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Expert Registration</h1>
              <p className="text-emerald-300">Step {currentStep} of 3</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step <= currentStep ? "bg-emerald-500 text-white shadow-lg" : "bg-white/10 text-emerald-300 border border-white/20"}`}>
                      {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full ${step < currentStep ? "bg-emerald-500" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-emerald-300 px-1">
                <span>Identity</span><span>Credentials</span><span>Authentication</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
              <form onSubmit={handleSubmit}>
                {/* Step 1 */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    {[
                      {label:"Full Name",field:"fullName",type:"text"},
                      {label:"Email",field:"email",type:"email"},
                      {label:"Phone Number",field:"phone",type:"tel"},
                      {label:"Password",field:"password",type:"password"},
                      {label:"Confirm Password",field:"confirmPassword",type:"password"},
                    ].map(({label,field,type}) => (
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

                {/* Step 2 */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Area of Expertise *</label>
                      <input type="text" value={formData.expertise} onChange={(e) => updateField("expertise", e.target.value)} placeholder="e.g., Pest Management, Soil Science, Organic Farming" className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Years of Experience *</label>
                      <input type="number" value={formData.yearsExperience} onChange={(e) => updateField("yearsExperience", e.target.value)} min="0" className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Upload Certifications</label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-white/5">
                        <Upload className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                        <p className="text-sm text-emerald-300">Upload your professional certifications</p>
                        <input type="file" accept="image/*,.pdf" multiple onChange={(e) => updateField("certifications", e.target.files?.[0] || null)} className="hidden" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Institution/Organization *</label>
                      <input type="text" value={formData.institution} onChange={(e) => updateField("institution", e.target.value)} placeholder="Current or previous institution" className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" required />
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Upload ID Document *</label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-white/5">
                        <Upload className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                        <p className="text-sm text-emerald-300">Upload your Government ID</p>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => updateField("idDocument", e.target.files?.[0] || null)} className="hidden" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Live Photo Verification *</label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-white/5">
                        <Camera className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                        <p className="text-sm text-emerald-300">Take a live photo for verification</p>
                        <input type="file" accept="image/*" capture="user" onChange={(e) => updateField("selfie", e.target.files?.[0] || null)} className="hidden" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-1">Portfolio/Previous Work (Optional)</label>
                      <textarea value={formData.portfolio} onChange={(e) => updateField("portfolio", e.target.value)} placeholder="Describe your previous work or links to publications" rows={4} className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-300/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none" />
                    </div>
                    <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4">
                      <p className="text-sm text-amber-200"><strong>Note:</strong> Your account will be reviewed before activation. You will receive an email once approved.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <input type="checkbox" id="agreement" checked={formData.agreement} onChange={(e) => updateField("agreement", e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-500" required />
                      <label htmlFor="agreement" className="text-sm text-emerald-200 cursor-pointer">I agree to the terms and conditions and certify that all information provided is accurate</label>
                    </div>
                  </div>
                )}

                {/* Navigation */}
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
                    <button type="submit" className="ml-auto px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all">
                      Complete Registration
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

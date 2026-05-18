import { useLanguage } from "../../context/LanguageContext";

export default function LanguageTab() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Language & Region</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-emerald-200 text-sm mb-2">Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "sw")}
            className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white"
          >
            <option value="en">English</option>
            <option value="sw">Swahili</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        <div>
          <label className="block text-emerald-200 text-sm mb-2">Time Zone</label>
          <select className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white">
            <option>East Africa Time (EAT) - UTC+3</option>
            <option>West Africa Time (WAT) - UTC+1</option>
            <option>Central Africa Time (CAT) - UTC+2</option>
          </select>
        </div>

        <div>
          <label className="block text-emerald-200 text-sm mb-2">Currency</label>
          <select className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white">
            <option>Kenyan Shilling (KES)</option>
            <option>US Dollar (USD)</option>
            <option>Euro (EUR)</option>
            <option>British Pound (GBP)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

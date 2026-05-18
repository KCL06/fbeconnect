import React from "react";
import { Link } from "react-router";
import { Mail, Phone, Facebook, Twitter, Instagram, MapPin } from "lucide-react";
import Logo from "./Logo";

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white border-t border-emerald-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center mb-4 w-fit">
              <Logo size="lg" />
            </Link>
            <p className="text-emerald-300 text-sm leading-relaxed max-w-md mb-4">
              Connecting farmers, buyers, and agricultural experts to create a sustainable
              farming ecosystem. Empowering agricultural communities through technology
              and knowledge sharing.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-4 mt-6">
              {[
                { Icon: Instagram, label: "Instagram", href: "https://instagram.com/fbeconnect" },
                { Icon: Facebook, label: "Facebook", href: "https://facebook.com/fbeconnect" },
                { Icon: Twitter, label: "X (Twitter)", href: "https://x.com/fbeconnect" },
                { Icon: TiktokIcon, label: "TikTok", href: "https://tiktok.com/@fbeconnect" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-emerald-800/80 group-hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg group-hover:shadow-emerald-500/50">
                    <Icon className="w-5 h-5 text-emerald-100 group-hover:text-white" />
                  </div>
                </a>
              ))}
              <span className="text-emerald-400 font-medium ml-2 bg-emerald-900/50 px-3 py-1 rounded-full text-sm border border-emerald-500/20">@fbeconnect</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-base text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home", isHash: false },
                { to: "about", label: "About Us", isHash: true },
                { to: "services", label: "Services", isHash: true },
                { to: "contact", label: "Contact Us", isHash: true },
                { to: "/login", label: "Login", isHash: false },
                { to: "/register", label: "Get Started", isHash: false },
              ].map((link) =>
                link.isHash ? (
                  <li key={link.to}>
                    <a
                      href={`#${link.to}`}
                      onClick={(e) => scrollTo(e, link.to)}
                      className="text-emerald-300 hover:text-white transition-colors text-sm hover:underline cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-emerald-300 hover:text-white transition-colors text-sm hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-base text-white mb-4 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-emerald-300 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@fbeconnect.com" className="hover:text-white transition-colors">
                  support@fbeconnect.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-emerald-300 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+254114081586" className="hover:text-white transition-colors">
                    +254 114 081 586
                  </a>
                  <a href="tel:+254113770822" className="hover:text-white transition-colors">
                    +254 113 770 822
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 text-emerald-300 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-2">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-emerald-800/60 border border-emerald-700 text-white placeholder-emerald-400 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-all font-medium">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-emerald-400 text-sm">
            &copy; {currentYear} FBEconnect. All rights reserved. Empowering agricultural communities.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-emerald-400 hover:text-white text-sm font-medium transition-colors hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-emerald-400 hover:text-white text-sm font-medium transition-colors hover:underline underline-offset-4">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

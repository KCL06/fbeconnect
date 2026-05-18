import React from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  isAuthenticated?: boolean;
}

export default function Header({ isAuthenticated = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { signOut } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  const navLinks: { to: string; label: string; isHash?: boolean }[] = [
    { to: "/", label: "Home" },
    { to: "#about", label: "About Us", isHash: true },
    { to: "#services", label: "Services", isHash: true },
    { to: "#contact", label: "Contact", isHash: true },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-emerald-900/95 backdrop-blur-sm border-b border-emerald-700/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = !link.isHash && location.pathname === link.to;
              return link.isHash ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleAnchorClick(e, link.to)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-700 text-white"
                      : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-600 text-emerald-100 hover:text-white hover:bg-emerald-700 transition-all text-sm font-medium"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'EN' : 'SW'}</span>
            </button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/app/profile"
                    className="px-4 py-2 text-emerald-100 hover:text-white transition-colors text-sm font-medium"
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-emerald-100 hover:text-white border border-emerald-600 hover:border-emerald-400 rounded-lg transition-all text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-md hover:shadow-emerald-500/25 text-sm font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-emerald-100 hover:text-white p-2 rounded-lg hover:bg-emerald-800/60 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-700/50">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = !link.isHash && location.pathname === link.to;
                return link.isHash ? (
                  <a
                    key={link.to}
                    href={link.to}
                    onClick={(e) => { handleAnchorClick(e, link.to); setIsMobileMenuOpen(false); }}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-700 text-white"
                        : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-emerald-700/50">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/app/profile"
                      className="px-4 py-3 text-emerald-100 hover:text-white text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                      className="px-4 py-3 bg-red-600/80 text-white rounded-lg text-sm font-medium text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-emerald-100 border border-emerald-600 rounded-lg text-sm font-medium text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Scale, Phone, ShieldCheck, Menu, X, Lock, ExternalLink, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdvocateProfile } from '../types';

interface NavbarProps {
  profile: AdvocateProfile;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeSection,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'expertise', label: 'Practice Areas' },
    { id: 'cases', label: 'Past Cases' },
    { id: 'events', label: 'Gallery & Media' },
    { id: 'contact', label: 'Consultation' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-slate-950/95 backdrop-blur-xl shadow-xl shadow-slate-950/50 border-b border-slate-800/90 py-2'
          : 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800/60 py-2.5'
      }`}
    >
      {/* Top micro bar for high-court status */}
      <div className="hidden sm:block border-b border-slate-800/40 pb-1 mb-1.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <Award className="w-3 h-3 text-amber-400" />
              <span>High Court Roll No. {profile.barRegistrationNo}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Chamber Active for Consultations</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 flex items-center justify-between">
        {/* Brand Header */}
        <motion.div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="brand-logo"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/10 group-hover:shadow-amber-500/20 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <Scale className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform duration-300" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Active Practice"></span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
              <span className="text-xs sm:text-sm md:text-base font-serif font-bold text-slate-100 tracking-tight sm:tracking-wide group-hover:text-amber-400 transition-colors">
                {profile.name?.toLowerCase().startsWith('advocate') ? profile.name : `Advocate ${profile.name}`}
              </span>
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 opacity-90 flex-shrink-0" />
            </div>
            <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-sans font-medium whitespace-nowrap truncate">
              {profile.title || 'High Court & Supreme Court Advocate'}
            </span>
          </div>
        </motion.div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-slate-950/80 p-1 rounded-full border border-slate-800/80 shadow-inner" id="desktop-nav">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 relative cursor-pointer ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden lg:flex items-center gap-2.5" id="navbar-actions">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`tel:${profile.phonePrimary}`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 shadow-sm transition-all cursor-pointer group"
            title="Call Primary Chamber"
            id="nav-call-btn"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <Phone className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>{profile.phonePrimary}</span>
          </motion.a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-slate-950/98 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-5 space-y-2 shadow-2xl overflow-hidden"
            id="mobile-nav-drawer"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Award className="w-3 h-3" />
                <span>Roll No: {profile.barRegistrationNo}</span>
              </span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Chamber Open</span>
              </span>
            </div>

            <div className="space-y-1 pt-1">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeSection === item.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent hover:border-slate-800'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <a
                href={`tel:${profile.phonePrimary}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Chamber ({profile.phonePrimary})</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


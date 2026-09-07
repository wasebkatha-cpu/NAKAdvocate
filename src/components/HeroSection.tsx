import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Scale, Award, ShieldCheck, ArrowRight, BookOpen, Calendar } from 'lucide-react';
import { AdvocateProfile } from '../types';

interface HeroSectionProps {
  profile: AdvocateProfile;
  onNavigate: (sectionId: string) => void;
}

interface AdvocatePortraitImageProps {
  profile: AdvocateProfile;
  className?: string;
  maxHeightClass?: string;
  isMobile?: boolean;
}

const AdvocatePortraitImage: React.FC<AdvocatePortraitImageProps> = ({
  profile,
  className = "w-full h-auto object-contain rounded-lg block m-0 p-0",
  maxHeightClass = "max-h-[480px]",
  isMobile = false
}) => {
  const imageOwner = 'wasebkatha-cpu';
  const imageRepo = 'NAKAdvocateImages';
  const imageBranch = 'main';

  const candidates = useMemo(() => {
    const list: string[] = [];
    if (profile.portraitUrl && profile.portraitUrl.trim()) {
      list.push(profile.portraitUrl.trim());
    }

    const rawBase = `https://raw.githubusercontent.com/${imageOwner}/${imageRepo}/${imageBranch}/images/profile_portrait`;
    const pagesBase = `https://${imageOwner}.github.io/${imageRepo}/images/profile_portrait`;

    const defaults = [
      `${rawBase}.jpg`,
      `${rawBase}.png`,
      `${rawBase}.jpeg`,
      `${rawBase}.webp`,
      `${pagesBase}.jpg`,
      `${pagesBase}.png`
    ];

    defaults.forEach(url => {
      if (!list.includes(url)) {
        list.push(url);
      }
    });

    return list;
  }, [profile.portraitUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setHasError(false);
  }, [profile.portraitUrl]);

  const currentSrc = candidates[currentIndex];

  const handleError = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentSrc) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center bg-slate-900 w-full ${isMobile ? 'h-56' : 'h-72'} border-2 border-dashed border-slate-800 rounded-lg`}>
        <Scale className="w-12 h-12 text-amber-400 mb-2 opacity-60" />
        <div className="text-xs font-bold text-slate-200 font-serif">Advocate {profile.name}</div>
        <div className="text-[11px] text-amber-400 mt-1 font-mono font-medium">No Image Uploaded</div>
        {!isMobile && <div className="text-[10px] text-slate-500 mt-2">Use Admin Panel to upload or add Hero image</div>}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={profile.name}
      onError={handleError}
      referrerPolicy="no-referrer"
      className={`${className} ${maxHeightClass}`}
    />
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ profile, onNavigate }) => {
  return (
    <section id="home" className="relative bg-slate-900 text-white py-4 md:py-6 overflow-hidden border-b border-slate-800">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Details & Information */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-7 lg:col-span-7 space-y-4 text-center md:text-left"
          >
            {/* Bar Council Credential Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>High Court Roll No. {profile.barRegistrationNo}</span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
              {profile.name?.toLowerCase().startsWith('advocate') ? (
                <span className="text-amber-400 italic font-serif">{profile.name}</span>
              ) : (
                <>Advocate <span className="text-amber-400 italic font-serif">{profile.name}</span></>
              )}
            </h1>

            {/* Hero Image Frame for Mobile View ONLY (Below heading, above tagline) */}
            <div className="block md:hidden py-2">
              <div className="relative max-w-xs mx-auto w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-slate-700/50 rounded-2xl blur-md opacity-75"></div>
                <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-2 overflow-hidden shadow-2xl isolate">
                  <div className="relative w-full min-h-[240px] max-h-[400px] bg-slate-900/80 rounded-xl overflow-hidden flex items-center justify-center p-1">
                    <AdvocatePortraitImage
                      profile={profile}
                      maxHeightClass="max-h-[380px]"
                      isMobile={true}
                    />
                  </div>
                  <div className="mt-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800/80 flex items-center justify-center gap-2 text-center">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-serif">High Court Advocate</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-amber-400 font-medium">Civil, Criminal & Writs Specialist</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline text */}
            <p className="text-base sm:text-lg md:text-xl text-amber-100/90 font-sans font-medium tracking-wide max-w-2xl mx-auto md:mx-0">
              {profile.tagline}
            </p>

            {/* Bio text */}
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto md:mx-0">
              {profile.bio}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5 pt-1">
              <button
                onClick={() => onNavigate('contact')}
                id="hero-consult-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Consultation</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={() => onNavigate('cases')}
                id="hero-cases-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Explore Precedents</span>
              </button>
            </div>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 max-w-xl mx-auto md:mx-0">
              <div className="text-center md:text-left">
                <div className="text-xl sm:text-2xl font-bold font-serif text-amber-400">{profile.experienceYears}+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Years Exp.</div>
              </div>
              <div className="text-center md:text-left border-x border-slate-800 px-1">
                <div className="text-xl sm:text-2xl font-bold font-serif text-slate-100">{profile.casesHandled}+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Cases Handled</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl sm:text-2xl font-bold font-serif text-emerald-400">{profile.successRatePercentage}%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Success Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Image Frame for Tablet and Desktop View */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex md:col-span-5 lg:col-span-5 justify-center md:justify-end"
          >
            <div className="relative w-full max-w-sm lg:max-w-md">
              {/* Decorative Frame Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-slate-700/50 rounded-2xl blur-md opacity-75"></div>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-2.5 overflow-hidden shadow-2xl isolate">
                <div className="relative w-full min-h-[300px] max-h-[500px] bg-slate-900/80 rounded-xl overflow-hidden flex items-center justify-center p-1">
                  <AdvocatePortraitImage
                    profile={profile}
                    className="w-full h-auto max-h-[480px] object-contain rounded-lg block m-0 p-0 transition-transform duration-300 hover:scale-[1.02]"
                    maxHeightClass="max-h-[480px]"
                    isMobile={false}
                  />
                </div>

                {/* High Court Advocate Badge below image */}
                <div className="mt-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-center gap-2 text-center">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-serif">High Court Advocate</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-amber-400 font-medium">Civil, Criminal & Writs Specialist</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

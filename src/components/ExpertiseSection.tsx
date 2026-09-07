import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Building, ShieldCheck, Briefcase, FileText, Award, ChevronRight, CheckCircle2, BookOpen, ArrowRight, Sparkles, Filter, X, Gavel, Clock, Check } from 'lucide-react';
import { PracticeArea, PracticeCategory } from '../types';

interface ExpertiseSectionProps {
  practiceAreas: PracticeArea[];
  onSelectCategory: (category: PracticeCategory) => void;
  onNavigateToContact: (category: PracticeCategory) => void;
}

export const ExpertiseSection: React.FC<ExpertiseSectionProps> = ({
  practiceAreas,
  onSelectCategory,
  onNavigateToContact
}) => {
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scale': return <Scale className="w-5 h-5 text-amber-400" />;
      case 'Building': return <Building className="w-5 h-5 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'Award': return <Award className="w-5 h-5 text-amber-400" />;
      default: return <Scale className="w-5 h-5 text-amber-400" />;
    }
  };

  const categories = ['All', 'Constitutional Law', 'Civil Litigation', 'Corporate & Commercial', 'Banking & Recovery', 'Criminal Defense', 'Family & Revenue'];

  const filteredAreas = practiceAreas.filter(area => {
    if (activeFilter === 'All') return true;
    return area.title.toLowerCase().includes(activeFilter.toLowerCase()) || activeFilter.toLowerCase().includes(area.title.toLowerCase());
  });

  return (
    <section id="expertise" className="py-8 md:py-12 bg-slate-950 text-slate-100 relative border-b border-slate-800/80 overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Practice Areas & Chamber Expertise</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-100 tracking-tight"
          >
            Comprehensive Legal Representation
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed"
          >
            Specialized High Court, Appellate, and District Trial advocacy across key civil, corporate, constitutional, and criminal law disciplines.
          </motion.p>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center sm:justify-center overflow-x-auto pb-2 sm:pb-0 gap-1.5 sm:flex-wrap mb-6 scrollbar-none touch-pan-x -mx-3 px-3 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Practice Areas Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 lg:gap-5"
        >
          <AnimatePresence>
            {filteredAreas.map((area, idx) => (
              <motion.div
                key={area.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl shadow-slate-950/50 flex flex-col justify-between group relative overflow-hidden w-full"
              >
                {/* Subtle card corner glow */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/15 transition-all z-10 pointer-events-none"></div>

                <div>
                  {/* Card Image Banner */}
                  <div className="relative aspect-[16/10] sm:aspect-auto sm:h-48 w-full overflow-hidden bg-slate-950">
                    {area.imageUrl ? (
                      <img 
                        src={area.imageUrl} 
                        alt={area.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                        <Scale className="w-12 h-12 text-slate-700" />
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                    {/* Top Badges Over Image */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <div className="w-10 h-10 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center shadow-lg group-hover:border-amber-500/50 transition-colors">
                        {getIcon(area.iconName)}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-slate-950/85 backdrop-blur-md border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {area.successRate} Success
                      </span>
                    </div>

                    {/* Bottom Title Over Gradient */}
                    <div className="absolute bottom-3 left-4 right-4 z-10">
                      <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-400 transition-colors drop-shadow-sm">
                        {area.title}
                      </h3>
                      <div className="text-[11px] text-amber-300/90 font-medium">
                        {area.handledCasesCount}+ Handled Cases
                      </div>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-4 pt-3">
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {area.shortDesc}
                    </p>

                    {/* Key Statutes Pill Tags */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-400/80" />
                        <span>Key Statutes & Laws:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {area.keyStatutes.map((st, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 font-medium border border-slate-700/60 group-hover:border-slate-700 transition-colors">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => setSelectedArea(area)}
                      className="text-amber-400 font-semibold hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer text-xs group/btn"
                    >
                      <span>Practice Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectCategory(area.title)}
                        className="text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Filter precedents for this category"
                      >
                        Precedents
                      </button>

                      <button
                        onClick={() => onNavigateToContact(area.title)}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-all shadow cursor-pointer"
                      >
                        Book Consult
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Practice Area Detail Modal */}
        <AnimatePresence>
          {selectedArea && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-auto max-h-[90vh] flex flex-col"
              >
                {/* Modal Header Banner Image */}
                <div className="relative h-48 sm:h-56 w-full bg-slate-950 overflow-hidden flex-shrink-0">
                  {selectedArea.imageUrl && (
                    <img 
                      src={selectedArea.imageUrl} 
                      alt={selectedArea.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                  <button
                    onClick={() => setSelectedArea(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/80 z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 left-5 right-5 z-10 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 bg-slate-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full">High Court Division</span>
                        <span className="text-[11px] bg-emerald-950 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-800">
                          {selectedArea.successRate} Success
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-md">
                        {selectedArea.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-300 overflow-y-auto">
                  <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 leading-relaxed shadow-inner">
                    <h4 className="font-bold text-slate-100 mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400">
                      <Gavel className="w-4 h-4" /> Comprehensive Scope of Practice & Chamber Advocacy
                    </h4>
                    <p className="text-slate-200">{selectedArea.fullDesc || selectedArea.shortDesc}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                      <BookOpen className="w-4 h-4 text-amber-400" /> Key Statutory Framework & Enactments
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedArea.keyStatutes.map((statute, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{statute}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" /> High Court Writ & Urgent Stay Hearing Support: Active
                    </span>
                    <span className="text-emerald-400 font-bold">Chamber Available</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      const cat = selectedArea.title;
                      setSelectedArea(null);
                      onSelectCategory(cat);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer text-center"
                  >
                    View Precedents in {selectedArea.title}
                  </button>

                  <button
                    onClick={() => {
                      const cat = selectedArea.title;
                      setSelectedArea(null);
                      onNavigateToContact(cat);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Schedule Consultation for {selectedArea.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};


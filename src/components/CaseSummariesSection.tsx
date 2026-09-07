import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, BookOpen, Award, Scale, ChevronRight, Sparkles, X, Calendar } from 'lucide-react';
import { CaseSummary } from '../types';

interface CaseSummariesSectionProps {
  cases: CaseSummary[];
  selectedCategoryFilter: string;
  onSelectCategoryFilter: (cat: string) => void;
  onViewCaseDetails: (c: CaseSummary) => void;
}

export const CaseSummariesSection: React.FC<CaseSummariesSectionProps> = ({
  cases,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  onViewCaseDetails
}) => {
  const categories: string[] = [
    'All',
    'Constitutional Law',
    'Civil Litigation',
    'Criminal Defense',
    'Corporate & Commercial',
    'Property & Real Estate',
    'Family & Inheritance',
    'Tax & Revenue'
  ];

  // Filtering by selected practice area category only
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      if (selectedCategoryFilter !== 'All' && c.category !== selectedCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [cases, selectedCategoryFilter]);

  return (
    <section id="cases" className="py-8 md:py-12 bg-slate-900 text-slate-100 relative border-b border-slate-800/80 overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
        
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Landmark Litigation & Case Archive</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-100 tracking-tight"
          >
            Case Summaries & Legal Precedents
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed"
          >
            Repository of reported judgements, high-stakes writ petitions, appellate victories, and binding precedents secured by Advocate Noor Alam Khatri.
          </motion.p>
        </div>

        {/* Practice Category Filter Panel */}
        <div className="bg-slate-950/90 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl mb-5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none touch-pan-x -mx-1 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 pr-1 flex-shrink-0">
              <Filter className="w-3 h-3 text-amber-400" />
              <span>Practice Area:</span>
            </span>
            {categories.map((cat) => {
              const active = selectedCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all cursor-pointer relative ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Reset Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
          <div>
            Showing <span className="font-bold text-amber-400">{filteredCases.length}</span> of {cases.length} reported case records
          </div>
          {selectedCategoryFilter !== 'All' && (
            <button
              onClick={() => onSelectCategoryFilter('All')}
              className="text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Areas</span>
            </button>
          )}
        </div>

        {/* Case Cards Grid */}
        {filteredCases.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 shadow-inner"
          >
            <Scale className="w-12 h-12 text-amber-500/50 mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-serif font-bold text-slate-200">No precedent records found for this category</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try selecting a different practice area category or clear the filter.
            </p>
            <button
              onClick={() => onSelectCategoryFilter('All')}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Show All Cases
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4"
          >
            <AnimatePresence>
              {filteredCases.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="bg-slate-950 rounded-2xl p-4 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl shadow-slate-950/60 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle hover gradient flare */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none"></div>

                  <div>
                    {/* Top Badges Header */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
                        {item.citation}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.landmark && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                            <Award className="w-3 h-3" />
                            <span>Landmark Ruling</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800 font-sans font-medium">
                          {item.court}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Summary */}
                    <p className="mt-2 text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>

                    {/* Legal Precedent Callout Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 group-hover:border-slate-800 transition-colors">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Judicial Precedent Set:</span>
                      </div>
                      <p className="text-[11px] text-slate-200 italic leading-snug line-clamp-2">
                        "{item.precedentSet}"
                      </p>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {item.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-medium border border-slate-800">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer & Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                        {item.outcome}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> {item.year}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewCaseDetails(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 group-hover/btn:translate-x-1 transition-all cursor-pointer px-2.5 py-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
                    >
                      <span>Full Case Brief</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </section>
  );
};



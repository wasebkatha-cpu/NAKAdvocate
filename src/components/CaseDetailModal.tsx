import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Scale, BookOpen, ShieldCheck, Sparkles, CheckCircle2, FileText, ArrowRight, Copy, Check, Gavel, Calendar, Building2, Tag } from 'lucide-react';
import { CaseSummary } from '../types';

interface CaseDetailModalProps {
  caseItem: CaseSummary | null;
  onClose: () => void;
  onConsult: (category: any) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  onConsult
}) => {
  const [copied, setCopied] = useState(false);

  if (!caseItem) return null;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(`${caseItem.title} (${caseItem.citation}) - ${caseItem.court} (${caseItem.year})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full my-auto max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
              title="Close Case Brief"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5 pr-8">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <span>{caseItem.citation}</span>
                <button 
                  onClick={handleCopyCitation}
                  className="hover:text-amber-200 transition-colors p-0.5"
                  title="Copy Citation"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{caseItem.court}</span>
              </span>

              {caseItem.landmark && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                  <Award className="w-3.5 h-3.5" />
                  <span>Landmark Precedent</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
              {caseItem.title}
            </h2>

            {/* Meta Stats Bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 pt-3 mt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Area:</span>
                <span className="text-amber-300 font-semibold">{caseItem.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Reported Year:</span>
                <span className="text-slate-200 font-mono font-bold">{caseItem.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Judicial Outcome:</span>
                <span className="text-emerald-400 font-bold">{caseItem.outcome}</span>
              </div>
            </div>
          </div>

          {/* Scrollable Brief Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300">
            
            {/* Case Background & Facts */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>1. Case Overview & Factual Matrix</span>
              </h3>
              <p className="text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-inner">
                {caseItem.summary}
              </p>
            </div>

            {/* Legal Strategy & Arguments */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans flex items-center gap-1.5">
                <Gavel className="w-4 h-4" />
                <span>2. Advocate's Submissions & Legal Strategy</span>
              </h3>
              <p className="text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-inner">
                {caseItem.legalStrategy}
              </p>
            </div>

            {/* Ratio Decidendi / Precedent Set */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>3. Ratio Decidendi & Binding Precedent Set</span>
              </h3>
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-slate-100 italic leading-relaxed shadow-sm relative">
                <span className="text-3xl text-emerald-500/20 absolute top-2 left-3 font-serif select-none">“</span>
                <p className="relative z-10 pl-2">{caseItem.precedentSet}</p>
              </div>
            </div>

            {/* Keyword Tags */}
            {caseItem.tags && caseItem.tags.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>Statutory Keywords & Citations:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {caseItem.tags.map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer text-center"
            >
              Close Brief
            </button>

            <button
              onClick={() => {
                onClose();
                onConsult(caseItem.category);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Book Consultation for {caseItem.category}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};


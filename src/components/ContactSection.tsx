import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, MessageSquare, Scale, X, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { AdvocateProfile, ConsultationRequest, PracticeCategory } from '../types';

interface ContactSectionProps {
  profile: AdvocateProfile;
  initialCategory?: PracticeCategory | 'General Inquiry';
  onSubmitConsultation: (req: Omit<ConsultationRequest, 'id' | 'createdAt' | 'status'>) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile,
  initialCategory = 'General Inquiry',
  onSubmitConsultation,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onOpen: externalOnOpen
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external state if provided, otherwise internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const toggleOpen = () => {
    if (isOpen) {
      if (externalOnClose) externalOnClose();
      else setInternalIsOpen(false);
    } else {
      if (externalOnOpen) externalOnOpen();
      else setInternalIsOpen(true);
    }
  };

  const closeModal = () => {
    if (externalOnClose) externalOnClose();
    else setInternalIsOpen(false);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: initialCategory,
    urgency: 'Standard' as 'Standard' | 'Urgent (24h)' | 'High Court Filing',
    message: '',
    preferredDate: ''
  });

  // Sync initialCategory when changed
  useEffect(() => {
    if (initialCategory) {
      setFormData(prev => ({ ...prev, category: initialCategory }));
    }
  }, [initialCategory]);

  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    onSubmitConsultation(formData);
    const ref = 'NAK-' + Math.floor(100000 + Math.random() * 900000);
    setReferenceNo(ref);
    setSubmitted(true);
  };

  return (
    <>
      {/* Floating Section Container Attached to Bottom-Right Edge */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto" id="contact">
        
        {/* Client Inquiry Form Modal / Popover anchored above bottom-right edge */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{ transformOrigin: 'bottom right' }}
              className="mb-3 w-[calc(100vw-2rem)] sm:w-[420px] md:w-[450px] max-h-[82vh] overflow-y-auto no-scrollbar bg-slate-950/95 border border-amber-500/40 shadow-2xl rounded-2xl p-4 sm:p-5 backdrop-blur-xl text-slate-100 flex flex-col border-t-2 border-t-amber-400"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-800/90">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      <span>Client Inquiry Form</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">High Court Advocate Consultation Request</p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                  title="Close Inquiry Form"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <h4 className="text-lg font-serif font-bold text-white">
                    Inquiry Booking Received
                  </h4>

                  <p className="text-slate-300 text-xs leading-normal">
                    Your case brief has been lodged directly into High Court Advocate Noor Alam Khatri's chamber queue.
                  </p>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-left text-xs space-y-1 w-full">
                    <div className="text-slate-400">Reference No: <span className="font-mono font-bold text-amber-400">{referenceNo}</span></div>
                    <div className="text-slate-400">Legal Category: <span className="text-white font-semibold">{formData.category}</span></div>
                    <div className="text-slate-400">Urgency: <span className="text-emerald-400 font-semibold">{formData.urgency}</span></div>
                  </div>

                  <div className="pt-2 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          category: 'General Inquiry',
                          urgency: 'Standard',
                          message: '',
                          preferredDate: ''
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3" id="client-inquiry-modal-form">
                  
                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Tariq Mahmood"
                        id="inquiry-form-name"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +92 300 1234567"
                        id="inquiry-form-phone"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@example.com"
                        id="inquiry-form-email"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Legal Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        id="inquiry-form-category"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 transition-colors cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Constitutional Law">Constitutional Law (Writs)</option>
                        <option value="Civil Litigation">Civil Litigation & Property</option>
                        <option value="Criminal Defense">Criminal Defense & Bails</option>
                        <option value="Corporate & Commercial">Corporate & Commercial</option>
                        <option value="Property & Real Estate">Property & Real Estate</option>
                        <option value="Family & Inheritance">Family & Inheritance</option>
                        <option value="Tax & Revenue">Tax & Revenue</option>
                      </select>
                    </div>
                  </div>

                  {/* Urgency & Preferred Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                        id="inquiry-form-urgency"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 transition-colors cursor-pointer"
                      >
                        <option value="Standard">Standard Consultation</option>
                        <option value="Urgent (24h)">Urgent Notice (24h)</option>
                        <option value="High Court Filing">Emergency High Court Filing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        id="inquiry-form-date"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Case Brief Message */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Case Summary / Brief Facts *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Briefly describe key facts, court location, or legal dispute..."
                      id="inquiry-form-message"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="inquiry-form-submit-btn"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Client Inquiry Request</span>
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button Attached to Bottom-Right Edge */}
        <button
          onClick={toggleOpen}
          id="client-inquiry-floating-btn"
          className="group relative flex items-center justify-center p-2.5 sm:p-3 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-amber-500/50 hover:border-amber-400 shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95"
          title={isOpen ? "Close Client Inquiry Form" : "Open Client Inquiry Form"}
          aria-label={isOpen ? "Close Client Inquiry Form" : "Open Client Inquiry Form"}
        >
          {/* Animated Glowing Pulse Dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border-2 border-slate-950"></span>
          </span>

          {isOpen ? (
            <X className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          ) : (
            <MessageSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          )}
        </button>

      </div>
    </>
  );
};


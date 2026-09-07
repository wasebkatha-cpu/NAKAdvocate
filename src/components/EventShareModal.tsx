import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Mail, 
  Calendar, 
  MapPin, 
  Sparkles,
  MessageCircle,
  Globe,
  Send,
  Scale
} from 'lucide-react';
import { EventGalleryItem } from '../types';

interface EventShareModalProps {
  event: EventGalleryItem | null;
  onClose: () => void;
  advocateName?: string;
  advocateTitle?: string;
}

export const EventShareModal: React.FC<EventShareModalProps> = ({ 
  event, 
  onClose,
  advocateName = "Advocate High Court",
  advocateTitle = "Senior Supreme Court & High Court Advocate"
}) => {
  const [copied, setCopied] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'linkedin' | 'whatsapp' | 'twitter' | 'facebook'>('whatsapp');

  if (!event) return null;

  // Build canonical share URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://advocate-chamber.law';
  const shareUrl = `${baseUrl}?event=${event.id}#events`;

  // Pre-formatted share messages for different platforms
  const shareTitle = `${event.title} | ${advocateName}`;
  const shareSummary = `${event.description} - Held on ${event.date} at ${event.location}. (${event.category})`;
  
  const whatsappText = `⚖️ *${event.title}*\n\n📌 *Category:* ${event.category}\n🗓 *Date:* ${event.date}\n📍 *Location:* ${event.location}\n\n"${event.description}"\n\n👤 *Advocate:* ${advocateName} (${advocateTitle})\n🔗 *View Event & Case Brief:* ${shareUrl}`;

  const twitterText = `⚖️ ${event.title}\n\nAdvocate ${advocateName} event engagement: ${event.category}\n\n🔗 ${shareUrl}`;

  const emailSubject = `Legal Engagement & Event: ${event.title}`;
  const emailBody = `Dear Colleague,\n\nI would like to share the details of this legal event / engagement featuring ${advocateName} (${advocateTitle}):\n\nTitle: ${event.title}\nCategory: ${event.category}\nDate: ${event.date}\nLocation: ${event.location}\n\nSummary:\n${event.description}\n\nYou can view full details, photos, and case briefs here:\n${shareUrl}\n\nBest regards.`;

  // Native web share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${event.title} - ${advocateName}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Social Share Action Handlers
  const openWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(url, '_self');
  };

  return (
    <AnimatePresence>
      <div className="fixed top-14 sm:top-20 bottom-2 left-0 right-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900/98 border border-amber-500/40 rounded-2xl max-w-2xl w-full h-full overflow-y-auto no-scrollbar shadow-2xl relative text-slate-100 pointer-events-auto shadow-black/90 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Share Event & Rich Preview</h3>
                <p className="text-xs text-slate-400">Share this event engagement across social platforms</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Rich Social Card Live Preview Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rich Social Media Card Preview</span>
                </span>
                <span className="text-[11px] text-amber-400/90 font-medium">Live Card Format</span>
              </div>

              {/* Platform Preview Selector Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
                  { id: 'twitter', label: 'X / Twitter', icon: '🐦' },
                  { id: 'facebook', label: 'Facebook', icon: '🌐' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id as any)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activePreviewTab === tab.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Simulated Social Card Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3">
                {activePreviewTab === 'whatsapp' && (
                  <div className="bg-[#0b141a] p-3 rounded-lg border border-emerald-900/50 space-y-2.5 font-sans">
                    <div className="text-xs text-emerald-100/90 leading-relaxed whitespace-pre-line font-mono bg-[#111b21] p-2.5 rounded-lg border border-emerald-800/30">
                      {whatsappText}
                    </div>
                    <div className="rounded-lg overflow-hidden border border-emerald-800/40 bg-[#111b21]">
                      <div className="h-36 w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center">
                            <Scale className="w-8 h-8 text-amber-400 opacity-60 mb-1" />
                            <span className="text-[10px] text-slate-300 font-serif line-clamp-1">{event.title}</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="text-xs font-bold text-white line-clamp-1">{event.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2">{event.description}</div>
                        <div className="text-[10px] text-emerald-400 font-mono pt-1">advocate-chamber.law • Official Chamber Entry</div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'linkedin' && (
                  <div className="bg-[#1b1f23] p-3 rounded-lg border border-blue-900/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-serif font-bold flex items-center justify-center text-xs border border-amber-500/40">
                        HC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{advocateName}</div>
                        <div className="text-[10px] text-slate-400">{advocateTitle}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-2">
                      Honored to present at the {event.title}. {event.description}
                    </p>
                    <div className="rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900">
                      <div className="h-36 w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center">
                            <Scale className="w-8 h-8 text-amber-400 opacity-60 mb-1" />
                            <span className="text-[10px] text-slate-300 font-serif line-clamp-1">{event.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 bg-slate-900 border-t border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">{event.category} • {event.date}</span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{event.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{event.location}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'twitter' && (
                  <div className="bg-black p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">⚖️ Advocate Chamber</span>
                      <span className="text-[11px] text-slate-500">@ChamberLaw • 1m</span>
                    </div>
                    <p className="text-xs text-slate-200">{twitterText}</p>
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                      <div className="h-32 w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center">
                            <Scale className="w-8 h-8 text-amber-400 opacity-60 mb-1" />
                            <span className="text-[10px] text-slate-300 font-serif line-clamp-1">{event.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-[11px] font-bold text-white line-clamp-1">{event.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{shareUrl}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'facebook' && (
                  <div className="bg-[#18191a] p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-300 font-semibold">{event.title} — {event.category}</div>
                    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      <div className="h-36 w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center">
                            <Scale className="w-8 h-8 text-amber-400 opacity-60 mb-1" />
                            <span className="text-[10px] text-slate-300 font-serif line-clamp-1">{event.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 bg-[#242526]">
                        <span className="text-[10px] uppercase text-slate-400 font-mono block">ADVOCATE-CHAMBER.LAW</span>
                        <div className="text-xs font-bold text-white line-clamp-1">{event.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{event.description}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Social Media Action Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Share Directly To Social Platforms
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* WhatsApp */}
                <button
                  onClick={openWhatsApp}
                  className="p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={openLinkedIn}
                  className="p-3 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>LinkedIn</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={openTwitter}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Send className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-400" />
                  <span>X / Twitter</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={openFacebook}
                  className="p-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Facebook</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={openTelegram}
                  className="p-3 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Telegram</span>
                </button>

                {/* Email */}
                <button
                  onClick={openEmail}
                  className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Email Brief</span>
                </button>
              </div>
            </div>

            {/* Direct Link Input Box & Native Share */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Direct Shareable URL
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-500/10 flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="Device Native Share Sheet"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 rounded-b-2xl flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{event.date}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{event.location}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

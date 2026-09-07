import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Calendar, MapPin, Tag, ZoomIn, X, ChevronRight, Award, Newspaper, Share2, Scale } from 'lucide-react';
import { EventGalleryItem } from '../types';
import { EventShareModal } from './EventShareModal';

interface EventsGallerySectionProps {
  events: EventGalleryItem[];
  advocateName?: string;
  advocateTitle?: string;
}

export const EventsGallerySection: React.FC<EventsGallerySectionProps> = ({ 
  events,
  advocateName = "Advocate High Court",
  advocateTitle = "Senior Supreme Court & High Court Advocate"
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxEvent, setLightboxEvent] = useState<EventGalleryItem | null>(null);
  const [shareModalEvent, setShareModalEvent] = useState<EventGalleryItem | null>(null);

  // Auto-open event if URL contains ?event=id or #event-id
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const eventIdParam = urlParams.get('event');
      if (eventIdParam) {
        const found = events.find(e => e.id === eventIdParam);
        if (found) {
          setLightboxEvent(found);
          const el = document.getElementById('events');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [events]);

  const categories = [
    'All',
    'Seminars & Speeches',
    'High Court Proceedings',
    'Bar Association',
    'Legal Publications'
  ];

  const filteredEvents = activeCategory === 'All'
    ? events
    : events.filter(e => e.category === activeCategory);

  return (
    <section id="events" className="py-6 md:py-8 bg-slate-950 text-slate-100 relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Engagements & Press</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight">
            Events, Speeches & Gallery
          </h2>
          <p className="mt-1 text-slate-400 text-xs sm:text-sm leading-normal">
            Highlighting Bar Association keynotes, High Court delegations, scholarly publications, and community legal aid initiatives.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center sm:justify-center overflow-x-auto pb-2 sm:pb-0 gap-1.5 sm:flex-wrap mb-4 scrollbar-none touch-pan-x -mx-3 px-3 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredEvents.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-md hover:border-amber-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Photo with Overlay */}
                <div 
                  className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950 rounded-t-xl cursor-pointer isolate transform-gpu m-0 p-0"
                  onClick={() => setLightboxEvent(item)}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block m-0 p-0 border-0 ${
                        item.category === 'Legal Publications' ? 'object-top' : 'object-center'
                      }`}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center border-b border-slate-800">
                      <Scale className="w-10 h-10 text-amber-400/70 mb-1" />
                      <span className="text-[11px] font-medium text-slate-300 font-serif line-clamp-1">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="p-2 rounded-full bg-slate-900/90 text-amber-400 border border-amber-500/40 shadow-md">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                    {item.category}
                  </div>

                  {/* Share button overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareModalEvent(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-slate-300 backdrop-blur-md border border-slate-700 transition-colors cursor-pointer shadow-md"
                    title="Share Event with Rich Preview"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{item.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span className="truncate max-w-[120px]">{item.location}</span>
                    </span>
                  </div>

                  <h3 
                    onClick={() => setLightboxEvent(item)}
                    className="text-base font-serif font-bold text-slate-100 group-hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-normal line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Tags & Share Action */}
              <div className="p-3 pt-0">
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShareModalEvent(item)}
                    className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxEvent && (
          <div className="fixed top-14 sm:top-20 bottom-2 left-0 right-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900/98 border border-amber-500/40 rounded-2xl max-w-3xl w-full h-full overflow-y-auto shadow-2xl relative pointer-events-auto shadow-black/90 flex flex-col"
            >
              <button
                onClick={() => setLightboxEvent(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full h-72 sm:h-96 bg-slate-950 overflow-hidden relative rounded-t-2xl flex items-center justify-center p-3">
                {lightboxEvent.imageUrl ? (
                  <img
                    src={lightboxEvent.imageUrl}
                    alt={lightboxEvent.title}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg block m-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-900 w-full h-full rounded-lg border border-slate-800">
                    <Scale className="w-16 h-16 text-amber-400 opacity-70 mb-3" />
                    <span className="text-sm font-bold text-slate-200 font-serif">{lightboxEvent.title}</span>
                    <span className="text-xs text-amber-400 mt-1 font-mono">{lightboxEvent.category}</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/40">
                      {lightboxEvent.category}
                    </span>
                    <span className="text-xs text-slate-400">{lightboxEvent.date}</span>
                  </div>

                  <button
                    onClick={() => {
                      const evtToShare = lightboxEvent;
                      setLightboxEvent(null);
                      setShareModalEvent(evtToShare);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Event</span>
                  </button>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white">
                  {lightboxEvent.title}
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {lightboxEvent.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-amber-400 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {lightboxEvent.location}</span>
                  </div>

                  <button
                    onClick={() => {
                      const evtToShare = lightboxEvent;
                      setLightboxEvent(null);
                      setShareModalEvent(evtToShare);
                    }}
                    className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors text-xs font-medium cursor-pointer"
                  >
                    <span>View Social Cards & WhatsApp share</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Media Share & Rich Card Modal */}
      <EventShareModal
        event={shareModalEvent}
        onClose={() => setShareModalEvent(null)}
        advocateName={advocateName}
        advocateTitle={advocateTitle}
      />
    </section>
  );
};

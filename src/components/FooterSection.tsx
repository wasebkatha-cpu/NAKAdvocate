import React from 'react';
import { Scale, MapPin, Phone, Mail, Clock, ShieldCheck, ExternalLink, Globe, Lock } from 'lucide-react';
import { AdvocateProfile } from '../types';

interface FooterSectionProps {
  profile: AdvocateProfile;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  profile,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800" id="main-footer">
      
      {/* Footer Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-8 space-y-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-12 gap-2 sm:gap-6">
          
          {/* Brand Info */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center">
                  <Scale className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-white block">
                  {profile.name}
                </span>
                <span className="text-xs text-amber-400 font-medium tracking-wide">
                  Advocate High Court & Legal Consultant
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Providing distinguished High Court appellate advocacy, constitutional writ practice, and corporate defense solutions with uncompromising integrity.
            </p>

            <div className="text-xs text-slate-400 space-y-1">
              <div>High Court Roll Registration: <span className="text-slate-200 font-mono font-semibold">{profile.barRegistrationNo}</span></div>
              <div>Official Domain: <a href={profile.domainUrl} className="text-amber-400 hover:underline font-mono">{profile.domainUrl.replace('https://', '')}</a></div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="col-span-4 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('expertise')} className="hover:text-amber-400 transition-colors">
                  Practice Areas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cases')} className="hover:text-amber-400 transition-colors">
                  Case Precedents
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-amber-400 transition-colors">
                  Gallery & Media
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition-colors">
                  Consultation
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    console.log('Opening Admin Panel...');
                    onOpenAdmin();
                  }}
                  type="button"
                  id="footer-admin-btn"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-slate-300 relative z-50 p-1"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAdminLoggedIn ? 'Admin Panel' : 'Admin'}</span>
                  {isAdminLoggedIn && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          {/* Chamber Contact Details */}
          <div className="col-span-8 lg:col-span-3 space-y-3 flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans flex items-center justify-between min-h-[20px]">
              <span>Chamber Contact Details</span>
            </h4>

            {profile.additionalContacts && profile.additionalContacts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 text-xs text-slate-300">
                {/* Column 1: Office Address & Primary Phone Number */}
                <div className="space-y-2">
                  {profile.additionalContacts.filter((_, idx) => idx < 2).map((contact) => (
                    <div key={contact.id} className="space-y-0.5">
                      <div className="text-[11px] font-bold text-amber-400">{contact.title}</div>
                      <div className="text-slate-200 font-medium text-xs break-words">
                        {contact.type === 'Phone' ? (
                          <a href={`tel:${contact.value}`} className="hover:text-amber-400 transition-colors font-mono">{contact.value}</a>
                        ) : contact.type === 'Email' ? (
                          <a href={`mailto:${contact.value}`} className="hover:text-amber-400 transition-colors font-mono">{contact.value}</a>
                        ) : (
                          <span>{contact.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Column 2: Landline, Mail Address & Working Hours */}
                <div className="space-y-2">
                  {profile.additionalContacts.filter((_, idx) => idx >= 2).map((contact) => (
                    <div key={contact.id} className="space-y-0.5">
                      <div className="text-[11px] font-bold text-amber-400">{contact.title}</div>
                      <div className="text-slate-200 font-medium text-xs break-words">
                        {contact.type === 'Phone' ? (
                          <a href={`tel:${contact.value}`} className="hover:text-amber-400 transition-colors font-mono">{contact.value}</a>
                        ) : contact.type === 'Email' ? (
                          <a href={`mailto:${contact.value}`} className="hover:text-amber-400 transition-colors font-mono">{contact.value}</a>
                        ) : (
                          <span>{contact.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 text-xs text-slate-300">
                {/* Column 1: Office Address & Primary Phone */}
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-400">Office Address</div>
                    <div className="text-slate-200 font-medium text-xs break-words">{profile.mainOfficeAddress}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-400">Primary Phone</div>
                    <div className="text-slate-200 font-medium text-xs break-words font-mono">
                      <a href={`tel:${profile.phonePrimary}`} className="hover:text-amber-400 transition-colors">{profile.phonePrimary}</a>
                    </div>
                  </div>
                </div>

                {/* Column 2: Landline, Mail Address & Working Hours */}
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-400">Landline</div>
                    <div className="text-slate-200 font-medium text-xs break-words font-mono">
                      <a href={`tel:${profile.phoneSecondary}`} className="hover:text-amber-400 transition-colors">{profile.phoneSecondary}</a>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-400">Mail Address</div>
                    <div className="text-slate-200 font-medium text-xs break-words font-mono">
                      <a href={`mailto:${profile.emailPrimary}`} className="hover:text-amber-400 transition-colors">{profile.emailPrimary}</a>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-400">Working Hours</div>
                    <div className="text-slate-200 font-medium text-xs break-words">{profile.workingHours}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Embedded Map Column directly beside Chamber Contact Details */}
          <div className="col-span-12 lg:col-span-3 space-y-3 flex flex-col">
            <div className="flex items-center justify-between gap-2 h-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Chamber Location</span>
              </h4>
              <a
                href={
                  profile.latitude !== undefined && profile.longitude !== undefined && !isNaN(Number(profile.latitude)) && !isNaN(Number(profile.longitude))
                    ? `https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`
                    : `https://www.google.com/maps?q=${encodeURIComponent(profile.mainOfficeAddress || 'Karachi')}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-full flex-1 min-h-[160px] rounded-xl overflow-hidden border border-slate-800 shadow-md relative bg-slate-900">
              <iframe
                title="Noor Alam Khatri Advocate Office Location"
                src={
                  profile.latitude !== undefined && profile.longitude !== undefined && !isNaN(Number(profile.latitude)) && !isNaN(Number(profile.longitude))
                    ? `https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&z=15&output=embed`
                    : profile.googleMapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(profile.mainOfficeAddress || 'Karachi')}&z=15&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1) invert(0.9) hue-rotate(180deg)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Advocate Noor Alam Khatri. All rights reserved. Registered High Court Legal Practice.
          </p>
          <p className="text-center sm:text-right max-w-md">
            Disclaimer: Content provided on this portfolio website is for informational purposes and does not constitute formal legal representation until a client agreement is signed.
          </p>
        </div>

      </div>
    </footer>
  );
};

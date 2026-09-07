import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, ShieldCheck, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteDataPayload, CaseSummary, ConsultationRequest, PracticeCategory } from './types';
import { StorageService } from './services/storageService';
import { subscribeToAuthChanges, isAuthorizedAdminEmail } from './services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExpertiseSection } from './components/ExpertiseSection';
import { CaseSummariesSection } from './components/CaseSummariesSection';
import { EventsGallerySection } from './components/EventsGallerySection';
import { ContactSection } from './components/ContactSection';
import { FooterSection } from './components/FooterSection';
import { CaseDetailModal } from './components/CaseDetailModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [siteData, setSiteData] = useState<SiteDataPayload>(() => StorageService.getSiteData());
  const [activeSection, setActiveSection] = useState<string>('home');
  const [viewMode, setViewMode] = useState<'home' | 'expertise' | 'cases' | 'events' | 'contact'>('home');
  const [selectedCaseModal, setSelectedCaseModal] = useState<CaseSummary | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [contactCategory, setContactCategory] = useState<PracticeCategory | 'General Inquiry'>('General Inquiry');
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);

  // Admin Modal & Firebase Auth state
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => StorageService.isAdminAuthenticated());
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      if (user) {
        if (isAuthorizedAdminEmail(user.email)) {
          setIsAdminLoggedIn(true);
          StorageService.setAdminAuthentication(true);
        } else {
          // Non-authorized email signed in to Firebase - do not grant admin access
          setIsAdminLoggedIn(false);
          StorageService.setAdminAuthentication(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync live remote data from GitHub. If no remote data exists (empty repo), trigger initial push.
  useEffect(() => {
    StorageService.fetchLiveRemoteData().then((remoteData) => {
      if (remoteData) {
        setSiteData(remoteData);
      } else {
        const current = StorageService.getSiteData();
        if (current.gitConfig.gitHubToken && current.gitConfig.autoSync) {
          StorageService.pushToGitHubRepo(current, "cms(init): auto-sync initial dataset & images to GitHub repositories").then((res) => {
            if (res.success) {
              console.log("Initial auto-sync to GitHub repositories completed successfully!");
            }
          });
        }
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Scroll spy for active section when in 'home' (full page) view mode
  useEffect(() => {
    if (viewMode !== 'home') return;

    const handleScroll = () => {
      const sections = ['home', 'expertise', 'cases', 'events', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  // Synchronize browser tab title and URL path when navigating
  useEffect(() => {
    let title = 'Noor Alam Khatri Advocate | Senior Advocate Supreme Court';
    let path = '/';

    if (adminOpen) {
      title = 'Admin Dashboard | Noor Alam Khatri Advocate';
      path = '/admin';
    } else if (isInquiryOpen) {
      title = 'Book Consultation | Noor Alam Khatri Advocate';
      path = '/contact';
    } else if (viewMode === 'expertise') {
      title = 'Practice Areas & Expertise | Noor Alam Khatri Advocate';
      path = '/expertise';
    } else if (viewMode === 'cases') {
      title = 'Landmark Cases & Judgements | Noor Alam Khatri Advocate';
      path = '/cases';
    } else if (viewMode === 'events') {
      title = 'Gallery & Media Engagements | Noor Alam Khatri Advocate';
      path = '/events';
    } else if (viewMode === 'contact') {
      title = 'Book Consultation | Noor Alam Khatri Advocate';
      path = '/contact';
    } else if (viewMode === 'home') {
      if (activeSection === 'expertise') {
        title = 'Practice Areas | Noor Alam Khatri Advocate';
        path = '/expertise';
      } else if (activeSection === 'cases') {
        title = 'Past Cases | Noor Alam Khatri Advocate';
        path = '/cases';
      } else if (activeSection === 'events') {
        title = 'Gallery & Media | Noor Alam Khatri Advocate';
        path = '/events';
      } else if (activeSection === 'contact') {
        title = 'Consultation & Contact | Noor Alam Khatri Advocate';
        path = '/contact';
      } else {
        title = 'Noor Alam Khatri Advocate | Senior Advocate Supreme Court';
        path = '/';
      }
    }

    document.title = title;

    if (window.location.pathname !== path) {
      window.history.pushState({ path }, title, path);
    }
  }, [adminOpen, isInquiryOpen, viewMode, activeSection]);

  // Initial route listener for direct link access & browser back/forward buttons
  useEffect(() => {
    const parseRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (pathname === '/admin' || hash === '#admin') {
        setAdminOpen(true);
      } else if (pathname === '/cases' || hash === '#cases') {
        setViewMode('cases');
        setActiveSection('cases');
      } else if (pathname === '/expertise' || hash === '#expertise') {
        setViewMode('expertise');
        setActiveSection('expertise');
      } else if (pathname === '/events' || hash === '#events') {
        setViewMode('events');
        setActiveSection('events');
      } else if (pathname === '/contact' || hash === '#contact') {
        setIsInquiryOpen(true);
      } else if (pathname === '/' || pathname === '/home' || hash === '#home') {
        setViewMode('home');
        setActiveSection('home');
      }
    };

    parseRoute();
    window.addEventListener('popstate', parseRoute);
    return () => window.removeEventListener('popstate', parseRoute);
  }, []);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'contact') {
      setIsInquiryOpen(true);
      return;
    }

    if (sectionId === 'admin') {
      setAdminOpen(true);
      return;
    }

    const validMode = (['home', 'expertise', 'cases', 'events'].includes(sectionId)
      ? sectionId
      : 'home') as 'home' | 'expertise' | 'cases' | 'events';
    
    setViewMode(validMode);
    setActiveSection(validMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select category from Practice Areas to filter Case Summaries
  const handleSelectPracticeCategory = (category: PracticeCategory) => {
    setCategoryFilter(category);
    handleNavigate('cases');
  };

  // Open contact form modal pre-selecting a practice area
  const handleNavigateToContactWithCategory = (category: PracticeCategory) => {
    setContactCategory(category);
    setIsInquiryOpen(true);
  };

  // Handle Client Consultation Submission
  const handleSubmitConsultation = (requestData: Omit<ConsultationRequest, 'id' | 'createdAt' | 'status'>) => {
    const newConsultation: ConsultationRequest = {
      ...requestData,
      id: 'consult-' + Date.now(),
      status: 'New',
      createdAt: new Date().toISOString()
    };

    const updatedPayload: SiteDataPayload = {
      ...siteData,
      consultations: [newConsultation, ...siteData.consultations]
    };

    setSiteData(updatedPayload);
    const result = StorageService.saveSiteData(updatedPayload, `feat(inquiry): new client consultation from ${requestData.name}`);
    
    // Automatically trigger real GitHub REST API sync if GitHub token and repository are configured
    if (updatedPayload.gitConfig.gitHubToken && (updatedPayload.gitConfig.textRepoOwner || updatedPayload.gitConfig.repoOwner)) {
      StorageService.pushToGitHubRepo(
        updatedPayload, 
        `feat(inquiry): client inquiry received from ${requestData.name} [${newConsultation.id}]`
      ).then(res => {
        if (res.success) {
          showToast(`Inquiry received & automatically pushed to Git repo (Commit: ${res.commitHash})`);
        }
      });
    } else {
      showToast(result.message || "Consultation inquiry received & logged in Admin Panel!");
    }
  };

  // Update site data from Admin Panel
  const handleUpdateSiteDataFromAdmin = (newData: SiteDataPayload, commitMsg?: string) => {
    setSiteData(newData);
    showToast(commitMsg || "Site data updated & saved to Headless JSON store.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      <div>
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-slate-900 text-amber-400 border border-amber-500/50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Fixed Top Navigation Bar */}
        <Navbar
          profile={siteData.profile}
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onOpenAdmin={() => setAdminOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
        />

        {/* Content Wrapper to offset fixed Navbar height */}
        <div className="pt-[52px] sm:pt-[74px]">
          {/* Sub-header Breadcrumb Bar when viewing a single landing page */}
          {viewMode !== 'home' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border-b border-slate-800 py-2 px-3 sm:px-6 sticky top-[52px] sm:top-[74px] z-40 backdrop-blur-md shadow-md"
            >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <button 
                  onClick={() => handleNavigate('home')} 
                  className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold text-slate-400 hover:underline cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  <span>Overview</span>
                </button>
                <span className="text-slate-600">/</span>
                <span className="text-amber-400 font-bold capitalize font-serif text-xs sm:text-sm">
                  {viewMode === 'expertise' && 'Practice Areas & Expertise Landing Page'}
                  {viewMode === 'cases' && 'Landmark Case Precedents & Judgements'}
                  {viewMode === 'events' && 'Engagements, Speeches & Press Gallery'}
                  {viewMode === 'contact' && 'Confidential Client Consultation Booking'}
                </span>
              </div>

              <button 
                onClick={() => handleNavigate('home')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shadow-sm hover:border-amber-500/40"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Return to Full Home Overview</span>
                <span className="sm:hidden">Overview</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Main View Area */}
        <main className="w-full">
          <AnimatePresence mode="wait">
            {viewMode === 'home' && (
              <motion.div
                key="home-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Hero Overview Section */}
                <HeroSection
                  profile={siteData.profile}
                  onNavigate={handleNavigate}
                />

                {/* Practice Areas / Expertise Section */}
                <ExpertiseSection
                  practiceAreas={siteData.practiceAreas}
                  onSelectCategory={handleSelectPracticeCategory}
                  onNavigateToContact={handleNavigateToContactWithCategory}
                />

                {/* Past Case Summaries & Precedents Showcase */}
                <CaseSummariesSection
                  cases={siteData.cases}
                  selectedCategoryFilter={categoryFilter}
                  onSelectCategoryFilter={(cat) => setCategoryFilter(cat)}
                  onViewCaseDetails={(caseItem) => setSelectedCaseModal(caseItem)}
                />

                {/* Events, Media & Photo Gallery Section */}
                <EventsGallerySection
                  events={siteData.events}
                  advocateName={siteData.profile.name}
                  advocateTitle={siteData.profile.title}
                />
              </motion.div>
            )}

            {viewMode === 'expertise' && (
              <motion.div
                key="expertise-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ExpertiseSection
                  practiceAreas={siteData.practiceAreas}
                  onSelectCategory={handleSelectPracticeCategory}
                  onNavigateToContact={handleNavigateToContactWithCategory}
                />
              </motion.div>
            )}

            {viewMode === 'cases' && (
              <motion.div
                key="cases-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CaseSummariesSection
                  cases={siteData.cases}
                  selectedCategoryFilter={categoryFilter}
                  onSelectCategoryFilter={(cat) => setCategoryFilter(cat)}
                  onViewCaseDetails={(caseItem) => setSelectedCaseModal(caseItem)}
                />
              </motion.div>
            )}

            {viewMode === 'events' && (
              <motion.div
                key="events-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <EventsGallerySection
                  events={siteData.events}
                  advocateName={siteData.profile.name}
                  advocateTitle={siteData.profile.title}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        </div>
      </div>

      {/* Footer with Google Maps Embedding */}
      <FooterSection
        profile={siteData.profile}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Floating Client Inquiry Form (Bottom-Right Edge Trigger & Popover Modal) */}
      <ContactSection
        profile={siteData.profile}
        initialCategory={contactCategory}
        onSubmitConsultation={handleSubmitConsultation}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        onOpen={() => setIsInquiryOpen(true)}
      />

      {/* Case Brief Detail Modal */}
      <CaseDetailModal
        caseItem={selectedCaseModal}
        onClose={() => setSelectedCaseModal(null)}
        onConsult={(cat) => handleNavigateToContactWithCategory(cat)}
      />

      {/* Headless Admin Panel Drawer */}
      <AdminPanel
        data={siteData}
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onUpdateSiteData={handleUpdateSiteDataFromAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
        setIsAdminLoggedIn={setIsAdminLoggedIn}
        currentUser={currentUser}
      />

    </div>
  );
}


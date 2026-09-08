import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  Lock, Key, ShieldCheck, LogOut, GitCommit, GitBranch, Download, Upload, 
  Plus, Trash2, Edit3, Save, CheckCircle2, AlertCircle, RefreshCw, X, 
  BookOpen, Scale, Newspaper, MessageSquare, User, Globe, ExternalLink, Sparkles, Award, Phone, MapPin, Mail, Clock, KeyRound, UserCheck, Shield, UserPlus, Ban, Check
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { SiteDataPayload, CaseSummary, PracticeArea, EventGalleryItem, ConsultationRequest, PracticeCategory, ChamberContactItem, ModeratorUser, AdminPermission } from '../types';
import { StorageService } from '../services/storageService';
import { loginWithEmail, registerWithEmail, loginWithGoogle, sendResetPassword, logoutUser, isAuthorizedAdminEmail, AUTHORIZED_ADMIN_EMAILS } from '../services/firebase';

interface AdminPanelProps {
  data: SiteDataPayload;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSiteData: (newData: SiteDataPayload, commitMsg?: string) => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (status: boolean) => void;
  currentUser?: FirebaseUser | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  data,
  isOpen,
  onClose,
  onUpdateSiteData,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  currentUser
}) => {
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState('');
  
  // Firebase Auth Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'signin' | 'signup' | 'reset' | 'legacy'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'cases' | 'practice' | 'events' | 'inquiries' | 'contacts' | 'profile' | 'git' | 'moderators'>('cases');

  // Status message
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isPushingGit, setIsPushingGit] = useState(false);

  // Form states for creating/editing items
  const [editingCase, setEditingCase] = useState<Partial<CaseSummary> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventGalleryItem> | null>(null);
  const [editingPracticeArea, setEditingPracticeArea] = useState<Partial<PracticeArea> | null>(null);
  const [editingContact, setEditingContact] = useState<Partial<ChamberContactItem> | null>(null);

  // Moderator Form States
  const [editingModerator, setEditingModerator] = useState<Partial<ModeratorUser> | null>(null);
  const [modEmailInput, setModEmailInput] = useState('');
  const [modNameInput, setModNameInput] = useState('');
  const [modRoleInput, setModRoleInput] = useState<'superadmin' | 'moderator'>('moderator');
  const [modPermissionsInput, setModPermissionsInput] = useState<AdminPermission[]>([
    'cases', 'practice', 'events', 'inquiries', 'contacts'
  ]);
  const [modNotesInput, setModNotesInput] = useState('');

  // Permission Checks
  const currentUserEmail = currentUser?.email || StorageService.getAdminEmail() || '';
  const isSuperAdmin = StorageService.isSuperAdmin(currentUserEmail);
  const userPermissions = StorageService.getUserPermissions(currentUserEmail);

  // Ensure user cannot stay on an unpermitted tab
  useEffect(() => {
    if (isAdminLoggedIn && currentUserEmail) {
      const perms = StorageService.getUserPermissions(currentUserEmail);
      if (perms.length > 0 && !perms.includes(activeTab as AdminPermission)) {
        setActiveTab(perms[0] as any);
      }
    }
  }, [isAdminLoggedIn, currentUserEmail, activeTab]);

  if (!isOpen) return null;

  // Handle Firebase Auth Email/Password Forms
  const handleFirebaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);

    try {
      if (authMethod === 'signin') {
        if (!email || !password) {
          setPassError('Please enter email and password');
          setAuthLoading(false);
          return;
        }

        if (!isAuthorizedAdminEmail(email)) {
          setPassError(`Access Denied: ${email} is not in the authorized admin list.`);
          setAuthLoading(false);
          return;
        }

        const cred = await loginWithEmail(email, password);
        const signedInEmail = cred.user?.email || email;
        if (!isAuthorizedAdminEmail(signedInEmail)) {
          await logoutUser();
          setPassError(`Access Denied: ${signedInEmail} is not an authorized admin.`);
          setAuthLoading(false);
          return;
        }

        StorageService.setAdminAuthentication(true, signedInEmail);
        setIsAdminLoggedIn(true);
        setEmail('');
        setPassword('');
      } else if (authMethod === 'signup') {
        if (!email || !password) {
          setPassError('Please enter email and password');
          setAuthLoading(false);
          return;
        }

        if (!isAuthorizedAdminEmail(email)) {
          setPassError(`Registration Denied: ${email} is not authorized.`);
          setAuthLoading(false);
          return;
        }

        if (password.length < 6) {
          setPassError('Password must be at least 6 characters long');
          setAuthLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setPassError('Passwords do not match');
          setAuthLoading(false);
          return;
        }

        const cred = await registerWithEmail(email, password);
        const signedInEmail = cred.user?.email || email;
        if (!isAuthorizedAdminEmail(signedInEmail)) {
          await logoutUser();
          setPassError(`Access Denied: ${signedInEmail} is not authorized.`);
          setAuthLoading(false);
          return;
        }

        StorageService.setAdminAuthentication(true, signedInEmail);
        setIsAdminLoggedIn(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else if (authMethod === 'reset') {
        if (!email) {
          setPassError('Please enter your admin email address');
          setAuthLoading(false);
          return;
        }
        if (!isAuthorizedAdminEmail(email)) {
          setPassError(`Password Reset Denied: ${email} is not an authorized admin.`);
          setAuthLoading(false);
          return;
        }
        await sendResetPassword(email);
        setAuthSuccessMsg(`Password reset email sent to ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let msg = err.message || 'Authentication failed';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setPassError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign In via @react-oauth/google
  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setPassError('');
      setAuthSuccessMsg('');
      setAuthLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const signedInEmail = userInfo.email;

        if (!isAuthorizedAdminEmail(signedInEmail)) {
          setPassError(`Access Denied: ${signedInEmail || 'Account'} is not an authorized admin email.`);
          setAuthLoading(false);
          return;
        }

        StorageService.setAdminAuthentication(true, signedInEmail);
        setIsAdminLoggedIn(true);
      } catch (err: any) {
        console.error('Google Sign-In user info fetch error:', err);
        setPassError('Failed to fetch Google user info');
      } finally {
        setAuthLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Sign-In error:', error);
      setPassError('Google Sign-In failed or was cancelled.');
    }
  });

  // Legacy Passcode Login
  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'nak2026' || passcode.trim() === 'advocate123' || passcode.trim() === 'nak123') {
      StorageService.setAdminAuthentication(true);
      setIsAdminLoggedIn(true);
      setPassError('');
      setPasscode('');
    } else {
      setPassError('Invalid Admin Passcode. Default passcode is nak2026');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
    StorageService.setAdminAuthentication(false);
    setIsAdminLoggedIn(false);
  };

  // Helper to trigger save + Git push
  const handleSaveAndCommit = async (updatedPayload: SiteDataPayload, commitMessage: string) => {
    setIsPushingGit(true);
    setStatusAlert(null);

    // Save locally (skip background autoSync because handleSaveAndCommit explicitly calls pushToGitHubRepo next)
    StorageService.saveSiteData(updatedPayload, { skipAutoSync: true });

    // Try GitHub API push if GitHub Token exists
    if (updatedPayload.gitConfig.gitHubToken) {
      const gitRes = await StorageService.pushToGitHubRepo(updatedPayload, commitMessage);
      if (gitRes.success) {
        setStatusAlert({
          type: 'success',
          msg: `Pushed to Git repo (${updatedPayload.gitConfig.repoOwner}/${updatedPayload.gitConfig.repoName}). Commit SHA: ${gitRes.commitHash}`
        });
      } else {
        setStatusAlert({
          type: 'error',
          msg: `Saved locally, but Git Push failed: ${gitRes.error}`
        });
      }
    } else {
      setStatusAlert({
        type: 'success',
        msg: `Data saved to Headless JSON store! (Tip: Configure GitHub PAT token in Git Sync tab to auto-push commits).`
      });
    }

    setIsPushingGit(false);
    onUpdateSiteData(updatedPayload, commitMessage);
  };

  // Delete Case
  const handleDeleteCase = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this case summary?")) return;
    const updatedCases = data.cases.filter(c => c.id !== id);
    const updatedPayload = { ...data, cases: updatedCases };
    handleSaveAndCommit(updatedPayload, `feat(cases): remove case summary ${id}`);
  };

  // Save Case (Add or Edit)
  const handleSaveCaseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase || !editingCase.title || !editingCase.citation) return;

    let updatedCases = [...data.cases];
    if (editingCase.id) {
      // Edit
      updatedCases = updatedCases.map(c => c.id === editingCase.id ? {
        ...editingCase,
        impactScore: editingCase.impactScore || '9.5 / 10',
        tags: editingCase.tags || ['High Court', 'Landmark']
      } as CaseSummary : c);
    } else {
      // Create new
      const newCase: CaseSummary = {
        id: 'case-' + Date.now(),
        title: editingCase.title || '',
        citation: editingCase.citation || '',
        court: editingCase.court || 'High Court',
        category: (editingCase.category as PracticeCategory) || 'Civil Litigation',
        year: Number(editingCase.year) || new Date().getFullYear(),
        clientType: editingCase.clientType || 'Private Litigant',
        summary: editingCase.summary || '',
        legalStrategy: editingCase.legalStrategy || '',
        precedentSet: editingCase.precedentSet || '',
        outcome: (editingCase.outcome as any) || 'Relief Granted',
        landmark: editingCase.landmark || false,
        impactScore: editingCase.impactScore || '9.5 / 10',
        tags: editingCase.tags || ['High Court', 'Landmark']
      };
      updatedCases.unshift(newCase);
    }

    const updatedPayload = { ...data, cases: updatedCases };
    handleSaveAndCommit(updatedPayload, `feat(cases): ${editingCase.id ? 'update' : 'add'} case summary "${editingCase.title}"`);
    setEditingCase(null);
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gallery event?")) return;
    const updatedEvents = data.events.filter(e => e.id !== id);
    const updatedPayload = { ...data, events: updatedEvents };
    handleSaveAndCommit(updatedPayload, `feat(events): remove event item ${id}`);
  };

  // Save Event
  const handleSaveEventForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;

    let updatedEvents = [...data.events];
    if (editingEvent.id) {
      updatedEvents = updatedEvents.map(ev => ev.id === editingEvent.id ? (editingEvent as EventGalleryItem) : ev);
    } else {
      const newEv: EventGalleryItem = {
        id: 'event-' + Date.now(),
        title: editingEvent.title || '',
        category: (editingEvent.category as any) || 'Seminars & Speeches',
        date: editingEvent.date || new Date().toLocaleDateString(),
        location: editingEvent.location || 'High Court Bar Association',
        description: editingEvent.description || '',
        imageUrl: editingEvent.imageUrl || data.profile.bannerUrl,
        tags: editingEvent.tags || ['Legal'],
        featured: editingEvent.featured || false
      };
      updatedEvents.unshift(newEv);
    }

    const updatedPayload = { ...data, events: updatedEvents };
    handleSaveAndCommit(updatedPayload, `feat(events): ${editingEvent.id ? 'update' : 'add'} event "${editingEvent.title}"`);
    setEditingEvent(null);
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = (id: string, newStatus: ConsultationRequest['status']) => {
    const updatedCons = data.consultations.map(c => c.id === id ? { ...c, status: newStatus } : c);
    const updatedPayload = { ...data, consultations: updatedCons };
    handleSaveAndCommit(updatedPayload, `fix(inquiry): update consultation status for ${id} to ${newStatus}`);
  };

  // Delete Inquiry
  const handleDeleteInquiry = (id: string) => {
    if (!window.confirm("Delete this consultation record?")) return;
    const updatedCons = data.consultations.filter(c => c.id !== id);
    const updatedPayload = { ...data, consultations: updatedCons };
    handleSaveAndCommit(updatedPayload, `fix(inquiry): delete consultation ${id}`);
  };

  // Delete Practice Area
  const handleDeletePracticeArea = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this practice area?")) return;
    const updatedAreas = data.practiceAreas.filter(p => p.id !== id);
    const updatedPayload = { ...data, practiceAreas: updatedAreas };
    handleSaveAndCommit(updatedPayload, `feat(practice): remove practice area ${id}`);
  };

  // Save Practice Area
  const handleSavePracticeAreaForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPracticeArea || !editingPracticeArea.title) return;

    let updatedAreas = [...data.practiceAreas];
    if (editingPracticeArea.id) {
      updatedAreas = updatedAreas.map(p => p.id === editingPracticeArea.id ? (editingPracticeArea as PracticeArea) : p);
    } else {
      const newArea: PracticeArea = {
        id: 'practice-' + Date.now(),
        title: editingPracticeArea.title || '',
        shortDesc: editingPracticeArea.shortDesc || '',
        fullDesc: editingPracticeArea.fullDesc || editingPracticeArea.shortDesc || '',
        iconName: editingPracticeArea.iconName || 'Scale',
        imageUrl: editingPracticeArea.imageUrl || '',
        keyStatutes: editingPracticeArea.keyStatutes || ['Constitution of Pakistan'],
        successRate: editingPracticeArea.successRate || '95%',
        handledCasesCount: editingPracticeArea.handledCasesCount || 100
      };
      updatedAreas.push(newArea);
    }

    const updatedPayload = { ...data, practiceAreas: updatedAreas };
    handleSaveAndCommit(updatedPayload, `feat(practice): ${editingPracticeArea.id ? 'update' : 'add'} practice area "${editingPracticeArea.title}"`);
    setEditingPracticeArea(null);
  };

  // Delete Chamber Contact Detail
  const handleDeleteContact = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this chamber contact detail?")) return;
    const currentContacts = data.profile.additionalContacts || [];
    const updatedContacts = currentContacts.filter(c => c.id !== id);
    const updatedProfile = { ...data.profile, additionalContacts: updatedContacts };
    const updatedPayload = { ...data, profile: updatedProfile };
    handleSaveAndCommit(updatedPayload, `feat(contact): remove chamber contact ${id}`);
  };

  // Save Chamber Contact Detail Form
  const handleSaveContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editingContact.title || !editingContact.value) return;

    const currentContacts = data.profile.additionalContacts || [];
    let updatedContacts = [...currentContacts];

    if (editingContact.id) {
      updatedContacts = updatedContacts.map(c => c.id === editingContact.id ? (editingContact as ChamberContactItem) : c);
    } else {
      const newContact: ChamberContactItem = {
        id: 'contact-' + Date.now(),
        title: editingContact.title || '',
        type: editingContact.type || 'Office',
        value: editingContact.value || '',
        subtitle: editingContact.subtitle || ''
      };
      updatedContacts.push(newContact);
    }

    const updatedProfile = { ...data.profile, additionalContacts: updatedContacts };
    const updatedPayload = { ...data, profile: updatedProfile };
    handleSaveAndCommit(updatedPayload, `feat(contact): ${editingContact.id ? 'update' : 'add'} chamber contact "${editingContact.title}"`);
    setEditingContact(null);
  };

  // Moderator Handlers
  const handleStartAddModerator = () => {
    setEditingModerator({ role: 'moderator', permissions: ['cases', 'practice', 'events', 'inquiries', 'contacts'] });
    setModEmailInput('');
    setModNameInput('');
    setModRoleInput('moderator');
    setModPermissionsInput(['cases', 'practice', 'events', 'inquiries', 'contacts']);
    setModNotesInput('');
  };

  const handleStartEditModerator = (mod: ModeratorUser) => {
    setEditingModerator(mod);
    setModEmailInput(mod.email);
    setModNameInput(mod.name || '');
    setModRoleInput(mod.role);
    setModPermissionsInput(mod.permissions || []);
    setModNotesInput(mod.notes || '');
  };

  const handleTogglePermission = (perm: AdminPermission) => {
    if (modPermissionsInput.includes(perm)) {
      setModPermissionsInput(modPermissionsInput.filter(p => p !== perm));
    } else {
      setModPermissionsInput([...modPermissionsInput, perm]);
    }
  };

  const handleSaveModeratorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modEmailInput.trim()) {
      setStatusAlert({ type: 'error', msg: 'Please enter a valid moderator email address.' });
      return;
    }

    const currentMods = data.moderators || [];
    let updatedMods = [...currentMods];

    if (editingModerator?.id) {
      updatedMods = updatedMods.map(m => m.id === editingModerator.id ? {
        ...m,
        email: modEmailInput.trim(),
        name: modNameInput.trim() || modEmailInput.split('@')[0],
        role: modRoleInput,
        permissions: modPermissionsInput,
        notes: modNotesInput.trim()
      } : m);
    } else {
      const normalizedEmail = modEmailInput.trim().toLowerCase();
      if (currentMods.some(m => m.email.toLowerCase() === normalizedEmail)) {
        setStatusAlert({ type: 'error', msg: `A moderator entry for ${modEmailInput} already exists!` });
        return;
      }
      const newMod: ModeratorUser = {
        id: 'mod-' + Date.now(),
        email: modEmailInput.trim(),
        name: modNameInput.trim() || modEmailInput.split('@')[0],
        role: modRoleInput,
        permissions: modPermissionsInput,
        addedBy: currentUserEmail || 'Super Admin',
        createdAt: new Date().toISOString(),
        status: 'active',
        notes: modNotesInput.trim()
      };
      updatedMods.push(newMod);
    }

    const updatedPayload = { ...data, moderators: updatedMods };
    handleSaveAndCommit(updatedPayload, `feat(auth): ${editingModerator?.id ? 'update' : 'add'} moderator ${modEmailInput}`);
    setEditingModerator(null);
    setModEmailInput('');
    setModNameInput('');
    setModNotesInput('');
    setStatusAlert({ type: 'success', msg: `Moderator permissions saved successfully for ${modEmailInput}` });
  };

  const handleToggleModeratorStatus = (id: string) => {
    const currentMods = data.moderators || [];
    const targetMod = currentMods.find(m => m.id === id);
    if (!targetMod) return;

    const newStatus = targetMod.status === 'active' ? 'suspended' : 'active';
    const updatedMods = currentMods.map(m => m.id === id ? { ...m, status: newStatus } : m);
    const updatedPayload = { ...data, moderators: updatedMods };
    handleSaveAndCommit(updatedPayload, `fix(auth): set moderator ${targetMod.email} status to ${newStatus}`);
    setStatusAlert({ type: 'success', msg: `Moderator ${targetMod.email} status is now ${newStatus}` });
  };

  const handleDeleteModerator = (id: string) => {
    const currentMods = data.moderators || [];
    const targetMod = currentMods.find(m => m.id === id);
    if (!targetMod) return;

    if (AUTHORIZED_ADMIN_EMAILS.includes(targetMod.email.toLowerCase())) {
      alert("Primary Super Admin accounts cannot be deleted.");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove moderator access for ${targetMod.email}?`)) return;

    const updatedMods = currentMods.filter(m => m.id !== id);
    const updatedPayload = { ...data, moderators: updatedMods };
    handleSaveAndCommit(updatedPayload, `fix(auth): remove moderator ${targetMod.email}`);
    setStatusAlert({ type: 'success', msg: `Moderator access removed for ${targetMod.email}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-lg overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full my-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Headless CMS & Admin Console</span>
                <span className="text-[10px] font-mono font-normal bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Databaseless Git JSON
                </span>
              </h2>
              <p className="text-xs text-slate-400">Managing portfolio content for {data.profile.domainUrl.replace('https://', '')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User Avatar" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                    {currentUserEmail ? currentUserEmail[0].toUpperCase() : 'A'}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200 text-[11px] leading-tight">
                      {currentUser?.displayName || currentUserEmail || 'Admin Authorized'}
                    </span>
                    {isSuperAdmin ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        Super Admin
                      </span>
                    ) : (
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        Moderator ({userPermissions.length} Features)
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Firebase Auth Active
                  </span>
                </div>
              </div>
            )}

            {isAdminLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* IF NOT LOGGED IN: SHOW FIREBASE AUTH SCREEN */}
        {!isAdminLoggedIn ? (
          <div className="p-6 sm:p-10 max-w-lg mx-auto space-y-6 my-auto w-full">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">Chamber Access Authentication</h3>
              <p className="text-xs text-slate-400">
                Secured by <span className="text-amber-400 font-semibold">Firebase Authentication</span>. Sign in to manage chamber records.
              </p>
            </div>



            {/* Google One-Click Auth Option */}
            {authMethod !== 'legacy' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-xs border border-slate-700 flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:border-slate-600"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google Sign-In</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider absolute">
                    or email
                  </span>
                </div>
              </div>
            )}

            {/* Form for Email Sign In / Sign Up / Reset */}
            {authMethod !== 'legacy' ? (
              <form onSubmit={handleFirebaseAuth} className="space-y-3.5 text-left">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Email Address
                    </label>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Authorized Email Chips Removed for Security */}
                </div>

                {authMethod !== 'reset' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {authMethod === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {passError && (
                  <div className="text-xs text-red-400 bg-red-950/50 p-2.5 rounded-lg border border-red-800/50 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {authSuccessMsg && (
                  <div className="text-xs text-emerald-300 bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : authMethod === 'signin' ? (
                    <span>Sign In with Firebase Auth</span>
                  ) : authMethod === 'signup' ? (
                    <span>Create Firebase Admin Account</span>
                  ) : (
                    <span>Send Password Reset Email</span>
                  )}
                </button>
                
                <div className="flex flex-col gap-2 pt-2 text-center text-[11px] text-slate-400">
                  {authMethod === 'signin' ? (
                    <span>Forgot password? <button type="button" onClick={() => setAuthMethod('reset')} className="text-amber-400 font-bold hover:underline cursor-pointer">Reset it</button></span>
                  ) : (
                    <span>Back to <button type="button" onClick={() => setAuthMethod('signin')} className="text-amber-400 font-bold hover:underline cursor-pointer">Sign In</button></span>
                  )}
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px] text-emerald-400/80 bg-emerald-900/20 py-1.5 px-2 rounded-md border border-emerald-800/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Access Restricted: Only authorized accounts can log in.</span>
                  </div>
                </div>
              </form>
            ) : (
              /* Legacy Passcode Form */
              <form onSubmit={handlePasscodeLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Admin Passcode
                  </label>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode (Default: nak2026)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {passError && (
                  <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-800/40 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg cursor-pointer"
                >
                  Authenticate & Unlock Console
                </button>
              </form>
            )}

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 text-center flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Firebase Auth Active
              </span>
              <span>Project ID: <span className="text-amber-400 font-mono">nth-apex-xxctm</span></span>
            </div>
          </div>
        ) : (
          /* LOGGED IN: SHOW ADMIN MANAGEMENT TABS */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Status Alert Banner */}
            {statusAlert && (
              <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
                statusAlert.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800/60' : 'bg-red-950/80 text-red-300 border-b border-red-800/60'
              }`}>
                <div className="flex items-center gap-2">
                  {statusAlert.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span>{statusAlert.msg}</span>
                </div>
                <button onClick={() => setStatusAlert(null)} className="hover:opacity-75">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Navigation Tabs Header */}
            <div className="bg-slate-950 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
              {(isSuperAdmin || userPermissions.includes('cases')) && (
                <button
                  onClick={() => setActiveTab('cases')}
                  id="admin-tab-cases"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'cases' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Case Summaries ({data.cases.length})</span>
                </button>
              )}

              {(isSuperAdmin || userPermissions.includes('events')) && (
                <button
                  onClick={() => setActiveTab('events')}
                  id="admin-tab-events"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'events' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Events & Gallery ({data.events.length})</span>
                </button>
              )}

              {(isSuperAdmin || userPermissions.includes('inquiries')) && (
                <button
                  onClick={() => setActiveTab('inquiries')}
                  id="admin-tab-inquiries"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'inquiries' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Client Enquiries ({data.consultations.length})</span>
                </button>
              )}

              {(isSuperAdmin || userPermissions.includes('practice')) && (
                <button
                  onClick={() => setActiveTab('practice')}
                  id="admin-tab-practice"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'practice' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Practice Areas</span>
                </button>
              )}

              {(isSuperAdmin || userPermissions.includes('contacts')) && (
                <button
                  onClick={() => setActiveTab('contacts')}
                  id="admin-tab-contacts"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'contacts' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chamber Contact Details ({data.profile.additionalContacts?.length || 0})</span>
                </button>
              )}

              {(isSuperAdmin || userPermissions.includes('profile')) && (
                <button
                  onClick={() => setActiveTab('profile')}
                  id="admin-tab-profile"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'profile' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Advocate Profile</span>
                </button>
              )}

              {(isSuperAdmin || userPermissions.includes('git')) && (
                <button
                  onClick={() => setActiveTab('git')}
                  id="admin-tab-git"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'git' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitCommit className="w-3.5 h-3.5 text-amber-400" />
                  <span>Headless Git JSON Sync</span>
                </button>
              )}

              {(isSuperAdmin || userPermissions.includes('moderators')) && (
                <button
                  onClick={() => setActiveTab('moderators')}
                  id="admin-tab-moderators"
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'moderators' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Moderators & Permissions ({data.moderators?.length || 0})</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT Scrollable Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: CASE SUMMARIES */}
              {activeTab === 'cases' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white">Manage Case Summaries & Legal Precedents</h3>
                      <p className="text-xs text-slate-400">Add, edit, or delete complete case summaries, legal arguments, citations, outcomes, and precedent impacts.</p>
                    </div>
                    <button
                      onClick={() => setEditingCase({
                        title: '',
                        citation: '',
                        court: 'High Court',
                        category: 'Civil Litigation',
                        year: new Date().getFullYear(),
                        clientType: 'Private Litigant',
                        summary: '',
                        legalStrategy: '',
                        precedentSet: '',
                        outcome: 'Relief Granted',
                        landmark: false,
                        impactScore: '9.5 / 10',
                        tags: ['High Court', 'Landmark Precedent']
                      })}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Case Summary</span>
                    </button>
                  </div>

                  {/* Case Form Modal / Drawer */}
                  {editingCase && (
                    <motion.form 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSaveCaseForm}
                      className="p-5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-sm font-bold text-amber-400 font-serif">
                          {editingCase.id ? 'Edit Case Summary & Precedent' : 'Create New Case Precedent'}
                        </h4>
                        <button onClick={() => setEditingCase(null)} type="button" className="text-slate-400 hover:text-white text-xs">
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Case Title / Cause Title *</label>
                          <input
                            type="text"
                            required
                            value={editingCase.title || ''}
                            onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                            placeholder="e.g. State vs. Multi-State Financial Corp"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Citation / Law Report Reference *</label>
                          <input
                            type="text"
                            required
                            value={editingCase.citation || ''}
                            onChange={(e) => setEditingCase({ ...editingCase, citation: e.target.value })}
                            placeholder="e.g. 2024 CLD 1892 or PLD 2023 SC 412"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Court Jurisdiction</label>
                          <input
                            type="text"
                            value={editingCase.court || 'High Court'}
                            onChange={(e) => setEditingCase({ ...editingCase, court: e.target.value })}
                            placeholder="e.g. High Court / Supreme Court"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Practice Category</label>
                          <select
                            value={editingCase.category || 'Civil Litigation'}
                            onChange={(e) => setEditingCase({ ...editingCase, category: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                          >
                            <option value="Constitutional Law">Constitutional Law</option>
                            <option value="Civil Litigation">Civil Litigation</option>
                            <option value="Criminal Defense">Criminal Defense</option>
                            <option value="Corporate & Commercial">Corporate & Commercial</option>
                            <option value="Property & Real Estate">Property & Real Estate</option>
                            <option value="Family & Inheritance">Family & Inheritance</option>
                            <option value="Tax & Revenue">Tax & Revenue</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Year</label>
                          <input
                            type="number"
                            value={editingCase.year || new Date().getFullYear()}
                            onChange={(e) => setEditingCase({ ...editingCase, year: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Judicial Outcome</label>
                          <select
                            value={editingCase.outcome || 'Relief Granted'}
                            onChange={(e) => setEditingCase({ ...editingCase, outcome: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                          >
                            <option value="Won">Won</option>
                            <option value="Settled">Settled</option>
                            <option value="Precedent Established">Precedent Established</option>
                            <option value="Relief Granted">Relief Granted</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Client Representation</label>
                          <input
                            type="text"
                            value={editingCase.clientType || ''}
                            onChange={(e) => setEditingCase({ ...editingCase, clientType: e.target.value })}
                            placeholder="e.g. Corporate Banking Consortium"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Impact Score / Rating</label>
                          <input
                            type="text"
                            value={editingCase.impactScore || ''}
                            onChange={(e) => setEditingCase({ ...editingCase, impactScore: e.target.value })}
                            placeholder="e.g. 9.8 / 10 or High Impact"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Legal Tags (Comma Separated)</label>
                        <input
                          type="text"
                          value={editingCase.tags ? editingCase.tags.join(', ') : ''}
                          onChange={(e) => setEditingCase({ 
                            ...editingCase, 
                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          })}
                          placeholder="e.g. Writ Petition, Constitutional Bench, Supreme Court"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Summary Brief</label>
                        <textarea
                          rows={2}
                          value={editingCase.summary || ''}
                          onChange={(e) => setEditingCase({ ...editingCase, summary: e.target.value })}
                          placeholder="Factual overview and background of the dispute..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Legal Strategy & Argument</label>
                        <textarea
                          rows={2}
                          value={editingCase.legalStrategy || ''}
                          onChange={(e) => setEditingCase({ ...editingCase, legalStrategy: e.target.value })}
                          placeholder="Key legal arguments, constitutional doctrines, and statutes relied upon..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Precedent Set / Impact</label>
                        <input
                          type="text"
                          value={editingCase.precedentSet || ''}
                          onChange={(e) => setEditingCase({ ...editingCase, precedentSet: e.target.value })}
                          placeholder="e.g. Established precedent empowering minority equity holders..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs text-amber-300 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!editingCase.landmark}
                            onChange={(e) => setEditingCase({ ...editingCase, landmark: e.target.checked })}
                            className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Mark as Landmark Precedent Badge</span>
                        </label>

                        <button
                          type="submit"
                          disabled={isPushingGit}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isPushingGit ? 'Pushing to Git...' : 'Save & Push Git Commit'}</span>
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* List of Cases */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">
                      Active Case Summaries ({data.cases.length})
                    </h4>

                    {data.cases.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                        No case summaries present. Click "Add New Case Summary" above to create one.
                      </div>
                    ) : (
                      data.cases.map(c => (
                        <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-amber-400">{c.citation}</span>
                              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">{c.category}</span>
                              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded font-medium">{c.outcome}</span>
                              {c.impactScore && (
                                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded font-mono">{c.impactScore}</span>
                              )}
                              {c.landmark && <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Landmark</span>}
                            </div>

                            <h4 className="text-sm font-bold text-white font-serif">{c.title}</h4>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                              <span><strong>Court:</strong> {c.court}</span>
                              <span><strong>Year:</strong> {c.year}</span>
                              {c.clientType && <span><strong>Client:</strong> {c.clientType}</span>}
                            </div>

                            <p className="text-xs text-slate-300 line-clamp-2">{c.summary}</p>

                            {c.precedentSet && (
                              <p className="text-[11px] text-amber-300/90 italic line-clamp-1">
                                <strong>Precedent:</strong> {c.precedentSet}
                              </p>
                            )}

                            {c.tags && c.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {c.tags.map((tag, idx) => (
                                  <span key={idx} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
                            <button
                              onClick={() => setEditingCase(c)}
                              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                              title="Edit Case Summary"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCase(c.id)}
                              className="p-2 rounded-lg bg-slate-900 hover:bg-red-950 text-red-400 border border-slate-800 transition-colors cursor-pointer"
                              title="Delete Case Summary"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: EVENTS & GALLERY */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white">Events, Media & Photo Gallery</h3>
                      <p className="text-xs text-slate-400">Manage speeches, seminars, bar association events, and publications.</p>
                    </div>
                    <button
                      onClick={() => setEditingEvent({
                        title: '',
                        category: 'Seminars & Speeches',
                        date: new Date().toLocaleDateString(),
                        location: 'High Court Chamber',
                        description: '',
                        imageUrl: data.profile.bannerUrl,
                        tags: ['High Court']
                      })}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Event / Photo</span>
                    </button>
                  </div>

                  {editingEvent && (
                    <form onSubmit={handleSaveEventForm} className="p-5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-sm font-bold text-amber-400 font-serif">
                          {editingEvent.id ? 'Edit Event Detail' : 'Add New Event to Gallery'}
                        </h4>
                        <button onClick={() => setEditingEvent(null)} type="button" className="text-slate-400 hover:text-white text-xs">
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Title *</label>
                          <input
                            type="text"
                            required
                            value={editingEvent.title || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Category</label>
                          <select
                            value={editingEvent.category || 'Seminars & Speeches'}
                            onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                          >
                            <option value="Seminars & Speeches">Seminars & Speeches</option>
                            <option value="High Court Proceedings">High Court Proceedings</option>
                            <option value="Bar Association">Bar Association</option>
                            <option value="Legal Publications">Legal Publications</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Date</label>
                          <input
                            type="text"
                            value={editingEvent.date || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Location</label>
                          <input
                            type="text"
                            value={editingEvent.location || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                          Event Image (Local Storage Upload & Git Sync)
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <label 
                              htmlFor="event-file-upload-input" 
                              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Image from Computer</span>
                            </label>
                            <input 
                              id="event-file-upload-input"
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setEditingEvent({ ...editingEvent, imageUrl: event.target.result as string });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <span className="text-[11px] text-slate-500">or paste URL:</span>
                          </div>
                          <input
                            type="text"
                            value={editingEvent.imageUrl || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })}
                            placeholder="Data URL or image path..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                          {editingEvent.imageUrl && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <img src={editingEvent.imageUrl} alt="Preview" className="w-20 h-14 object-cover rounded bg-slate-950" />
                              <div className="text-[11px] text-slate-400">
                                <span className="font-semibold text-amber-400 block">Image Loaded</span>
                                Ready to be saved to local storage & pushed to Git repo
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Description</label>
                        <textarea
                          rows={2}
                          value={editingEvent.description || ''}
                          onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={isPushingGit}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Push to Git</span>
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.events.map(ev => (
                      <div key={ev.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                        <img src={ev.imageUrl} alt={ev.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-slate-900" />
                        <div className="flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{ev.category}</span>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{ev.title}</h4>
                          <p className="text-[11px] text-slate-400">{ev.date} • {ev.location}</p>
                          <div className="pt-2 flex gap-2">
                            <button onClick={() => setEditingEvent(ev)} className="text-[11px] text-slate-300 hover:text-white underline">Edit</button>
                            <button onClick={() => handleDeleteEvent(ev.id)} className="text-[11px] text-red-400 hover:underline">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CLIENT ENQUIRIES QUEUE */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <span>Client Consultation Enquiries</span>
                        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-sans font-semibold">
                          {data.consultations.length} Received
                        </span>
                        {data.consultations.filter(c => c.status === 'New').length > 0 && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans font-semibold">
                            {data.consultations.filter(c => c.status === 'New').length} New
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Incoming requests submitted via client inquiry form. All submissions are automatically saved to local storage & pushed to Git repo payload.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => StorageService.exportDataAsJSON()}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Export JSON payload with client inquiries"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export JSON</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveAndCommit(data, 'feat(inquiries): sync client consultation queue to Git repository')}
                        disabled={isPushingGit}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <GitCommit className="w-3.5 h-3.5" />
                        <span>{isPushingGit ? 'Pushing to Git...' : 'Push to Git Repo'}</span>
                      </button>
                    </div>
                  </div>

                  {data.consultations.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                      <p className="font-semibold text-slate-400">No client consultation requests logged yet.</p>
                      <p>When clients submit the Inquiry Form on the website, their details appear here instantly and trigger a Git push commit.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.consultations.map(c => (
                        <div key={c.id} className="p-4.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white font-serif">{c.name}</span>
                                <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                                  Ref: {c.id}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                                <span>Phone: <a href={`tel:${c.phone}`} className="text-amber-400 font-semibold hover:underline">{c.phone}</a></span>
                                {c.email && <span>Email: <a href={`mailto:${c.email}`} className="text-slate-300 hover:underline">{c.email}</a></span>}
                                {c.createdAt && <span className="text-[11px] text-slate-500">Submitted: {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                                c.urgency?.includes('High Court') || c.urgency?.includes('Urgent') 
                                  ? 'bg-red-950/80 text-red-400 border-red-800' 
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {c.urgency || 'Standard'}
                              </span>

                              <select
                                value={c.status}
                                onChange={(e) => handleUpdateInquiryStatus(c.id, e.target.value as any)}
                                className="bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Resolved">Resolved</option>
                              </select>

                              <button 
                                onClick={() => handleDeleteInquiry(c.id)} 
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                                title="Delete Inquiry Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/60 text-xs text-slate-200 leading-relaxed font-sans">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500/80 block mb-1">Client Case Facts / Summary:</span>
                            "{c.message}"
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-0.5">
                            <div>Legal Practice Area: <span className="text-amber-400 font-semibold">{c.category}</span></div>
                            <div>Preferred Consultation Slot: <span className="text-slate-200 font-mono font-medium">{c.preferredDate || 'Flexible / Asap'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRACTICE AREAS */}
              {activeTab === 'practice' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <span>Comprehensive Legal Representation Practice Areas</span>
                        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-sans font-semibold">
                          {data.practiceAreas.length} Areas
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Add, edit, or remove practice areas, statutes, success rates, and card imagery shown on the main chamber section.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingPracticeArea({
                        title: '',
                        shortDesc: '',
                        fullDesc: '',
                        iconName: 'Scale',
                        imageUrl: '',
                        keyStatutes: ['Constitution of Pakistan'],
                        successRate: '95%',
                        handledCasesCount: 100
                      })}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Practice Area</span>
                    </button>
                  </div>

                  {/* FORM FOR ADD / EDIT PRACTICE AREA */}
                  {editingPracticeArea && (
                    <form onSubmit={handleSavePracticeAreaForm} className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-sm font-bold text-amber-400 font-serif flex items-center gap-1.5">
                          <Scale className="w-4 h-4" />
                          <span>{editingPracticeArea.id ? 'Edit Practice Area' : 'Add New Practice Area'}</span>
                        </h4>
                        <button 
                          type="button" 
                          onClick={() => setEditingPracticeArea(null)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Practice Area Title *</label>
                          <input
                            type="text"
                            required
                            value={editingPracticeArea.title || ''}
                            onChange={(e) => setEditingPracticeArea({ ...editingPracticeArea, title: e.target.value })}
                            placeholder="e.g. Constitutional & Writ Litigation"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Icon Style</label>
                          <select
                            value={editingPracticeArea.iconName || 'Scale'}
                            onChange={(e) => setEditingPracticeArea({ ...editingPracticeArea, iconName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
                          >
                            <option value="Scale">Scale (Judicial/Constitutional)</option>
                            <option value="Building">Building (Civil/Property)</option>
                            <option value="ShieldCheck">ShieldCheck (Criminal Defense)</option>
                            <option value="Briefcase">Briefcase (Corporate/Commercial)</option>
                            <option value="FileText">FileText (Contracts/Deeds)</option>
                            <option value="Award">Award (Family/Inheritance)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Success Rate (%)</label>
                          <input
                            type="text"
                            value={editingPracticeArea.successRate || '95%'}
                            onChange={(e) => setEditingPracticeArea({ ...editingPracticeArea, successRate: e.target.value })}
                            placeholder="e.g. 96%"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Handled Cases Count</label>
                          <input
                            type="number"
                            value={editingPracticeArea.handledCasesCount || 100}
                            onChange={(e) => setEditingPracticeArea({ ...editingPracticeArea, handledCasesCount: Number(e.target.value) })}
                            placeholder="e.g. 250"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Image Upload / URL Input */}
                      <div className="space-y-2 pt-1 border-t border-slate-900">
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Banner Image for Card</label>
                        <div className="flex flex-wrap items-center gap-2">
                          <label 
                            htmlFor="practice-file-upload-input" 
                            className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image from Computer</span>
                          </label>
                          <input 
                            id="practice-file-upload-input"
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setEditingPracticeArea({ ...editingPracticeArea, imageUrl: event.target.result as string });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <span className="text-[11px] text-slate-500">or paste URL:</span>
                        </div>
                        <input
                          type="text"
                          value={editingPracticeArea.imageUrl || ''}
                          onChange={(e) => setEditingPracticeArea({ ...editingPracticeArea, imageUrl: e.target.value })}
                          placeholder="Image URL or Base64 Data..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        {editingPracticeArea.imageUrl && (
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <img src={editingPracticeArea.imageUrl} alt="Preview" className="w-24 h-16 object-cover rounded bg-slate-950" />
                            <div className="text-[11px] text-slate-400">
                              <span className="font-semibold text-amber-400 block">Practice Image Loaded</span>
                              Ready to be saved to chamber data payload & synced to Git.
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Short Description (Card Summary)</label>
                        <textarea
                          rows={2}
                          value={editingPracticeArea.shortDesc || ''}
                          onChange={(e) => setEditingPracticeArea({ ...editingPracticeArea, shortDesc: e.target.value })}
                          placeholder="Brief summary of practice scope..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Full Scope Description (Modal View)</label>
                        <textarea
                          rows={3}
                          value={editingPracticeArea.fullDesc || ''}
                          onChange={(e) => setEditingPracticeArea({ ...editingPracticeArea, fullDesc: e.target.value })}
                          placeholder="Detailed scope of practice and legal representation..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Applicable Key Statutes (Comma-separated)</label>
                        <input
                          type="text"
                          value={editingPracticeArea.keyStatutes ? editingPracticeArea.keyStatutes.join(', ') : ''}
                          onChange={(e) => setEditingPracticeArea({ 
                            ...editingPracticeArea, 
                            keyStatutes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="e.g. Constitution of Pakistan, CPC 1908, Specific Relief Act"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={isPushingGit}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer shadow"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Practice Area & Push Git</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPracticeArea(null)}
                          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Practice Areas List Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.practiceAreas.map(pa => (
                      <div key={pa.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors">
                        <div>
                          {pa.imageUrl && (
                            <img 
                              src={pa.imageUrl} 
                              alt={pa.title} 
                              className="w-full h-28 object-cover rounded-lg mb-2.5 bg-slate-900 border border-slate-800" 
                            />
                          )}
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold text-amber-400 font-serif">{pa.title}</h4>
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">{pa.successRate} Success</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{pa.shortDesc}</p>
                          {pa.keyStatutes && pa.keyStatutes.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {pa.keyStatutes.map((st, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                  {st}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 font-mono">{pa.handledCasesCount || 0}+ Handled Cases</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingPracticeArea(pa)} 
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-amber-400" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeletePracticeArea(pa.id)} 
                              className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-red-800/40"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: CHAMBER CONTACT DETAILS (ADD / EDIT / DELETE) */}
              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  {/* Top Header & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <Phone className="w-5 h-5 text-amber-400" />
                        <span>Chamber Contact Details Management</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Add, edit, or remove chamber office locations, direct phone lines, emails, and consultation hours displayed on the website footer.
                      </p>
                    </div>

                    <button
                      onClick={() => setEditingContact({
                        title: '',
                        type: 'Office',
                        value: '',
                        subtitle: ''
                      })}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors cursor-pointer flex-shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Contact Detail</span>
                    </button>
                  </div>

                  {/* Primary Chamber Contact Quick Editor Form */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-amber-400 font-serif flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>Chamber Address & Direct Contact Lines</span>
                    </h4>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase">Chamber Office Address</label>
                      <input
                        type="text"
                        value={data.profile.mainOfficeAddress}
                        onChange={(e) => onUpdateSiteData({ 
                          ...data, 
                          profile: { 
                            ...data.profile, 
                            mainOfficeAddress: e.target.value,
                            highCourtChamberAddress: e.target.value
                          } 
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Primary Phone / Mobile</label>
                        <input
                          type="text"
                          value={data.profile.phonePrimary}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, phonePrimary: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Secondary Landline Phone</label>
                        <input
                          type="text"
                          value={data.profile.phoneSecondary}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, phoneSecondary: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Official Legal Email</label>
                        <input
                          type="text"
                          value={data.profile.emailPrimary}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, emailPrimary: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Chamber Working Hours</label>
                        <input
                          type="text"
                          value={data.profile.workingHours}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, workingHours: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Google Maps Embed URL</label>
                        <input
                          type="text"
                          value={data.profile.googleMapEmbedUrl}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, googleMapEmbedUrl: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveAndCommit(data, 'fix(contact): update primary chamber contact details')}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Primary Contacts & Sync Git</span>
                      </button>
                    </div>
                  </div>

                  {/* Add / Edit Chamber Contact Form Drawer */}
                  {editingContact && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSaveContactForm}
                      className="p-5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-sm font-bold text-amber-400 font-serif flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4" />
                          <span>{editingContact.id ? 'Edit Chamber Contact Item' : 'Add New Chamber Contact Item'}</span>
                        </h4>
                        <button onClick={() => setEditingContact(null)} type="button" className="text-slate-400 hover:text-white text-xs">
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Title / Label *</label>
                          <input
                            type="text"
                            required
                            value={editingContact.title || ''}
                            onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                            placeholder="e.g. Islamabad High Court Desk or WhatsApp Hotline"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">Type Category</label>
                          <select
                            value={editingContact.type || 'Office'}
                            onChange={(e) => setEditingContact({ ...editingContact, type: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                          >
                            <option value="Office">Office Location Address</option>
                            <option value="Phone">Direct Phone / Hotline</option>
                            <option value="Email">Official Email</option>
                            <option value="Hours">Working Hours Schedule</option>
                            <option value="Other">Other Legal Detail</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Address / Phone / Email Value *</label>
                        <input
                          type="text"
                          required
                          value={editingContact.value || ''}
                          onChange={(e) => setEditingContact({ ...editingContact, value: e.target.value })}
                          placeholder="e.g. Chamber No. 402, Judicial Complex or +92 300 1234567"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Note / Subtitle (Optional)</label>
                        <input
                          type="text"
                          value={editingContact.subtitle || ''}
                          onChange={(e) => setEditingContact({ ...editingContact, subtitle: e.target.value })}
                          placeholder="e.g. Appointments Required or Roll Registration No"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={isPushingGit}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Contact & Commit Git</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingContact(null)}
                          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Chamber Contacts List Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">
                      Active Chamber Contact Details ({data.profile.additionalContacts?.length || 0})
                    </h4>

                    {(!data.profile.additionalContacts || data.profile.additionalContacts.length === 0) ? (
                      <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                        No custom contact details added yet. Click "Add Contact Detail" above to add new office branches, direct lines, or department emails.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.profile.additionalContacts.map((c) => (
                          <div key={c.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-amber-400">{c.title}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800">{c.type}</span>
                              </div>
                              <div className="text-xs font-medium text-slate-200 truncate">{c.value}</div>
                              {c.subtitle && <div className="text-[11px] text-slate-400 italic truncate">{c.subtitle}</div>}
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setEditingContact(c)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                                title="Edit Contact Detail"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(c.id)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-red-400 border border-slate-800 transition-colors cursor-pointer"
                                title="Delete Contact Detail"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: ADVOCATE PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-white">Advocate Credentials & Domain Settings</h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveAndCommit(data, 'fix(profile): update advocate profile info');
                    }}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-amber-400 uppercase">Advocate Name (Top Navigation & Header)</label>
                          <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Updates topNav</span>
                        </div>
                        <input
                          type="text"
                          value={data.profile.name}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, name: e.target.value } })}
                          placeholder="e.g. Noor Alam Khatri or Advocate Noor Alam Khatri"
                          className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Bar Council Roll No.</label>
                        <input
                          type="text"
                          value={data.profile.barRegistrationNo}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, barRegistrationNo: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Professional Title / Designation (topNav Subtitle)</label>
                        <span className="text-[9px] text-slate-400 font-mono">Displayed under name in topNav</span>
                      </div>
                      <input
                        type="text"
                        value={data.profile.title || ''}
                        onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, title: e.target.value } })}
                        placeholder="e.g. High Court & Supreme Court Advocate"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-400 uppercase">Legal Tagline / Headline (Hero Section)</label>
                      <input
                        type="text"
                        value={data.profile.tagline || ''}
                        onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, tagline: e.target.value } })}
                        placeholder="e.g. Relentless Advocacy. Uncompromising Legal Ethics. Proven Courtroom Results."
                        className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-400 uppercase">Professional Bio / Overview Text</label>
                      <textarea
                        rows={3}
                        value={data.profile.bio || ''}
                        onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, bio: e.target.value } })}
                        placeholder="e.g. Advocate Noor Alam Khatri is a distinguished High Court legal practitioner..."
                        className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 resize-y"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Experience (Years)</label>
                        <input
                          type="number"
                          value={data.profile.experienceYears || 0}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, experienceYears: Number(e.target.value) } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Cases Handled</label>
                        <input
                          type="number"
                          value={data.profile.casesHandled || 0}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, casesHandled: Number(e.target.value) } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Success Rate (%)</label>
                        <input
                          type="number"
                          value={data.profile.successRatePercentage || 0}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, successRatePercentage: Number(e.target.value) } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Primary Phone</label>
                        <input
                          type="text"
                          value={data.profile.phonePrimary}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, phonePrimary: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase">Official Email</label>
                        <input
                          type="text"
                          value={data.profile.emailPrimary}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, emailPrimary: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">High Court Chamber Address</label>
                      <input
                        type="text"
                        value={data.profile.highCourtChamberAddress}
                        onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, highCourtChamberAddress: e.target.value } })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    {/* Office Location & Footer Embedded Map Settings (Latitude & Longitude) */}
                    <div className="bg-slate-900/60 border border-emerald-500/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Footer Map & Office Location Settings
                          </h4>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          Live Footer Map Control
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                          Main Office Street Address
                        </label>
                        <input
                          type="text"
                          value={data.profile.mainOfficeAddress}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, mainOfficeAddress: e.target.value } })}
                          placeholder="e.g. Suit No. 112-113, Paradise Chambers, Saddar, Karachi"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>

                      {/* Latitude and Longitude Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-amber-400 uppercase">
                              Map Latitude (Lat) *
                            </label>
                            <span className="text-[9px] text-slate-400 font-mono">e.g. 24.860734</span>
                          </div>
                          <input
                            type="number"
                            step="any"
                            value={data.profile.latitude !== undefined && data.profile.latitude !== null ? data.profile.latitude : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              const newLat = val;
                              const newLng = data.profile.longitude;
                              const newMapUrl = (newLat !== undefined && newLng !== undefined && !isNaN(newLat) && !isNaN(newLng))
                                ? `https://maps.google.com/maps?q=${newLat},${newLng}&z=15&output=embed`
                                : data.profile.googleMapEmbedUrl;

                              onUpdateSiteData({
                                ...data,
                                profile: {
                                  ...data.profile,
                                  latitude: newLat,
                                  googleMapEmbedUrl: newMapUrl
                                }
                              });
                            }}
                            placeholder="Enter Latitude (e.g. 24.860734)"
                            className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-amber-400 uppercase">
                              Map Longitude (Lng) *
                            </label>
                            <span className="text-[9px] text-slate-400 font-mono">e.g. 67.009932</span>
                          </div>
                          <input
                            type="number"
                            step="any"
                            value={data.profile.longitude !== undefined && data.profile.longitude !== null ? data.profile.longitude : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              const newLat = data.profile.latitude;
                              const newLng = val;
                              const newMapUrl = (newLat !== undefined && newLng !== undefined && !isNaN(newLat) && !isNaN(newLng))
                                ? `https://maps.google.com/maps?q=${newLat},${newLng}&z=15&output=embed`
                                : data.profile.googleMapEmbedUrl;

                              onUpdateSiteData({
                                ...data,
                                profile: {
                                  ...data.profile,
                                  longitude: newLng,
                                  googleMapEmbedUrl: newMapUrl
                                }
                              });
                            }}
                            placeholder="Enter Longitude (e.g. 67.009932)"
                            className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Custom Google Maps Embed URL Option */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-400 uppercase">
                            Google Maps Embed URL (Generated / Custom Iframe Source)
                          </label>
                          {data.profile.latitude !== undefined && data.profile.longitude !== undefined ? (
                            <span className="text-[9px] text-emerald-400 font-mono">Auto-generated from Lat/Lng</span>
                          ) : (
                            <span className="text-[9px] text-amber-400 font-mono">Fallback Embed URL</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={data.profile.googleMapEmbedUrl || ''}
                          onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, googleMapEmbedUrl: e.target.value } })}
                          placeholder="https://maps.google.com/maps?q=... or embed iframe src"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono text-slate-300"
                        />
                      </div>

                      {/* Live Admin Panel Embedded Map Preview Box */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            Footer Map Live Preview
                          </span>
                          {data.profile.latitude !== undefined && data.profile.longitude !== undefined && (
                            <a
                              href={`https://www.google.com/maps?q=${data.profile.latitude},${data.profile.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                            >
                              <span>Open in Google Maps ({data.profile.latitude}, {data.profile.longitude})</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative">
                          <iframe
                            title="Admin Panel Footer Location Map Preview"
                            src={
                              data.profile.latitude !== undefined && data.profile.longitude !== undefined && !isNaN(Number(data.profile.latitude)) && !isNaN(Number(data.profile.longitude))
                                ? `https://maps.google.com/maps?q=${data.profile.latitude},${data.profile.longitude}&z=15&output=embed`
                                : data.profile.googleMapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(data.profile.mainOfficeAddress || 'Karachi')}&z=15&output=embed`
                            }
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1) invert(0.9) hue-rotate(180deg)' }}
                            allowFullScreen={true}
                            loading="lazy"
                          ></iframe>
                        </div>
                      </div>
                    </div>

                    {/* Local Image Storage Upload & Management section for Advocate Profile Hero Section */}
                    <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 my-3 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Hero Section Portrait & Image Manager
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Live Hero Image Control
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Portrait Hero Photo Upload & Actions */}
                        <div className="space-y-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-300 uppercase">
                              1. Hero Section Advocate Photo
                            </label>
                            {data.profile.portraitUrl ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                            ) : (
                              <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">No Image</span>
                            )}
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-20 h-24 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                              {data.profile.portraitUrl ? (
                                <img src={data.profile.portraitUrl} alt="Hero portrait preview" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-1">
                                  <User className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                                  <span className="text-[9px] text-slate-500 block">No Image</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 flex-1">
                              {/* Action Buttons: Add/Upload, Delete, Reset */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <label 
                                  htmlFor="portrait-file-upload-input"
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{data.profile.portraitUrl ? 'Change Photo' : 'Upload Hero Photo'}</span>
                                </label>
                                <input 
                                  id="portrait-file-upload-input"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = async (ev) => {
                                        if (ev.target?.result) {
                                          const base64Str = ev.target.result as string;
                                          // Save image as physical file on server workspace disk (/public/uploads)
                                          const serverUrl = await StorageService.saveImageFileToServer(base64Str, 'advocate_hero_portrait');
                                          const finalUrl = serverUrl || base64Str;
                                          const updatedData = {
                                            ...data,
                                            profile: { ...data.profile, portraitUrl: finalUrl }
                                          };
                                          handleSaveAndCommit(updatedData, 'media(hero): upload new hero section advocate photo');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />

                                {data.profile.portraitUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm("Are you sure you want to remove/delete the hero section image?")) {
                                        const updatedData = {
                                          ...data,
                                          profile: { ...data.profile, portraitUrl: '' }
                                        };
                                        handleSaveAndCommit(updatedData, 'media(hero): remove hero advocate photo');
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold border border-rose-800/80 inline-flex items-center gap-1 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Image</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedData = {
                                      ...data,
                                      profile: { ...data.profile, portraitUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800" }
                                    };
                                    handleSaveAndCommit(updatedData, 'media(hero): reset advocate photo to default');
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 inline-flex items-center gap-1"
                                  title="Reset to default lawyer photo"
                                >
                                  <RefreshCw className="w-3 h-3 text-amber-400" />
                                  <span>Default</span>
                                </button>
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Edit Image Direct URL / Data string:</label>
                                <input
                                  type="text"
                                  value={data.profile.portraitUrl}
                                  onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, portraitUrl: e.target.value } })}
                                  placeholder="Paste image link or data URL"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:border-amber-400"
                                />
                              </div>

                              {/* Direct Git Push & Media Actions */}
                              <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveAndCommit(data, 'media(hero): push hero advocate photo to NAKAdvocateImages repo')}
                                    disabled={isPushingGit}
                                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    title="Push hero image directly to NAKAdvocateImages repository"
                                  >
                                    <GitCommit className="w-3 h-3" />
                                    <span>{isPushingGit ? 'Pushing Image...' : 'Push Image to NAKAdvocateImages Repo'}</span>
                                  </button>

                                  {data.profile.portraitUrl && (
                                    <a
                                      href={data.profile.portraitUrl}
                                      download="advocate_hero_portrait.jpg"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 border border-slate-700"
                                      title="Download image file to local computer"
                                    >
                                      <Download className="w-3 h-3 text-amber-400" />
                                      <span>Download File</span>
                                    </a>
                                  )}
                                </div>

                                {!data.gitConfig.gitHubToken && (
                                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 space-y-1">
                                    <div className="font-semibold flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-amber-400" />
                                      <span>GitHub PAT Token required to push images to NAKAdvocateImages:</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <input
                                        type="password"
                                        placeholder="Enter GitHub PAT (ghp_...)"
                                        value={data.gitConfig.gitHubToken || ''}
                                        onChange={(e) => onUpdateSiteData({
                                          ...data,
                                          gitConfig: { ...data.gitConfig, gitHubToken: e.target.value }
                                        })}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveAndCommit(data, 'config: update github token')}
                                        className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[10px]"
                                      >
                                        Save Token
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Banner Image Upload & Actions */}
                        <div className="space-y-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-300 uppercase">
                              2. High Court Chamber Banner Image
                            </label>
                            {data.profile.bannerUrl ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                            ) : (
                              <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">No Image</span>
                            )}
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-24 h-24 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                              {data.profile.bannerUrl ? (
                                <img src={data.profile.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-1">
                                  <User className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                                  <span className="text-[9px] text-slate-500 block">No Banner</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <label 
                                  htmlFor="banner-file-upload-input"
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{data.profile.bannerUrl ? 'Change Banner' : 'Upload Banner'}</span>
                                </label>
                                <input 
                                  id="banner-file-upload-input"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result) {
                                          onUpdateSiteData({
                                            ...data,
                                            profile: { ...data.profile, bannerUrl: ev.target.result as string }
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />

                                {data.profile.bannerUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm("Remove banner image?")) {
                                        onUpdateSiteData({
                                          ...data,
                                          profile: { ...data.profile, bannerUrl: '' }
                                        });
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold border border-rose-800/80 inline-flex items-center gap-1 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Edit Banner URL:</label>
                                <input
                                  type="text"
                                  value={data.profile.bannerUrl}
                                  onChange={(e) => onUpdateSiteData({ ...data, profile: { ...data.profile, bannerUrl: e.target.value } })}
                                  placeholder="Paste banner image link or data URL"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:border-amber-400"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Save Profile & Commit
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: HEADLESS GIT REPOSITORY JSON SYNC */}
              {activeTab === 'git' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                      <GitCommit className="w-5 h-5 text-amber-400" />
                      <span>Headless Git Repository JSON Engine</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      This application operates without a traditional database. Every update from the admin panel produces a structured JSON commit payload.
                    </p>
                  </div>

                  {/* Multi-Repository Sync Config Form */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-amber-400 font-serif">GitHub Multi-Repository Integration Settings</h4>
                        <p className="text-[11px] text-slate-400">Syncs code & site payload to NAKAdvocate, text data to NAKAdvocateText, and media to NAKAdvocateImages.</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.gitConfig.autoSync}
                          onChange={(e) => onUpdateSiteData({
                            ...data,
                            gitConfig: { ...data.gitConfig, autoSync: e.target.checked }
                          })}
                          className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs text-slate-300 font-semibold">Auto-Sync on Save</span>
                      </label>
                    </div>

                    {/* Quick 3-Step Guide to Make Sync Live */}
                    <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 space-y-1.5">
                      <div className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5" />
                        <span>How to Sync with Your Main Project & Data Repositories</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                        <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-amber-400 underline font-mono">github.com/settings/tokens</a> and generate a <strong>Personal Access Token (classic)</strong> with <strong><code className="bg-slate-900 px-1 rounded text-amber-300">repo</code></strong> access.</li>
                        <li>Paste your token into the <strong>GitHub Personal Access Token (PAT)</strong> input field below.</li>
                        <li>Click <strong>"Push to All GitHub Repositories Now"</strong> to push synced data live across <code className="text-amber-400 font-mono">NAKAdvocate</code> (Main), <code className="text-amber-400 font-mono">NAKAdvocateText</code> (Text), and <code className="text-amber-400 font-mono">NAKAdvocateImages</code> (Images).</li>
                      </ol>
                    </div>

                    {/* GitHub Personal Access Token */}
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-400 uppercase mb-1">
                        GitHub Personal Access Token (PAT)
                      </label>
                      <input
                        type="password"
                        value={data.gitConfig.gitHubToken}
                        onChange={(e) => onUpdateSiteData({
                          ...data,
                          gitConfig: { ...data.gitConfig, gitHubToken: e.target.value }
                        })}
                        placeholder="Paste your GitHub Personal Access Token (ghp_...) here"
                        className="w-full bg-slate-900 border border-amber-500/30 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Token requires <code className="text-amber-400 font-mono">repo</code> scope permissions to commit changes.
                      </p>
                    </div>

                    {/* Repo 0: Main Codebase Repository */}
                    <div className="p-3.5 rounded-lg bg-slate-900/80 border border-amber-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>Main Project Repository (Codebase & Live Payload)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">Main Repo</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Owner</label>
                          <input
                            type="text"
                            value={data.gitConfig.mainRepoOwner || 'wasebkatha-cpu'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, mainRepoOwner: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Repository Name</label>
                          <input
                            type="text"
                            value={data.gitConfig.mainRepoName || 'NAKAdvocate'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, mainRepoName: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Branch</label>
                          <input
                            type="text"
                            value={data.gitConfig.mainRepoBranch || 'main'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, mainRepoBranch: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Target: <a href={`https://github.com/${data.gitConfig.mainRepoOwner || 'wasebkatha-cpu'}/${data.gitConfig.mainRepoName || 'NAKAdvocate'}`} target="_blank" rel="noreferrer" className="text-amber-400 underline">https://github.com/{data.gitConfig.mainRepoOwner || 'wasebkatha-cpu'}/{data.gitConfig.mainRepoName || 'NAKAdvocate'}</a>
                      </div>
                    </div>

                    {/* Repo 1: Text Repository */}

                    {/* Repo 1: Text Repository */}
                    <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>Text Repository (JSON Data)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">JSON Engine</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Owner</label>
                          <input
                            type="text"
                            value={data.gitConfig.textRepoOwner || 'wasebkatha-cpu'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, textRepoOwner: e.target.value, repoOwner: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Repository Name</label>
                          <input
                            type="text"
                            value={data.gitConfig.textRepoName || 'NAKAdvocateText'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, textRepoName: e.target.value, repoName: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Branch</label>
                          <input
                            type="text"
                            value={data.gitConfig.textRepoBranch || 'main'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, textRepoBranch: e.target.value, branch: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Pushes: <span className="text-slate-300">site_data.json, data/profile.json, data/cases.json, data/events.json, data/practice_areas.json</span>
                      </div>
                    </div>

                    {/* Repo 2: Image Repository */}
                    <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>Image Repository (Media Assets)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">Media Engine</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Owner</label>
                          <input
                            type="text"
                            value={data.gitConfig.imageRepoOwner || 'wasebkatha-cpu'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, imageRepoOwner: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Repository Name</label>
                          <input
                            type="text"
                            value={data.gitConfig.imageRepoName || 'NAKAdvocateImages'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, imageRepoName: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase">Branch</label>
                          <input
                            type="text"
                            value={data.gitConfig.imageRepoBranch || 'main'}
                            onChange={(e) => onUpdateSiteData({
                              ...data,
                              gitConfig: { ...data.gitConfig, imageRepoBranch: e.target.value }
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Pushes: <span className="text-slate-300">images/profile_portrait, images/profile_banner, images/events/*, images/practice_areas/*</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900">
                      <div className="text-xs text-slate-400">
                        Last Commit: <span className="text-amber-400 font-mono font-bold">{data.gitConfig.lastCommitHash || 'Initial'}</span>
                        {data.gitConfig.lastSyncTime && (
                          <span className="text-[10px] text-slate-500 ml-2">({new Date(data.gitConfig.lastSyncTime).toLocaleTimeString()})</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveAndCommit(data, 'manual(sync): push code, text & images to all GitHub repositories')}
                        disabled={isPushingGit}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <GitCommit className="w-4 h-4" />
                        <span>{isPushingGit ? 'Pushing to Repositories...' : 'Push to All 3 GitHub Repositories Now'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual JSON Download & Import Controls */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-white font-serif">JSON Payload File Export / Import</h4>
                    <p className="text-xs text-slate-400">Download the full JSON data file to commit directly to your Vercel / GitHub repository.</p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => StorageService.exportDataAsJSON()}
                        className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>Download site-data.json Payload</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Reset data back to factory initial default dataset?")) {
                            const res = StorageService.resetToDefault();
                            onUpdateSiteData(res, "reset: factory default dataset");
                          }
                        }}
                        className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-red-950 text-red-400 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
                      >
                        Reset Factory Defaults
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 8: MODERATORS & PERMISSIONS MANAGEMENT */}
              {activeTab === 'moderators' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-emerald-400" />
                        <span>Manage Admin Panel Moderators & Feature Access</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Super admins can authorize team members, associate advocates, and chamber managers by assigning granular permissions for each feature.
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={handleStartAddModerator}
                        className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shadow-lg"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add New Moderator</span>
                      </button>
                    )}
                  </div>

                  {/* Moderator Edit / Create Form Modal */}
                  {editingModerator && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSaveModeratorForm}
                      className="p-5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-4 shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-emerald-400 font-serif">
                            {editingModerator.id ? `Edit Permissions for ${editingModerator.email}` : 'Grant Moderator Access to Team Member'}
                          </h4>
                        </div>
                        <button onClick={() => setEditingModerator(null)} type="button" className="text-slate-400 hover:text-white text-xs">
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Moderator Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={modEmailInput}
                            onChange={(e) => setModEmailInput(e.target.value)}
                            placeholder="e.g. advocate.assistant@gmail.com"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Full Name / Designation
                          </label>
                          <input
                            type="text"
                            value={modNameInput}
                            onChange={(e) => setModNameInput(e.target.value)}
                            placeholder="e.g. Advocate Noor Ahmed (Associate)"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Administrative Role
                          </label>
                          <select
                            value={modRoleInput}
                            onChange={(e) => {
                              const r = e.target.value as 'superadmin' | 'moderator';
                              setModRoleInput(r);
                              if (r === 'superadmin') {
                                setModPermissionsInput(['cases', 'practice', 'events', 'inquiries', 'contacts', 'profile', 'git', 'moderators']);
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="moderator">Moderator (Custom Permissions)</option>
                            <option value="superadmin">Super Admin (Full Access)</option>
                          </select>
                        </div>
                      </div>

                      {/* Granular Permission Toggles */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                            Feature Permissions Checklist
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModPermissionsInput(['cases', 'practice', 'events', 'inquiries', 'contacts', 'profile', 'git', 'moderators'])}
                              className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                            >
                              Grant All
                            </button>
                            <span className="text-slate-600">|</span>
                            <button
                              type="button"
                              onClick={() => setModPermissionsInput(['cases', 'events', 'inquiries', 'contacts'])}
                              className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                            >
                              Staff Preset
                            </button>
                            <span className="text-slate-600">|</span>
                            <button
                              type="button"
                              onClick={() => setModPermissionsInput([])}
                              className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {[
                            { id: 'cases', label: 'Case Summaries', desc: 'Precedents & Law Citations', icon: BookOpen },
                            { id: 'practice', label: 'Practice Areas', desc: 'Statutes & Legal Expertise', icon: Scale },
                            { id: 'events', label: 'Events & Gallery', desc: 'Seminars & Photo Records', icon: Newspaper },
                            { id: 'inquiries', label: 'Client Enquiries', desc: 'Consultation Form Requests', icon: MessageSquare },
                            { id: 'contacts', label: 'Chamber Contacts', desc: 'Phone Numbers & Office Hours', icon: Phone },
                            { id: 'profile', label: 'Advocate Profile', desc: 'Bio, Credentials & Photos', icon: User },
                            { id: 'git', label: 'Git Sync & Backups', desc: 'GitHub Push & JSON Exports', icon: GitCommit },
                            { id: 'moderators', label: 'Moderator Admin', desc: 'Manage Team Permissions', icon: UserCheck },
                          ].map((item) => {
                            const isSelected = modPermissionsInput.includes(item.id as AdminPermission);
                            const ItemIcon = item.icon;
                            return (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => handleTogglePermission(item.id as AdminPermission)}
                                className={`p-3 rounded-lg text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                                  isSelected
                                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                                    <ItemIcon className="w-3 h-3 text-emerald-400" />
                                    <span>{item.label}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Notes / Chamber Reference
                        </label>
                        <input
                          type="text"
                          value={modNotesInput}
                          onChange={(e) => setModNotesInput(e.target.value)}
                          placeholder="e.g. Granted access for managing daily client enquiries and high court case logs"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingModerator(null)}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Moderator Permissions</span>
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* List of Registered Moderators & Super Admins */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Authorized Admin Panel Accounts ({(data.moderators || []).length})</span>
                      <span className="text-[10px] text-amber-400 font-normal">
                        Only authenticated Google/Email accounts matching this list can log in.
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {(data.moderators || []).map((mod) => {
                        const isPrimaryAdmin = AUTHORIZED_ADMIN_EMAILS.includes(mod.email.toLowerCase());
                        const isActive = mod.status === 'active';

                        return (
                          <div
                            key={mod.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isActive
                                ? 'bg-slate-950 border-slate-800/90 hover:border-slate-700'
                                : 'bg-slate-950/50 border-red-900/40 opacity-75'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-white font-mono">{mod.email}</span>
                                  
                                  {mod.role === 'superadmin' ? (
                                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                      <Shield className="w-3 h-3" /> Super Admin
                                    </span>
                                  ) : (
                                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                      <UserCheck className="w-3 h-3" /> Moderator
                                    </span>
                                  )}

                                  {isActive ? (
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                  ) : (
                                    <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                                      <Ban className="w-3 h-3" /> Suspended
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                  <span>Name: <strong className="text-slate-200">{mod.name || 'Not specified'}</strong></span>
                                  <span>•</span>
                                  <span>Added by: <span className="text-slate-300">{mod.addedBy || 'System'}</span></span>
                                  {mod.createdAt && (
                                    <>
                                      <span>•</span>
                                      <span>Date: {new Date(mod.createdAt).toLocaleDateString()}</span>
                                    </>
                                  )}
                                </div>

                                {mod.notes && (
                                  <p className="text-xs text-slate-400 italic bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800/80 inline-block">
                                    "{mod.notes}"
                                  </p>
                                )}
                              </div>

                              {/* Action Controls for Super Admin */}
                              {isSuperAdmin && (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleStartEditModerator(mod)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Edit Permissions</span>
                                  </button>

                                  {!isPrimaryAdmin && (
                                    <>
                                      <button
                                        onClick={() => handleToggleModeratorStatus(mod.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 cursor-pointer ${
                                          isActive
                                            ? 'bg-slate-900 hover:bg-amber-950/40 text-amber-400 border-amber-900/40'
                                            : 'bg-slate-900 hover:bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                                        }`}
                                      >
                                        {isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                        <span>{isActive ? 'Suspend' : 'Activate'}</span>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteModerator(mod.id)}
                                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-red-400 border border-slate-800 cursor-pointer"
                                        title="Remove Moderator"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Granted Feature Badges */}
                            <div className="mt-3 pt-3 border-t border-slate-900/80 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase mr-1">Granted Features:</span>
                              {mod.role === 'superadmin' ? (
                                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                                  ★ Full System Super Admin Access (All 8 Modules)
                                </span>
                              ) : (mod.permissions || []).length > 0 ? (
                                (mod.permissions || []).map((perm) => (
                                  <span key={perm} className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-mono capitalize">
                                    {perm}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-red-400 italic">No features assigned</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

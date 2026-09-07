export type PracticeCategory = 
  | 'Constitutional Law'
  | 'Civil Litigation'
  | 'Criminal Defense'
  | 'Corporate & Commercial'
  | 'Property & Real Estate'
  | 'Family & Inheritance'
  | 'Tax & Revenue';

export interface CaseSummary {
  id: string;
  title: string;
  citation: string;
  court: string;
  category: PracticeCategory;
  year: number;
  clientType: string;
  summary: string;
  legalStrategy: string;
  precedentSet: string;
  outcome: 'Won' | 'Settled' | 'Precedent Established' | 'Relief Granted';
  landmark: boolean;
  impactScore?: string;
  tags: string[];
}

export interface PracticeArea {
  id: string;
  title: PracticeCategory;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  imageUrl?: string;
  keyStatutes: string[];
  successRate: string;
  handledCasesCount: number;
}

export interface EventGalleryItem {
  id: string;
  title: string;
  category: 'Seminars & Speeches' | 'High Court Proceedings' | 'Bar Association' | 'Legal Publications' | 'Media & Interviews';
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  tags: string[];
  featured?: boolean;
}

export interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: PracticeCategory | 'General Inquiry';
  urgency: 'Standard' | 'Urgent (24h)' | 'High Court Filing';
  message: string;
  preferredDate?: string;
  status: 'New' | 'Contacted' | 'Scheduled' | 'Resolved';
  createdAt: string;
}

export interface ChamberContactItem {
  id: string;
  title: string;
  type: 'Office' | 'Phone' | 'Email' | 'Hours' | 'Other';
  value: string;
  subtitle?: string;
}

export interface AdvocateProfile {
  name: string;
  title: string;
  barRegistrationNo: string;
  experienceYears: number;
  casesHandled: number;
  successRatePercentage: number;
  bio: string;
  tagline: string;
  mainOfficeAddress: string;
  highCourtChamberAddress: string;
  phonePrimary: string;
  phoneSecondary: string;
  emailPrimary: string;
  workingHours: string;
  googleMapEmbedUrl: string;
  latitude?: number;
  longitude?: number;
  domainUrl: string;
  portraitUrl: string;
  bannerUrl: string;
  additionalContacts?: ChamberContactItem[];
}

export interface GitRepositoryConfig {
  mainRepoOwner: string;
  mainRepoName: string;
  mainRepoBranch: string;
  textRepoOwner: string;
  textRepoName: string;
  textRepoBranch: string;
  textFilePath: string;
  imageRepoOwner: string;
  imageRepoName: string;
  imageRepoBranch: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  filePath: string;
  gitHubToken: string;
  autoSync: boolean;
  lastSyncTime?: string;
  lastCommitHash?: string;
}

export type AdminPermission =
  | 'cases'
  | 'practice'
  | 'events'
  | 'inquiries'
  | 'contacts'
  | 'profile'
  | 'git'
  | 'moderators';

export interface ModeratorUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'moderator';
  permissions: AdminPermission[];
  addedBy?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  notes?: string;
}

export interface SiteDataPayload {
  version: string;
  lastUpdated: string;
  profile: AdvocateProfile;
  cases: CaseSummary[];
  practiceAreas: PracticeArea[];
  events: EventGalleryItem[];
  consultations: ConsultationRequest[];
  gitConfig: GitRepositoryConfig;
  moderators?: ModeratorUser[];
}

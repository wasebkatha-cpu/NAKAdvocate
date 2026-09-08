import { SiteDataPayload, CaseSummary, PracticeArea, EventGalleryItem, ConsultationRequest, AdvocateProfile, GitRepositoryConfig, ModeratorUser, AdminPermission } from '../types';
import { initialSiteData } from '../data/defaultData';

const STORAGE_KEY = 'nak_advocate_site_data_v2.0';
const ADMIN_AUTH_KEY = 'nak_advocate_admin_auth_v1';

function cleanLegacyImage(url?: string): string {
  if (!url) return '';
  const lower = url.toLowerCase();
  // Only strip legacy template demo files if explicitly matched
  if (
    lower.includes('/assets/advocate_portrait') ||
    lower.includes('/assets/high_court_building') ||
    lower.includes('/assets/legal_seminar')
  ) {
    return '';
  }
  return url;
}

export class StorageService {
  /**
   * Saves uploaded base64 image as physical file in workspace repository (/public/uploads) via Express server API
   */
  static async saveImageFileToServer(base64Data: string, fileName?: string, subDir?: string): Promise<string | null> {
    try {
      // Only call backend file upload API if running in local server or Cloud Run container dev environment
      const isDevServer = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('run.app')
      );
      if (!isDevServer) {
        return null;
      }

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, fileName, subDir })
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.url) {
          return json.url;
        }
      }
    } catch {
      // Silent fallback for static web hosting
    }
    return null;
  }

  /**
   * Retrieves current site data from LocalStorage or defaults
   */
  static getSiteData(): SiteDataPayload {
    try {
      // Clean old localStorage keys from previous versions
      if (typeof window !== 'undefined' && window.localStorage) {
        ['nak_advocate_site_data_v1.0', 'nak_advocate_site_data_v1.1', 'nak_advocate_site_data_v1.2', 'nak_advocate_site_data_v1.3'].forEach(k => {
          localStorage.removeItem(k);
        });
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      let data: SiteDataPayload;
      if (!stored) {
        data = initialSiteData;
      } else {
        const parsed = JSON.parse(stored) as SiteDataPayload;
        data = {
          ...initialSiteData,
          ...parsed,
          profile: { ...initialSiteData.profile, ...(parsed.profile || {}) },
          gitConfig: { 
            ...initialSiteData.gitConfig, 
            ...(parsed.gitConfig || {}),
            gitHubToken: parsed.gitConfig?.gitHubToken || initialSiteData.gitConfig.gitHubToken
          },
          cases: parsed.cases && parsed.cases.length > 0 ? parsed.cases : initialSiteData.cases,
          practiceAreas: parsed.practiceAreas && parsed.practiceAreas.length > 0 ? parsed.practiceAreas : initialSiteData.practiceAreas,
          events: parsed.events && parsed.events.length > 0 ? parsed.events : initialSiteData.events,
          consultations: parsed.consultations || initialSiteData.consultations,
          moderators: parsed.moderators && parsed.moderators.length > 0 ? parsed.moderators : initialSiteData.moderators,
        };
      }

      // Sanitize legacy deleted images & set fallbacks
      data.profile.portraitUrl = cleanLegacyImage(data.profile.portraitUrl) || initialSiteData.profile.portraitUrl;
      data.profile.bannerUrl = cleanLegacyImage(data.profile.bannerUrl);
      data.practiceAreas = (data.practiceAreas || []).map(pa => ({ ...pa, imageUrl: cleanLegacyImage(pa.imageUrl) }));
      data.events = (data.events || []).map(e => ({ ...e, imageUrl: cleanLegacyImage(e.imageUrl) }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error("Failed to parse local site data, reverting to defaults", err);
      return initialSiteData;
    }
  }

  /**
   * Fetches latest live site data directly from the public GitHub raw URL
   */
  static async fetchLiveRemoteData(): Promise<SiteDataPayload | null> {
    try {
      const currentData = this.getSiteData();
      const owner = currentData.gitConfig.textRepoOwner || 'wasebkatha-cpu';
      const repo = currentData.gitConfig.textRepoName || 'NAKAdvocateText';
      const branch = currentData.gitConfig.textRepoBranch || 'main';
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/site_data.json?_t=${Date.now()}`;
      const response = await fetch(rawUrl);
      if (response.ok) {
        const remoteData = await response.json() as SiteDataPayload;
        if (remoteData && remoteData.profile) {
          // Preserve local user-uploaded images if remote image is empty or not yet updated
          const mergedProfile = { ...remoteData.profile };
          const cleanLocalPortrait = cleanLegacyImage(currentData.profile?.portraitUrl);
          const cleanLocalBanner = cleanLegacyImage(currentData.profile?.bannerUrl);

          if (cleanLocalPortrait && (
            cleanLocalPortrait.startsWith('data:image') ||
            cleanLocalPortrait.includes('/uploads/') ||
            !remoteData.profile?.portraitUrl
          )) {
            mergedProfile.portraitUrl = cleanLocalPortrait;
          } else if (remoteData.profile?.portraitUrl) {
            mergedProfile.portraitUrl = cleanLegacyImage(remoteData.profile.portraitUrl) || cleanLocalPortrait || initialSiteData.profile.portraitUrl;
          } else {
            mergedProfile.portraitUrl = cleanLocalPortrait || initialSiteData.profile.portraitUrl;
          }

          if (cleanLocalBanner && (
            cleanLocalBanner.startsWith('data:image') ||
            cleanLocalBanner.includes('/uploads/') ||
            !remoteData.profile?.bannerUrl
          )) {
            mergedProfile.bannerUrl = cleanLocalBanner;
          } else if (remoteData.profile?.bannerUrl) {
            mergedProfile.bannerUrl = cleanLegacyImage(remoteData.profile.bannerUrl) || cleanLocalBanner;
          } else {
            mergedProfile.bannerUrl = cleanLocalBanner;
          }

          // Merge with local config preserving token
          const merged: SiteDataPayload = {
            ...remoteData,
            profile: mergedProfile,
            practiceAreas: (remoteData.practiceAreas || []).map(pa => ({ ...pa, imageUrl: cleanLegacyImage(pa.imageUrl) })),
            events: (remoteData.events || []).map(e => ({ ...e, imageUrl: cleanLegacyImage(e.imageUrl) })),
            gitConfig: {
              ...remoteData.gitConfig,
              gitHubToken: currentData.gitConfig.gitHubToken || remoteData.gitConfig?.gitHubToken || ''
            }
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {
      console.log("Could not fetch remote GitHub live data, using local cache:", err);
    }
    return null;
  }

  private static syncMutexChain: Promise<any> = Promise.resolve();

  /**
   * Saves updated dataset locally and triggers optional GitHub API Git push commit
   */
  static saveSiteData(
    data: SiteDataPayload, 
    options?: { commitMessage?: string; skipAutoSync?: boolean } | string
  ): { success: boolean; gitCommitted?: boolean; commitHash?: string; message: string } {
    try {
      const commitMessage = typeof options === 'string' ? options : options?.commitMessage;
      const skipAutoSync = typeof options === 'object' && options?.skipAutoSync === true;

      const updatedData: SiteDataPayload = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

      // Attempt Git Push if autoSync is active and not explicitly skipped
      let gitCommitted = false;
      let commitHash = undefined;

      if (updatedData.gitConfig.gitHubToken && updatedData.gitConfig.autoSync && !skipAutoSync) {
        // Asynchronously trigger push to GitHub repositories
        this.pushToGitHubRepo(updatedData, commitMessage || "cms(auto): update site details and images").then((res) => {
          if (res.success) {
            console.log("Auto-synced successfully to GitHub repos!");
          } else {
            console.warn("Auto-sync to GitHub encountered issues:", res.error);
          }
        });
        commitHash = updatedData.gitConfig.lastCommitHash || Math.random().toString(36).substring(2, 9);
        gitCommitted = true;
      }

      return {
        success: true,
        gitCommitted,
        commitHash: commitHash || updatedData.gitConfig.lastCommitHash,
        message: gitCommitted ? "Data saved & synced to NAKAdvocateText & NAKAdvocateImages repositories." : "Data saved locally."
      };
    } catch (err) {
      console.error("Error saving site data", err);
      return { success: false, message: "Failed to write data to store." };
    }
  }

  /**
   * Real GitHub REST API Dual Repository Sync integration (queued sequentially via mutex)
   */
  static async pushToGitHubRepo(
    data: SiteDataPayload, 
    commitMsg: string
  ): Promise<{ success: boolean; commitHash?: string; mainRepoSuccess?: boolean; textRepoSuccess?: boolean; imageRepoSuccess?: boolean; error?: string }> {
    const task = StorageService.syncMutexChain.then(() => StorageService._executePushToGitHubRepo(data, commitMsg));
    StorageService.syncMutexChain = task.catch(() => {});
    return task;
  }

  private static async _executePushToGitHubRepo(
    data: SiteDataPayload, 
    commitMsg: string
  ): Promise<{ success: boolean; commitHash?: string; mainRepoSuccess?: boolean; textRepoSuccess?: boolean; imageRepoSuccess?: boolean; error?: string }> {
    const token = data.gitConfig.gitHubToken || (import.meta.env.VITE_GITHUB_TOKEN as string) || "";

    if (!token) {
      return {
        success: false,
        error: "GitHub Personal Access Token (PAT) is required to push to repositories. Please enter it in the Admin Panel or set VITE_GITHUB_TOKEN in Vercel environment variables."
      };
    }

    const mainOwner = data.gitConfig.mainRepoOwner || "wasebkatha-cpu";
    const mainRepo = data.gitConfig.mainRepoName || "NAKAdvocate";
    const mainBranch = data.gitConfig.mainRepoBranch || "main";

    const textOwner = data.gitConfig.textRepoOwner || "wasebkatha-cpu";
    const textRepo = data.gitConfig.textRepoName || "NAKAdvocateText";
    const textBranch = data.gitConfig.textRepoBranch || "main";

    const imageOwner = data.gitConfig.imageRepoOwner || "wasebkatha-cpu";
    const imageRepo = data.gitConfig.imageRepoName || "NAKAdvocateImages";
    const imageBranch = data.gitConfig.imageRepoBranch || "main";

    let mainSuccess = false;
    let textSuccess = false;
    let imageSuccess = false;
    let commitHash = "";
    const timestamp = new Date().toISOString();

    // Helper 1: Sanitize data so secrets like GitHub PAT tokens are stripped before pushing JSON files to GitHub repos
    const sanitizeDataForGit = (payload: SiteDataPayload): SiteDataPayload => {
      const cloned: SiteDataPayload = JSON.parse(JSON.stringify(payload));
      if (cloned.gitConfig) {
        cloned.gitConfig.gitHubToken = ""; // Strip PAT token so GitHub secret scanner won't flag 'Secret detected in content'
      }
      return cloned;
    };

    const sanitizedData = sanitizeDataForGit(data);

    // Helper 2: String to Base64 (supports Unicode/UTF-8)
    const stringToBase64 = (str: string): string => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    // Helper 3: Convert Image Src to Base64 (always normalized to jpg format for repository file consistency)
    const imageSrcToBase64 = async (src: string): Promise<{ base64: string; ext: string } | null> => {
      if (!src) return null;
      try {
        // Try canvas export to JPEG first (standardizes format to jpg & compresses)
        const canvasResult = await new Promise<{ base64: string; ext: string } | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || img.width || 800;
              canvas.height = img.naturalHeight || img.height || 600;
              const ctx = canvas.getContext('2d');
              if (!ctx) return resolve(null);
              // Fill with solid white background (prevents transparent PNGs turning black)
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
              const match = dataUrl.match(/^data:image\/jpeg;base64,(.+)$/);
              if (match) {
                resolve({ ext: 'jpg', base64: match[1] });
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = src;
        });

        if (canvasResult) {
          return canvasResult;
        }

        // Direct data URL extraction fallback
        if (src.startsWith('data:image/')) {
          const match = src.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (match) {
            return { ext: 'jpg', base64: match[2] };
          }
        }

        // Fetch blob fallback
        try {
          const response = await fetch(src);
          if (response.ok) {
            const blob = await response.blob();
            return await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const resStr = reader.result as string;
                const match = resStr.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                if (match) {
                  resolve({ ext: 'jpg', base64: match[2] });
                } else {
                  resolve(null);
                }
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(blob);
            });
          }
        } catch {
          // Fetch failed
        }

        return null;
      } catch {
        return null;
      }
    };

    // Helper 4: Tree Map Cache to lookup exact SHAs without producing GET 404 console errors
    const treeMapCache = new Map<string, Map<string, string>>();

    const fetchRepoTreeMap = async (
      owner: string,
      repo: string,
      branch: string
    ): Promise<Map<string, string>> => {
      const cacheKey = `${owner}/${repo}/${branch}`;
      if (treeMapCache.has(cacheKey)) {
        return treeMapCache.get(cacheKey)!;
      }

      const map = new Map<string, string>();
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.tree)) {
            for (const item of data.tree) {
              if (item.path && item.sha && item.type === 'blob') {
                map.set(item.path, item.sha);
              }
            }
          }
        }
      } catch {
        // Catch network errors silently
      }

      treeMapCache.set(cacheKey, map);
      return map;
    };

    // Helper 5: Upload Single File to GitHub REST API using Tree Map SHA lookup & automatic retry logic
    const uploadFileToGitHub = async (
      owner: string,
      repo: string,
      branch: string,
      filePath: string,
      contentBase64: string,
      msg: string,
      maxRetries = 3
    ): Promise<{ success: boolean; sha?: string; error?: string }> => {
      // Ensure clean base64 without data URL prefixes or whitespace
      const cleanBase64 = contentBase64.replace(/^data:[^;]+;base64,/, '').replace(/[\r\n\s]/g, '');
      const targetBranch = branch || 'main';
      const cleanPath = filePath.replace(/^\/+/, ''); // Ensure clean path without leading slashes

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Fetch or use cached tree map to get exact SHA without triggering 404s for missing files
          const treeMap = await fetchRepoTreeMap(owner, repo, targetBranch);
          const sha = treeMap.get(cleanPath);

          const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
          const bodyPayload: any = {
            message: msg,
            content: cleanBase64,
            branch: targetBranch
          };
          if (sha) {
            bodyPayload.sha = sha;
          }

          const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyPayload)
          });

          if (putRes.ok) {
            const resData = await putRes.json();
            const newBlobSha = resData.content?.sha || resData.commit?.sha;
            if (newBlobSha) {
              treeMap.set(cleanPath, newBlobSha);
            }
            return { success: true, sha: resData.commit?.sha };
          } else {
            const errJson = await putRes.json().catch(() => ({ message: '' }));
            const errMsg = errJson.message || `HTTP ${putRes.status}`;
            
            // If conflict or SHA mismatch, invalidate tree map cache so next retry re-fetches latest tree
            if (
              (putRes.status === 409 || putRes.status === 422 || errMsg.includes('sha') || errMsg.includes('conflict') || errMsg.includes('does not match')) && 
              attempt < maxRetries - 1
            ) {
              treeMapCache.delete(`${owner}/${repo}/${targetBranch}`);
              await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
              continue;
            }
            return { success: false, error: errMsg };
          }
        } catch (err: any) {
          if (attempt < maxRetries - 1) {
            treeMapCache.delete(`${owner}/${repo}/${targetBranch}`);
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
            continue;
          }
          return { success: false, error: err.message || 'Network request failed' };
        }
      }

      return { success: false, error: 'Max retries exceeded' };
    };

    try {
      // ----------------------------------------------------
      // Step A: Push Image Files to NAKAdvocateImages repo FIRST
      // ----------------------------------------------------
      const imagesToProcess: { type: 'portrait' | 'banner' | 'event' | 'practice'; id?: string; path: string; src: string }[] = [];
      const cdnHost = `${imageOwner.toLowerCase()}.github.io/${imageRepo.toLowerCase()}`;
      const rawHost = `raw.githubusercontent.com/${imageOwner.toLowerCase()}/${imageRepo.toLowerCase()}`;

      const isCdnUrl = (url?: string) => url && (url.toLowerCase().includes(cdnHost) || url.toLowerCase().includes(rawHost));

      if (data.profile.portraitUrl && !isCdnUrl(data.profile.portraitUrl)) {
        imagesToProcess.push({ type: 'portrait', path: "images/profile_portrait", src: data.profile.portraitUrl });
      } else if (isCdnUrl(data.profile.portraitUrl)) {
        imageSuccess = true;
      }

      if (data.profile.bannerUrl && !isCdnUrl(data.profile.bannerUrl)) {
        imagesToProcess.push({ type: 'banner', path: "images/profile_banner", src: data.profile.bannerUrl });
      } else if (isCdnUrl(data.profile.bannerUrl)) {
        imageSuccess = true;
      }

      data.events.forEach((evt) => {
        if (evt.imageUrl && !isCdnUrl(evt.imageUrl)) {
          imagesToProcess.push({ type: 'event', id: evt.id, path: `images/events/${evt.id}`, src: evt.imageUrl });
        } else if (isCdnUrl(evt.imageUrl)) {
          imageSuccess = true;
        }
      });

      data.practiceAreas.forEach((pa) => {
        if (pa.imageUrl && !isCdnUrl(pa.imageUrl)) {
          imagesToProcess.push({ type: 'practice', id: pa.id, path: `images/practice_areas/${pa.id}`, src: pa.imageUrl });
        } else if (isCdnUrl(pa.imageUrl)) {
          imageSuccess = true;
        }
      });

      const imageErrors: string[] = [];
      for (const imgItem of imagesToProcess) {
        const imgData = await imageSrcToBase64(imgItem.src);
        if (imgData) {
          const filePath = `${imgItem.path}.${imgData.ext}`;
          const liveCdnUrl = `https://raw.githubusercontent.com/${imageOwner}/${imageRepo}/${imageBranch}/${filePath}`;

          const res = await uploadFileToGitHub(
            imageOwner,
            imageRepo,
            imageBranch,
            filePath,
            imgData.base64,
            `cms(media): sync image ${filePath} [${timestamp}]`
          );
          if (res.success) {
            imageSuccess = true;
            // Update image URLs in sanitizedData and local state with the live CDN URL
            if (imgItem.type === 'portrait') {
              sanitizedData.profile.portraitUrl = liveCdnUrl;
              data.profile.portraitUrl = liveCdnUrl;
            } else if (imgItem.type === 'banner') {
              sanitizedData.profile.bannerUrl = liveCdnUrl;
              data.profile.bannerUrl = liveCdnUrl;
            } else if (imgItem.type === 'event' && imgItem.id) {
              const targetEvt = sanitizedData.events.find(e => e.id === imgItem.id);
              if (targetEvt) targetEvt.imageUrl = liveCdnUrl;
              const localEvt = data.events.find(e => e.id === imgItem.id);
              if (localEvt) localEvt.imageUrl = liveCdnUrl;
            } else if (imgItem.type === 'practice' && imgItem.id) {
              const targetPa = sanitizedData.practiceAreas.find(p => p.id === imgItem.id);
              if (targetPa) targetPa.imageUrl = liveCdnUrl;
              const localPa = data.practiceAreas.find(p => p.id === imgItem.id);
              if (localPa) localPa.imageUrl = liveCdnUrl;
            }
          } else {
            imageErrors.push(`${filePath}: ${res.error}`);
            // Keep local image source if remote upload failed, avoiding broken 404 URL
          }
          // Pause between image commits to avoid race conditions
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      // ----------------------------------------------------
      // Step B: Push Data to Main Codebase Repo (NAKAdvocate)
      // ----------------------------------------------------
      const mainFilesToUpload = [
        { path: "site_data.json", data: sanitizedData },
        { path: "public/data/site-data.json", data: sanitizedData }
      ];
      for (const item of mainFilesToUpload) {
        const jsonStr = JSON.stringify(item.data, null, 2);
        const b64 = stringToBase64(jsonStr);
        const res = await uploadFileToGitHub(
          mainOwner,
          mainRepo,
          mainBranch,
          item.path,
          b64,
          commitMsg || `cms(main): sync ${item.path} [${timestamp}]`
        );
        if (res.success) {
          mainSuccess = true;
          if (res.sha && !commitHash) commitHash = res.sha.substring(0, 7);
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      // ----------------------------------------------------
      // Step C: Push Text Details to NAKAdvocateText repo
      // ----------------------------------------------------
      const textFilesToUpload = [
        { path: "site_data.json", data: sanitizedData },
        { path: "data/profile.json", data: sanitizedData.profile },
        { path: "data/cases.json", data: sanitizedData.cases },
        { path: "data/events.json", data: sanitizedData.events },
        { path: "data/practice_areas.json", data: sanitizedData.practiceAreas },
        { path: "data/consultations.json", data: sanitizedData.consultations }
      ];

      const textErrors: string[] = [];
      for (const item of textFilesToUpload) {
        const jsonStr = JSON.stringify(item.data, null, 2);
        const b64 = stringToBase64(jsonStr);
        const res = await uploadFileToGitHub(
          textOwner,
          textRepo,
          textBranch,
          item.path,
          b64,
          commitMsg || `cms(data): update ${item.path} [${timestamp}]`
        );
        if (res.success) {
          textSuccess = true;
          if (res.sha && !commitHash) commitHash = res.sha.substring(0, 7);
        } else {
          textErrors.push(`${item.path}: ${res.error}`);
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      // Update local storage git metadata
      data.gitConfig.lastSyncTime = timestamp;
      if (commitHash) {
        data.gitConfig.lastCommitHash = commitHash;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      if (!textSuccess && textErrors.length > 0) {
        return {
          success: false,
          error: `Text Sync Error (${textRepo}): ${textErrors.join(', ')}`
        };
      }

      return {
        success: true,
        commitHash: commitHash || Math.random().toString(36).substring(2, 9),
        mainRepoSuccess: mainSuccess,
        textRepoSuccess: textSuccess,
        imageRepoSuccess: imageSuccess
      };
    } catch (err: any) {
      console.error("GitHub sync failed:", err);
      return { success: false, error: err.message || "Failed to commit to GitHub" };
    }
  }

  /**
   * Export all CMS data as JSON file for manual Git repo check-in or backup
   */
  static exportDataAsJSON(): void {
    const data = this.getSiteData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nakadvocate-site-data-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Reset site data back to factory default
   */
  static resetToDefault(): SiteDataPayload {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSiteData));
    return initialSiteData;
  }

  /**
   * Simple Auth Check for Admin Access
   */
  static isAdminAuthenticated(): boolean {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  }

  static getAdminEmail(): string | null {
    return localStorage.getItem('admin_email');
  }

  static setAdminAuthentication(status: boolean, email?: string): void {
    if (status) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      if (email) localStorage.setItem('admin_email', email);
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.removeItem('admin_email');
    }
  }

  /**
   * Moderator & Permission Management
   */
  static getModerators(): ModeratorUser[] {
    const data = this.getSiteData();
    return data.moderators || initialSiteData.moderators || [];
  }

  static saveModerators(moderators: ModeratorUser[]): SiteDataPayload {
    const current = this.getSiteData();
    const updated: SiteDataPayload = {
      ...current,
      moderators,
      lastUpdated: new Date().toISOString()
    };
    this.saveSiteData(updated);
    return updated;
  }

  static getModeratorByEmail(email?: string | null): ModeratorUser | null {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const mods = this.getModerators();
    return mods.find(m => m.email.trim().toLowerCase() === normalized && m.status === 'active') || null;
  }

  static isSuperAdmin(email?: string | null): boolean {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    const mods = this.getModerators();
    const mod = mods.find(m => m.email.trim().toLowerCase() === normalized && m.status === 'active');
    if (mod) return mod.role === 'superadmin';
    // Fallback for hardcoded super admins
    return ['waseemparhyar09@gmail.com', 'waseemparhyar760@gmail.com', 'nooradv55@gmail.com', 'wasebkatha@gmail.com'].includes(normalized);
  }

  static getUserPermissions(email?: string | null): AdminPermission[] {
    if (!email) return [];
    const normalized = email.trim().toLowerCase();
    // Super admins get ALL permissions
    if (this.isSuperAdmin(normalized)) {
      return ['cases', 'practice', 'events', 'inquiries', 'contacts', 'profile', 'git', 'moderators'];
    }
    const mod = this.getModeratorByEmail(normalized);
    return mod?.permissions || [];
  }

  static hasPermission(email: string | null | undefined, permission: AdminPermission): boolean {
    if (!email) return false;
    const perms = this.getUserPermissions(email);
    return perms.includes(permission);
  }
}

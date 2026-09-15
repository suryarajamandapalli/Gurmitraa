/**
 * cms.ts — GURMITRAA CMS Service Layer
 *
 * ARCHITECTURE:
 *   CONTENT STORAGE: Cloudinary (raw JSON files)
 *   MEDIA STORAGE:   Cloudinary (images / videos)
 *   AUTH:            Serverless HMAC-SHA256 session token
 *   LOCALSTORAGE:    Draft only — never source of truth
 *
 * READ PATH:
 *   fetchGlobalSettings() → GET Cloudinary URL
 *   fetchPageData(pageId) → GET Cloudinary URL
 *
 * WRITE PATH (admin only):
 *   publishGlobalCms(data) → POST /api/cms-write
 *   publishPageCms(pageId, data) → POST /api/cms-write
 *
 * RESET PATH:
 *   resetGlobalCms() → POST /api/cms-write with defaults
 *   resetPageCms(pageId) → POST /api/cms-write with page defaults
 *   resetAllCms() → POST /api/cms-write for global + all pages
 *
 * SUBSCRIPTIONS:
 *   subscribeToGlobalChanges(cb) → smart polling Cloudinary
 *   subscribeToPageChanges(pageId, cb) → smart polling Cloudinary
 */

import {
  DEFAULT_GLOBAL,
  DEFAULT_HOME,
  DEFAULT_ABOUT,
  DEFAULT_SERVICES,
  DEFAULT_PRODUCTS,
  DEFAULT_PORTFOLIO,
  DEFAULT_CONTACT,
} from "./cms-defaults";

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const CLOUD_NAME = "di6akznvb";
const CMS_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/gurmitraa/cms`;

function getCmsWriteUrl() {
  if (typeof window === "undefined") {
    return "/api/cms-write";
  }
  return `${window.location.origin}/api/cms-write`;
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function cmsUrl(path: string): string {
  const clean = path.replace(/\.json$/, "");
  const ts = typeof window !== "undefined" ? Date.now() : Math.floor(Date.now() / 1000);
  return `${CMS_BASE_URL}/${clean}.json?_t=${ts}`;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw =
      localStorage.getItem("admin_session") ||
      localStorage.getItem("admin_auth_user") ||
      "";
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.token || "";
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// PUBLIC API: DEFAULT DATA
// ---------------------------------------------------------------------------

export function getDefaultPageData(pageId: string) {
  switch (pageId) {
    case "home":     return JSON.parse(JSON.stringify(DEFAULT_HOME));
    case "about":    return JSON.parse(JSON.stringify(DEFAULT_ABOUT));
    case "services": return JSON.parse(JSON.stringify(DEFAULT_SERVICES));
    case "products": return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    case "portfolio":return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO));
    case "contact":  return JSON.parse(JSON.stringify(DEFAULT_CONTACT));
    default: return { seo: { title: "", description: "" }, sections: [] };
  }
}

// ---------------------------------------------------------------------------
// PUBLIC API: DEEP MERGE
// ---------------------------------------------------------------------------

export function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  if (!source || typeof source !== "object") {
    return JSON.parse(JSON.stringify(target || {}));
  }
  const result: any = JSON.parse(JSON.stringify(target || {}));

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    if (sourceVal === null || sourceVal === undefined) continue;

    const targetVal = result[key];

    if (Array.isArray(sourceVal)) {
      result[key] = sourceVal;
    } else if (
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal) &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// PUBLIC API: READ
// ---------------------------------------------------------------------------

export async function fetchGlobalSettings(): Promise<typeof DEFAULT_GLOBAL> {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_GLOBAL));
  const url = cmsUrl("global");

  try {
    const res = await fetchWithTimeout(url, { cache: "no-store" }, 6000);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && !data.error) {
        return deepMerge(defaults, data);
      }
    }
  } catch (err) {
    console.warn("[CMS READ] fetchGlobalSettings failed:", err);
  }

  return defaults;
}

export const fetchGlobalData = fetchGlobalSettings;

export async function fetchPageData(pageId: string): Promise<any> {
  const defaults = getDefaultPageData(pageId);
  const url = cmsUrl(`pages/${pageId}`);

  try {
    const res = await fetchWithTimeout(url, { cache: "no-store" }, 6000);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && !data.error) {
        return deepMerge(defaults, data);
      }
    }
  } catch (err) {
    console.warn(`[CMS READ] fetchPageData(${pageId}) failed:`, err);
  }

  return defaults;
}

// ---------------------------------------------------------------------------
// PUBLIC API: WRITE (admin only)
// ---------------------------------------------------------------------------

async function cmsWrite(path: string, data: any): Promise<void> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Not authenticated. Please log in again.");
  }

  const payloadData = {
    ...data,
    _updatedAt: new Date().toISOString(),
    _version: ((data._version || 0) + 1),
  };

  const res = await fetchWithTimeout(
    getCmsWriteUrl(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Admin-Token": token,
      },
      body: JSON.stringify({ path, data: payloadData }),
    },
    20000
  );

  let result: any = {};
  try {
    result = await res.json();
  } catch {
    result = { ok: false, error: `HTTP ${res.status}` };
  }

  if (!res.ok || !result.ok) {
    const msg = result.error || `CMS write failed (HTTP ${res.status})`;
    console.error(`[CMS WRITE ERROR] path="${path}":`, msg);
    throw new Error(msg);
  }
}

export async function publishGlobalCms(data: any): Promise<void> {
  await cmsWrite("global", data);
  clearDraft("global");
}

export const saveGlobalData = publishGlobalCms;

export async function publishPageCms(pageId: string, data: any): Promise<void> {
  await cmsWrite(`pages/${pageId}`, data);
  clearDraft(`page_${pageId}`);
}

export const savePageData = publishPageCms;

export async function publishPageOrderCms(_keys: string[]): Promise<void> {
  clearDraft("pageOrder");
}

// ---------------------------------------------------------------------------
// PUBLIC API: RESET & BACKUPS
// ---------------------------------------------------------------------------

function createPreResetBackup(key: string, data: any) {
  if (typeof window === "undefined") return;
  try {
    const backupKey = `cms_backup_${key}_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(data));
  } catch {}
}

export async function resetGlobalCms(): Promise<typeof DEFAULT_GLOBAL> {
  try {
    const current = await fetchGlobalSettings();
    createPreResetBackup("global", current);
  } catch {}

  const defaults = JSON.parse(JSON.stringify(DEFAULT_GLOBAL));
  await cmsWrite("global", defaults);
  clearDraft("global");
  return defaults;
}

export async function resetPageCms(pageId: string): Promise<any> {
  try {
    const current = await fetchPageData(pageId);
    createPreResetBackup(`page_${pageId}`, current);
  } catch {}

  const defaults = getDefaultPageData(pageId);
  await cmsWrite(`pages/${pageId}`, defaults);
  clearDraft(`page_${pageId}`);
  return defaults;
}

export async function resetAllCms(): Promise<void> {
  const pageIds = ["home", "about", "services", "products", "portfolio", "contact"];

  try {
    const globalCur = await fetchGlobalSettings();
    createPreResetBackup("global_all_reset", globalCur);
  } catch {}

  await cmsWrite("global", JSON.parse(JSON.stringify(DEFAULT_GLOBAL)));
  clearDraft("global");
  clearDraft("pageOrder");

  for (const pid of pageIds) {
    await cmsWrite(`pages/${pid}`, getDefaultPageData(pid));
    clearDraft(`page_${pid}`);
  }
}

// ---------------------------------------------------------------------------
// PUBLIC API: SUBSCRIPTIONS
// ---------------------------------------------------------------------------

export function subscribeToGlobalChanges(
  callback: (data: any) => void,
  intervalMs = 30000
): () => void {
  let cancelled = false;
  let lastJson = "";

  async function poll() {
    if (cancelled) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      if (!cancelled) setTimeout(poll, intervalMs);
      return;
    }

    try {
      const res = await fetch(cmsUrl("global"), { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text !== lastJson) {
          lastJson = text;
          const data = JSON.parse(text);
          if (data && typeof data === "object") {
            callback(deepMerge(JSON.parse(JSON.stringify(DEFAULT_GLOBAL)), data));
          }
        }
      }
    } catch {}

    if (!cancelled) {
      setTimeout(poll, intervalMs);
    }
  }

  poll();
  return () => { cancelled = true; };
}

export function subscribeToPageChanges(
  pageId: string,
  callback: (data: any) => void,
  intervalMs = 30000
): () => void {
  let cancelled = false;
  let lastJson = "";
  const defaults = getDefaultPageData(pageId);

  async function poll() {
    if (cancelled) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      if (!cancelled) setTimeout(poll, intervalMs);
      return;
    }

    try {
      const res = await fetch(cmsUrl(`pages/${pageId}`), { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text !== lastJson) {
          lastJson = text;
          const data = JSON.parse(text);
          if (data && typeof data === "object") {
            callback(deepMerge(defaults, data));
          }
        }
      }
    } catch {}

    if (!cancelled) {
      setTimeout(poll, intervalMs);
    }
  }

  poll();
  return () => { cancelled = true; };
}

// ---------------------------------------------------------------------------
// DRAFT HELPERS (localStorage — admin in-editor state only)
// ---------------------------------------------------------------------------

export function saveDraft(key: string, data: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`cms_draft_${key}`, JSON.stringify(data));
  } catch {}
}

export function getDraft<T = any>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`cms_draft_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`cms_draft_${key}`);
  } catch {}
}

export function clearAllDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("cms_draft_")) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

import { db } from "./firebase";
import { ref, set, get, remove } from "firebase/database";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
  getOptimizedCloudinaryUrl,
  getCloudinaryThumbnail,
  CloudinaryAsset,
} from "./cloudinary";
import { fetchGlobalData, fetchPageData } from "./cms";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  publicId?: string;
  size?: number;
  format?: string;
  width?: number;
  height?: number;
  resourceType?: string;
  uploadedAt: number;
}

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "default_logo",
    publicId: "default_logo",
    url: "/Logo.png",
    name: "Logo.png",
    size: 45000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000000,
  },
  {
    id: "default_long_logo",
    publicId: "default_long_logo",
    url: "/LongLogo.png",
    name: "LongLogo.png",
    size: 95000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000001,
  },
  {
    id: "default_pre_logo",
    publicId: "default_pre_logo",
    url: "/PreLogo.png",
    name: "PreLogo.png",
    size: 42000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000002,
  },
  {
    id: "default_bgvideo",
    publicId: "default_bgvideo",
    url: "/bgvideo.mp4",
    name: "bgvideo.mp4",
    size: 2450000,
    format: "mp4",
    resourceType: "video",
    uploadedAt: 1700000000003,
  },
  {
    id: "default_scenic_hero",
    publicId: "default_scenic_hero",
    url: "/scenic_hero.png",
    name: "scenic_hero.png",
    size: 850000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000004,
  },
  {
    id: "default_og_image",
    publicId: "default_og_image",
    url: "/og-image.png",
    name: "og-image.png",
    size: 150000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000005,
  },
  {
    id: "default_about_gurumitraa",
    publicId: "default_about_gurumitraa",
    url: "/images/about_gurumitraa.png",
    name: "about_gurumitraa.png",
    size: 210000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000006,
  },
  {
    id: "default_about_story",
    publicId: "default_about_story",
    url: "/images/about_story.png",
    name: "about_story.png",
    size: 280000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000007,
  },
  {
    id: "default_about_why_us",
    publicId: "default_about_why_us",
    url: "/images/about_why_us.png",
    name: "about_why_us.png",
    size: 260000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000008,
  },
  {
    id: "default_ceo",
    publicId: "default_ceo",
    url: "/images/ceo.png",
    name: "ceo.png",
    size: 180000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000009,
  },
  {
    id: "default_enterprise_features",
    publicId: "default_enterprise_features",
    url: "/images/enterprise_features.png",
    name: "enterprise_features.png",
    size: 320000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000010,
  },
  {
    id: "default_hexa_health",
    publicId: "default_hexa_health",
    url: "/images/hexa_health.png",
    name: "hexa_health.png",
    size: 220000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000011,
  },
  {
    id: "default_lumen_commerce",
    publicId: "default_lumen_commerce",
    url: "/images/lumen_commerce.png",
    name: "lumen_commerce.png",
    size: 230000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000012,
  },
  {
    id: "default_mentora_learn",
    publicId: "default_mentora_learn",
    url: "/images/mentora_learn.png",
    name: "mentora_learn.png",
    size: 240000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000013,
  },
  {
    id: "default_nimbus_banking",
    publicId: "default_nimbus_banking",
    url: "/images/nimbus_banking.png",
    name: "nimbus_banking.png",
    size: 250000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000014,
  },
  {
    id: "default_orbit_analytics",
    publicId: "default_orbit_analytics",
    url: "/images/orbit_analytics.png",
    name: "orbit_analytics.png",
    size: 260000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000015,
  },
  {
    id: "default_pulsecare",
    publicId: "default_pulsecare",
    url: "/images/pulsecare.png",
    name: "pulsecare.png",
    size: 270000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000016,
  },
  {
    id: "default_synapse_studio",
    publicId: "default_synapse_studio",
    url: "/images/synapse_studio.png",
    name: "synapse_studio.png",
    size: 280000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000017,
  },
  {
    id: "default_vela_mobility",
    publicId: "default_vela_mobility",
    url: "/images/vela_mobility.png",
    name: "vela_mobility.png",
    size: 290000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000018,
  },
  {
    id: "default_voyage_travel",
    publicId: "default_voyage_travel",
    url: "/images/voyage_travel.png",
    name: "voyage_travel.png",
    size: 300000,
    format: "png",
    resourceType: "image",
    uploadedAt: 1700000000019,
  },
];

/**
 * Uploads a media asset directly to Cloudinary and registers metadata in Firebase RTDB (/media)
 */
export async function uploadMediaAsset(
  file: File,
  folder = "gurmitraa"
): Promise<MediaAsset> {
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  // 1. Upload to Cloudinary via direct signed upload or server API
  const cloudinaryData: CloudinaryAsset = await uploadFileToCloudinary(file, folder);

  const publicId = cloudinaryData.public_id;
  const safeKey = publicId.replace(/[.#$/[\]]/g, "_");
  const ext = cloudinaryData.format || file.name.split(".").pop()?.toLowerCase() || "";

  const mediaItem: MediaAsset = {
    id: safeKey,
    publicId: publicId,
    url: cloudinaryData.secure_url || cloudinaryData.url,
    name: file.name || cleanName,
    size: cloudinaryData.bytes || file.size,
    format: ext,
    width: cloudinaryData.width,
    height: cloudinaryData.height,
    resourceType: cloudinaryData.resource_type || "image",
    uploadedAt: timestamp,
  };

  // 2. Save into local media cache immediately so UI gets it in 0ms
  try {
    const cached = getLocalMediaCache();
    saveLocalMediaCache([mediaItem, ...cached.filter((m) => m.id !== mediaItem.id)]);
  } catch {}

  // 3. Index metadata in Firebase Realtime Database (non-blocking with safety timeout)
  try {
    await Promise.race([
      set(ref(db, `media/${safeKey}`), mediaItem),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (fbErr) {
    console.warn("Firebase media index notice:", fbErr);
  }

  return mediaItem;
}

// Backward-compatible alias for existing code
export const uploadMediaToFirebase = uploadMediaAsset;

const PAGE_NAMES = ["home", "about", "services", "products", "portfolio", "contact"];

/**
 * Scans CMS data across all pages to determine if a media asset is actively referenced
 */
export async function checkMediaUsage(
  mediaUrl: string,
  publicId?: string,
  inMemoryCmsData?: { global?: any; pages?: Record<string, any> }
): Promise<{ isUsed: boolean; occurrences: string[] }> {
  const occurrences: string[] = [];
  if (!mediaUrl && !publicId) return { isUsed: false, occurrences: [] };

  const targetUrl = (mediaUrl || "").trim();
  const targetId = (publicId || "").trim();

  function scanObject(obj: any, pageLabel: string, path = "") {
    if (!obj) return;
    if (typeof obj === "string") {
      if (
        (targetUrl && (obj === targetUrl || obj.includes(targetUrl))) ||
        (targetId && (obj === targetId || obj.includes(targetId)))
      ) {
        occurrences.push(`${pageLabel}${path ? ` (${path})` : ""}`);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemLabel = item?.title || item?.id || `Item #${index + 1}`;
        scanObject(item, pageLabel, path ? `${path} > ${itemLabel}` : itemLabel);
      });
    } else if (typeof obj === "object") {
      for (const [key, val] of Object.entries(obj)) {
        if (key === "id" || key === "type") continue;
        scanObject(val, pageLabel, path ? `${path} > ${key}` : key);
      }
    }
  }

  // Scan provided in-memory CMS data if available
  if (inMemoryCmsData) {
    if (inMemoryCmsData.global) {
      scanObject(inMemoryCmsData.global, "Global Settings");
    }
    if (inMemoryCmsData.pages) {
      for (const [pageId, pageContent] of Object.entries(inMemoryCmsData.pages)) {
        scanObject(pageContent, `${pageId.toUpperCase()} Page`);
      }
    }
  } else {
    // Fetch live CMS snapshot from Cloudinary CMS storage
    try {
      const globalData = await fetchGlobalData();
      if (globalData) scanObject(globalData, "Global Settings");

      const pagePromises = PAGE_NAMES.map(async (pName) => {
        const pData = await fetchPageData(pName);
        if (pData) scanObject(pData, `${pName.toUpperCase()} Page`);
      });

      await Promise.allSettled(pagePromises);
    } catch {}
  }

  return {
    isUsed: occurrences.length > 0,
    occurrences: [...new Set(occurrences)],
  };
}

/**
 * Fetches all media items from Firebase Realtime Database
 */
export async function fetchMediaAssets(): Promise<MediaAsset[]> {
  const localCache = getLocalMediaCache();

  try {
    const snapshot: any = await Promise.race([
      get(ref(db, "media")),
      new Promise((resolve) => setTimeout(() => resolve(null), 1200)),
    ]);
    if (snapshot && snapshot.exists()) {
      const data = snapshot.val();
      if (data && typeof data === "object") {
        const list = Object.values(data) as MediaAsset[];
        const map = new Map<string, MediaAsset>();
        DEFAULT_MEDIA_ASSETS.forEach((a) => map.set(a.id, a));
        list.forEach((a) => { if (a?.id) map.set(a.id, a); });
        const merged = Array.from(map.values()).sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
        saveLocalMediaCache(merged);
        return merged;
      }
    }
  } catch {}

  return localCache;
}

/**
 * Deletes a media asset from Cloudinary and removes its metadata from Firebase RTDB
 */
export async function deleteMediaAsset(item: MediaAsset): Promise<void> {
  const publicId = item.publicId || item.id;
  const safeKey = item.id.replace(/[.#$/[\]]/g, "_");

  // 1. Delete from Cloudinary
  if (publicId && !publicId.startsWith("default_")) {
    try {
      await deleteFileFromCloudinary(publicId, item.resourceType || "image");
    } catch (cErr) {
      console.warn("Cloudinary delete notice:", cErr);
    }
  }

  // 2. Remove metadata from Firebase RTDB
  try {
    await remove(ref(db, `media/${safeKey}`));
  } catch (fbErr) {
    console.warn("Firebase media removal notice:", fbErr);
  }

  // 3. Remove from local cache
  try {
    const cached = getLocalMediaCache();
    saveLocalMediaCache(cached.filter((m) => m.id !== item.id));
  } catch {}
}

// Backward-compatible alias
export const deleteMediaFromFirebase = deleteMediaAsset;

/**
 * Helper to get delivery-optimized Cloudinary image URL
 */
export function getImageUrl(
  url: string | undefined,
  options?: { width?: number; height?: number; crop?: string; quality?: string }
): string {
  if (!url) return "";
  return getOptimizedCloudinaryUrl(url, options);
}

/**
 * Helper to get preview thumbnail
 */
export function getThumbnailUrl(url: string | undefined, size = 300): string {
  if (!url) return "";
  return getCloudinaryThumbnail(url, size);
}

// Helper to get local cache of media assets (fallback/offline)
export function getLocalMediaCache(): MediaAsset[] {
  if (typeof window === "undefined") return DEFAULT_MEDIA_ASSETS;
  try {
    const raw = localStorage.getItem("gurmitraa_media_cache");
    const list: MediaAsset[] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, MediaAsset>();
    DEFAULT_MEDIA_ASSETS.forEach((a) => map.set(a.id, a));
    list.forEach((a) => {
      if (a && a.id) map.set(a.id, a);
    });
    return Array.from(map.values()).sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
  } catch {
    return DEFAULT_MEDIA_ASSETS;
  }
}

// Helper to save local cache of media assets
export function saveLocalMediaCache(items: MediaAsset[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("gurmitraa_media_cache", JSON.stringify(items.slice(0, 100)));
  } catch {}
}

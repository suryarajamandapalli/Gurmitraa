import {
  DEFAULT_GLOBAL,
  DEFAULT_HOME,
  DEFAULT_ABOUT,
  DEFAULT_SERVICES,
  DEFAULT_PRODUCTS,
  DEFAULT_PORTFOLIO,
  DEFAULT_CONTACT,
} from "./cms-defaults";

const FIREBASE_DB_URL = "https://gurmitraa-default-rtdb.firebaseio.com";

// Helper to perform a deep merge
export function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  if (!source) return target;
  const result = { ...target } as any;

  for (const key of Object.keys(source)) {
    const targetVal = target[key];
    const sourceVal = source[key];

    if (sourceVal === null || sourceVal === undefined) {
      continue;
    }

    if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
      // If the array contains objects, merge them element by element to backfill default properties
      result[key] = sourceVal.map((item: any, idx: number) => {
        const targetItem = targetVal[idx] || targetVal[0]; // fallback to first item as template if index out of bounds
        if (
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          targetItem &&
          typeof targetItem === "object" &&
          !Array.isArray(targetItem)
        ) {
          return deepMerge(targetItem, item);
        }
        return item;
      });
    } else if (
      targetVal &&
      typeof targetVal === "object" &&
      sourceVal &&
      typeof sourceVal === "object"
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}

// Fetch with a short timeout to prevent blocking SSR
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchGlobalSettings() {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/global.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return deepMerge(DEFAULT_GLOBAL, data);
  } catch (error) {
    console.warn("CMS: Failed to fetch global settings, falling back to defaults.", error);
    return DEFAULT_GLOBAL;
  }
}

export async function fetchPageData(pageId: string) {
  let defaults: any;
  switch (pageId) {
    case "home":
      defaults = DEFAULT_HOME;
      break;
    case "about":
      defaults = DEFAULT_ABOUT;
      break;
    case "services":
      defaults = DEFAULT_SERVICES;
      break;
    case "products":
      defaults = DEFAULT_PRODUCTS;
      break;
    case "portfolio":
      defaults = DEFAULT_PORTFOLIO;
      break;
    case "contact":
      defaults = DEFAULT_CONTACT;
      break;
    default:
      defaults = { seo: { title: "", description: "" }, sections: [] };
  }

  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/pages/${pageId}.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return deepMerge(defaults, data);
  } catch (error) {
    console.warn(`CMS: Failed to fetch page data for ${pageId}, falling back to defaults.`, error);
    return defaults;
  }
}

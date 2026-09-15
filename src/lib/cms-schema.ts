import { z } from "zod";

export const NavItemSchema = z.object({
  label: z.string().min(1, "Navigation label cannot be empty"),
  href: z.string().min(1, "Navigation href cannot be empty"),
  hidden: z.boolean().optional(),
});

export const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

export const GlobalSettingsSchema = z.object({
  logo: z.string().optional(),
  logoUrl: z.string().optional(),
  longLogoUrl: z.string().optional(),
  favicon: z.string().optional(),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      foregroundColor: z.string().optional(),
    })
    .optional(),
  fonts: z
    .object({
      primaryFont: z.string().optional(),
      displayFont: z.string().optional(),
    })
    .optional(),
  meta: z
    .object({
      defaultTitle: z.string().optional(),
      defaultDescription: z.string().optional(),
    })
    .optional(),
  analytics: z.string().optional(),
  navbar: z.array(NavItemSchema).optional(),
  footer: z
    .object({
      copyright: z.string().optional(),
      madeByText: z.string().optional(),
      madeByUrl: z.string().optional(),
      madeByLogoUrl: z.string().optional(),
      socialLinks: z.array(SocialLinkSchema).optional(),
      contactDetails: z
        .object({
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  _version: z.number().optional(),
  _updatedAt: z.number().optional(),
});

export const SectionSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  type: z.string().min(1, "Section type is required"),
  active: z.boolean().optional(),
  order: z.number().optional(),
  content: z.record(z.any()).default({}),
});

export const PageCmsSchema = z.object({
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  sections: z.array(SectionSchema),
  _version: z.number().optional(),
  _updatedAt: z.number().optional(),
});

/**
 * Validate any CMS payload according to its path ("global" or "pages/*")
 */
export function validateCmsPayload(
  path: string,
  data: unknown
): { valid: boolean; error?: string; data?: any } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "CMS payload must be a non-null object" };
  }

  const cleanPath = path.replace(/\.json$/, "").toLowerCase();

  try {
    if (cleanPath === "global") {
      const parsed = GlobalSettingsSchema.parse(data);
      return { valid: true, data: parsed };
    }

    if (cleanPath.startsWith("pages/") || ["home", "about", "services", "products", "portfolio", "contact"].includes(cleanPath)) {
      const parsed = PageCmsSchema.parse(data);
      return { valid: true, data: parsed };
    }

    // Generic schema fallback for arbitrary custom paths
    return { valid: true, data };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const formatted = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      return { valid: false, error: `Schema Validation Error: ${formatted}` };
    }
    return { valid: false, error: err?.message || "Invalid CMS schema format" };
  }
}

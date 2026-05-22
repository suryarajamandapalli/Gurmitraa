import { Cloudinary } from "@cloudinary/url-gen";
import { createServerFn } from "@tanstack/react-start";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "di6akznvb";

// Initialize Cloudinary SDK for client-side advanced use cases
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME,
  },
});

/**
 * Generates an optimized Cloudinary delivery URL with basic transformations.
 * Works on both client and server.
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: { width?: number; height?: number; crop?: string; quality?: string | number },
): string {
  if (!publicId) return "";

  // If it's already a full HTTP(S) URL, return it as-is
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  const params: string[] = ["f_auto", "q_auto"];

  if (options?.width) params.push(`w_${options.width}`);
  if (options?.height) params.push(`h_${options.height}`);
  if (options?.crop) params.push(`c_${options.crop}`);
  if (options?.quality) params.push(`q_${options.quality}`);

  const transformString = params.join(",");
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || CLOUD_NAME;

  return `https://res.cloudinary.com/${cloud}/image/upload/${transformString}/${publicId}`;
}

/**
 * Server function to securely sign and upload an asset (image/video/raw file) to Cloudinary.
 * Keeps API secrets hidden from the browser and works on both Node.js and Cloudflare Workers.
 */
export const uploadAssetServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { fileBase64: string; filename: string }) => d)
  .handler(async ({ data }) => {
    // Read credentials from server env
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || CLOUD_NAME;
    const apiKey = process.env.VITE_CLOUDINARY_API_KEY || "416568366319934";
    const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET || "GiTf5EZPmJoJE1FuqvU49zL4mzE";

    if (!apiSecret || !apiKey || !cloudName) {
      throw new Error("Missing Cloudinary configuration credentials.");
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    const folder = "gurmitraa";

    // Prepare parameters for signature verification
    // Cloudinary requires signing all parameters alphabetically sorted
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    // SHA-1 hashing using the standard Web Crypto API (supported in Node.js & Cloudflare Workers)
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", dataBuffer);
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const formData = new FormData();
    formData.append("file", data.fileBase64);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const result = await response.json();
    return result as {
      public_id: string;
      secure_url: string;
      format: string;
      width: number;
      height: number;
    };
  });

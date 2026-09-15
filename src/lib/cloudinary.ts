/**
 * Cloudinary Client Utilities
 * Handles communication with secure backend upload/delete endpoints, direct signed uploads,
 * client-side compression, and CDN URL transformations.
 */

export interface CloudinaryAsset {
  public_id: string;
  url: string;
  secure_url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  resource_type?: string;
  created_at?: string;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("admin_session") || localStorage.getItem("admin_auth_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
          headers["X-Admin-Token"] = user.token;
        }
      }
    } catch {}
  }
  return headers;
}

/**
 * Compresses an image file in the browser using HTML5 Canvas
 * Reduces multi-megabyte camera photos down to ~350KB in milliseconds
 */
export async function compressImage(
  file: File,
  maxDimension = 2048,
  quality = 0.88
): Promise<File | Blob> {
  // If not an image or SVG/GIF, return as is
  const type = file.type?.toLowerCase() || "";
  if (!type.startsWith("image/") || type.includes("svg") || type.includes("gif")) {
    return file;
  }

  // If already very small (< 400KB), return as is
  if (file.size < 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP or JPEG
        const outputFormat = "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name, {
                type: outputFormat,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a browser File/Blob object to Base64 Data URL
 */
function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a media file directly to Cloudinary using secure server-generated signature
 */
export async function uploadFileToCloudinary(
  fileInput: File | string,
  folder = "gurmitraa"
): Promise<CloudinaryAsset> {
  let fileToUpload: File | Blob | string = fileInput;

  // 1. Client-side smart image compression
  if (typeof fileInput !== "string") {
    try {
      fileToUpload = await compressImage(fileInput, 2048, 0.88);
    } catch {}
  }

  const authHeaders = getAuthHeaders();

  // 2. Fetch signed parameters from backend
  let signData: {
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    folder: string;
  } | null = null;

  const signEndpoints = ["/api/cloudinary/sign", "/api/cloudinary-sign"];

  for (const ep of signEndpoints) {
    try {
      const signRes = await fetch(ep, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ folder }),
      });
      if (signRes.ok) {
        const json = await signRes.json();
        if (json.ok && json.signature) {
          signData = json;
          break;
        }
      }
    } catch {}
  }

  // 3. Direct Upload to Cloudinary API with signature
  if (signData) {
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("folder", signData.folder || folder);
      formData.append("signature", signData.signature);

      const cloudName = signData.cloudName || "di6akznvb";
      const cRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (cRes.ok) {
        const resJson = await cRes.json();
        if (resJson.secure_url || resJson.url) {
          return {
            public_id: resJson.public_id,
            url: resJson.url,
            secure_url: resJson.secure_url,
            format: resJson.format,
            width: resJson.width,
            height: resJson.height,
            bytes: resJson.bytes,
            resource_type: resJson.resource_type,
            created_at: resJson.created_at,
          };
        }
      }
    } catch (directErr) {
      console.warn("Direct signed upload fallback notice:", directErr);
    }
  }

  // 4. Fallback: Upload via server endpoint
  let fileData: string;
  if (typeof fileToUpload === "string") {
    fileData = fileToUpload;
  } else {
    fileData = await fileToBase64(fileToUpload);
  }

  const payload = {
    file: fileData,
    folder,
  };

  const uploadEndpoints = [
    "/api/cloudinary/upload",
    "/api/cloudinary-upload",
  ];
  let lastError: Error | null = null;

  for (const endpoint of uploadEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMsg = `Upload failed with status ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.error) errMsg = errJson.error;
        } catch {}
        throw new Error(errMsg);
      }

      const resJson = await response.json();
      if (resJson.ok && resJson.data) {
        return resJson.data as CloudinaryAsset;
      }
      throw new Error(resJson.error || "Invalid response from upload server.");
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("Failed to upload file to Cloudinary.");
}

/**
 * Deletes an asset from Cloudinary via secure server endpoint
 */
export async function deleteFileFromCloudinary(
  publicId: string,
  resourceType = "image"
): Promise<boolean> {
  if (!publicId) return false;

  const payload = {
    public_id: publicId,
    resource_type: resourceType,
  };

  const endpoints = [
    "/api/cloudinary/delete",
    "/api/cloudinary-delete",
  ];
  let lastError: Error | null = null;
  const authHeaders = getAuthHeaders();

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMsg = `Delete failed with status ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.error) errMsg = errJson.error;
        } catch {}
        throw new Error(errMsg);
      }

      const resJson = await response.json();
      return resJson.ok === true;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  console.error("Cloudinary deletion error:", lastError);
  throw lastError || new Error("Failed to delete asset from Cloudinary.");
}

/**
 * Transforms Cloudinary URLs with dynamic delivery optimizations (f_auto, q_auto, responsive widths)
 */
export function getOptimizedCloudinaryUrl(
  url: string | undefined,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  if (!url) return "";

  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const {
    width,
    height,
    crop = "limit",
    quality = "auto",
    format = "auto",
  } = options;

  const transforms: string[] = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  const transformString = transforms.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}

/**
 * Generates an efficient thumbnail URL for admin previews
 */
export function getCloudinaryThumbnail(url: string | undefined, size = 300): string {
  if (!url) return "";
  return getOptimizedCloudinaryUrl(url, {
    width: size,
    height: size,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
}

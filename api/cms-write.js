/**
 * /api/cms-write.js
 * Vercel Serverless: Authenticated CMS write endpoint.
 * Stores CMS JSON files in Cloudinary as raw assets.
 *
 * POST /api/cms-write
 *   Headers: Authorization: Bearer <session_token>
 *   Body: { path: "global" | "pages/home" | ..., data: { ... } }
 */

import crypto from "crypto";
import { authenticateRequest } from "./_utils/auth-utils.js";

const ALLOWED_PATHS = new Set([
  "global",
  "pages/home",
  "pages/about",
  "pages/services",
  "pages/products",
  "pages/portfolio",
  "pages/contact",
]);

function getCloudinaryConfig(env) {
  const cloud_name =
    env?.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "di6akznvb";
  const api_key =
    env?.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_KEY;
  const api_secret =
    env?.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_API_SECRET;

  return { cloud_name, api_key, api_secret };
}

function cloudinarySign(params, secret) {
  if (!secret) throw new Error("CLOUDINARY_API_SECRET is not configured");
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha256").update(toSign + secret).digest("hex");
}

function sanitizePath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return null;
  const clean = rawPath.replace(/\.json$/, "").replace(/^\/+|\/+$/g, "").trim();
  if (ALLOWED_PATHS.has(clean)) return clean;
  if (/^pages\/[a-zA-Z0-9_-]+$/.test(clean)) return clean;
  return null;
}

export default async function handler(req, res) {
  if (req instanceof Request || (req && typeof req.json === "function" && !res)) {
    return handleWebRequest(req);
  }

  // Node runtime
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Token");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const config = getCloudinaryConfig();

  // READ (GET) - Public read
  if (req.method === "GET") {
    try {
      const urlObj = new URL(req.url, "http://localhost");
      const rawPath = urlObj.searchParams.get("path") || "global";
      const cleanPath = sanitizePath(rawPath);
      if (!cleanPath) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ ok: false, error: "Invalid path specified", data: null }));
      }

      const cloudUrl = `https://res.cloudinary.com/${config.cloud_name}/raw/upload/v1/gurmitraa/cms/${cleanPath}.json?_t=${Date.now()}`;
      const response = await fetch(cloudUrl, { headers: { "Cache-Control": "no-cache" } });
      if (!response.ok) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ ok: false, error: "CMS data not found", data: null }));
      }

      const data = await response.json();
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: true, data }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: err.message || "Read failed" }));
    }
  }

  // WRITE (POST) - Authenticated
  if (req.method === "POST") {
    const auth = authenticateRequest(req);
    if (!auth.ok) {
      res.statusCode = auth.status || 401;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: auth.error }));
    }

    if (!config.api_key || !config.api_secret) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Server misconfiguration: Cloudinary credentials missing" }));
    }

    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch {}
    } else if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try { body = JSON.parse(Buffer.concat(chunks).toString("utf-8")); } catch { body = {}; }
    }

    const { path: rawPath, data } = body || {};
    const cleanPath = sanitizePath(rawPath);
    if (!cleanPath || data === undefined || data === null || typeof data !== "object") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Invalid payload: valid path and data object required" }));
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `gurmitraa/cms/${cleanPath}`;

      const signParams = {
        format: "json",
        invalidate: "true",
        overwrite: "true",
        public_id: publicId,
        timestamp,
      };

      const signature = cloudinarySign(signParams, config.api_secret);
      const jsonContent = JSON.stringify(data);
      const boundary = `----FormBoundary${Date.now()}`;

      const parts = [
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="cms.json"\r\nContent-Type: application/json\r\n\r\n${jsonContent}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="public_id"\r\n\r\n${publicId}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="format"\r\n\r\njson`,
        `--${boundary}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue`,
        `--${boundary}\r\nContent-Disposition: form-data; name="invalidate"\r\n\r\ntrue`,
        `--${boundary}\r\nContent-Disposition: form-data; name="timestamp"\r\n\r\n${timestamp}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="api_key"\r\n\r\n${config.api_key}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${signature}`,
        `--${boundary}--`,
      ];

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud_name}/raw/upload`, {
        method: "POST",
        headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
        body: parts.join("\r\n"),
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || uploadResult.error) {
        const errMsg = uploadResult.error?.message || `Upload failed (${uploadRes.status})`;
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ ok: false, error: errMsg }));
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: true, url: uploadResult.secure_url, savedAt: new Date().toISOString() }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: err.message || "Write failed" }));
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
}

async function handleWebRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Token",
      },
    });
  }

  const config = getCloudinaryConfig(env);

  if (request.method === "GET") {
    try {
      const urlObj = new URL(request.url);
      const rawPath = urlObj.searchParams.get("path") || "global";
      const cleanPath = sanitizePath(rawPath);
      if (!cleanPath) {
        return new Response(JSON.stringify({ ok: false, error: "Invalid path specified", data: null }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const cloudUrl = `https://res.cloudinary.com/${config.cloud_name}/raw/upload/v1/gurmitraa/cms/${cleanPath}.json?_t=${Date.now()}`;
      const res = await fetch(cloudUrl, { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) {
        return new Response(JSON.stringify({ ok: false, error: "Not found", data: null }), {
          status: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      const data = await res.json();
      return new Response(JSON.stringify({ ok: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  if (request.method === "POST") {
    const auth = authenticateRequest(request, env);
    if (!auth.ok) {
      return new Response(JSON.stringify({ ok: false, error: auth.error }), {
        status: auth.status || 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!config.api_key || !config.api_secret) {
      return new Response(JSON.stringify({ ok: false, error: "Server misconfiguration: Cloudinary credentials missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const body = await request.json();
      const { path: rawPath, data } = body || {};
      const cleanPath = sanitizePath(rawPath);
      if (!cleanPath || data === undefined || data === null || typeof data !== "object") {
        return new Response(JSON.stringify({ ok: false, error: "Invalid payload: valid path and data object required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `gurmitraa/cms/${cleanPath}`;

      const signParams = {
        format: "json",
        invalidate: "true",
        overwrite: "true",
        public_id: publicId,
        timestamp,
      };

      const signature = cloudinarySign(signParams, config.api_secret);
      const jsonContent = JSON.stringify(data);
      const boundary = `----FormBoundary${Date.now()}`;

      const parts = [
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="cms.json"\r\nContent-Type: application/json\r\n\r\n${jsonContent}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="public_id"\r\n\r\n${publicId}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="format"\r\n\r\njson`,
        `--${boundary}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue`,
        `--${boundary}\r\nContent-Disposition: form-data; name="invalidate"\r\n\r\ntrue`,
        `--${boundary}\r\nContent-Disposition: form-data; name="timestamp"\r\n\r\n${timestamp}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="api_key"\r\n\r\n${config.api_key}`,
        `--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${signature}`,
        `--${boundary}--`,
      ];

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud_name}/raw/upload`, {
        method: "POST",
        headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
        body: parts.join("\r\n"),
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || uploadResult.error) {
        return new Response(JSON.stringify({ ok: false, error: uploadResult.error?.message || "Upload failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      return new Response(JSON.stringify({ ok: true, url: uploadResult.secure_url, savedAt: new Date().toISOString() }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

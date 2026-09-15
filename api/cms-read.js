/**
 * /api/cms-read.js
 * Vercel Serverless: Public CMS read endpoint.
 * Reads CMS JSON from Cloudinary raw assets.
 *
 * GET /api/cms-read?path=global
 * GET /api/cms-read?path=pages/home
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "di6akznvb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }

  if (req.method !== "GET") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
  }

  try {
    const urlObj = new URL(req.url, "http://localhost");
    const path = (urlObj.searchParams.get("path") || "global").replace(/\.json$/, "");
    const cloudUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/gurmitraa/cms/${path}.json`;

    const response = await fetch(cloudUrl, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (!response.ok) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Not found", data: null }));
    }

    const data = await response.json();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.end(JSON.stringify({ ok: true, data }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: err.message || "Read failed" }));
  }
}

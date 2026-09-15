import { v2 as cloudinary } from "cloudinary";
import { authenticateRequest } from "./_utils/auth-utils.js";

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
  const default_folder =
    env?.CLOUDINARY_UPLOAD_FOLDER ||
    process.env.CLOUDINARY_UPLOAD_FOLDER ||
    "gurmitraa";

  return { cloud_name, api_key, api_secret, default_folder };
}

// Universal Serverless Handler (Vercel Node & Edge)
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

  // Authenticate
  const auth = authenticateRequest(req);
  if (!auth.ok) {
    res.statusCode = auth.status || 401;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: auth.error }));
  }

  const config = getCloudinaryConfig();
  if (!config.api_key || !config.api_secret) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: "Cloudinary credentials missing." }));
  }

  try {
    let folder = config.default_folder;
    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch {}
      } else if (!body) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        try { body = JSON.parse(Buffer.concat(chunks).toString("utf-8")); } catch { body = {}; }
      }
      if (body?.folder) folder = body.folder;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      config.api_secret
    );

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        ok: true,
        timestamp,
        signature,
        apiKey: config.api_key,
        cloudName: config.cloud_name,
        folder,
      })
    );
  } catch (err) {
    console.error("Cloudinary sign error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: err.message || "Failed to sign upload request." }));
  }
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

  const auth = authenticateRequest(request, env);
  if (!auth.ok) {
    return new Response(JSON.stringify({ ok: false, error: auth.error }), {
      status: auth.status || 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const config = getCloudinaryConfig(env);
  if (!config.api_key || !config.api_secret) {
    return new Response(JSON.stringify({ ok: false, error: "Cloudinary credentials missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  let folder = config.default_folder;
  if (request.method === "POST") {
    try {
      const body = await request.json();
      if (body?.folder) folder = body.folder;
    } catch {}
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    config.api_secret
  );

  return new Response(
    JSON.stringify({
      ok: true,
      timestamp,
      signature,
      apiKey: config.api_key,
      cloudName: config.cloud_name,
      folder,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

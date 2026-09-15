import { v2 as cloudinary } from "cloudinary";
import { authenticateRequest } from "./auth-utils.js";

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

// Universal Serverless Handler (Node.js req/res on Vercel and Web Request on Edge)
export default async function handler(req, res) {
  if (req instanceof Request || (req && typeof req.json === "function" && !res)) {
    return handleWebRequest(req);
  }

  // Node runtime
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Token");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
  }

  // Authenticate admin
  const auth = authenticateRequest(req);
  if (!auth.ok) {
    res.statusCode = auth.status || 401;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: auth.error }));
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch {}
    } else if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try { body = JSON.parse(Buffer.concat(chunks).toString("utf-8")); } catch { body = {}; }
    }

    const public_id = body?.public_id;
    const resource_type = body?.resource_type || "image";

    if (!public_id) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Missing public_id parameter." }));
    }

    const config = getCloudinaryConfig();
    if (!config.api_key || !config.api_secret) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Cloudinary credentials missing." }));
    }

    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
      secure: true,
    });

    const result = await cloudinary.uploader.destroy(public_id, { resource_type });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: true, result }));
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        ok: false,
        error: err.message || "Failed to delete file from Cloudinary.",
      })
    );
  }
}

async function handleWebRequest(request, env) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
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

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid request payload." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const public_id = body?.public_id;
  const resource_type = body?.resource_type || "image";

  if (!public_id) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing public_id parameter." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
      secure: true,
    });

    const result = await cloudinary.uploader.destroy(public_id, { resource_type });
    return new Response(
      JSON.stringify({ ok: true, result }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message || "Failed to delete file from Cloudinary.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

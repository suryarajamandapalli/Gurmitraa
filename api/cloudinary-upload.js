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
  const default_folder =
    env?.CLOUDINARY_UPLOAD_FOLDER ||
    process.env.CLOUDINARY_UPLOAD_FOLDER ||
    "gurmitraa";

  return { cloud_name, api_key, api_secret, default_folder };
}

async function uploadToCloudinary(file, folder, config) {
  if (!config.api_key || !config.api_secret) {
    throw new Error("CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be configured");
  }

  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
    secure: true,
  });

  return await cloudinary.uploader.upload(file, {
    folder: folder || config.default_folder,
    resource_type: "auto",
  });
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

    const file = body?.file;
    const folder = body?.folder;

    if (!file) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "No file data provided." }));
    }

    const config = getCloudinaryConfig();
    const uploadResult = await uploadToCloudinary(file, folder, config);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        ok: true,
        data: {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
          secure_url: uploadResult.secure_url,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
          resource_type: uploadResult.resource_type,
          created_at: uploadResult.created_at,
        },
      })
    );
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        ok: false,
        error: err.message || "Failed to upload file to Cloudinary.",
      })
    );
  }
}

async function handleWebRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Token",
      },
    });
  }

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
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid request payload." }),
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  const file = body?.file;
  const folder = body?.folder;

  if (!file) {
    return new Response(
      JSON.stringify({ ok: false, error: "No file data provided." }),
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  try {
    const uploadResult = await uploadToCloudinary(file, folder, config);
    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
          secure_url: uploadResult.secure_url,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
          resource_type: uploadResult.resource_type,
          created_at: uploadResult.created_at,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message || "Failed to upload file to Cloudinary.",
      }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}
